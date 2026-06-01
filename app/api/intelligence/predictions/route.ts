/**
 * GET /api/intelligence/predictions?adId=<id>
 * Returns AI-predicted performance metrics and timing recommendations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { prisma } from '@/lib/prisma';
import { generatePredictions } from '@/lib/algorithms/predictions';

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

    const predictions = await generatePredictions(adId);
    if (!predictions) {
      return NextResponse.json({ success: false, error: 'Unable to generate predictions' }, { status: 422 });
    }

    return NextResponse.json({ success: true, data: predictions });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to generate predictions';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
