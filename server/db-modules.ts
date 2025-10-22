import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./db";
import {
  modules,
  moduleFields,
  moduleSections,
  moduleRecords,
  type InsertModule,
  type InsertModuleField,
  type InsertModuleSection,
  type InsertModuleRecord,
} from "../drizzle/schema";

// ===== MODULES =====

export async function createModule(data: InsertModule) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(modules).values(data);
  return result[0].insertId;
}

export async function getUserModules(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(modules)
    .where(eq(modules.userId, userId))
    .orderBy(modules.name);
}

export async function getModuleById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(modules)
    .where(eq(modules.id, id))
    .limit(1);
  
  return result[0];
}

export async function updateModule(id: number, data: Partial<InsertModule>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(modules)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(modules.id, id));
}

export async function deleteModule(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Delete all related data
  await db.delete(moduleRecords).where(eq(moduleRecords.moduleId, id));
  await db.delete(moduleFields).where(eq(moduleFields.moduleId, id));
  await db.delete(moduleSections).where(eq(moduleSections.moduleId, id));
  await db.delete(modules).where(eq(modules.id, id));
}

// ===== MODULE FIELDS =====

export async function createModuleField(data: InsertModuleField) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(moduleFields).values(data);
  return result[0].insertId;
}

export async function getModuleFields(moduleId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(moduleFields)
    .where(eq(moduleFields.moduleId, moduleId))
    .orderBy(moduleFields.displayOrder);
}

export async function updateModuleField(id: number, data: Partial<InsertModuleField>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(moduleFields)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(moduleFields.id, id));
}

export async function deleteModuleField(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(moduleFields).where(eq(moduleFields.id, id));
}

export async function reorderModuleFields(updates: { id: number; displayOrder: number }[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  for (const update of updates) {
    await db
      .update(moduleFields)
      .set({ displayOrder: update.displayOrder })
      .where(eq(moduleFields.id, update.id));
  }
}

// ===== MODULE SECTIONS =====

export async function createModuleSection(data: InsertModuleSection) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(moduleSections).values(data);
  return result[0].insertId;
}

export async function getModuleSections(moduleId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(moduleSections)
    .where(eq(moduleSections.moduleId, moduleId))
    .orderBy(moduleSections.displayOrder);
}

export async function updateModuleSection(id: number, data: Partial<InsertModuleSection>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(moduleSections)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(moduleSections.id, id));
}

export async function deleteModuleSection(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Clear sectionId from fields in this section
  await db
    .update(moduleFields)
    .set({ sectionId: null })
    .where(eq(moduleFields.sectionId, id));
  
  await db.delete(moduleSections).where(eq(moduleSections.id, id));
}

// ===== MODULE RECORDS =====

export async function createModuleRecord(data: InsertModuleRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(moduleRecords).values(data);
  return result[0].insertId;
}

export async function getModuleRecords(moduleId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(moduleRecords)
    .where(and(
      eq(moduleRecords.moduleId, moduleId),
      eq(moduleRecords.userId, userId)
    ))
    .orderBy(desc(moduleRecords.createdAt));
}

export async function getModuleRecordById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db
    .select()
    .from(moduleRecords)
    .where(eq(moduleRecords.id, id))
    .limit(1);
  
  return result[0];
}

export async function updateModuleRecord(id: number, data: Partial<InsertModuleRecord>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(moduleRecords)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(moduleRecords.id, id));
}

export async function deleteModuleRecord(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(moduleRecords).where(eq(moduleRecords.id, id));
}

