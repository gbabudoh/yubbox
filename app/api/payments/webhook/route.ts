import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import dbConnect from '@/lib/dbConnect';
import Ad from '@/models/Ad';
import Payment from '@/models/Payment';

const AD_DURATION_DAYS = 30;

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
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;

      console.log('📦 Received checkout.session.completed event');
      console.log('📦 Session ID:', session.id);
      console.log('📦 Session metadata:', JSON.stringify(session.metadata, null, 2));
      console.log('📦 Payment status:', session.payment_status);

      // Get payment ID from metadata
      const paymentId = session.metadata?.paymentId;
      const adId = session.metadata?.adId;
      const userId = session.metadata?.userId;
      const isRelist = session.metadata?.isRelist === 'true';

      if (!paymentId || !adId || !userId) {
        console.error('❌ Missing metadata in checkout session:', session.id);
        console.error('❌ Available metadata:', JSON.stringify(session.metadata, null, 2));
        return NextResponse.json(
          { error: 'Missing required metadata' },
          { status: 400 }
        );
      }

      console.log(`🔍 Processing payment: ${paymentId} for ad: ${adId}`);

      await dbConnect();

      // Find the payment record
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        console.error('❌ Payment not found:', paymentId);
        return NextResponse.json(
          { error: 'Payment not found' },
          { status: 404 }
        );
      }

      console.log(`✅ Found payment: ${paymentId}, current status: ${payment.status}`);

      // Find the ad
      const ad = await Ad.findById(adId);
      if (!ad) {
        console.error('❌ Ad not found:', adId);
        return NextResponse.json(
          { error: 'Ad not found' },
          { status: 404 }
        );
      }

      console.log(`✅ Found ad: ${adId}, current isPaid: ${ad.isPaid}`);

      // Calculate expiry date (30 days from now)
      const paymentDate = new Date();
      const expiryDate = new Date(paymentDate);
      expiryDate.setDate(expiryDate.getDate() + AD_DURATION_DAYS);
      expiryDate.setHours(23, 59, 59, 999);

      // Update payment record
      payment.status = 'completed';
      payment.transactionId = session.id;
      payment.paymentDate = paymentDate;
      payment.expiryDate = expiryDate;
      await payment.save();

      // Update ad with payment info
      ad.isPaid = true;
      ad.paymentDate = paymentDate;
      ad.expiryDate = expiryDate;
      ad.isActive = true;
      await ad.save();

      console.log(`✅ Payment completed for ad ${adId}, payment ${paymentId}`);
      console.log(`✅ Ad ${adId} marked as paid and active`);
      console.log(`✅ Expiry date set to: ${expiryDate.toISOString()}`);
    } else if (event.type === 'checkout.session.async_payment_failed') {
      const session = event.data.object as any;
      const paymentId = session.metadata?.paymentId;

      if (paymentId) {
        await dbConnect();
        const payment = await Payment.findById(paymentId);
        if (payment) {
          payment.status = 'failed';
          await payment.save();
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Webhook handler failed',
      },
      { status: 500 }
    );
  }
}

