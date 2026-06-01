import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { recomputeAdVisibilityScore } from '@/lib/algorithms/visibility';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ adId: string }> }
) {
  try {
    const { adId } = await params;

    const ad = await prisma.ad.update({
      where: { id: adId },
      data: { yubboxCount: { increment: 1 } },
    });

    // Fire-and-forget — don't block the vote response
    recomputeAdVisibilityScore(adId).catch(() => null);

    return NextResponse.json({
      success: true,
      data: { yubboxCount: ad.yubboxCount },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to vote';
    // Prisma throws P2025 when record not found on update
    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      (error as { code: string }).code === 'P2025'
    ) {
      return NextResponse.json(
        { success: false, error: 'Ad not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
