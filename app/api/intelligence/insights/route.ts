/**
 * GET /api/intelligence/insights?adId=<id>   — fetch ranked insight cards
 * POST /api/intelligence/insights             — regenerate insights for adId in body
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { prisma } from '@/lib/prisma';
import { generateInsights } from '@/lib/algorithms/insights';

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

    const insights = await prisma.adInsight.findMany({
      where:   { adId, expiresAt: { gte: new Date() } },
      orderBy: { priority: 'desc' },
    });

    // If no fresh insights exist, generate them on demand
    if (insights.length === 0) {
      await generateInsights(adId);
      const fresh = await prisma.adInsight.findMany({
        where:   { adId, expiresAt: { gte: new Date() } },
        orderBy: { priority: 'desc' },
      });
      return NextResponse.json({ success: true, data: fresh, generated: true });
    }

    return NextResponse.json({ success: true, data: insights, generated: false });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch insights';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { adId } = await request.json();
    if (!adId) {
      return NextResponse.json({ success: false, error: 'adId is required' }, { status: 400 });
    }

    const ad = await prisma.ad.findUnique({ where: { id: adId } });
    if (!ad || ad.userId !== session.user.id) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    const count = await generateInsights(adId);
    return NextResponse.json({ success: true, data: { generated: count } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate insights';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
