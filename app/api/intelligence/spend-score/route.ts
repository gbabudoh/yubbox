/**
 * GET /api/intelligence/spend-score
 * Returns the Spend Score and efficiency breakdown for the current user.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { computeSpendScore } from '@/lib/algorithms/spendScore';

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const result = await computeSpendScore(session.user.id);
    if (!result) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No completed spend data available yet',
      });
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to compute spend score';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
