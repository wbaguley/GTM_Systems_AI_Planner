import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { upsertApiKey, getAllApiKeys, getApiKey } from "./db-apikeys";

export const settingsRouter = router({
  getApiKeys: protectedProcedure.query(async ({ ctx }) => {
    return getAllApiKeys(ctx.user.id);
  }),

  saveApiKey: protectedProcedure
    .input(
      z.object({
        provider: z.enum(["openai", "anthropic", "ollama"]),
        apiKey: z.string().optional(),
        serverUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await upsertApiKey(
        ctx.user.id,
        input.provider,
        input.apiKey || null,
        input.serverUrl
      );
      return { success: true };
    }),
});

