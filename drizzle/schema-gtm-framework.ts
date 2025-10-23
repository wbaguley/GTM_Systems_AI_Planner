import { int, mysqlTable, text, timestamp, varchar, json } from "drizzle-orm/mysql-core";

/**
 * GTM Frameworks - The 8 predefined frameworks
 */
export const gtmFrameworks = mysqlTable("gtm_frameworks", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 50 }), // Icon name for UI
  colorScheme: varchar("colorScheme", { length: 50 }), // Color theme for UI
  expertTrainingData: json("expertTrainingData").$type<{
    principles: string[];
    bestPractices: string[];
    commonPitfalls: string[];
    keyMetrics: string[];
    successIndicators: string[];
  }>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GtmFramework = typeof gtmFrameworks.$inferSelect;
export type InsertGtmFramework = typeof gtmFrameworks.$inferInsert;

/**
 * Framework Questions - Assessment questions for each framework
 */
export const gtmFrameworkQuestions = mysqlTable("gtm_framework_questions", {
  id: int("id").autoincrement().primaryKey(),
  frameworkId: int("frameworkId").notNull(),
  category: varchar("category", { length: 255 }).notNull(),
  questionText: text("questionText").notNull(),
  questionType: varchar("questionType", { length: 50 }).notNull(), // text, rating, multipleChoice, etc.
  options: json("options").$type<string[]>(), // For multiple choice questions
  orderIndex: int("orderIndex").notNull().default(0),
  isRequired: int("isRequired").notNull().default(1), // 1 = required, 0 = optional
  helpText: text("helpText"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GtmFrameworkQuestion = typeof gtmFrameworkQuestions.$inferSelect;
export type InsertGtmFrameworkQuestion = typeof gtmFrameworkQuestions.$inferInsert;

/**
 * Assessments - User assessment sessions
 */
export const gtmAssessments = mysqlTable("gtm_assessments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  frameworkId: int("frameworkId").notNull(),
  companyName: varchar("companyName", { length: 255 }),
  industry: varchar("industry", { length: 255 }),
  status: varchar("status", { length: 50 }).notNull().default("in_progress"), // in_progress, completed, archived
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GtmAssessment = typeof gtmAssessments.$inferSelect;
export type InsertGtmAssessment = typeof gtmAssessments.$inferInsert;

/**
 * Assessment Responses - User answers to questions
 */
export const gtmAssessmentResponses = mysqlTable("gtm_assessment_responses", {
  id: int("id").autoincrement().primaryKey(),
  assessmentId: int("assessmentId").notNull(),
  questionId: int("questionId").notNull(),
  responseValue: text("responseValue").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GtmAssessmentResponse = typeof gtmAssessmentResponses.$inferSelect;
export type InsertGtmAssessmentResponse = typeof gtmAssessmentResponses.$inferInsert;

/**
 * Assessment Results - AI analysis and recommendations
 */
export const gtmAssessmentResults = mysqlTable("gtm_assessment_results", {
  id: int("id").autoincrement().primaryKey(),
  assessmentId: int("assessmentId").notNull().unique(),
  overallScore: int("overallScore").notNull(), // 0-100
  categoryScores: json("categoryScores").$type<Record<string, number>>(),
  strengths: json("strengths").$type<string[]>(),
  gaps: json("gaps").$type<string[]>(),
  recommendations: json("recommendations").$type<{
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
  }[]>(),
  actionPlan: json("actionPlan").$type<{
    phase: string;
    actions: string[];
    timeline: string;
  }[]>(),
  aiAnalysis: text("aiAnalysis"), // Full AI analysis text
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GtmAssessmentResult = typeof gtmAssessmentResults.$inferSelect;
export type InsertGtmAssessmentResult = typeof gtmAssessmentResults.$inferInsert;

