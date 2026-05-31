import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();

    const bannerAds = await prisma.bannerAd.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        linkUrl: true,
        displayOrder: true,
      },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
      take: 5,
    });

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
