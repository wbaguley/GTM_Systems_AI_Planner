import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import {
  createPlaybook,
  getPlaybookById,
  getUserPlaybooks,
  getTemplatePlaybooks,
  updatePlaybook,
  deletePlaybook,
  createNode,
  getPlaybookNodes,
  updateNode,
  deleteNode,
  createConnection,
  getPlaybookConnections,
  deleteConnection,
  getCompletePlaybook,
} from "../db/helpers/playbook";

export const playbookRouter = router({
  // Playbook operations
  create: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        type: z.enum(["playbook", "cadence", "workflow"]),
        category: z.string().optional(),
        isTemplate: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }: { ctx: any; input: any }) => {
      return createPlaybook({
        userId: ctx.user.id,
        ...input,
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }: { ctx: any; input: { id: number } }) => {
      return getPlaybookById(input.id, ctx.user.id);
    }),

  list: protectedProcedure.query(async ({ ctx }: { ctx: any }) => {
    return getUserPlaybooks(ctx.user.id);
  }),

  listTemplates: protectedProcedure.query(async () => {
    return getTemplatePlaybooks();
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
        tags: z.any().optional(),
      })
    )
    .mutation(async ({ ctx, input }: { ctx: any; input: any }) => {
      const { id, ...data } = input;
      return updatePlaybook(id, ctx.user.id, data);
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }: { ctx: any; input: { id: number } }) => {
      return deletePlaybook(input.id, ctx.user.id);
    }),

  // Node operations
  createNode: protectedProcedure
    .input(
      z.object({
        playbookId: z.number(),
        nodeType: z.enum(["start", "step", "decision", "end", "note", "delay"]),
        title: z.string(),
        description: z.string().optional(),
        content: z.string().optional(),
        position: z.object({ x: z.number(), y: z.number() }),
        data: z.any().optional(),
        duration: z.string().optional(),
        owner: z.string().optional(),
        orderIndex: z.number().optional(),
      })
    )
    .mutation(async ({ input }: { input: any }) => {
      return createNode(input);
    }),

  getNodes: protectedProcedure
    .input(z.object({ playbookId: z.number() }))
    .query(async ({ input }: { input: { playbookId: number } }) => {
      return getPlaybookNodes(input.playbookId);
    }),

  updateNode: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        content: z.string().optional(),
        position: z.object({ x: z.number(), y: z.number() }).optional(),
        data: z.any().optional(),
        duration: z.string().optional(),
        owner: z.string().optional(),
        status: z.enum(["pending", "in-progress", "completed", "skipped"]).optional(),
      })
    )
    .mutation(async ({ input }: { input: any }) => {
      const { id, ...data } = input;
      return updateNode(id, data);
    }),

  deleteNode: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }: { input: { id: number } }) => {
      return deleteNode(input.id);
    }),

  // Connection operations
  createConnection: protectedProcedure
    .input(
      z.object({
        playbookId: z.number(),
        sourceNodeId: z.number(),
        targetNodeId: z.number(),
        label: z.string().optional(),
        condition: z.string().optional(),
      })
    )
    .mutation(async ({ input }: { input: any }) => {
      return createConnection(input);
    }),

  getConnections: protectedProcedure
    .input(z.object({ playbookId: z.number() }))
    .query(async ({ input }: { input: { playbookId: number } }) => {
      return getPlaybookConnections(input.playbookId);
    }),

  deleteConnection: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }: { input: { id: number } }) => {
      return deleteConnection(input.id);
    }),

  // Get complete playbook with nodes and connections
  getComplete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }: { ctx: any; input: { id: number } }) => {
      return getCompletePlaybook(input.id, ctx.user.id);
    }),
});

