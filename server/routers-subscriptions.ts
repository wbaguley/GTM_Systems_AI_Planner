import { z } from "zod";
import { router, protectedProcedure, publicProcedure } from "./_core/trpc";
import * as db from "./db-subscriptions";
import {
  getOrCreateStripeCustomer,
  createCheckoutSession,
  createBillingPortalSession,
  cancelSubscription,
  reactivateSubscription,
} from "./stripe";

export const subscriptionsRouter = router({
  /**
   * Get all available subscription plans
   */
  getPlans: publicProcedure.query(async () => {
    return await db.getSubscriptionPlans();
  }),

  /**
   * Get current user's subscription
   */
  getMySubscription: protectedProcedure.query(async ({ ctx }) => {
    return await db.getUserSubscription(ctx.user.id);
  }),

  /**
   * Get user's subscription tier
   */
  getMyTier: protectedProcedure.query(async ({ ctx }) => {
    return await db.getUserSubscriptionTier(ctx.user.id);
  }),

  /**
   * Check if user has access to a feature
   */
  hasFeature: protectedProcedure
    .input(z.object({ feature: z.string() }))
    .query(async ({ ctx, input }) => {
      return await db.userHasFeature(ctx.user.id, input.feature);
    }),

  /**
   * Create a Stripe Checkout session
   */
  createCheckout: protectedProcedure
    .input(
      z.object({
        planId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const plan = await db.getSubscriptionPlanById(input.planId);

      if (!plan) {
        throw new Error("Plan not found");
      }

      if (!ctx.user.email) {
        throw new Error("User email is required");
      }

      // Get or create Stripe customer
      const customerId = await getOrCreateStripeCustomer({
        email: ctx.user.email,
        name: ctx.user.name,
        userId: ctx.user.id,
      });

      // Create checkout session
      const session = await createCheckoutSession({
        customerId,
        priceId: plan.stripePriceId,
        successUrl: `${process.env.APP_URL || "http://localhost:3001"}/settings?success=true`,
        cancelUrl: `${process.env.APP_URL || "http://localhost:3001"}/pricing?canceled=true`,
        userId: ctx.user.id,
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    }),

  /**
   * Create a billing portal session
   */
  createBillingPortal: protectedProcedure.mutation(async ({ ctx }) => {
    const subscription = await db.getUserSubscription(ctx.user.id);

    if (!subscription || !subscription.stripeCustomerId) {
      throw new Error("No active subscription found");
    }

    const session = await createBillingPortalSession({
      customerId: subscription.stripeCustomerId,
      returnUrl: `${process.env.APP_URL || "http://localhost:3001"}/settings`,
    });

    return {
      url: session.url,
    };
  }),

  /**
   * Cancel subscription at period end
   */
  cancel: protectedProcedure.mutation(async ({ ctx }) => {
    const subscription = await db.getUserSubscription(ctx.user.id);

    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new Error("No active subscription found");
    }

    await cancelSubscription(subscription.stripeSubscriptionId);

    await db.updateSubscription(subscription.id, {
      cancelAtPeriodEnd: true,
    });

    return { success: true };
  }),

  /**
   * Reactivate a canceled subscription
   */
  reactivate: protectedProcedure.mutation(async ({ ctx }) => {
    const subscription = await db.getUserSubscription(ctx.user.id);

    if (!subscription || !subscription.stripeSubscriptionId) {
      throw new Error("No active subscription found");
    }

    await reactivateSubscription(subscription.stripeSubscriptionId);

    await db.updateSubscription(subscription.id, {
      cancelAtPeriodEnd: false,
    });

    return { success: true };
  }),
});

