import { eq, and, desc } from "drizzle-orm";
import { getDb } from "../../db";
import {
  playbooks,
  playbookNodes,
  playbookConnections,
  playbookExecutions,
  playbookNodeExecutions,
  type Playbook,
  type PlaybookNode,
  type PlaybookConnection,
} from "../../../drizzle/schema";

// Playbook CRUD operations
export async function createPlaybook(data: {
  userId: string;
  title: string;
  description?: string;
  type: string;
  category?: string;
  isTemplate?: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(playbooks).values(data);
  const insertedId = Number(result[0].insertId);

  const inserted = await db
    .select()
    .from(playbooks)
    .where(eq(playbooks.id, insertedId))
    .limit(1);
  return inserted[0];
}

export async function getPlaybookById(playbookId: number, userId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(playbooks)
    .where(and(eq(playbooks.id, playbookId), eq(playbooks.userId, userId)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getUserPlaybooks(userId: string) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(playbooks)
    .where(eq(playbooks.userId, userId))
    .orderBy(desc(playbooks.updatedAt));
}

export async function getTemplatePlaybooks() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(playbooks)
    .where(eq(playbooks.isTemplate, true))
    .orderBy(desc(playbooks.createdAt));
}

export async function updatePlaybook(
  playbookId: number,
  userId: string,
  data: Partial<Playbook>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(playbooks)
    .set(data)
    .where(and(eq(playbooks.id, playbookId), eq(playbooks.userId, userId)));

  return getPlaybookById(playbookId, userId);
}

export async function deletePlaybook(playbookId: number, userId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .delete(playbooks)
    .where(and(eq(playbooks.id, playbookId), eq(playbooks.userId, userId)));

  return result[0].affectedRows > 0;
}

// Playbook Node operations
export async function createNode(data: {
  playbookId: number;
  nodeType: string;
  title: string;
  description?: string;
  content?: string;
  position: { x: number; y: number };
  data?: any;
  duration?: string;
  owner?: string;
  orderIndex?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(playbookNodes).values({
    ...data,
    position: JSON.stringify(data.position),
    data: data.data ? JSON.stringify(data.data) : undefined,
  });
  const insertedId = Number(result[0].insertId);

  const inserted = await db
    .select()
    .from(playbookNodes)
    .where(eq(playbookNodes.id, insertedId))
    .limit(1);
  return inserted[0];
}

export async function getPlaybookNodes(playbookId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(playbookNodes)
    .where(eq(playbookNodes.playbookId, playbookId))
    .orderBy(playbookNodes.orderIndex);
}

export async function updateNode(
  nodeId: number,
  data: Partial<PlaybookNode>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Convert position and data to JSON strings if provided
  const updateData: any = { ...data };
  if (data.position) {
    updateData.position = JSON.stringify(data.position);
  }
  if (data.data) {
    updateData.data = JSON.stringify(data.data);
  }

  await db.update(playbookNodes).set(updateData).where(eq(playbookNodes.id, nodeId));

  const result = await db
    .select()
    .from(playbookNodes)
    .where(eq(playbookNodes.id, nodeId))
    .limit(1);
  return result[0];
}

export async function deleteNode(nodeId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .delete(playbookNodes)
    .where(eq(playbookNodes.id, nodeId));

  return result[0].affectedRows > 0;
}

// Playbook Connection operations
export async function createConnection(data: {
  playbookId: number;
  sourceNodeId: number;
  targetNodeId: number;
  label?: string;
  condition?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(playbookConnections).values(data);
  const insertedId = Number(result[0].insertId);

  const inserted = await db
    .select()
    .from(playbookConnections)
    .where(eq(playbookConnections.id, insertedId))
    .limit(1);
  return inserted[0];
}

export async function getPlaybookConnections(playbookId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(playbookConnections)
    .where(eq(playbookConnections.playbookId, playbookId));
}

export async function deleteConnection(connectionId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .delete(playbookConnections)
    .where(eq(playbookConnections.id, connectionId));

  return result[0].affectedRows > 0;
}

// Get complete playbook with nodes and connections
export async function getCompletePlaybook(playbookId: number, userId: string) {
  const playbook = await getPlaybookById(playbookId, userId);
  if (!playbook) return null;

  const nodes = await getPlaybookNodes(playbookId);
  const connections = await getPlaybookConnections(playbookId);

  return {
    playbook,
    nodes,
    connections,
  };
}

