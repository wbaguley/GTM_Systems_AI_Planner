import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";
import {
  platformDocuments,
  type PlatformDocument,
  type InsertPlatformDocument,
} from "../drizzle/schema";

/**
 * Get all documents for a platform
 */
export async function getPlatformDocuments(
  platformId: number
): Promise<PlatformDocument[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(platformDocuments)
    .where(eq(platformDocuments.platformId, platformId))
    .orderBy(desc(platformDocuments.createdAt));
}

/**
 * Get a single document by ID
 */
export async function getPlatformDocument(
  documentId: number
): Promise<PlatformDocument | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(platformDocuments)
    .where(eq(platformDocuments.id, documentId))
    .limit(1);

  return result[0] || null;
}

/**
 * Create a new platform document
 */
export async function createPlatformDocument(
  document: InsertPlatformDocument
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(platformDocuments).values(document);
  return result[0].insertId;
}

/**
 * Delete a platform document
 */
export async function deletePlatformDocument(
  documentId: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(platformDocuments).where(eq(platformDocuments.id, documentId));
}

/**
 * Update document metadata
 */
export async function updatePlatformDocument(
  documentId: number,
  updates: Partial<InsertPlatformDocument>
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(platformDocuments)
    .set(updates)
    .where(eq(platformDocuments.id, documentId));
}

