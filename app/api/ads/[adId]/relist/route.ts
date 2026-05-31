import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { prisma } from '@/lib/prisma';

const AD_PRICE = 1.0;
const AD_DURATION_DAYS = 14;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ adId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { adId } = await params;

    // Find the ad
    const ad = await prisma.ad.findUnique({ where: { id: adId } });

    if (!ad) {
      return NextResponse.json(
        { success: false, error: 'Ad not found' },
        { status: 404 }
      );
    }

    // Check if user owns the ad
    if (ad.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Calculate new expiry date
    const paymentDate = new Date();
    const expiryDate = new Date(paymentDate);
    expiryDate.setDate(expiryDate.getDate() + AD_DURATION_DAYS);
    expiryDate.setHours(23, 59, 59, 999);

    // Create new payment record for relisting
    const payment = await prisma.payment.create({
      data: {
        adId,
        userId: session.user.id,
        amount: AD_PRICE,
        currency: 'USD',
        status: 'completed',
        paymentMethod: 'manual',
        transactionId: `RELIST-${Date.now()}-${adId}`,
        paymentDate,
        expiryDate,
      },
    });

    // Update ad with new payment info
    const updatedAd = await prisma.ad.update({
      where: { id: adId },
      data: {
        isPaid: true,
        paymentDate,
        expiryDate,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        payment,
        ad: updatedAd,
        message: 'Ad successfully relisted for 14 days',
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to relist ad';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
