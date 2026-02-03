import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Ad from '@/models/Ad';

export async function POST(
  request: NextRequest,
  { params }: { params: { adId: string } }
) {
  try {
    await dbConnect();
    const { adId } = params;

    const ad = await Ad.findByIdAndUpdate(
      adId,
      { $inc: { yubboxCount: 1 } },
      { new: true }
    );

    if (!ad) {
      return NextResponse.json(
        { success: false, error: 'Ad not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        yubboxCount: ad.yubboxCount,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to vote';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
