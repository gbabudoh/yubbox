/**
 * POST /api/ads/rerank
 * Admin-only endpoint: recomputes visibility scores for all active ads.
 * Intended to be called by a cron job or manually from the admin panel.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { recomputeAllVisibilityScores } from '@/lib/algorithms/visibility';

export async function POST(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || (session.user as { role?: string }).role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const updated = await recomputeAllVisibilityScores();
    return NextResponse.json({ success: true, data: { updated } });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to rerank ads';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
