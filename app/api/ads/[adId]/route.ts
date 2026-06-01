import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { prisma } from '@/lib/prisma';
import { recomputeAdVisibilityScore } from '@/lib/algorithms/visibility';

const AD_INCLUDE = {
  user: { select: { id: true, name: true, email: true } },
  category: { select: { id: true, name: true, slug: true, type: true } },
  industry: { select: { id: true, name: true, slug: true } },
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ adId: string }> }
) {
  try {
    const { adId } = await params;

    const ad = await prisma.ad.findUnique({
      where: { id: adId },
      include: AD_INCLUDE,
    });

    if (!ad) {
      return NextResponse.json(
        { success: false, error: 'Ad not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: ad,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch ad',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ adId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { adId } = await params;
    const existing = await prisma.ad.findUnique({ where: { id: adId } });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Ad not found' },
        { status: 404 }
      );
    }

    // Check if user owns the ad
    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const imageUrl = formData.get('imageUrl') as string;
    const webLink = formData.get('webLink') as string;
    // Support both countries and targetLocations for backward compatibility
    const countries = formData.getAll('countries').length > 0
      ? formData.getAll('countries') as string[]
      : formData.getAll('targetLocations') as string[];
    const isTopLens = formData.get('isTopLens') === 'true';
    const isStories = formData.get('isStories') === 'true';

    // Handle premium feature expiry updates
    let topLensExpiry: Date | null | undefined = undefined;
    if (isTopLens && !existing.topLensExpiry) {
      topLensExpiry = existing.expiryDate;
    } else if (!isTopLens) {
      topLensExpiry = null;
    }

    let storiesExpiry: Date | null | undefined = undefined;
    if (isStories && !existing.storiesExpiry) {
      storiesExpiry = existing.expiryDate;
    } else if (!isStories) {
      storiesExpiry = null;
    }

    const updateData: Record<string, unknown> = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (webLink) updateData.webLink = webLink;
    if (countries.length > 0) updateData.countries = countries;
    if (topLensExpiry !== undefined) updateData.topLensExpiry = topLensExpiry;
    if (storiesExpiry !== undefined) updateData.storiesExpiry = storiesExpiry;

    const ad = await prisma.ad.update({
      where: { id: adId },
      data: updateData,
      include: AD_INCLUDE,
    });

    // Recompute visibility — premium status or targeting may have changed
    recomputeAdVisibilityScore(adId).catch(() => null);

    return NextResponse.json({
      success: true,
      data: ad,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update ad',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ adId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { adId } = await params;
    const existing = await prisma.ad.findUnique({ where: { id: adId } });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Ad not found' },
        { status: 404 }
      );
    }

    // Check if user owns the ad
    if (existing.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await prisma.ad.delete({ where: { id: adId } });

    return NextResponse.json({
      success: true,
      message: 'Ad deleted successfully',
    });
  } catch (error: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete ad',
      },
      { status: 500 }
    );
  }
}
