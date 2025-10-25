import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";
import { users } from "./schema";

/**
 * Subscription plans available in the system
 */
export const subscriptionPlans = mysqlTable("subscription_plans", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 50 }).notNull(), // "Essentials" or "Pro"
  stripePriceId: varchar("stripe_price_id", { length: 255 }).notNull().unique(),
  stripeProductId: varchar("stripe_product_id", { length: 255 }).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(), // Monthly price in USD
  interval: mysqlEnum("interval", ["month", "year"]).default("month").notNull(),
  features: text("features"), // JSON array of feature flags
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

/**
 * User subscriptions
 */
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id),
  planId: int("plan_id").notNull().references(() => subscriptionPlans.id),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }).unique(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 255 }).notNull(),
  status: mysqlEnum("status", [
    "active",
    "canceled",
    "past_due",
    "unpaid",
    "trialing",
    "incomplete",
    "incomplete_expired"
  ]).default("incomplete").notNull(),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
  canceledAt: timestamp("canceled_at"),
  trialStart: timestamp("trial_start"),
  trialEnd: timestamp("trial_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;
export type InsertSubscriptionPlan = typeof subscriptionPlans.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

