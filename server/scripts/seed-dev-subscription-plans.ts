/**
 * Seed subscription plans for development (without Stripe)
 * This creates plans with placeholder Stripe IDs for development purposes
 */

import { getDb } from "../db";
import { subscriptionPlans } from "../../drizzle/schema";

async function seedDevSubscriptionPlans() {
  console.log("[Seed] Seeding development subscription plans...");

  const db = await getDb();
  if (!db) {
    console.error("[Seed] Database not available");
    process.exit(1);
  }

  try {
    // Check if plans already exist
    const existing = await db.select().from(subscriptionPlans);
    
    if (existing.length > 0) {
      console.log(`[Seed] Found ${existing.length} existing plans - skipping`);
      process.exit(0);
    }

    console.log("[Seed] Creating development subscription plans...");
    
    // Create Free plan
    await db.insert(subscriptionPlans).values({
      name: "Free",
      stripePriceId: "price_dev_free",
      stripeProductId: "prod_dev_free",
      price: "0.00",
      interval: "month",
      features: JSON.stringify([
        "platforms",
        "dashboard",
      ]),
      isActive: true,
    });
    console.log("[Seed] ✓ Created Free plan");

    // Create Essentials plan
    await db.insert(subscriptionPlans).values({
      name: "Essentials",
      stripePriceId: "price_dev_essentials",
      stripeProductId: "prod_dev_essentials",
      price: "15.00",
      interval: "month",
      features: JSON.stringify([
        "platforms",
        "dashboard",
        "ai_upload",
        "export",
        "settings",
        "gtm_framework",
        "icp_assessment",
      ]),
      isActive: true,
    });
    console.log("[Seed] ✓ Created Essentials plan");

    // Create Pro plan
    await db.insert(subscriptionPlans).values({
      name: "Pro",
      stripePriceId: "price_dev_pro",
      stripeProductId: "prod_dev_pro",
      price: "30.00",
      interval: "month",
      features: JSON.stringify([
        "platforms",
        "dashboard",
        "ai_upload",
        "export",
        "settings",
        "gtm_framework",
        "playbook_builder",
        "icp_assessment",
        "sop_generator",
        "priority_support",
      ]),
      isActive: true,
    });
    console.log("[Seed] ✓ Created Pro plan");

    console.log("[Seed] ✓ Development subscription plans seeded successfully");
    console.log("[Seed] Note: These are development plans with placeholder Stripe IDs");
    
    process.exit(0);
  } catch (error: any) {
    console.error("[Seed] Error seeding plans:", error.message);
    process.exit(1);
  }
}

seedDevSubscriptionPlans();

