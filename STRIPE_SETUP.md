# Stripe Subscription Setup Guide

This document explains how to set up Stripe for the GTM Planetary Tech Stack Tracker subscription system.

## Overview

The application uses Stripe for subscription management with two plans:
- **Essentials**: $15/month - Platform tracking with AI upload only
- **Pro**: $30/month - Full access to all features

## Prerequisites

1. A Stripe account (sign up at https://stripe.com)
2. Access to your Stripe Dashboard

## Step 1: Get Your Stripe API Keys

1. Go to https://dashboard.stripe.com/apikeys
2. Copy your **Publishable key** (starts with `pk_`)
3. Copy your **Secret key** (starts with `sk_`)
4. For production, use **Live** keys. For testing, use **Test** keys.

## Step 2: Create Products and Prices in Stripe

### Option A: Using Stripe Dashboard (Recommended for first-time setup)

1. Go to https://dashboard.stripe.com/products
2. Click **"+ Add product"**

**For Essentials Plan:**
- Product name: `GTM Planetary Essentials`
- Description: `Platform tracking with AI upload and basic dashboard`
- Pricing model: `Standard pricing`
- Price: `$15.00 USD`
- Billing period: `Monthly`
- Click **"Save product"**
- Copy the **Price ID** (starts with `price_`)

**For Pro Plan:**
- Product name: `GTM Planetary Pro`
- Description: `Full access to GTM Framework, Playbook Builder, ICP Assessment, and all features`
- Pricing model: `Standard pricing`
- Price: `$30.00 USD`
- Billing period: `Monthly`
- Click **"Save product"**
- Copy the **Price ID** (starts with `price_`)

### Option B: Using Stripe CLI (For developers)

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli

# Create Essentials product and price
stripe products create \
  --name="GTM Planetary Essentials" \
  --description="Platform tracking with AI upload and basic dashboard"

# Note the product ID, then create the price
stripe prices create \
  --product=prod_XXXXX \
  --unit-amount=1500 \
  --currency=usd \
  --recurring[interval]=month

# Create Pro product and price
stripe products create \
  --name="GTM Planetary Pro" \
  --description="Full access to all features"

stripe prices create \
  --product=prod_YYYYY \
  --unit-amount=3000 \
  --currency=usd \
  --recurring[interval]=month
```

## Step 3: Set Up Environment Variables

Add these to your `.env` file or Manus environment secrets:

```env
# Stripe API Keys
STRIPE_SECRET_KEY=sk_test_xxxxx  # or sk_live_xxxxx for production
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx  # or pk_live_xxxxx for production

# Stripe Price IDs (from Step 2)
STRIPE_ESSENTIALS_PRICE_ID=price_xxxxx
STRIPE_PRO_PRICE_ID=price_yyyyy

# Stripe Webhook Secret (from Step 4)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

## Step 4: Set Up Webhook Endpoint

Stripe needs to send events to your application when subscriptions change.

### For Development (using Stripe CLI)

```bash
# Forward webhook events to your local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# This will output a webhook signing secret like: whsec_xxxxx
# Add this to your .env as STRIPE_WEBHOOK_SECRET
```

### For Production

1. Go to https://dashboard.stripe.com/webhooks
2. Click **"+ Add endpoint"**
3. Enter your webhook URL: `https://app.gtmplanetary.com/api/webhooks/stripe`
4. Select events to listen to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click **"Add endpoint"**
6. Copy the **Signing secret** (starts with `whsec_`)
7. Add it to your environment as `STRIPE_WEBHOOK_SECRET`

## Step 5: Initialize Subscription Plans in Database

Run this script to create the subscription plans in your database:

```bash
cd /home/ubuntu/GTM_Systems_AI_Planner_Web
pnpm tsx server/scripts/init-subscription-plans.ts
```

This will create two records in the `subscription_plans` table with your Stripe price IDs.

## Step 6: Test the Subscription Flow

### Using Stripe Test Mode

1. Make sure you're using **test** API keys (starts with `pk_test_` and `sk_test_`)
2. Go to your pricing page: http://localhost:3000/pricing
3. Click "Subscribe" on either plan
4. Use Stripe's test card numbers:
   - **Success**: `4242 4242 4242 4242`
   - **Decline**: `4000 0000 0000 0002`
   - Use any future expiration date, any 3-digit CVC, any ZIP code
5. Complete the checkout
6. You should be redirected back to the app with an active subscription

### Verify in Stripe Dashboard

1. Go to https://dashboard.stripe.com/subscriptions
2. You should see your test subscription
3. Go to https://dashboard.stripe.com/webhooks
4. Click on your webhook endpoint
5. You should see successful webhook events

## Step 7: Go Live

When you're ready to accept real payments:

1. **Activate your Stripe account** (complete business verification)
2. **Replace test keys with live keys** in your environment variables
3. **Create live products and prices** (repeat Step 2 with live mode)
4. **Update webhook endpoint** to use your production URL
5. **Test with a real card** (you can cancel immediately)
6. **Remove development authentication bypass** from `server/_core/context.ts`

## Troubleshooting

### Webhook events not being received

- Check that `STRIPE_WEBHOOK_SECRET` is set correctly
- Verify the webhook endpoint URL is correct
- Check server logs for webhook errors
- Use Stripe CLI to test locally: `stripe trigger checkout.session.completed`

### Checkout not working

- Verify `VITE_STRIPE_PUBLISHABLE_KEY` is set and starts with `pk_`
- Check browser console for errors
- Ensure price IDs are correct in environment variables

### Subscription not showing in app

- Check database for subscription record
- Verify webhook events were received successfully
- Check server logs for errors during webhook processing

## Security Notes

- **Never commit** `.env` files or API keys to version control
- Use **test mode** for development and testing
- Only use **live mode** in production
- Rotate API keys if they're ever exposed
- Keep webhook signing secrets secure

## Support

- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- GTM Planetary Support: Contact Wyatt

## Custom Domain Setup

Once you set up your custom domain (app.gtmplanetary.com), remember to:
1. Update the webhook endpoint URL in Stripe Dashboard
2. Update any hardcoded URLs in the application
3. Test the entire subscription flow again with the new domain

