import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/nextauth';
import { prisma } from '@/lib/prisma';
import { stripe, AD_PRICE, AD_DURATION_DAYS, CURRENCY, dollarsToCents } from '@/lib/stripe';

/**
 * Create Stripe Checkout Session for ad payment
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
    const { adId, isRelist = false } = body;

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

    // Calculate expiry date from payment
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + AD_DURATION_DAYS);
    expiryDate.setHours(23, 59, 59, 999);

    // Create pending payment record
    const payment = await prisma.payment.create({
      data: {
        adId,
        userId: session.user.id,
        amount: AD_PRICE,
        currency: 'USD',
        status: 'pending',
        paymentMethod: 'stripe',
        expiryDate,
      },
    });

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: CURRENCY,
            product_data: {
              name: isRelist ? `Relist Yubbox: ${ad.title}` : `Yubbox Listing: ${ad.title}`,
              description: isRelist
                ? `Relist your Yubbox for ${AD_DURATION_DAYS} days`
                : `Activate your Yubbox listing for ${AD_DURATION_DAYS} days`,
            },
            unit_amount: dollarsToCents(AD_PRICE),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/payment/cancel?adId=${adId}`,
      client_reference_id: payment.id,
      metadata: {
        adId,
        userId: session.user.id,
        paymentId: payment.id,
        isRelist: isRelist.toString(),
      },
    });

    // Update payment with Stripe session ID
    await prisma.payment.update({
      where: { id: payment.id },
      data: { transactionId: checkoutSession.id },
    });

    return NextResponse.json({
      success: true,
      data: {
        sessionId: checkoutSession.id,
        url: checkoutSession.url,
        paymentId: payment.id,
      },
    });
  } catch (error: unknown) {
    console.error('Error creating checkout session:', error);
    const message = error instanceof Error ? error.message : 'Failed to create checkout session';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
