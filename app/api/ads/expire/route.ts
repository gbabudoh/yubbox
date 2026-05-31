import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// This endpoint can be called by a cron job to deactivate expired ads
export async function POST() {
  try {
    const now = new Date();

    const result = await prisma.ad.updateMany({
      where: {
        isPaid: true,
        isActive: true,
        expiryDate: { lt: now },
      },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: `Deactivated ${result.count} expired ads`,
      count: result.count,
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
    const now = new Date();
    const expiredAds = await prisma.ad.findMany({
      where: {
        isPaid: true,
        isActive: true,
        expiryDate: { lt: now },
      },
      select: { id: true, title: true, expiryDate: true },
    });

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
