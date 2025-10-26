import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";
import {
  subscriptions,
  subscriptionPlans,
  type Subscription,
  type InsertSubscription,
  type SubscriptionPlan,
  type InsertSubscriptionPlan,
} from "../drizzle/schema";

/**
 * Get all subscription plans
 */
export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.isActive, true))
    .orderBy(subscriptionPlans.price);
}

/**
 * Get a subscription plan by ID
 */
export async function getSubscriptionPlanById(
  planId: number
): Promise<SubscriptionPlan | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.id, planId))
    .limit(1);

  return result[0];
}

/**
 * Get a subscription plan by Stripe price ID
 */
export async function getSubscriptionPlanByPriceId(
  stripePriceId: string
): Promise<SubscriptionPlan | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.stripePriceId, stripePriceId))
    .limit(1);

  return result[0];
}

/**
 * Create or update a subscription plan
 */
export async function upsertSubscriptionPlan(
  plan: InsertSubscriptionPlan
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(subscriptionPlans)
    .where(eq(subscriptionPlans.stripePriceId, plan.stripePriceId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(subscriptionPlans)
      .set(plan)
      .where(eq(subscriptionPlans.id, existing[0].id));
    return existing[0].id;
  }

  const result = await db.insert(subscriptionPlans).values(plan);
  return result[0].insertId;
}

/**
 * Get user's active subscription
 */
export async function getUserSubscription(
  userId: number
): Promise<(Subscription & { plan: SubscriptionPlan }) | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select({
      subscription: subscriptions,
      plan: subscriptionPlans,
    })
    .from(subscriptions)
    .innerJoin(
      subscriptionPlans,
      eq(subscriptions.planId, subscriptionPlans.id)
    )
    .where(
      and(
        eq(subscriptions.userId, userId),
        eq(subscriptions.status, "active")
      )
    )
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);

  if (result.length === 0) return null;

  return {
    ...result[0].subscription,
    plan: result[0].plan,
  };
}

/**
 * Get subscription by Stripe subscription ID
 */
export async function getSubscriptionByStripeId(
  stripeSubscriptionId: string
): Promise<Subscription | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId))
    .limit(1);

  return result[0];
}

/**
 * Create a new subscription
 */
export async function createSubscription(
  subscription: InsertSubscription
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(subscriptions).values(subscription);
  return result[0].insertId;
}

/**
 * Update a subscription
 */
export async function updateSubscription(
  subscriptionId: number,
  updates: Partial<Subscription>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(subscriptions)
    .set(updates)
    .where(eq(subscriptions.id, subscriptionId));
}

/**
 * Update subscription by Stripe subscription ID
 */
export async function updateSubscriptionByStripeId(
  stripeSubscriptionId: string,
  updates: Partial<Subscription>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(subscriptions)
    .set(updates)
    .where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId));
}

/**
 * Check if user has access to a feature based on their subscription
 */
export async function userHasFeature(
  userId: number,
  feature: string
): Promise<boolean> {
  const subscription = await getUserSubscription(userId);

  if (!subscription) {
    // No subscription = Essentials features only
    const essentialsFeatures = ["platforms", "ai_upload", "dashboard"];
    return essentialsFeatures.includes(feature);
  }

  // Parse features from JSON
  const features = subscription.plan.features
    ? JSON.parse(subscription.plan.features)
    : [];

  return features.includes(feature);
}

/**
 * Get user's subscription tier
 */
export async function getUserSubscriptionTier(
  userId: number
): Promise<"free" | "essentials" | "pro"> {
  const subscription = await getUserSubscription(userId);

  if (!subscription) {
    return "free";
  }

  const planName = subscription.plan.name.toLowerCase();

  if (planName.includes("pro")) {
    return "pro";
  }

  if (planName.includes("essentials")) {
    return "essentials";
  }

  return "free";
}

