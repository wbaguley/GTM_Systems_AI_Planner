import {
  mysqlTable,
  int,
  varchar,
  text,
  boolean,
  timestamp,
  json,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

// Playbooks - Main playbook/cadence container
export const playbooks = mysqlTable("playbooks", {
  id: int("id").primaryKey().autoincrement(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(), // 'playbook', 'cadence', 'workflow'
  category: varchar("category", { length: 100 }), // 'onboarding', 'implementation', 'sales', 'marketing', 'custom'
  isTemplate: boolean("is_template").notNull().default(false),
  status: varchar("status", { length: 50 }).notNull().default("draft"), // 'draft', 'published', 'archived'
  tags: json("tags"), // JSON array of tags
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .onUpdateNow(),
});

// Playbook Nodes - Individual steps/nodes in the playbook
export const playbookNodes = mysqlTable("playbook_nodes", {
  id: int("id").primaryKey().autoincrement(),
  playbookId: int("playbook_id")
    .notNull()
    .references(() => playbooks.id, { onDelete: "cascade" }),
  nodeType: varchar("node_type", { length: 50 }).notNull(), // 'start', 'step', 'decision', 'end', 'note', 'delay'
  title: varchar("title", { length: 500 }).notNull(),
  description: text("description"),
  content: text("content"), // Rich text content, AI-generated or manual
  position: json("position").notNull(), // {x: number, y: number}
  data: json("data"), // Additional node-specific data
  duration: varchar("duration", { length: 100 }), // For steps: estimated time (e.g., "2 hours", "3 days")
  owner: varchar("owner", { length: 255 }), // Who is responsible for this step
  status: varchar("status", { length: 50 }).default("pending"), // 'pending', 'in-progress', 'completed', 'skipped'
  orderIndex: int("order_index").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .onUpdateNow(),
});

// Playbook Connections - Edges/connections between nodes
export const playbookConnections = mysqlTable("playbook_connections", {
  id: int("id").primaryKey().autoincrement(),
  playbookId: int("playbook_id")
    .notNull()
    .references(() => playbooks.id, { onDelete: "cascade" }),
  sourceNodeId: int("source_node_id")
    .notNull()
    .references(() => playbookNodes.id, { onDelete: "cascade" }),
  targetNodeId: int("target_node_id")
    .notNull()
    .references(() => playbookNodes.id, { onDelete: "cascade" }),
  label: varchar("label", { length: 255 }), // Optional label for the connection (e.g., "Yes", "No", "Next")
  condition: text("condition"), // For decision nodes: condition to follow this path
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Playbook Executions - Track playbook instances/runs
export const playbookExecutions = mysqlTable("playbook_executions", {
  id: int("id").primaryKey().autoincrement(),
  playbookId: int("playbook_id")
    .notNull()
    .references(() => playbooks.id, { onDelete: "cascade" }),
  userId: varchar("user_id", { length: 255 }).notNull(),
  clientName: varchar("client_name", { length: 255 }), // If running for a specific client
  status: varchar("status", { length: 50 }).notNull().default("active"), // 'active', 'completed', 'paused', 'cancelled'
  currentNodeId: int("current_node_id").references(() => playbookNodes.id),
  startedAt: timestamp("started_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .onUpdateNow(),
});

// Playbook Node Executions - Track individual node completions
export const playbookNodeExecutions = mysqlTable("playbook_node_executions", {
  id: int("id").primaryKey().autoincrement(),
  executionId: int("execution_id")
    .notNull()
    .references(() => playbookExecutions.id, { onDelete: "cascade" }),
  nodeId: int("node_id")
    .notNull()
    .references(() => playbookNodes.id, { onDelete: "cascade" }),
  status: varchar("status", { length: 50 }).notNull().default("pending"), // 'pending', 'in-progress', 'completed', 'skipped'
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  notes: text("notes"),
  completedBy: varchar("completed_by", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .onUpdateNow(),
});

export type Playbook = typeof playbooks.$inferSelect;
export type PlaybookNode = typeof playbookNodes.$inferSelect;
export type PlaybookConnection = typeof playbookConnections.$inferSelect;
export type PlaybookExecution = typeof playbookExecutions.$inferSelect;
export type PlaybookNodeExecution = typeof playbookNodeExecutions.$inferSelect;

