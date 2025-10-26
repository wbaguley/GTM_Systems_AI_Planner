import { int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * SOPs (Standard Operating Procedures) table
 * Stores AI-generated SOPs from uploaded documents
 */
export const sops = mysqlTable("sops", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // SOP metadata
  title: varchar("title", { length: 500 }).notNull(),
  content: text("content").notNull(), // Markdown formatted SOP content
  
  // Source file information
  sourceFileName: varchar("sourceFileName", { length: 500 }),
  sourceFileUrl: varchar("sourceFileUrl", { length: 1000 }), // S3 URL of uploaded file
  sourceFileKey: varchar("sourceFileKey", { length: 1000 }), // S3 key for file management
  
  // Chat history for refinement
  chatHistory: text("chatHistory"), // JSON stringified array of chat messages
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Sop = typeof sops.$inferSelect;
export type InsertSop = typeof sops.$inferInsert;

