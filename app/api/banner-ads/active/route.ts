import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import BannerAd from '@/models/BannerAd';

export async function GET(request: NextRequest) {
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
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to fetch active banner ads',
      },
      { status: 500 }
    );
  }
}
