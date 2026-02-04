import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin';
import dbConnect from '@/lib/dbConnect';
import BannerAd from '@/models/BannerAd';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const query: { isActive?: boolean } = {};
    if (!includeInactive) {
      query.isActive = true;
    }

    const bannerAds = await BannerAd.find(query)
      .populate('createdBy', 'name email')
      .sort({ displayOrder: 1, createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: bannerAds,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to fetch banner ads';
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
    await requireAdmin();
    await dbConnect();

    const body = await request.json();
    const { title, description, imageUrl, linkUrl, cost, startDate, endDate, isActive, displayOrder, createdBy } = body;

    if (!title || !imageUrl || !linkUrl || cost === undefined || !startDate || !endDate || !createdBy) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end <= start) {
      return NextResponse.json(
        { success: false, error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    const bannerAd = await BannerAd.create({
      title,
      description,
      imageUrl,
      linkUrl,
      cost,
      startDate: start,
      endDate: end,
      isActive: isActive !== undefined ? isActive : true,
      displayOrder: displayOrder || 0,
      createdBy,
    });

    return NextResponse.json(
      {
        success: true,
        data: bannerAd,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'Admin access required') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to create banner ad';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
