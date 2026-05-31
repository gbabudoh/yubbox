import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';

const AD_DURATION_DAYS = 14;

/**
 * Stripe Webhook Handler
 * Handles payment completion events from Stripe
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = (await headers()).get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('STRIPE_WEBHOOK_SECRET is not set');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('Webhook signature verification failed:', message);
      return NextResponse.json(
        { error: `Webhook Error: ${message}` },
        { status: 400 }
      );
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as unknown as Record<string, unknown>;

      console.log('📦 Received checkout.session.completed event');
      console.log('📦 Session ID:', session.id);
      console.log('📦 Session metadata:', JSON.stringify(session.metadata, null, 2));
      console.log('📦 Payment status:', session.payment_status);

      // Get payment ID from metadata
      const metadata = (session.metadata as Record<string, string>) || {};
      const paymentId = metadata.paymentId;
      const adId = metadata.adId;
      const userId = metadata.userId;

      if (!paymentId || !adId || !userId) {
        console.error('❌ Missing metadata in checkout session:', session.id);
        console.error('❌ Available metadata:', JSON.stringify(session.metadata, null, 2));
        return NextResponse.json(
          { error: 'Missing required metadata' },
          { status: 400 }
        );
      }

      console.log(`🔍 Processing payment: ${paymentId} for ad: ${adId}`);

      // Find the payment record
      const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
      if (!payment) {
        console.error('❌ Payment not found:', paymentId);
        return NextResponse.json(
          { error: 'Payment not found' },
          { status: 404 }
        );
      }

      console.log(`✅ Found payment: ${paymentId}, current status: ${payment.status}`);

      // Find the ad
      const ad = await prisma.ad.findUnique({ where: { id: adId } });
      if (!ad) {
        console.error('❌ Ad not found:', adId);
        return NextResponse.json(
          { error: 'Ad not found' },
          { status: 404 }
        );
      }

      console.log(`✅ Found ad: ${adId}, current isPaid: ${ad.isPaid}`);

      // Calculate expiry date (14 days from now)
      const paymentDate = new Date();
      const expiryDate = new Date(paymentDate);
      expiryDate.setDate(expiryDate.getDate() + AD_DURATION_DAYS);
      expiryDate.setHours(23, 59, 59, 999);

      // Update payment record
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'completed',
          transactionId: session.id as string,
          paymentDate,
          expiryDate,
        },
      });

      // Update ad with payment info
      await prisma.ad.update({
        where: { id: adId },
        data: {
          isPaid: true,
          paymentDate,
          expiryDate,
          isActive: true,
        },
      });

      console.log(`✅ Payment completed for ad ${adId}, payment ${paymentId}`);
      console.log(`✅ Ad ${adId} marked as paid and active`);
      console.log(`✅ Expiry date set to: ${expiryDate.toISOString()}`);
    } else if (event.type === 'checkout.session.async_payment_failed') {
      const session = event.data.object as unknown as Record<string, unknown>;
      const metadata = (session.metadata as Record<string, string>) || {};
      const paymentId = metadata.paymentId;

      if (paymentId) {
        await prisma.payment.update({
          where: { id: paymentId },
          data: { status: 'failed' },
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: unknown) {
    console.error('Webhook error:', error);
    const message = error instanceof Error ? error.message : 'Webhook handler failed';
    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    );
  }
}
