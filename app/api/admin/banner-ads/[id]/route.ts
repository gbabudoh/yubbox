import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import dbConnect from '@/lib/dbConnect';
import BannerAd from '@/models/BannerAd';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    await dbConnect();

    const bannerAd = await BannerAd.findById(params.id).populate('createdBy', 'name email');

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
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    await dbConnect();

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

    const updateData: {
      title?: string;
      description?: string;
      imageUrl?: string;
      linkUrl?: string;
      cost?: number;
      startDate?: Date;
      endDate?: Date;
      isActive?: boolean;
      displayOrder?: number;
    } = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (linkUrl !== undefined) updateData.linkUrl = linkUrl;
    if (cost !== undefined) updateData.cost = cost;
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = new Date(endDate);
    if (isActive !== undefined) updateData.isActive = isActive;
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder;

    const bannerAd = await BannerAd.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

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
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
    await dbConnect();

    const bannerAd = await BannerAd.findByIdAndDelete(params.id);

    if (!bannerAd) {
      return NextResponse.json(
        { success: false, error: 'Banner ad not found' },
        { status: 404 }
      );
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
