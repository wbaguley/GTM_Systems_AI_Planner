import { int, mysqlTable, text, timestamp, varchar, json, mysqlEnum, boolean } from "drizzle-orm/mysql-core";

/**
 * Modules - Custom data modules (like "Platforms", "Contacts", "Deals", etc.)
 */
export const modules = mysqlTable("modules", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Owner of this module
  name: varchar("name", { length: 255 }).notNull(), // e.g., "Contacts", "Deals"
  singularName: varchar("singularName", { length: 255 }).notNull(), // e.g., "Contact", "Deal"
  pluralName: varchar("pluralName", { length: 255 }).notNull(), // e.g., "Contacts", "Deals"
  icon: varchar("icon", { length: 100 }), // Lucide icon name
  description: text("description"),
  isSystem: boolean("isSystem").default(false).notNull(), // System modules can't be deleted
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Module Fields - Fields within each module
 */
export const moduleFields = mysqlTable("module_fields", {
  id: int("id").autoincrement().primaryKey(),
  moduleId: int("moduleId").notNull(), // Reference to modules table
  fieldKey: varchar("fieldKey", { length: 100 }).notNull(), // Unique key for this field
  label: varchar("label", { length: 255 }).notNull(), // Display label
  fieldType: mysqlEnum("fieldType", [
    "text",
    "longtext",
    "number",
    "percentage",
    "currency",
    "checkbox",
    "url",
    "email",
    "phone",
    "date",
    "datetime",
    "select",
    "multiselect",
    "lookup",
    "file",
    "image",
  ]).notNull(),
  placeholder: varchar("placeholder", { length: 255 }),
  helpText: text("helpText"),
  isRequired: boolean("isRequired").default(false).notNull(),
  isUnique: boolean("isUnique").default(false).notNull(),
  defaultValue: text("defaultValue"),
  options: json("options").$type<string[]>(), // For select/multiselect fields
  validation: json("validation").$type<{
    min?: number;
    max?: number;
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  }>(),
  displayOrder: int("displayOrder").default(0).notNull(),
  sectionId: int("sectionId"), // Optional: group fields into sections
  columnSpan: int("columnSpan").default(2).notNull(), // 1, 2, or 3 columns
  isSystem: boolean("isSystem").default(false).notNull(), // System fields can't be deleted
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Module Sections - Organize fields into collapsible sections
 */
export const moduleSections = mysqlTable("module_sections", {
  id: int("id").autoincrement().primaryKey(),
  moduleId: int("moduleId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  displayOrder: int("displayOrder").default(0).notNull(),
  isCollapsible: boolean("isCollapsible").default(true).notNull(),
  isCollapsedByDefault: boolean("isCollapsedByDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Module Records - Actual data records for each module
 */
export const moduleRecords = mysqlTable("module_records", {
  id: int("id").autoincrement().primaryKey(),
  moduleId: int("moduleId").notNull(),
  userId: int("userId").notNull(), // Owner of this record
  data: json("data").$type<Record<string, any>>().notNull(), // Field values stored as JSON
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  createdBy: int("createdBy"),
  updatedBy: int("updatedBy"),
});

export type Module = typeof modules.$inferSelect;
export type InsertModule = typeof modules.$inferInsert;
export type ModuleField = typeof moduleFields.$inferSelect;
export type InsertModuleField = typeof moduleFields.$inferInsert;
export type ModuleSection = typeof moduleSections.$inferSelect;
export type InsertModuleSection = typeof moduleSections.$inferInsert;
export type ModuleRecord = typeof moduleRecords.$inferSelect;
export type InsertModuleRecord = typeof moduleRecords.$inferInsert;

