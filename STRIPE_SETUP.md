# Stripe Payment Integration Setup

This guide explains how to set up Stripe payments for Yubbox.

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Stripe API keys (available in Stripe Dashboard)

## Setup Steps

### 1. Get Your Stripe API Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Developers** → **API keys**
3. Copy your **Publishable key** and **Secret key**
   - Use **Test mode** keys for development
   - Use **Live mode** keys for production

### 2. Configure Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key (test or live)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_... # Your Stripe publishable key (test or live)

# Stripe Webhook Secret (get this after setting up webhook)
STRIPE_WEBHOOK_SECRET=whsec_...

# NextAuth URL (required for Stripe redirects)
NEXTAUTH_URL=http://localhost:3000 # Change to your production URL
```

### 3. Set Up Stripe Webhook

#### For Local Development (using Stripe CLI):

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to Stripe CLI:
   ```bash
   stripe login
   ```
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/payments/webhook
   ```
4. Copy the webhook signing secret (starts with `whsec_`) and add it to `.env.local` as `STRIPE_WEBHOOK_SECRET`

#### For Production:

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Set endpoint URL to: `https://yourdomain.com/api/payments/webhook`
4. Select events to listen to:
   - `checkout.session.completed`
   - `checkout.session.async_payment_failed`
5. Copy the webhook signing secret and add it to your production environment variables

### 4. Test the Integration

#### Test Mode:

1. Use test API keys in `.env.local`
2. Use test card numbers from Stripe:
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`
3. Use any future expiry date and any 3-digit CVC

#### Test Flow:

1. Create a Yubbox listing
2. Click "Pay $1.00" button
3. You'll be redirected to Stripe Checkout
4. Complete payment with test card
5. You'll be redirected back to success page
6. Check your dashboard - the ad should be active

### 5. Go Live

When ready for production:

1. Switch to **Live mode** in Stripe Dashboard
2. Update environment variables with live keys:
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`
3. Update `NEXTAUTH_URL` to your production URL
4. Set up production webhook endpoint
5. Test with a real card (small amount)

## Payment Flow

1. User clicks "Pay $1.00" or "Relist" button
2. Frontend calls `/api/payments/create-checkout`
3. Backend creates Stripe Checkout Session
4. User is redirected to Stripe Checkout
5. User completes payment
6. Stripe sends webhook to `/api/payments/webhook`
7. Backend processes webhook and activates ad
8. User is redirected to success page

## Troubleshooting

### Payment not completing

- Check webhook is receiving events (Stripe Dashboard → Webhooks → View logs)
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Check server logs for errors
- Ensure `NEXTAUTH_URL` matches your domain

### Webhook not working

- Verify webhook endpoint URL is accessible
- Check webhook secret is correct
- Ensure webhook events are selected correctly
- For local development, use Stripe CLI

### Test cards not working

- Ensure you're using test mode keys
- Check card number is correct
- Verify expiry date is in the future

## Security Notes

- Never commit Stripe keys to version control
- Use environment variables for all secrets
- Use test mode for development
- Verify webhook signatures in production
- Use HTTPS in production

## Support

- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com

