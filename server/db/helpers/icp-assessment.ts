import { getDb } from '../../db';
import {
  icpAssessments,
  icpAssessmentSections,
  icpAssessmentQuestions,
  icpAssessmentResponses,
  icpProfiles,
  icpAssessmentResults,
  icpReferences,
} from '../../../drizzle/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function createAssessment(data: {
  userId: string;
  companyName: string;
  industry?: string;
  companySize?: string;
  revenue?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db.insert(icpAssessments).values({
    userId: data.userId,
    companyName: data.companyName,
    industry: data.industry,
    companySize: data.companySize,
    revenue: data.revenue,
    status: 'draft',
  });

  return result;
}

export async function getAssessmentById(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const assessments = await db
    .select()
    .from(icpAssessments)
    .where(eq(icpAssessments.id, id))
    .limit(1);

  return assessments[0];
}

export async function getUserAssessments(userId: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return await db
    .select()
    .from(icpAssessments)
    .where(eq(icpAssessments.userId, userId))
    .orderBy(desc(icpAssessments.createdAt));
}

export async function updateAssessmentStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db
    .update(icpAssessments)
    .set({ status, updatedAt: new Date() })
    .where(eq(icpAssessments.id, id));
}

export async function getAllSections() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return await db
    .select()
    .from(icpAssessmentSections)
    .orderBy(icpAssessmentSections.order);
}

export async function getQuestionsBySection(sectionId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return await db
    .select()
    .from(icpAssessmentQuestions)
    .where(eq(icpAssessmentQuestions.sectionId, sectionId))
    .orderBy(icpAssessmentQuestions.order);
}

export async function getAllQuestions() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return await db
    .select()
    .from(icpAssessmentQuestions)
    .orderBy(icpAssessmentQuestions.sectionId, icpAssessmentQuestions.order);
}

export async function saveResponse(data: {
  assessmentId: number;
  questionId: number;
  response: string;
}) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Check if response already exists
  const existing = await db
    .select()
    .from(icpAssessmentResponses)
    .where(
      and(
        eq(icpAssessmentResponses.assessmentId, data.assessmentId),
        eq(icpAssessmentResponses.questionId, data.questionId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Update existing response
    await db
      .update(icpAssessmentResponses)
      .set({ response: data.response, updatedAt: new Date() })
      .where(eq(icpAssessmentResponses.id, existing[0].id));
  } else {
    // Create new response
    await db.insert(icpAssessmentResponses).values(data);
  }
}

export async function getAssessmentResponses(assessmentId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return await db
    .select()
    .from(icpAssessmentResponses)
    .where(eq(icpAssessmentResponses.assessmentId, assessmentId));
}

export async function saveICPProfiles(assessmentId: number, profiles: any[]) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Delete existing profiles for this assessment
  await db
    .delete(icpProfiles)
    .where(eq(icpProfiles.assessmentId, assessmentId));

  // Insert new profiles
  for (const profile of profiles) {
    await db.insert(icpProfiles).values({
      assessmentId,
      ...profile,
    });
  }
}

export async function getICPProfiles(assessmentId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return await db
    .select()
    .from(icpProfiles)
    .where(eq(icpProfiles.assessmentId, assessmentId));
}

export async function saveAssessmentResults(assessmentId: number, results: any) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Delete existing results
  await db
    .delete(icpAssessmentResults)
    .where(eq(icpAssessmentResults.assessmentId, assessmentId));

  // Insert new results
  await db.insert(icpAssessmentResults).values({
    assessmentId,
    ...results,
  });
}

export async function getAssessmentResults(assessmentId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const results = await db
    .select()
    .from(icpAssessmentResults)
    .where(eq(icpAssessmentResults.assessmentId, assessmentId))
    .limit(1);

  return results[0];
}

export async function deleteAssessment(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  // Delete all related data
  await db.delete(icpAssessmentResponses).where(eq(icpAssessmentResponses.assessmentId, id));
  await db.delete(icpProfiles).where(eq(icpProfiles.assessmentId, id));
  await db.delete(icpAssessmentResults).where(eq(icpAssessmentResults.assessmentId, id));
  await db.delete(icpReferences).where(eq(icpReferences.assessmentId, id));
  await db.delete(icpAssessments).where(eq(icpAssessments.id, id));
}

