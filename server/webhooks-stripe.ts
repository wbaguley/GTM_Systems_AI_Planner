import { Request, Response } from "express";
import Stripe from "stripe";
import { stripe } from "./stripe";
import * as db from "./db-subscriptions";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

export async function handleStripeWebhook(req: Request, res: Response) {
  if (!stripe) {
    console.error("[Stripe Webhook] Stripe not initialized");
    return res.status(500).json({ error: "Stripe not configured" });
  }

  if (!WEBHOOK_SECRET) {
    console.error("[Stripe Webhook] Webhook secret not configured");
    return res.status(500).json({ error: "Webhook secret not configured" });
  }

  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("[Stripe Webhook] No signature found");
    return res.status(400).json({ error: "No signature" });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);
  } catch (err: any) {
    console.error(`[Stripe Webhook] Signature verification failed: ${err.message}`);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  console.log(`[Stripe Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error(`[Stripe Webhook] Error processing event: ${error.message}`);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log(`[Stripe Webhook] Checkout completed: ${session.id}`);

  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;
  const userId = session.metadata?.userId;

  if (!userId) {
    console.error("[Stripe Webhook] No userId in session metadata");
    return;
  }

  if (!subscriptionId) {
    console.log("[Stripe Webhook] No subscription in checkout session");
    return;
  }

  // Fetch the subscription to get the price ID
  if (!stripe) return;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0]?.price.id;

  if (!priceId) {
    console.error("[Stripe Webhook] No price ID found in subscription");
    return;
  }

  // Find the plan by price ID
  const plan = await db.getSubscriptionPlanByPriceId(priceId);

  if (!plan) {
    console.error(`[Stripe Webhook] No plan found for price ID: ${priceId}`);
    return;
  }

  // Create subscription record
  await db.createSubscription({
    userId: parseInt(userId),
    planId: plan.id,
    stripeSubscriptionId: subscriptionId,
    stripeCustomerId: customerId,
    status: subscription.status as "active" | "canceled" | "past_due" | "unpaid" | "trialing" | "incomplete" | "incomplete_expired",
    currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });

  console.log(`[Stripe Webhook] Created subscription for user ${userId}`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log(`[Stripe Webhook] Subscription updated: ${subscription.id}`);

  const priceId = subscription.items.data[0]?.price.id;

  if (!priceId) {
    console.error("[Stripe Webhook] No price ID found in subscription");
    return;
  }

  const plan = await db.getSubscriptionPlanByPriceId(priceId);

  if (!plan) {
    console.error(`[Stripe Webhook] No plan found for price ID: ${priceId}`);
    return;
  }

  await db.updateSubscriptionByStripeId(subscription.id, {
    planId: plan.id,
    status: subscription.status as "active" | "canceled" | "past_due" | "unpaid" | "trialing" | "incomplete" | "incomplete_expired",
    currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
    currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
    cancelAtPeriodEnd: subscription.cancel_at_period_end,
  });

  console.log(`[Stripe Webhook] Updated subscription: ${subscription.id}`);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log(`[Stripe Webhook] Subscription deleted: ${subscription.id}`);

  await db.updateSubscriptionByStripeId(subscription.id, {
    status: "canceled",
    canceledAt: new Date(),
  });

  console.log(`[Stripe Webhook] Marked subscription as canceled: ${subscription.id}`);
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log(`[Stripe Webhook] Invoice payment succeeded: ${invoice.id}`);

  const subscriptionId = (invoice as any).subscription as string;

  if (!subscriptionId) {
    console.log("[Stripe Webhook] No subscription in invoice");
    return;
  }

  // Update subscription status to active
  await db.updateSubscriptionByStripeId(subscriptionId, {
    status: "active",
  });

  console.log(`[Stripe Webhook] Updated subscription to active: ${subscriptionId}`);
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log(`[Stripe Webhook] Invoice payment failed: ${invoice.id}`);

  const subscriptionId = (invoice as any).subscription as string;

  if (!subscriptionId) {
    console.log("[Stripe Webhook] No subscription in invoice");
    return;
  }

  // Update subscription status to past_due
  await db.updateSubscriptionByStripeId(subscriptionId, {
    status: "past_due",
  });

  console.log(`[Stripe Webhook] Updated subscription to past_due: ${subscriptionId}`);
}

