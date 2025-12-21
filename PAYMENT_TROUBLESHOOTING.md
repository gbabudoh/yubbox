# Payment Troubleshooting Guide

## Issue: Payment Successful but Ad Still Shows Unpaid

If you've completed a payment but your ad still shows as unpaid, follow these steps:

### Step 1: Check Webhook Status

1. **Check Stripe Dashboard**
   - Go to [Stripe Dashboard](https://dashboard.stripe.com)
   - Navigate to **Developers** → **Webhooks**
   - Click on your webhook endpoint
   - Check **Recent events** for `checkout.session.completed`
   - Look for any failed deliveries (red status)

2. **Check Webhook Logs**
   - Look at the **Response** column
   - If you see errors, check what they say
   - Common issues:
     - `Webhook signature verification failed` → Wrong webhook secret
     - `404 Not Found` → Webhook URL incorrect
     - `500 Internal Server Error` → Check server logs

### Step 2: Verify Webhook Configuration

**For Local Development:**
```bash
# Make sure Stripe CLI is running
stripe listen --forward-to localhost:3000/api/payments/webhook

# Check the webhook secret matches your .env.local
# It should start with whsec_
```

**For Production:**
- Webhook URL should be: `https://yourdomain.com/api/payments/webhook`
- Webhook secret should match `STRIPE_WEBHOOK_SECRET` in your environment variables
- Event type should be: `checkout.session.completed`

### Step 3: Check Server Logs

Look for these log messages when payment completes:
- `📦 Received checkout.session.completed event`
- `✅ Found payment: [paymentId]`
- `✅ Found ad: [adId]`
- `✅ Payment completed for ad [adId]`

If you don't see these, the webhook isn't being called.

### Step 4: Manual Payment Verification

The payment success page now automatically verifies payment status. If it still shows unpaid:

1. **Wait 10-30 seconds** - Webhooks can take a moment to process
2. **Refresh the dashboard** - The verification endpoint will check Stripe directly
3. **Check browser console** - Look for any errors

### Step 5: Manual Fix (If Needed)

If webhook failed and payment is confirmed in Stripe:

1. **Get the Stripe Session ID**
   - From Stripe Dashboard → Payments
   - Or from the payment success URL: `?session_id=cs_...`

2. **Use the Verification Endpoint**
   - The payment success page will automatically verify
   - Or manually call: `POST /api/payments/verify` with `{ "sessionId": "cs_..." }`

3. **Check Database Directly**
   - Payment should have `status: 'completed'`
   - Ad should have `isPaid: true`

### Common Issues and Solutions

#### Issue: Webhook Not Receiving Events

**Solution:**
- Verify webhook URL is correct and accessible
- Check firewall/security settings
- Ensure webhook secret matches
- For local dev, ensure Stripe CLI is running

#### Issue: Webhook Signature Verification Failed

**Solution:**
- Check `STRIPE_WEBHOOK_SECRET` matches the webhook signing secret
- For local dev, get new secret from `stripe listen` command
- For production, copy from Stripe Dashboard → Webhooks → Your endpoint → Signing secret

#### Issue: Payment Verified but Ad Not Updated

**Solution:**
- Check server logs for database errors
- Verify MongoDB connection
- Check if ad ID matches payment's adId
- Manually verify payment using `/api/payments/verify`

#### Issue: Metadata Missing

**Solution:**
- Check `app/api/payments/create-checkout/route.ts`
- Ensure metadata includes: `adId`, `userId`, `paymentId`
- Verify metadata is being passed to Stripe Checkout

### Testing Webhook Locally

1. **Start your dev server**
   ```bash
   npm run dev
   ```

2. **Start Stripe CLI**
   ```bash
   stripe listen --forward-to localhost:3000/api/payments/webhook
   ```

3. **Make a test payment**
   - Use test card: `4242 4242 4242 4242`
   - Complete payment
   - Check terminal for webhook logs

4. **Verify in database**
   - Check Payment collection: `status` should be `completed`
   - Check Ad collection: `isPaid` should be `true`

### Debugging Steps

1. **Check Payment Record**
   ```javascript
   // In MongoDB or via API
   db.payments.findOne({ transactionId: "cs_..." })
   ```

2. **Check Ad Record**
   ```javascript
   db.ads.findOne({ _id: ObjectId("...") })
   ```

3. **Check Stripe Session**
   ```bash
   stripe checkout sessions retrieve cs_...
   ```

4. **Check Webhook Events**
   - Stripe Dashboard → Developers → Events
   - Look for `checkout.session.completed`
   - Check if webhook was called and what response was returned

### Quick Fix Script

If payment is confirmed in Stripe but not updated in database:

```javascript
// Run this in MongoDB shell or create an API endpoint
const sessionId = "cs_..."; // From Stripe
const payment = await Payment.findOne({ transactionId: sessionId });

if (payment && payment.status !== 'completed') {
  const ad = await Ad.findById(payment.adId);
  if (ad) {
    const paymentDate = new Date();
    const expiryDate = new Date(paymentDate);
    expiryDate.setDate(expiryDate.getDate() + 30);
    
    payment.status = 'completed';
    payment.paymentDate = paymentDate;
    payment.expiryDate = expiryDate;
    await payment.save();
    
    ad.isPaid = true;
    ad.paymentDate = paymentDate;
    ad.expiryDate = expiryDate;
    ad.isActive = true;
    await ad.save();
  }
}
```

### Still Not Working?

1. Check server console logs for errors
2. Verify all environment variables are set correctly
3. Test webhook endpoint manually using Stripe CLI
4. Check MongoDB connection and database permissions
5. Verify Stripe API keys are correct (test vs. live)

