import { int, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Custom field definitions table
 * Stores user-defined field configurations for platform forms
 */
export const customFields = mysqlTable("custom_fields", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  fieldKey: varchar("fieldKey", { length: 100 }).notNull(), // Unique key for the field (e.g., "monthly_cost")
  label: varchar("label", { length: 255 }).notNull(), // Display label (e.g., "Monthly Cost")
  fieldType: varchar("fieldType", { length: 50 }).notNull(), // text, longtext, number, percentage, checkbox, url, phone, date, select
  placeholder: text("placeholder"), // Placeholder text for input
  required: int("required").default(0).notNull(), // 0 = optional, 1 = required
  options: text("options"), // JSON array for select/dropdown options
  displayOrder: int("displayOrder").default(0).notNull(), // Order in which fields appear
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Custom field values table
 * Stores actual values for custom fields per platform
 */
export const customFieldValues = mysqlTable("custom_field_values", {
  id: int("id").autoincrement().primaryKey(),
  platformId: int("platformId").notNull(),
  fieldKey: varchar("fieldKey", { length: 100 }).notNull(),
  value: text("value"), // Stored as text, parsed based on fieldType
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CustomField = typeof customFields.$inferSelect;
export type InsertCustomField = typeof customFields.$inferInsert;
export type CustomFieldValue = typeof customFieldValues.$inferSelect;
export type InsertCustomFieldValue = typeof customFieldValues.$inferInsert;

