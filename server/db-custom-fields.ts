import { eq, and, asc } from "drizzle-orm";
import { getDb } from "./db";
import { customFields, customFieldValues, InsertCustomField, InsertCustomFieldValue } from "../drizzle/schema";

export async function getUserCustomFields(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(customFields)
    .where(eq(customFields.userId, userId))
    .orderBy(asc(customFields.displayOrder));
}

export async function createCustomField(data: InsertCustomField) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(customFields).values(data);
  return result;
}

export async function updateCustomField(id: number, userId: number, data: Partial<InsertCustomField>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(customFields)
    .set(data)
    .where(and(eq(customFields.id, id), eq(customFields.userId, userId)));
}

export async function deleteCustomField(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete field definition
  await db
    .delete(customFields)
    .where(and(eq(customFields.id, id), eq(customFields.userId, userId)));

  // Also delete all values for this field
  const field = await db
    .select()
    .from(customFields)
    .where(eq(customFields.id, id))
    .limit(1);

  if (field.length > 0) {
    await db
      .delete(customFieldValues)
      .where(eq(customFieldValues.fieldKey, field[0].fieldKey));
  }
}

export async function getPlatformCustomFieldValues(platformId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(customFieldValues)
    .where(eq(customFieldValues.platformId, platformId));
}

export async function upsertCustomFieldValue(
  platformId: number,
  fieldKey: string,
  value: string | null
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(customFieldValues)
    .where(
      and(
        eq(customFieldValues.platformId, platformId),
        eq(customFieldValues.fieldKey, fieldKey)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(customFieldValues)
      .set({ value, updatedAt: new Date() })
      .where(eq(customFieldValues.id, existing[0].id));
  } else {
    await db.insert(customFieldValues).values({
      platformId,
      fieldKey,
      value,
    });
  }
}

export async function reorderCustomFields(userId: number, fieldIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Update display order for each field
  for (let i = 0; i < fieldIds.length; i++) {
    await db
      .update(customFields)
      .set({ displayOrder: i })
      .where(and(eq(customFields.id, fieldIds[i]), eq(customFields.userId, userId)));
  }
}

