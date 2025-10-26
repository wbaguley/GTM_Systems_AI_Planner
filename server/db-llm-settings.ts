import { getDb } from "./db";
import { llmSettings } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export async function getLLMSettings(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const results = await db
    .select()
    .from(llmSettings)
    .where(eq(llmSettings.userId, userId))
    .limit(1);

  return results[0] || null;
}

export async function upsertLLMSettings(
  userId: number,
  useCustomLLM: boolean,
  provider: string | null,
  model: string | null
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getLLMSettings(userId);

  if (existing) {
    await db
      .update(llmSettings)
      .set({
        useCustomLLM,
        provider,
        model,
        updatedAt: new Date(),
      })
      .where(eq(llmSettings.userId, userId));
  } else {
    await db.insert(llmSettings).values({
      userId,
      useCustomLLM,
      provider,
      model,
    });
  }
}

