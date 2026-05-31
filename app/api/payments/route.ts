import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { prisma } from '@/lib/prisma';

const AD_PRICE = 1.0; // $1.00 per listing
const AD_DURATION_DAYS = 14;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { adId } = body;

    if (!adId) {
      return NextResponse.json(
        { success: false, error: 'Ad ID is required' },
        { status: 400 }
      );
    }

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

    // Calculate expiry date
    const paymentDate = new Date();
    const expiryDate = new Date(paymentDate);
    expiryDate.setDate(expiryDate.getDate() + AD_DURATION_DAYS);
    expiryDate.setHours(23, 59, 59, 999);

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        adId,
        userId: session.user.id,
        amount: AD_PRICE,
        currency: 'USD',
        status: 'completed',
        paymentMethod: 'manual',
        transactionId: `TXN-${Date.now()}-${adId}`,
        paymentDate,
        expiryDate,
      },
    });

    // Update ad with payment info
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
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to process payment';
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

    const where: { userId: string; adId?: string } = { userId: session.user.id };
    if (adId) {
      where.adId = adId;
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        ad: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: payments,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch payments';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
