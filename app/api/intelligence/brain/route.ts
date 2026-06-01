/**
 * GET /api/intelligence/brain?adId=<id>
 * Returns the Yubbox Brain Score (0–100) for a given ad plus the raw signal
 * breakdown used to compute it.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { prisma } from '@/lib/prisma';
import { computeVisibilityScore } from '@/lib/algorithms/visibility';

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

    const [views, clicks, insights] = await Promise.all([
      prisma.analytics.count({ where: { adId, eventType: 'view' } }),
      prisma.analytics.count({ where: { adId, eventType: 'click' } }),
      prisma.adInsight.count({ where: { adId, isRead: false } }),
    ]);

    const brainScore = computeVisibilityScore(ad, views, clicks);
    const ctr        = views > 0 ? Math.round((clicks / views) * 1000) / 10 : 0;

    return NextResponse.json({
      success: true,
      data: {
        adId,
        brainScore,
        signals: {
          views,
          clicks,
          ctr,
          yubboxCount:    ad.yubboxCount,
          isPaid:         ad.isPaid,
          hasTopLens:     !!(ad.topLensExpiry && new Date(ad.topLensExpiry) >= new Date()),
          hasStories:     !!(ad.storiesExpiry && new Date(ad.storiesExpiry) >= new Date()),
          unreadInsights: insights,
        },
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to compute brain score';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
