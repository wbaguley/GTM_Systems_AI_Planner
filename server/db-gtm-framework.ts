import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";
import { gtmAssessments, gtmQuestions, InsertGtmAssessment } from "../drizzle/schema";

export async function getGtmQuestions() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(gtmQuestions).where(eq(gtmQuestions.isActive, 1)).orderBy(gtmQuestions.displayOrder);
}

export async function getGtmQuestionsByCategory(category: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(gtmQuestions)
    .where(and(eq(gtmQuestions.category, category), eq(gtmQuestions.isActive, 1)))
    .orderBy(gtmQuestions.displayOrder);
}

export async function createGtmAssessment(assessment: InsertGtmAssessment) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(gtmAssessments).values(assessment);
  return result[0].insertId;
}

export async function updateGtmAssessment(id: number, data: Partial<InsertGtmAssessment>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(gtmAssessments).set(data).where(eq(gtmAssessments.id, id));
}

export async function getGtmAssessment(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db.select().from(gtmAssessments).where(eq(gtmAssessments.id, id)).limit(1);
  return results.length > 0 ? results[0] : null;
}

export async function getUserGtmAssessments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(gtmAssessments)
    .where(eq(gtmAssessments.userId, userId))
    .orderBy(desc(gtmAssessments.assessmentDate));
}

export async function deleteGtmAssessment(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(gtmAssessments).where(eq(gtmAssessments.id, id));
}

