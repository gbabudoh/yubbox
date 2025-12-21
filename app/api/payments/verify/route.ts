import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import dbConnect from '@/lib/dbConnect';
import Payment from '@/models/Payment';
import Ad from '@/models/Ad';
import { stripe } from '@/lib/stripe';

/**
 * Verify payment status by checking Stripe session
 */
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
    const { sessionId, paymentId, adId } = body;

    if (!sessionId && !paymentId && !adId) {
      return NextResponse.json(
        { success: false, error: 'Session ID, Payment ID, or Ad ID is required' },
        { status: 400 }
      );
    }

    let payment;
    let ad;

    // Find payment by different methods
    if (paymentId) {
      payment = await Payment.findById(paymentId);
    } else if (adId) {
      payment = await Payment.findOne({ adId }).sort({ createdAt: -1 });
    } else if (sessionId) {
      payment = await Payment.findOne({ transactionId: sessionId }).sort({ createdAt: -1 });
    }

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Verify user owns the payment
    if (payment.userId.toString() !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // If payment is already completed, return success
    if (payment.status === 'completed') {
      ad = await Ad.findById(payment.adId);
      return NextResponse.json({
        success: true,
        data: {
          payment,
          ad,
          isPaid: ad?.isPaid || false,
        },
      });
    }

    // If we have a Stripe session ID, verify with Stripe
    if (payment.transactionId) {
      try {
        const stripeSession = await stripe.checkout.sessions.retrieve(payment.transactionId);

        if (stripeSession.payment_status === 'paid') {
          // Payment was successful, update our records
          const paymentDate = new Date();
          const expiryDate = new Date(paymentDate);
          expiryDate.setDate(expiryDate.getDate() + 30);
          expiryDate.setHours(23, 59, 59, 999);

          payment.status = 'completed';
          payment.paymentDate = paymentDate;
          payment.expiryDate = expiryDate;
          await payment.save();

          // Update ad
          ad = await Ad.findById(payment.adId);
          if (ad) {
            ad.isPaid = true;
            ad.paymentDate = paymentDate;
            ad.expiryDate = expiryDate;
            ad.isActive = true;
            await ad.save();
          }

          return NextResponse.json({
            success: true,
            data: {
              payment,
              ad,
              isPaid: true,
              verified: true,
            },
          });
        } else {
          return NextResponse.json({
            success: false,
            data: {
              payment,
              paymentStatus: stripeSession.payment_status,
              isPaid: false,
            },
          });
        }
      } catch (stripeError: any) {
        console.error('Stripe verification error:', stripeError);
        return NextResponse.json({
          success: false,
          error: 'Failed to verify with Stripe',
          details: stripeError.message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        payment,
        isPaid: payment.status === 'completed',
      },
    });
  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to verify payment',
      },
      { status: 500 }
    );
  }
}

