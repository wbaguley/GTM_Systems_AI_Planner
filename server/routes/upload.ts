import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { storagePut } from "../storage";

// Helper to generate random suffix for file keys
function randomSuffix() {
  return Math.random().toString(36).substring(2, 15);
}

export const uploadRouter = router({
  uploadImage: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileData: z.string(), // base64 encoded
        contentType: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { fileName, fileData, contentType } = input;
      const userId = ctx.user.id;

      // Decode base64
      const buffer = Buffer.from(fileData, 'base64');

      // Generate unique key
      const ext = fileName.split('.').pop() || 'jpg';
      const key = `playbook-images/${userId}/${randomSuffix()}.${ext}`;

      // Upload to S3
      const result = await storagePut(key, buffer, contentType);

      return { url: result.url, key: result.key };
    }),
});

