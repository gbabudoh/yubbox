import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { prisma } from '@/lib/prisma';
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

    const body = await request.json();
    const { sessionId, paymentId, adId } = body;

    if (!sessionId && !paymentId && !adId) {
      return NextResponse.json(
        { success: false, error: 'Session ID, Payment ID, or Ad ID is required' },
        { status: 400 }
      );
    }

    let payment;

    // Find payment by different methods
    if (paymentId) {
      payment = await prisma.payment.findUnique({ where: { id: paymentId } });
    } else if (adId) {
      payment = await prisma.payment.findFirst({
        where: { adId },
        orderBy: { createdAt: 'desc' },
      });
    } else if (sessionId) {
      payment = await prisma.payment.findFirst({
        where: { transactionId: sessionId },
        orderBy: { createdAt: 'desc' },
      });
    }

    if (!payment) {
      return NextResponse.json(
        { success: false, error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Verify user owns the payment
    if (payment.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // If payment is already completed, return success
    if (payment.status === 'completed') {
      const ad = await prisma.ad.findUnique({ where: { id: payment.adId } });
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
          expiryDate.setDate(expiryDate.getDate() + 14);
          expiryDate.setHours(23, 59, 59, 999);

          const updatedPayment = await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'completed',
              paymentDate,
              expiryDate,
            },
          });

          // Update ad
          const updatedAd = await prisma.ad.update({
            where: { id: payment.adId },
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
              payment: updatedPayment,
              ad: updatedAd,
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
      } catch (stripeError: unknown) {
        console.error('Stripe verification error:', stripeError);
        const message = stripeError instanceof Error ? stripeError.message : 'Unknown Stripe error';
        return NextResponse.json({
          success: false,
          error: 'Failed to verify with Stripe',
          details: message,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        payment,
        isPaid: false,
      },
    });
  } catch (error: unknown) {
    console.error('Payment verification error:', error);
    const message = error instanceof Error ? error.message : 'Failed to verify payment';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
