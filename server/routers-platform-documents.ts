import { z } from "zod";
import { router, protectedProcedure } from "./_core/trpc";
import * as db from "./db-platform-documents";
import { storagePut } from "./storage";
import { TRPCError } from "@trpc/server";

export const platformDocumentsRouter = router({
  /**
   * Get all documents for a platform
   */
  getDocuments: protectedProcedure
    .input(z.object({ platformId: z.number() }))
    .query(async ({ input }) => {
      return await db.getPlatformDocuments(input.platformId);
    }),

  /**
   * Upload a new document
   */
  uploadDocument: protectedProcedure
    .input(
      z.object({
        platformId: z.number(),
        name: z.string(),
        description: z.string().optional(),
        category: z.enum(["sop", "contract", "guide", "other"]),
        fileData: z.string(), // base64 encoded file
        fileName: z.string(),
        mimeType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Decode base64 file data
      const fileBuffer = Buffer.from(input.fileData, "base64");
      const fileSize = fileBuffer.length;

      // Generate unique file key
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(7);
      const fileKey = `platform-documents/${input.platformId}/${timestamp}-${randomSuffix}-${input.fileName}`;

      // Upload to S3
      const { url: fileUrl } = await storagePut(
        fileKey,
        fileBuffer,
        input.mimeType
      );

      // Save to database
      const documentId = await db.createPlatformDocument({
        platformId: input.platformId,
        name: input.name,
        description: input.description || null,
        category: input.category,
        fileUrl,
        fileKey,
        fileName: input.fileName,
        fileSize,
        mimeType: input.mimeType,
        uploadedBy: ctx.user.id,
      });

      return { id: documentId, fileUrl };
    }),

  /**
   * Delete a document
   */
  deleteDocument: protectedProcedure
    .input(z.object({ documentId: z.number() }))
    .mutation(async ({ input }) => {
      // Get document to retrieve file key
      const document = await db.getPlatformDocument(input.documentId);
      
      if (!document) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Document not found",
        });
      }

      // Note: S3 files are not automatically deleted
      // They will remain in storage but won't be accessible from the app
      // TODO: Implement S3 deletion when storage API supports it

      // Delete from database
      await db.deletePlatformDocument(input.documentId);

      return { success: true };
    }),

  /**
   * Update document metadata
   */
  updateDocument: protectedProcedure
    .input(
      z.object({
        documentId: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        category: z.enum(["sop", "contract", "guide", "other"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { documentId, ...updates } = input;
      
      await db.updatePlatformDocument(documentId, updates);

      return { success: true };
    }),
});

