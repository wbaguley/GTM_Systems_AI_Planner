/**
 * Initialize subscription plans in the database
 * Run this script after setting up Stripe products and prices
 * 
 * Usage: pnpm tsx server/scripts/init-subscription-plans.ts
 */

import { getDb } from "../db";
import { subscriptionPlans } from "../../drizzle/schema";

const ESSENTIALS_PRICE_ID = process.env.STRIPE_ESSENTIALS_PRICE_ID;
const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID;

async function initSubscriptionPlans() {
  console.log("[Init] Initializing subscription plans...");

  if (!ESSENTIALS_PRICE_ID || !PRO_PRICE_ID) {
    console.error("[Init] Missing Stripe price IDs in environment variables");
    console.error("[Init] Please set STRIPE_ESSENTIALS_PRICE_ID and STRIPE_PRO_PRICE_ID");
    process.exit(1);
  }

  const db = await getDb();
  if (!db) {
    console.error("[Init] Database not available");
    process.exit(1);
  }

  try {
    // Check if plans already exist
    const existing = await db.select().from(subscriptionPlans);
    
    if (existing.length > 0) {
      console.log(`[Init] Found ${existing.length} existing plans`);
      console.log("[Init] Updating plans with new price IDs...");
      
      // Update existing plans
      for (const plan of existing) {
        if (plan.name === "Essentials") {
          await db
            .update(subscriptionPlans)
            .set({
              stripePriceId: ESSENTIALS_PRICE_ID,
              price: "15.00",
              updatedAt: new Date(),
            })
            .where({ id: plan.id } as any);
          console.log("[Init] Updated Essentials plan");
        } else if (plan.name === "Pro") {
          await db
            .update(subscriptionPlans)
            .set({
              stripePriceId: PRO_PRICE_ID,
              price: "30.00",
              updatedAt: new Date(),
            })
            .where({ id: plan.id } as any);
          console.log("[Init] Updated Pro plan");
        }
      }
    } else {
      console.log("[Init] Creating new subscription plans...");
      
      // Create Essentials plan
      await db.insert(subscriptionPlans).values({
        name: "Essentials",
        stripePriceId: ESSENTIALS_PRICE_ID,
        stripeProductId: "prod_essentials", // This will be updated by webhook
        price: "15.00",
        interval: "month",
        features: JSON.stringify([
          "platforms",
          "dashboard",
          "ai_upload",
          "export",
          "settings",
        ]),
        isActive: true,
      });
      console.log("[Init] Created Essentials plan ($15/month)");

      // Create Pro plan
      await db.insert(subscriptionPlans).values({
        name: "Pro",
        stripePriceId: PRO_PRICE_ID,
        stripeProductId: "prod_pro", // This will be updated by webhook
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
          "priority_support",
        ]),
        isActive: true,
      });
      console.log("[Init] Created Pro plan ($30/month)");
    }

    console.log("[Init] ✓ Subscription plans initialized successfully");
    console.log("[Init] ");
    console.log("[Init] Next steps:");
    console.log("[Init] 1. Set up webhook endpoint in Stripe Dashboard");
    console.log("[Init] 2. Test the subscription flow");
    console.log("[Init] 3. Remove development authentication bypass before going live");
    
    process.exit(0);
  } catch (error: any) {
    console.error("[Init] Error initializing plans:", error.message);
    process.exit(1);
  }
}

initSubscriptionPlans();

