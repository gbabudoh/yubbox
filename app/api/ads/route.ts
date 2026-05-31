import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { prisma } from '@/lib/prisma';

const AD_INCLUDE = {
  user: { select: { id: true, name: true, email: true } },
  category: { select: { id: true, name: true, slug: true, type: true } },
  industry: { select: { id: true, name: true, slug: true } },
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const isActive = searchParams.get('isActive');
    const country = searchParams.get('country');

    const where: Record<string, unknown> = {};

    if (userId) {
      where.userId = userId;
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    // Filter by country - ads that include this country in their countries array
    if (country) {
      where.countries = { has: country };
    }

    // Only show non-expired ads for public feed
    if (!userId) {
      where.expiryDate = { gte: new Date() };
    }

    const ads = await prisma.ad.findMany({
      where,
      include: AD_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: ads,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch ads';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const imageUrl = formData.get('imageUrl') as string;
    const webLink = formData.get('webLink') as string;
    const ownerName = formData.get('ownerName') as string;
    const location = formData.get('location') as string;
    const companyName = formData.get('companyName') as string;
    // Support both countries and targetLocations for backward compatibility
    const countries = formData.getAll('countries').length > 0
      ? formData.getAll('countries') as string[]
      : formData.getAll('targetLocations') as string[];
    const categoryId = formData.get('categoryId') as string | null;
    const industryId = formData.get('industryId') as string | null;
    const isTopLens = formData.get('isTopLens') === 'true';
    const isStories = formData.get('isStories') === 'true';

    // Validation
    if (!title || !description || !imageUrl || !webLink || !ownerName || !location || !companyName) {
      return NextResponse.json(
        { success: false, error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    if (countries.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please select at least one country' },
        { status: 400 }
      );
    }

    if (!categoryId) {
      return NextResponse.json(
        { success: false, error: 'Category is required' },
        { status: 400 }
      );
    }

    if (!industryId) {
      return NextResponse.json(
        { success: false, error: 'Industry is required' },
        { status: 400 }
      );
    }

    // Set initial expiry dates
    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setDate(expiryDate.getDate() + 30);

    const ad = await prisma.ad.create({
      data: {
        title,
        description,
        imageUrl,
        webLink,
        ownerName,
        location,
        companyName,
        countries,
        userId: session.user.id,
        categoryId,
        industryId,
        isActive: true,
        isPaid: false,
        expiryDate,
        topLensExpiry: isTopLens ? expiryDate : null,
        storiesExpiry: isStories ? expiryDate : null,
      },
      include: AD_INCLUDE,
    });

    return NextResponse.json(
      {
        success: true,
        data: ad,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create ad';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
