import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const usersRouter = router({
  getAllUsers: protectedProcedure.query(async ({ ctx }) => {
    // Only admins can view all users
    if (ctx.user.role !== "admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can view all users",
      });
    }

    const db = await getDb();
    if (!db) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database not available",
      });
    }

    const allUsers = await db.select().from(users);
    return allUsers;
  }),

  updateUserRole: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        role: z.enum(["viewer", "standard", "admin"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Only admins can update roles
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update user roles",
        });
      }

      // Can't change your own role
      if (input.userId === ctx.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot change your own role",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      await db
        .update(users)
        .set({ role: input.role })
        .where(eq(users.id, input.userId));

      return { success: true };
    }),

  deactivateUser: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Only admins can deactivate users
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can deactivate users",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Get user to check if they're global admin
      const [targetUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, input.userId));

      if (!targetUser) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      // Cannot deactivate global admin
      if (targetUser.isGlobalAdmin) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot deactivate the global admin. Transfer global admin role first.",
        });
      }

      // Cannot deactivate yourself
      if (input.userId === ctx.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You cannot deactivate yourself",
        });
      }

      await db
        .update(users)
        .set({ isActive: false })
        .where(eq(users.id, input.userId));

      return { success: true };
    }),

  reactivateUser: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Only admins can reactivate users
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can reactivate users",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      await db
        .update(users)
        .set({ isActive: true })
        .where(eq(users.id, input.userId));

      return { success: true };
    }),

  transferGlobalAdmin: protectedProcedure
    .input(z.object({ newGlobalAdminId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database not available",
        });
      }

      // Only current global admin can transfer
      if (!ctx.user.isGlobalAdmin) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the global admin can transfer this role",
        });
      }

      // Cannot transfer to yourself
      if (input.newGlobalAdminId === ctx.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You are already the global admin",
        });
      }

      // Verify new user exists and is active
      const [newAdmin] = await db
        .select()
        .from(users)
        .where(eq(users.id, input.newGlobalAdminId));

      if (!newAdmin) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }

      if (!newAdmin.isActive) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot transfer global admin to an inactive user",
        });
      }

      // Remove global admin from current user
      await db
        .update(users)
        .set({ isGlobalAdmin: false })
        .where(eq(users.id, ctx.user.id));

      // Set new global admin and make them admin role
      await db
        .update(users)
        .set({ isGlobalAdmin: true, role: "admin" })
        .where(eq(users.id, input.newGlobalAdminId));

      return { success: true };
    }),
});

