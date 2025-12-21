import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import dbConnect from '@/lib/dbConnect';
import Ad from '@/models/Ad';
import Payment from '@/models/Payment';

const AD_PRICE = 1.0;
const AD_DURATION_DAYS = 30;

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

    await dbConnect();

    const { adId } = await params;

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

    // Calculate new expiry date (30 days from relist payment date)
    const paymentDate = new Date();
    const expiryDate = new Date(paymentDate);
    expiryDate.setDate(expiryDate.getDate() + AD_DURATION_DAYS);
    
    // Ensure we're setting exactly 30 days from payment
    expiryDate.setHours(23, 59, 59, 999); // Set to end of day for consistency

    // Create new payment record for relisting
    const payment = await Payment.create({
      adId: ad._id,
      userId: session.user.id,
      amount: AD_PRICE,
      currency: 'USD',
      status: 'completed',
      paymentMethod: 'manual',
      transactionId: `RELIST-${Date.now()}-${ad._id}`,
      paymentDate,
      expiryDate,
    });

    // Update ad with new payment info
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
        message: 'Ad successfully relisted for 30 days',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to relist ad',
      },
      { status: 500 }
    );
  }
}

