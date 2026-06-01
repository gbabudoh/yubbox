/**
 * GET /api/cron/rerank
 * Recomputes visibility scores for all active ads.
 * Protected by CRON_SECRET — Vercel calls this on schedule via vercel.json.
 *
 * Set CRON_SECRET in your Vercel project environment variables.
 * The Vercel Cron runner injects it automatically as the Authorization header.
 */

import { NextRequest, NextResponse } from 'next/server';
import { recomputeAllVisibilityScores } from '@/lib/algorithms/visibility';
import { generateInsights } from '@/lib/algorithms/insights';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  // Validate the cron secret so the endpoint can't be called freely
  const authHeader = request.headers.get('authorization');
  const expected   = `Bearer ${process.env.CRON_SECRET ?? ''}`;

  if (!process.env.CRON_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const start = Date.now();

  // 1. Recompute visibility scores for all active ads
  const rerankCount = await recomputeAllVisibilityScores();

  // 2. Regenerate insights for every active, paid ad (in batches to stay within timeout)
  const activeAds = await prisma.ad.findMany({
    where: { isActive: true, isPaid: true, expiryDate: { gte: new Date() } },
    select: { id: true },
    take: 200,
  });

  let insightCount = 0;
  for (const ad of activeAds) {
    const n = await generateInsights(ad.id).catch(() => 0);
    insightCount += n;
  }

  return NextResponse.json({
    success: true,
    data: {
      rerankCount,
      insightCount,
      durationMs: Date.now() - start,
    },
  });
}
