import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Ad from '@/models/Ad';

// This endpoint can be called by a cron job to deactivate expired ads
export async function POST() {
  try {
    // Optional: Add authentication/authorization here for cron jobs
    // For now, we'll allow it to be called directly
    
    await dbConnect();

    const now = new Date();
    
    // Find all ads that are paid, active, but past their expiry date
    const expiredAds = await Ad.find({
      isPaid: true,
      isActive: true,
      expiryDate: { $lt: now },
    });

    // Deactivate expired ads
    if (expiredAds.length > 0) {
      await Ad.updateMany(
        {
          isPaid: true,
          isActive: true,
          expiryDate: { $lt: now },
        },
        {
          $set: { isActive: false },
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Deactivated ${expiredAds.length} expired ads`,
      count: expiredAds.length,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to expire ads';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check expired ads (for manual checking)
export async function GET() {
  try {
    await dbConnect();

    const now = new Date();
    const expiredAds = await Ad.find({
      isPaid: true,
      isActive: true,
      expiryDate: { $lt: now },
    }).select('title expiryDate');

    return NextResponse.json({
      success: true,
      count: expiredAds.length,
      ads: expiredAds,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to check expired ads';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

