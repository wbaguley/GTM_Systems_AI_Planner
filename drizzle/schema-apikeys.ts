import { int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * API Keys table for storing encrypted AI provider credentials
 */
export const apiKeys = mysqlTable("api_keys", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  provider: varchar("provider", { length: 50 }).notNull(), // 'openai', 'anthropic', 'ollama'
  apiKey: text("apiKey"), // Encrypted API key
  serverUrl: text("serverUrl"), // For Ollama
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ApiKey = typeof apiKeys.$inferSelect;
export type InsertApiKey = typeof apiKeys.$inferInsert;

