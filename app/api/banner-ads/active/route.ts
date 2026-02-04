import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BannerAd from '@/models/BannerAd';

export async function GET() {
  try {
    await dbConnect();

    const now = new Date();

    const bannerAds = await BannerAd.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .select('title description imageUrl linkUrl displayOrder')
      .sort({ displayOrder: 1, createdAt: -1 })
      .limit(5);

    return NextResponse.json({
      success: true,
      data: bannerAds,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch active banner ads';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
