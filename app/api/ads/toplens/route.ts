import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();

    const ads = await prisma.ad.findMany({
      where: {
        isActive: true,
        topLensExpiry: { gte: now },
        expiryDate: { gte: now },
      },
      select: {
        id: true,
        title: true,
        description: true,
        companyName: true,
        ownerName: true,
        imageUrl: true,
        webLink: true,
        topLensExpiry: true,
        countries: true,
        location: true,
        yubboxCount: true,
      },
      orderBy: { topLensExpiry: 'desc' },
      take: 12,
    });

    return NextResponse.json({ success: true, data: ads });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch top lens ads';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
