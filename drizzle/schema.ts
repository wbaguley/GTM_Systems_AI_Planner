import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, datetime, date } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export * from "./schema-apikeys";
export * from "./schema-custom-fields";
export * from "./schema-modules";
export * from "./schema-gtm-framework";

/**
 * Platforms table for tracking tech stack
 */
export const platforms = mysqlTable("platforms", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Basic information
  platform: varchar("platform", { length: 255 }).notNull(),
  useCase: text("useCase"),
  website: varchar("website", { length: 500 }),
  logoUrl: varchar("logoUrl", { length: 500 }),
  
  // Cost and ownership
  costOwner: mysqlEnum("costOwner", ["Client", "GTM Planetary", "Both"]).notNull(),
  status: mysqlEnum("status", ["Active", "Inactive", "Cancelled"]).default("Active").notNull(),
  
  // Billing structure
  billingType: mysqlEnum("billingType", ["Monthly", "Yearly", "OneTime", "Usage", "Free Plan", "Pay as you go"]),
  licenses: varchar("licenses", { length: 100 }),
  
  // Costs
  monthlyAmount: int("monthlyAmount").default(0),
  yearlyAmount: int("yearlyAmount").default(0),
  oneTimeAmount: int("oneTimeAmount").default(0),
  balanceUsage: int("balanceUsage").default(0),
  
  // Renewal and dates
  renewalDate: date("renewalDate"),
  renewalDay: int("renewalDay"),
  
  // Categories
  isMyToolbelt: boolean("isMyToolbelt").default(false),
  isInternalBusiness: boolean("isInternalBusiness").default(false),
  isSolutionPartner: boolean("isSolutionPartner").default(false),
  
  // Notes
  notesForManus: text("notesForManus"),
  notesForStaff: text("notesForStaff"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Platform = typeof platforms.$inferSelect;
export type InsertPlatform = typeof platforms.$inferInsert;

