import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, platforms, InsertPlatform, Platform } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUser(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Platform query helpers
export async function getUserPlatforms(userId: number): Promise<Platform[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(platforms).where(eq(platforms.userId, userId)).orderBy(desc(platforms.createdAt));
}

export async function getPlatformById(platformId: number, userId: number): Promise<Platform | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(platforms).where(
    and(eq(platforms.id, platformId), eq(platforms.userId, userId))
  ).limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function createPlatform(data: InsertPlatform): Promise<Platform> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(platforms).values(data);
  const insertedId = Number(result[0].insertId);
  
  const inserted = await db.select().from(platforms).where(eq(platforms.id, insertedId)).limit(1);
  return inserted[0];
}

export async function updatePlatform(platformId: number, userId: number, data: Partial<InsertPlatform>): Promise<Platform | undefined> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(platforms).set(data).where(
    and(eq(platforms.id, platformId), eq(platforms.userId, userId))
  );
  
  return getPlatformById(platformId, userId);
}

export async function deletePlatform(platformId: number, userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.delete(platforms).where(
    and(eq(platforms.id, platformId), eq(platforms.userId, userId))
  );
  
  return result[0].affectedRows > 0;
}



// SOP query helpers
export async function getUserSops(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const { sops } = await import("../drizzle/schema");
  return db.select().from(sops).where(eq(sops.userId, userId)).orderBy(desc(sops.updatedAt));
}

export async function getSopById(sopId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const { sops } = await import("../drizzle/schema");
  const result = await db.select().from(sops)
    .where(and(eq(sops.id, sopId), eq(sops.userId, userId)))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

export async function createSop(data: { userId: number; title: string; content: string; sourceFileName?: string; sourceFileUrl?: string; sourceFileKey?: string; chatHistory?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { sops } = await import("../drizzle/schema");
  const result = await db.insert(sops).values(data);
  return result;
}

export async function updateSop(sopId: number, userId: number, data: { title?: string; content?: string; chatHistory?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { sops } = await import("../drizzle/schema");
  await db.update(sops)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(sops.id, sopId), eq(sops.userId, userId)));
}

export async function deleteSop(sopId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { sops } = await import("../drizzle/schema");
  await db.delete(sops).where(and(eq(sops.id, sopId), eq(sops.userId, userId)));
}

