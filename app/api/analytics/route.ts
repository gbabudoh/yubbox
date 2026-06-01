import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { prisma } from '@/lib/prisma';
import { EventType } from '@prisma/client';
import { recomputeAdVisibilityScore } from '@/lib/algorithms/visibility';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      adId, eventType, country, ipAddress, userAgent, referrer,
      sessionId, scrollDepth, timeOnAd, clickElement, deviceType,
    } = body;

    if (!adId || !eventType) {
      return NextResponse.json(
        { success: false, error: 'Ad ID and event type are required' },
        { status: 400 }
      );
    }

    // Verify ad exists
    const ad = await prisma.ad.findUnique({ where: { id: adId } });
    if (!ad) {
      return NextResponse.json(
        { success: false, error: 'Ad not found' },
        { status: 404 }
      );
    }

    // Get user session if available
    const session = await getServerSession(authOptions);

    // Create analytics record with behavioural signals
    const analytics = await prisma.analytics.create({
      data: {
        adId,
        eventType:   eventType as EventType,
        country:     country      || null,
        ipAddress:   ipAddress    || null,
        userAgent:   userAgent    || null,
        referrer:    referrer     || null,
        userId:      session?.user?.id || null,
        sessionId:   sessionId    || null,
        scrollDepth: scrollDepth  ?? null,
        timeOnAd:    timeOnAd     ?? null,
        clickElement: clickElement || null,
        deviceType:  deviceType   || null,
        timestamp:   new Date(),
      },
    });

    // Recompute visibility score asynchronously on every click (not view — too frequent)
    if (eventType === 'click') {
      recomputeAdVisibilityScore(adId).catch(() => null);
    }

    return NextResponse.json({
      success: true,
      data: analytics,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to record analytics';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const adId = searchParams.get('adId');
    const eventType = searchParams.get('eventType');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!adId) {
      return NextResponse.json(
        { success: false, error: 'Ad ID is required' },
        { status: 400 }
      );
    }

    // Verify user owns the ad
    const ad = await prisma.ad.findUnique({ where: { id: adId } });
    if (!ad || ad.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Build where clause
    const where: Record<string, unknown> = { adId };

    if (eventType) {
      where.eventType = eventType as EventType;
    }

    if (startDate || endDate) {
      const timestampFilter: { gte?: Date; lte?: Date } = {};
      if (startDate) timestampFilter.gte = new Date(startDate);
      if (endDate) timestampFilter.lte = new Date(endDate);
      where.timestamp = timestampFilter;
    }

    const analytics = await prisma.analytics.findMany({
      where,
      orderBy: { timestamp: 'desc' },
    });

    // Aggregate statistics
    const [totalViews, totalClicks] = await Promise.all([
      prisma.analytics.count({ where: { adId, eventType: EventType.view } }),
      prisma.analytics.count({ where: { adId, eventType: EventType.click } }),
    ]);

    // Country breakdown (raw SQL for aggregation)
    const countryStats = await prisma.$queryRaw<{ country: string; count: bigint }[]>`
      SELECT country, COUNT(*)::int as count
      FROM "Analytics"
      WHERE "adId" = ${adId}::uuid AND event_type = 'click'
      GROUP BY country ORDER BY count DESC
    `;

    // Hourly breakdown
    const hourlyStats = await prisma.$queryRaw<{ hour: number; count: bigint }[]>`
      SELECT EXTRACT(HOUR FROM timestamp)::int as hour, COUNT(*)::int as count
      FROM "Analytics"
      WHERE "adId" = ${adId}::uuid AND event_type = 'click'
      GROUP BY hour ORDER BY hour
    `;

    // Daily breakdown (last 14 days)
    const dailyStats = await prisma.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT TO_CHAR(DATE_TRUNC('day', timestamp), 'YYYY-MM-DD') as date, COUNT(*)::int as count
      FROM "Analytics"
      WHERE "adId" = ${adId}::uuid AND event_type = 'click'
        AND timestamp >= NOW() - INTERVAL '14 days'
      GROUP BY date ORDER BY date
    `;

    return NextResponse.json({
      success: true,
      data: {
        analytics,
        statistics: {
          totalViews,
          totalClicks,
          clickThroughRate: totalViews > 0 ? (totalClicks / totalViews) * 100 : 0,
          countryStats: countryStats.map((r) => ({ _id: r.country, count: Number(r.count) })),
          hourlyStats: hourlyStats.map((r) => ({ _id: r.hour, count: Number(r.count) })),
          dailyStats: dailyStats.map((r) => ({ _id: r.date, count: Number(r.count) })),
        },
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch analytics';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
