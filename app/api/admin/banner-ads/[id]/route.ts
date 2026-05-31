import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const bannerAd = await prisma.bannerAd.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!bannerAd) {
      return NextResponse.json(
        { success: false, error: 'Banner ad not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: bannerAd,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to fetch banner ad';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;
    const body = await request.json();
    const { title, description, imageUrl, linkUrl, cost, startDate, endDate, isActive, displayOrder } = body;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      if (end <= start) {
        return NextResponse.json(
          { success: false, error: 'End date must be after start date' },
          { status: 400 }
        );
      }
    }

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (linkUrl !== undefined) updateData.linkUrl = linkUrl;
    if (cost !== undefined) updateData.cost = cost;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (isActive !== undefined) updateData.isActive = isActive;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;

    let bannerAd;
    try {
      bannerAd = await prisma.bannerAd.update({
        where: { id },
        data: updateData,
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
        },
      });
    } catch (updateError: unknown) {
      if (
        typeof updateError === 'object' &&
        updateError !== null &&
        'code' in updateError &&
        (updateError as { code: string }).code === 'P2025'
      ) {
        return NextResponse.json(
          { success: false, error: 'Banner ad not found' },
          { status: 404 }
        );
      }
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      data: bannerAd,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to update banner ad';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    try {
      await prisma.bannerAd.delete({ where: { id } });
    } catch (deleteError: unknown) {
      if (
        typeof deleteError === 'object' &&
        deleteError !== null &&
        'code' in deleteError &&
        (deleteError as { code: string }).code === 'P2025'
      ) {
        return NextResponse.json(
          { success: false, error: 'Banner ad not found' },
          { status: 404 }
        );
      }
      throw deleteError;
    }

    return NextResponse.json({
      success: true,
      message: 'Banner ad deleted successfully',
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to delete banner ad';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
