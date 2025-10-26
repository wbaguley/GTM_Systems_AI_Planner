import { int, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * LLM Settings table for storing user LLM preferences
 */
export const llmSettings = mysqlTable("llm_settings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  useCustomLLM: boolean("useCustomLLM").default(false).notNull(), // false = use Forge, true = use custom
  provider: varchar("provider", { length: 50 }), // 'openai', 'anthropic', 'ollama'
  model: varchar("model", { length: 100 }), // e.g., 'gpt-4', 'claude-3-opus', 'llama2'
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type LLMSettings = typeof llmSettings.$inferSelect;
export type InsertLLMSettings = typeof llmSettings.$inferInsert;

