import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import { apiKeys, InsertApiKey } from "../drizzle/schema";
import * as crypto from "crypto";

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "default-key-change-in-production-32b";
const ALGORITHM = "aes-256-cbc";

// Simple encryption for API keys (in production, use a proper secret management service)
function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

function decrypt(text: string): string {
  const parts = text.split(":");
  const iv = Buffer.from(parts[0], "hex");
  const encryptedText = parts[1];
  const key = crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export async function upsertApiKey(
  userId: number,
  provider: string,
  apiKey: string | null,
  serverUrl?: string | null
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const encryptedKey = apiKey ? encrypt(apiKey) : null;

  const existing = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.userId, userId), eq(apiKeys.provider, provider)))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(apiKeys)
      .set({
        apiKey: encryptedKey,
        serverUrl: serverUrl || null,
        updatedAt: new Date(),
      })
      .where(eq(apiKeys.id, existing[0].id));
  } else {
    await db.insert(apiKeys).values({
      userId,
      provider,
      apiKey: encryptedKey,
      serverUrl: serverUrl || null,
    });
  }
}

export async function getApiKey(userId: number, provider: string): Promise<{
  apiKey: string | null;
  serverUrl: string | null;
} | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.userId, userId), eq(apiKeys.provider, provider)))
    .limit(1);

  if (result.length === 0) return null;

  const record = result[0];
  return {
    apiKey: record.apiKey ? decrypt(record.apiKey) : null,
    serverUrl: record.serverUrl,
  };
}

export async function getAllApiKeys(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.userId, userId));

  return results.map((record) => ({
    provider: record.provider,
    hasKey: !!record.apiKey,
    serverUrl: record.serverUrl,
  }));
}

