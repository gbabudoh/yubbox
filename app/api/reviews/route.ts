import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import dbConnect from '@/lib/dbConnect';
import Review from '@/models/Review';
import Ad from '@/models/Ad';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const adId = searchParams.get('adId');

    if (!adId) {
      return NextResponse.json(
        { success: false, error: 'Ad ID is required' },
        { status: 400 }
      );
    }

    const reviews = await Review.find({ adId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      data: reviews,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch reviews';
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
    await dbConnect();

    const body = await request.json();
    const { adId, rating, comment, userName } = body;

    // Validation
    if (!adId || !rating) {
      return NextResponse.json(
        { success: false, error: 'Ad ID and rating are required' },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Verify ad exists
    const ad = await Ad.findById(adId);
    if (!ad) {
      return NextResponse.json(
        { success: false, error: 'Ad not found' },
        { status: 404 }
      );
    }

    const review = await Review.create({
      adId,
      rating,
      comment: comment || '',
      userId: session?.user?.id || null,
      userName: userName || session?.user?.name || 'Anonymous',
    });

    const populatedReview = await Review.findById(review._id).populate(
      'userId',
      'name email'
    );

    return NextResponse.json(
      {
        success: true,
        data: populatedReview,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create review';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

