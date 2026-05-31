import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const now = new Date();

    const ads = await prisma.ad.findMany({
      where: {
        isActive: true,
        storiesExpiry: { gte: now },
        expiryDate: { gte: now },
      },
      select: {
        id: true,
        title: true,
        companyName: true,
        ownerName: true,
        imageUrl: true,
        webLink: true,
        storiesExpiry: true,
        countries: true,
      },
      orderBy: { storiesExpiry: 'desc' },
      take: 20,
    });

    return NextResponse.json({ success: true, data: ads });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch stories';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
