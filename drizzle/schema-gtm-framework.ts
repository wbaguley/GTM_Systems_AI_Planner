import { int, json, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * GTM Framework Assessments
 * Stores assessment results and scores for companies
 */
export const gtmAssessments = mysqlTable("gtm_assessments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  companyName: varchar("companyName", { length: 255 }),
  industry: varchar("industry", { length: 255 }),
  assessmentDate: timestamp("assessmentDate").defaultNow().notNull(),
  
  // Overall scores
  overallScore: int("overallScore").default(0), // 0-100
  
  // Category scores
  marketStrategyScore: int("marketStrategyScore").default(0),
  salesProcessScore: int("salesProcessScore").default(0),
  marketingOpsScore: int("marketingOpsScore").default(0),
  customerSuccessScore: int("customerSuccessScore").default(0),
  revenueOpsScore: int("revenueOpsScore").default(0),
  teamEnablementScore: int("teamEnablementScore").default(0),
  
  // Raw responses (JSON)
  responses: json("responses"),
  
  // AI-generated insights
  strengths: text("strengths"),
  gaps: text("gaps"),
  recommendations: text("recommendations"),
  actionPlan: text("actionPlan"),
  
  // Metadata
  status: varchar("status", { length: 50 }).default("in_progress"), // in_progress, completed
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * GTM Framework Questions
 * Stores the assessment questions organized by category
 */
export const gtmQuestions = mysqlTable("gtm_questions", {
  id: int("id").autoincrement().primaryKey(),
  category: varchar("category", { length: 100 }).notNull(), // market_strategy, sales_process, etc.
  question: text("question").notNull(),
  questionType: varchar("questionType", { length: 50 }).notNull(), // multiple_choice, scale, text, yes_no
  options: json("options"), // For multiple choice questions
  weight: int("weight").default(1), // Importance weight for scoring
  displayOrder: int("displayOrder").default(0),
  isActive: int("isActive").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GtmAssessment = typeof gtmAssessments.$inferSelect;
export type InsertGtmAssessment = typeof gtmAssessments.$inferInsert;
export type GtmQuestion = typeof gtmQuestions.$inferSelect;
export type InsertGtmQuestion = typeof gtmQuestions.$inferInsert;

