import { int, mysqlTable, text, timestamp, varchar, mysqlEnum } from "drizzle-orm/mysql-core";
import { platforms } from "./schema";

/**
 * Platform documents table for storing SOPs, contracts, and other files
 */
export const platformDocuments = mysqlTable("platform_documents", {
  id: int("id").autoincrement().primaryKey(),
  platformId: int("platform_id").notNull().references(() => platforms.id, { onDelete: "cascade" }),
  
  // Document metadata
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["sop", "contract", "guide", "other"]).notNull().default("other"),
  
  // File storage
  fileUrl: text("file_url").notNull(),
  fileKey: varchar("file_key", { length: 512 }).notNull(), // S3 key for deletion
  fileName: varchar("file_name", { length: 255 }).notNull(),
  fileSize: int("file_size").notNull(), // in bytes
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  
  // Metadata
  uploadedBy: int("uploaded_by").notNull(), // user ID
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type PlatformDocument = typeof platformDocuments.$inferSelect;
export type InsertPlatformDocument = typeof platformDocuments.$inferInsert;

