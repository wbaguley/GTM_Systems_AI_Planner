# Stripe Setup Guide for GTM Planetary Tech Stack Tracker

This guide will walk you through setting up Stripe for your subscription system.

## Step 1: Create Stripe Account

1. Go to https://stripe.com
2. Click "Start now" or "Sign up"
3. Complete the registration process
4. Verify your email address

## Step 2: Activate Your Account

1. Log into your Stripe Dashboard
2. Click "Activate your account" in the banner
3. Complete the business information form:
   - Business type: Individual or Company
   - Business details: GTM Planetary
   - Website: gtmplanetary.com (or your domain)
   - Business description: "SaaS platform for managing technology stacks and subscriptions"
4. Add bank account details for payouts
5. Verify your identity (may require ID upload)

## Step 3: Create Products and Prices

### Create Essentials Plan ($15/month)

1. In Stripe Dashboard, go to **Products** → **Add product**
2. Fill in the details:
   - **Name:** Essentials
   - **Description:** Full platform tracking with AI upload capabilities
   - **Pricing model:** Standard pricing
   - **Price:** $15.00
   - **Billing period:** Monthly
   - **Currency:** USD
3. Click **Save product**
4. **Copy the Price ID** (starts with `price_...`) - you'll need this later

### Create Pro Plan ($30/month)

1. Click **Add product** again
2. Fill in the details:
   - **Name:** Pro
   - **Description:** All features including GTM Framework, Playbook Builder, and ICP Assessment
   - **Pricing model:** Standard pricing
   - **Price:** $30.00
   - **Billing period:** Monthly
   - **Currency:** USD
3. Click **Save product**
4. **Copy the Price ID** (starts with `price_...`) - you'll need this later

## Step 4: Get Your API Keys

### For Testing (Use Test Mode First!)

1. In Stripe Dashboard, toggle to **Test mode** (switch in top right)
2. Go to **Developers** → **API keys**
3. You'll see two keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`) - Click "Reveal test key"
4. **Copy both keys** - you'll add these to your environment variables

### For Production (After Testing)

1. Toggle to **Live mode**
2. Go to **Developers** → **API keys**
3. Copy:
   - **Publishable key** (starts with `pk_live_...`)
   - **Secret key** (starts with `sk_live_...`)

## Step 5: Configure Webhook Endpoint

Webhooks allow Stripe to notify your app when subscription events occur (payments, cancellations, etc.).

### Set Up Webhook

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL:
   - **For testing:** `https://your-dev-url.manusvm.computer/api/webhooks/stripe`
   - **For production:** `https://app.gtmplanetary.com/api/webhooks/stripe`
4. Click **Select events** and choose:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **Add endpoint**
6. **Copy the Signing secret** (starts with `whsec_...`) - you'll need this

## Step 6: Add Environment Variables

You need to add these secrets to your Manus project:

### Required Secrets

1. **STRIPE_SECRET_KEY** - Your Stripe secret key (sk_test_... or sk_live_...)
2. **STRIPE_PUBLISHABLE_KEY** - Your Stripe publishable key (pk_test_... or pk_live_...)
3. **STRIPE_WEBHOOK_SECRET** - Your webhook signing secret (whsec_...)
4. **ESSENTIALS_PRICE_ID** - The Price ID for Essentials plan (price_...)
5. **PRO_PRICE_ID** - The Price ID for Pro plan (price_...)

### How to Add Secrets in Manus

1. Open the Manus interface
2. Click on the **Management UI** icon (top right)
3. Go to **Settings** → **Secrets**
4. Click **Add Secret** for each one:
   - Key: `STRIPE_SECRET_KEY`
   - Value: `sk_test_...` (your secret key)
5. Repeat for all 5 secrets above

## Step 7: Initialize Subscription Plans in Database

After adding the environment variables, run this command to create the plans in your database:

```bash
cd /home/ubuntu/GTM_Systems_AI_Planner_Web
pnpm tsx server/scripts/init-subscription-plans.ts
```

This will:
- Create Essentials and Pro plans in your database
- Link them to your Stripe Price IDs
- Set up the feature lists for each plan

## Step 8: Test the Subscription Flow

### Test Mode Testing

1. Make sure you're in **Test mode** in Stripe
2. Go to your app's pricing page
3. Click "Subscribe" on a plan
4. Use Stripe's test card numbers:
   - **Success:** `4242 4242 4242 4242`
   - **Decline:** `4000 0000 0000 0002`
   - **Requires authentication:** `4000 0025 0000 3155`
   - Any future expiry date (e.g., 12/34)
   - Any 3-digit CVC
   - Any ZIP code

5. Complete the checkout
6. Verify you're redirected back and have access to the features
7. Check Stripe Dashboard to see the subscription

### Test Webhook Events

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. You'll see a list of events sent
4. Click on an event to see the details and response

## Step 9: Switch to Production

Once testing is complete:

1. Toggle Stripe to **Live mode**
2. Update your environment variables with live keys:
   - Replace `sk_test_...` with `sk_live_...`
   - Replace `pk_test_...` with `pk_live_...`
   - Update webhook secret if you created a new webhook for production
3. Update webhook URL to production domain: `https://app.gtmplanetary.com/api/webhooks/stripe`
4. Run the init script again with production Price IDs

## Troubleshooting

### Webhook Not Receiving Events

- Check that the webhook URL is correct
- Verify the webhook secret matches
- Check server logs for errors
- Use Stripe's webhook testing tool to send test events

### Checkout Not Working

- Verify API keys are correct
- Check browser console for errors
- Ensure CORS is properly configured
- Verify Price IDs match your Stripe products

### Subscription Not Updating in App

- Check webhook events in Stripe Dashboard
- Verify webhook handler is processing events
- Check database for subscription records
- Look at server logs for errors

## Important Notes

- **Always test in Test mode first** before going live
- **Never commit API keys** to your repository
- **Use webhook signing** to verify events are from Stripe
- **Handle failed payments** gracefully
- **Monitor your Stripe Dashboard** regularly

## Support

If you encounter issues:
- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- GTM Planetary Support: support@gtmplanetary.com

---

## Quick Reference

### Test Card Numbers
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Requires 3D Secure: `4000 0025 0000 3155`

### Webhook Events to Monitor
- `customer.subscription.created` - New subscription
- `customer.subscription.updated` - Subscription changed
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.payment_succeeded` - Payment successful
- `invoice.payment_failed` - Payment failed

### Environment Variables Needed
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
ESSENTIALS_PRICE_ID=price_...
PRO_PRICE_ID=price_...
```

