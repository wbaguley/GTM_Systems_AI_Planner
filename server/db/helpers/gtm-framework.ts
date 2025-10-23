import { eq, and, desc } from "drizzle-orm";
import { getDb } from "../../db";
import {
  gtmFrameworks,
  gtmFrameworkQuestions,
  gtmAssessments,
  gtmAssessmentResponses,
  gtmAssessmentResults,
  type GtmFramework,
  type GtmFrameworkQuestion,
  type GtmAssessment,
  type InsertGtmAssessment,
  type GtmAssessmentResponse,
  type InsertGtmAssessmentResponse,
  type GtmAssessmentResult,
  type InsertGtmAssessmentResult,
} from "../../../drizzle/schema";

// Framework operations
export async function getAllFrameworks(): Promise<GtmFramework[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(gtmFrameworks);
}

export async function getFrameworkBySlug(slug: string): Promise<GtmFramework | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const results = await db.select().from(gtmFrameworks).where(eq(gtmFrameworks.slug, slug));
  return results[0];
}

export async function getFrameworkById(id: number): Promise<GtmFramework | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const results = await db.select().from(gtmFrameworks).where(eq(gtmFrameworks.id, id));
  return results[0];
}

// Question operations
export async function getFrameworkQuestions(frameworkId: number): Promise<GtmFrameworkQuestion[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(gtmFrameworkQuestions)
    .where(eq(gtmFrameworkQuestions.frameworkId, frameworkId))
    .orderBy(gtmFrameworkQuestions.orderIndex);
}

// Assessment operations
export async function createAssessment(data: InsertGtmAssessment): Promise<GtmAssessment> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(gtmAssessments).values(data);
  const [assessment] = await db
    .select()
    .from(gtmAssessments)
    .where(eq(gtmAssessments.id, result.insertId));
  
  return assessment;
}

export async function getUserAssessments(userId: number): Promise<GtmAssessment[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(gtmAssessments)
    .where(eq(gtmAssessments.userId, userId))
    .orderBy(desc(gtmAssessments.createdAt));
}

export async function getAssessmentById(id: number, userId: number): Promise<GtmAssessment | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const results = await db
    .select()
    .from(gtmAssessments)
    .where(and(eq(gtmAssessments.id, id), eq(gtmAssessments.userId, userId)));
  return results[0];
}

export async function updateAssessmentStatus(
  id: number,
  userId: number,
  status: string,
  completedAt?: Date
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(gtmAssessments)
    .set({ status, completedAt })
    .where(and(eq(gtmAssessments.id, id), eq(gtmAssessments.userId, userId)));
}

// Response operations
export async function saveAssessmentResponse(data: InsertGtmAssessmentResponse): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if response already exists
  const existing = await db
    .select()
    .from(gtmAssessmentResponses)
    .where(
      and(
        eq(gtmAssessmentResponses.assessmentId, data.assessmentId),
        eq(gtmAssessmentResponses.questionId, data.questionId)
      )
    );
  
  if (existing.length > 0) {
    // Update existing response
    await db
      .update(gtmAssessmentResponses)
      .set({ responseValue: data.responseValue })
      .where(
        and(
          eq(gtmAssessmentResponses.assessmentId, data.assessmentId),
          eq(gtmAssessmentResponses.questionId, data.questionId)
        )
      );
  } else {
    // Insert new response
    await db.insert(gtmAssessmentResponses).values(data);
  }
}

export async function getAssessmentResponses(assessmentId: number): Promise<GtmAssessmentResponse[]> {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(gtmAssessmentResponses)
    .where(eq(gtmAssessmentResponses.assessmentId, assessmentId));
}

// Result operations
export async function saveAssessmentResult(data: InsertGtmAssessmentResult): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if result already exists
  const existing = await db
    .select()
    .from(gtmAssessmentResults)
    .where(eq(gtmAssessmentResults.assessmentId, data.assessmentId));
  
  if (existing.length > 0) {
    // Update existing result
    await db
      .update(gtmAssessmentResults)
      .set(data)
      .where(eq(gtmAssessmentResults.assessmentId, data.assessmentId));
  } else {
    // Insert new result
    await db.insert(gtmAssessmentResults).values(data);
  }
}

export async function getAssessmentResult(assessmentId: number): Promise<GtmAssessmentResult | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  const results = await db
    .select()
    .from(gtmAssessmentResults)
    .where(eq(gtmAssessmentResults.assessmentId, assessmentId));
  return results[0];
}

