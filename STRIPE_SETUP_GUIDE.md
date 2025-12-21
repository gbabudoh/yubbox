# Stripe Payment Setup Guide for Yubbox

This comprehensive guide will walk you through setting up Stripe payments for your Yubbox application.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step 1: Create Stripe Account](#step-1-create-stripe-account)
3. [Step 2: Get Your API Keys](#step-2-get-your-api-keys)
4. [Step 3: Set Up Webhooks](#step-3-set-up-webhooks)
5. [Step 4: Configure Environment Variables](#step-4-configure-environment-variables)
6. [Step 5: Test Your Integration](#step-5-test-your-integration)
7. [Step 6: Go Live (Production)](#step-6-go-live-production)
8. [Troubleshooting](#troubleshooting)
9. [Security Best Practices](#security-best-practices)

---

## Prerequisites

- A Stripe account (we'll create one)
- Your Yubbox application running locally or on a server
- Access to your server's environment variables
- A domain name (for production webhooks)

---

## Step 1: Create Stripe Account

1. **Visit Stripe Website**
   - Go to [https://stripe.com](https://stripe.com)
   - Click **"Sign up"** or **"Start now"**

2. **Create Your Account**
   - Enter your email address
   - Create a password
   - Fill in your business details:
     - Business name: Your business name
     - Business type: Select appropriate type
     - Country: Your country
     - Website: Your website URL

3. **Verify Your Email**
   - Check your email inbox
   - Click the verification link from Stripe

4. **Complete Business Information**
   - Add your business address
   - Add your phone number
   - Complete any additional required information

---

## Step 2: Get Your API Keys

### For Testing (Test Mode)

1. **Access Dashboard**
   - Log in to [https://dashboard.stripe.com](https://dashboard.stripe.com)
   - Make sure you're in **Test mode** (toggle in top right)

2. **Get API Keys**
   - Click on **"Developers"** in the left sidebar
   - Click **"API keys"**
   - You'll see two keys:
     - **Publishable key** (starts with `pk_test_...`)
     - **Secret key** (starts with `sk_test_...`)

3. **Copy Your Keys**
   - Click **"Reveal test key"** for the secret key
   - Copy both keys (you'll need them in Step 4)

### For Production (Live Mode)

1. **Switch to Live Mode**
   - Toggle the **"Test mode"** switch to **"Live mode"** (top right)
   - Complete any additional verification required

2. **Get Production Keys**
   - Go to **"Developers"** → **"API keys"**
   - Copy your **Live** keys:
     - **Publishable key** (starts with `pk_live_...`)
     - **Secret key** (starts with `sk_live_...`)

---

## Step 3: Set Up Webhooks

Webhooks allow Stripe to notify your application when payment events occur (e.g., payment completed).

### For Local Development (Using Stripe CLI)

1. **Install Stripe CLI**
   - **Windows**: Download from [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)
   - **macOS**: `brew install stripe/stripe-cli/stripe`
   - **Linux**: Follow instructions on Stripe docs

2. **Login to Stripe CLI**
   ```bash
   stripe login
   ```
   - This will open your browser to authorize the CLI

3. **Forward Webhooks to Local Server**
   ```bash
   stripe listen --forward-to localhost:3000/api/payments/webhook
   ```
   - This will give you a webhook signing secret (starts with `whsec_...`)
   - **Copy this secret** - you'll need it for your `.env.local` file

### For Production (Using Stripe Dashboard)

1. **Go to Webhooks Section**
   - In Stripe Dashboard, go to **"Developers"** → **"Webhooks"**
   - Click **"Add endpoint"**

2. **Configure Webhook Endpoint**
   - **Endpoint URL**: `https://yourdomain.com/api/payments/webhook`
     - Replace `yourdomain.com` with your actual domain
   - **Description**: "Yubbox Payment Webhook"
   - **Events to send**: Select **"Select events"** and choose:
     - `checkout.session.completed`

3. **Get Webhook Signing Secret**
   - After creating the endpoint, click on it
   - Click **"Reveal"** next to **"Signing secret"**
   - Copy the secret (starts with `whsec_...`)

---

## Step 4: Configure Environment Variables

1. **Locate Your `.env.local` File**
   - In your Yubbox project root directory
   - If it doesn't exist, create it

2. **Add Stripe Configuration**

   **For Test Mode (Development):**
   ```env
   # Stripe Configuration (Test Mode)
   STRIPE_SECRET_KEY=sk_test_YOUR_TEST_SECRET_KEY
   STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_TEST_PUBLISHABLE_KEY
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET

   # Your application URL (for redirects)
   NEXTAUTH_URL=http://localhost:3000
   ```

   **For Production:**
   ```env
   # Stripe Configuration (Live Mode)
   STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_SECRET_KEY
   STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_PUBLISHABLE_KEY
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_PRODUCTION_WEBHOOK_SECRET

   # Your production URL
   NEXTAUTH_URL=https://yourdomain.com
   ```

3. **Replace Placeholder Values**
   - Replace `YOUR_TEST_SECRET_KEY` with your actual test secret key
   - Replace `YOUR_TEST_PUBLISHABLE_KEY` with your actual test publishable key
   - Replace `YOUR_WEBHOOK_SECRET` with your webhook signing secret
   - Replace `yourdomain.com` with your actual domain

4. **Important Notes**
   - **Never commit `.env.local` to Git** (it should be in `.gitignore`)
   - Keep your secret keys secure
   - Use test keys for development, live keys for production

---

## Step 5: Test Your Integration

### Test Payment Flow

1. **Start Your Development Server**
   ```bash
   npm run dev
   ```

2. **Start Stripe Webhook Listener** (if testing locally)
   ```bash
   stripe listen --forward-to localhost:3000/api/payments/webhook
   ```

3. **Test Payment Process**
   - Log in to your Yubbox application
   - Create a new Yubbox listing
   - Click **"Pay $1.00"** or **"Pay Now"**
   - You'll be redirected to Stripe Checkout

4. **Use Test Card Numbers**
   - **Successful payment**: `4242 4242 4242 4242`
   - **Declined payment**: `4000 0000 0000 0002`
   - **Requires authentication**: `4000 0025 0000 3155`
   - Use any future expiry date (e.g., 12/34)
   - Use any 3-digit CVC
   - Use any ZIP code

5. **Verify Payment**
   - After successful payment, you should be redirected to `/payment/success`
   - Check your Stripe Dashboard → **"Payments"** to see the test payment
   - Check your application dashboard - the Yubbox should be marked as paid

### Test Webhook Events

1. **View Webhook Events**
   - In Stripe Dashboard → **"Developers"** → **"Webhooks"**
   - Click on your webhook endpoint
   - View **"Recent events"** to see webhook deliveries

2. **Check Webhook Logs**
   - Look for `checkout.session.completed` events
   - Verify they're being sent successfully
   - Check your server logs for any errors

---

## Step 6: Go Live (Production)

### Before Going Live

1. **Complete Stripe Account Verification**
   - Go to **"Settings"** → **"Account"**
   - Complete all required verification steps
   - Add your bank account details for payouts

2. **Update Environment Variables**
   - Switch to production Stripe keys
   - Update `NEXTAUTH_URL` to your production domain
   - Update webhook endpoint URL in Stripe Dashboard

3. **Set Up Production Webhook**
   - Create a new webhook endpoint with your production URL
   - Use the production webhook signing secret

4. **Test Production Flow**
   - Make a small test payment with a real card
   - Verify the payment appears in your Stripe Dashboard
   - Verify the Yubbox is activated in your application

### Production Checklist

- [ ] Stripe account fully verified
- [ ] Production API keys configured
- [ ] Production webhook endpoint created
- [ ] Webhook signing secret updated in environment variables
- [ ] `NEXTAUTH_URL` set to production domain
- [ ] SSL certificate installed (HTTPS required)
- [ ] Test payment completed successfully
- [ ] Bank account added for payouts

---

## Troubleshooting

### Common Issues

#### 1. "Webhook signature verification failed"
   - **Solution**: Ensure `STRIPE_WEBHOOK_SECRET` matches your webhook signing secret
   - Check that you're using the correct secret (test vs. production)

#### 2. "No checkout URL received"
   - **Solution**: Verify `STRIPE_SECRET_KEY` is correct
   - Check Stripe Dashboard for any API errors

#### 3. Payment succeeds but Yubbox not activated
   - **Solution**: Check webhook logs in Stripe Dashboard
   - Verify webhook endpoint is accessible
   - Check server logs for errors

#### 4. Redirect URL issues
   - **Solution**: Ensure `NEXTAUTH_URL` matches your actual domain
   - Check that success/cancel URLs are correct

#### 5. "Invalid API Key"
   - **Solution**: Verify you're using the correct key (test vs. live)
   - Ensure there are no extra spaces in your `.env.local` file

### Debugging Tips

1. **Check Stripe Dashboard Logs**
   - Go to **"Developers"** → **"Logs"**
   - View API requests and responses

2. **Check Webhook Logs**
   - Go to **"Developers"** → **"Webhooks"**
   - Click on your endpoint
   - View recent events and their responses

3. **Check Application Logs**
   - Look at your server console output
   - Check for error messages related to Stripe

4. **Test Webhook Locally**
   ```bash
   stripe listen --forward-to localhost:3000/api/payments/webhook
   stripe trigger checkout.session.completed
   ```

---

## Security Best Practices

### 1. Protect Your Secret Keys
   - **Never** commit secret keys to version control
   - Use environment variables for all sensitive data
   - Rotate keys if they're ever exposed

### 2. Verify Webhook Signatures
   - Always verify webhook signatures (already implemented)
   - Use HTTPS for webhook endpoints
   - Keep webhook signing secrets secure

### 3. Use HTTPS
   - Stripe requires HTTPS for production
   - Ensure your domain has a valid SSL certificate

### 4. Validate Payment Data
   - Don't trust client-side data
   - Always verify payment status server-side
   - Use webhooks to confirm payments

### 5. Monitor Your Account
   - Regularly check Stripe Dashboard for suspicious activity
   - Set up email notifications for important events
   - Review failed payments and disputes

### 6. Handle Errors Gracefully
   - Implement proper error handling
   - Log errors for debugging
   - Provide clear error messages to users

---

## Additional Resources

- **Stripe Documentation**: [https://stripe.com/docs](https://stripe.com/docs)
- **Stripe API Reference**: [https://stripe.com/docs/api](https://stripe.com/docs/api)
- **Stripe Testing**: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)
- **Stripe Webhooks Guide**: [https://stripe.com/docs/webhooks](https://stripe.com/docs/webhooks)
- **Stripe CLI**: [https://stripe.com/docs/stripe-cli](https://stripe.com/docs/stripe-cli)

---

## Support

If you encounter issues:

1. Check Stripe Dashboard for error messages
2. Review Stripe documentation
3. Check your server logs
4. Contact Stripe support if needed

---

## Quick Reference

### Test Card Numbers
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

### Environment Variables Needed
```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXTAUTH_URL=http://localhost:3000
```

### Webhook Events Used
- `checkout.session.completed` - When payment is completed

---

**Last Updated**: 2024
**Stripe API Version**: Latest

