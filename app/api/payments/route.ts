import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import dbConnect from '@/lib/dbConnect';
import Ad from '@/models/Ad';
import Payment from '@/models/Payment';

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

    await dbConnect();

    const body = await request.json();
    const { adId } = body;

    if (!adId) {
      return NextResponse.json(
        { success: false, error: 'Ad ID is required' },
        { status: 400 }
      );
    }

    // Find the ad
    const ad = await Ad.findById(adId);

    if (!ad) {
      return NextResponse.json(
        { success: false, error: 'Ad not found' },
        { status: 404 }
      );
    }

    // Check if user owns the ad
    if (ad.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // Calculate expiry date (14 days from payment date - this is when counter starts)
    const paymentDate = new Date();
    const expiryDate = new Date(paymentDate);
    expiryDate.setDate(expiryDate.getDate() + AD_DURATION_DAYS);
    
    // Ensure we're setting exactly 14 days from payment
    expiryDate.setHours(23, 59, 59, 999); // Set to end of day for consistency

    // Create payment record
    const payment = await Payment.create({
      adId: ad._id,
      userId: session.user.id,
      amount: AD_PRICE,
      currency: 'USD',
      status: 'completed', // For now, auto-complete. In production, integrate with Stripe/PayPal
      paymentMethod: 'manual',
      transactionId: `TXN-${Date.now()}-${ad._id}`,
      paymentDate,
      expiryDate,
    });

    // Update ad with payment info
    ad.isPaid = true;
    ad.paymentDate = paymentDate;
    ad.expiryDate = expiryDate;
    ad.isActive = true;
    await ad.save();

    return NextResponse.json({
      success: true,
      data: {
        payment,
        ad,
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

    await dbConnect();

    const searchParams = request.nextUrl.searchParams;
    const adId = searchParams.get('adId');

    const query: { userId: string; adId?: string } = { userId: session.user.id };

    if (adId) {
      query.adId = adId;
    }

    const payments = await Payment.find(query)
      .populate('adId', 'title')
      .sort({ createdAt: -1 });

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

