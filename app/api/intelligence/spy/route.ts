/**
 * GET /api/intelligence/spy?adId=<id>
 * Returns anonymised category benchmarks and market intelligence.
 * All data is aggregated across a minimum cohort of 5 ads — no individual data exposed.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { prisma } from '@/lib/prisma';
import { getSpyData } from '@/lib/algorithms/spy';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const adId = request.nextUrl.searchParams.get('adId');
    if (!adId) {
      return NextResponse.json({ success: false, error: 'adId is required' }, { status: 400 });
    }

    const ad = await prisma.ad.findUnique({ where: { id: adId } });
    if (!ad || ad.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    const spyData = await getSpyData(adId);
    if (!spyData) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'Not enough category data yet for benchmarks (minimum 5 peers required)',
      });
    }

    return NextResponse.json({ success: true, data: spyData });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch spy data';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
