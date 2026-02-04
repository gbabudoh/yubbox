import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import dbConnect from '@/lib/dbConnect';
import Ad from '@/models/Ad';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ adId: string }> }
) {
  try {
    await dbConnect();

    const { adId } = await params;
    // Populate safely
    let ad;
    try {
      ad = await Ad.findById(adId)
        .populate('userId', 'name email')
        .populate('categoryId', 'name slug')
        .populate('industryId', 'name slug')
        .populate('productTypeId', 'name slug type');
    } catch {
      // If populate fails, use basic populate
      ad = await Ad.findById(adId)
        .populate('userId', 'name email');
    }

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

    await dbConnect();

    const { adId } = await params;
    const ad = await Ad.findById(adId);

    if (!ad) {
      return NextResponse.json(
        { success: false, error: 'Ad not found' },
        { status: 404 }
      );
    }

    // Check if user owns the ad
    if (ad.userId.toString() !== session.user.id) {
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

    // Update ad
    ad.title = title || ad.title;
    ad.description = description || ad.description;
    ad.imageUrl = imageUrl || ad.imageUrl;
    ad.webLink = webLink || ad.webLink;
    if (countries.length > 0) {
      ad.countries = countries;
    }

    // Handle premium feature updates
    // If selecting Top Lens/Stories for an existing ad, set expiry to match standard ad expiry
    if (isTopLens && !ad.topLensExpiry) {
      ad.topLensExpiry = ad.expiryDate;
    } else if (!isTopLens) {
      ad.topLensExpiry = undefined;
    }

    if (isStories && !ad.storiesExpiry) {
      ad.storiesExpiry = ad.expiryDate;
    } else if (!isStories) {
      ad.storiesExpiry = undefined;
    }

    await ad.save();

    // Populate safely
    let populatedAd;
    try {
      populatedAd = await Ad.findById(adId)
        .populate('userId', 'name email')
        .populate('categoryId', 'name slug')
        .populate('industryId', 'name slug')
        .populate('productTypeId', 'name slug type');
    } catch {
      // If populate fails, use basic populate
      populatedAd = await Ad.findById(adId)
        .populate('userId', 'name email');
    }

    return NextResponse.json({
      success: true,
      data: populatedAd,
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

    await dbConnect();

    const { adId } = await params;
    const ad = await Ad.findById(adId);

    if (!ad) {
      return NextResponse.json(
        { success: false, error: 'Ad not found' },
        { status: 404 }
      );
    }

    // Check if user owns the ad
    if (ad.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    await Ad.findByIdAndDelete(adId);

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

