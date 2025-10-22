import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db-modules";
import { migratePlatforms } from "./migrate-platforms";

export const modulesRouter = router({
  // ===== MODULES =====
  
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getUserModules(ctx.user.id);
  }),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getModuleById(input.id);
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      singularName: z.string(),
      pluralName: z.string(),
      icon: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const id = await db.createModule({
        ...input,
        userId: ctx.user.id,
        isSystem: false,
      });
      return { id };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().optional(),
      singularName: z.string().optional(),
      pluralName: z.string().optional(),
      icon: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateModule(id, data);
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteModule(input.id);
      return { success: true };
    }),

  // ===== MODULE FIELDS =====

  getFields: protectedProcedure
    .input(z.object({ moduleId: z.number() }))
    .query(async ({ input }) => {
      return await db.getModuleFields(input.moduleId);
    }),

  createField: protectedProcedure
    .input(z.object({
      moduleId: z.number(),
      fieldKey: z.string(),
      label: z.string(),
      fieldType: z.enum([
        "text", "longtext", "number", "percentage", "currency",
        "checkbox", "url", "email", "phone", "date", "datetime",
        "select", "multiselect", "lookup", "file", "image"
      ]),
      placeholder: z.string().optional(),
      helpText: z.string().optional(),
      isRequired: z.boolean().optional(),
      isUnique: z.boolean().optional(),
      defaultValue: z.string().optional(),
      options: z.array(z.string()).optional(),
      validation: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
        pattern: z.string().optional(),
        minLength: z.number().optional(),
        maxLength: z.number().optional(),
      }).optional(),
      displayOrder: z.number().optional(),
      sectionId: z.number().optional(),
      columnSpan: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createModuleField({
        ...input,
        isSystem: false,
      });
      return { id };
    }),

  updateField: protectedProcedure
    .input(z.object({
      id: z.number(),
      label: z.string().optional(),
      placeholder: z.string().optional(),
      helpText: z.string().optional(),
      isRequired: z.boolean().optional(),
      isUnique: z.boolean().optional(),
      defaultValue: z.string().optional(),
      options: z.array(z.string()).optional(),
      validation: z.object({
        min: z.number().optional(),
        max: z.number().optional(),
        pattern: z.string().optional(),
        minLength: z.number().optional(),
        maxLength: z.number().optional(),
      }).optional(),
      displayOrder: z.number().optional(),
      sectionId: z.number().optional(),
      columnSpan: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateModuleField(id, data);
      return { success: true };
    }),

  deleteField: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteModuleField(input.id);
      return { success: true };
    }),

  migratePlatforms: protectedProcedure
    .mutation(async ({ ctx }) => {
      const result = await migratePlatforms(ctx.user.id);
      return result;
    }),

  reorderFields: protectedProcedure
    .input(z.object({
      updates: z.array(z.object({
        id: z.number(),
        displayOrder: z.number(),
      })),
    }))
    .mutation(async ({ input }) => {
      await db.reorderModuleFields(input.updates);
      return { success: true };
    }),

  // ===== MODULE SECTIONS =====

  getSections: protectedProcedure
    .input(z.object({ moduleId: z.number() }))
    .query(async ({ input }) => {
      return await db.getModuleSections(input.moduleId);
    }),

  createSection: protectedProcedure
    .input(z.object({
      moduleId: z.number(),
      title: z.string(),
      description: z.string().optional(),
      displayOrder: z.number().optional(),
      isCollapsible: z.boolean().optional(),
      isCollapsedByDefault: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const id = await db.createModuleSection(input);
      return { id };
    }),

  updateSection: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      description: z.string().optional(),
      displayOrder: z.number().optional(),
      isCollapsible: z.boolean().optional(),
      isCollapsedByDefault: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      await db.updateModuleSection(id, data);
      return { success: true };
    }),

  deleteSection: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteModuleSection(input.id);
      return { success: true };
    }),

  // ===== MODULE RECORDS =====

  getRecords: protectedProcedure
    .input(z.object({ moduleId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await db.getModuleRecords(input.moduleId, ctx.user.id);
    }),

  listRecords: protectedProcedure
    .input(z.object({ moduleId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await db.getModuleRecords(input.moduleId, ctx.user.id);
    }),

  getStats: protectedProcedure
    .input(z.object({ moduleId: z.number() }))
    .query(async ({ ctx, input }) => {
      const records = await db.getModuleRecords(input.moduleId, ctx.user.id);
      
      // Calculate stats for Platforms module
      let totalCount = records.length;
      let activeCount = 0;
      let cancelledCount = 0;
      let monthlyTotal = 0;
      let yearlyTotal = 0;
      
      records.forEach((record: any) => {
        const data = record.data || {};
        const status = data.status;
        
        if (status === "Active") {
          activeCount++;
          monthlyTotal += parseFloat(data.monthlyAmount || "0");
          yearlyTotal += parseFloat(data.yearlyAmount || "0");
        } else if (status === "Cancelled") {
          cancelledCount++;
        }
      });
      
      const estimatedAnnual = (monthlyTotal * 12) + yearlyTotal;
      
      return {
        totalCount,
        activeCount,
        cancelledCount,
        monthlyTotal,
        yearlyTotal,
        estimatedAnnual,
      };
    }),

  getRecord: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getModuleRecordById(input.id);
    }),

  createRecord: protectedProcedure
    .input(z.object({
      moduleId: z.number(),
      data: z.record(z.string(), z.any()),
    }))
    .mutation(async ({ ctx, input }) => {
      const id = await db.createModuleRecord({
        moduleId: input.moduleId,
        userId: ctx.user.id,
        data: input.data,
        createdBy: ctx.user.id,
        updatedBy: ctx.user.id,
      });
      return { id };
    }),

  updateRecord: protectedProcedure
    .input(z.object({
      id: z.number(),
      data: z.record(z.string(), z.any()),
    }))
    .mutation(async ({ ctx, input }) => {
      await db.updateModuleRecord(input.id, {
        data: input.data,
        updatedBy: ctx.user.id,
      });
      return { success: true };
    }),

  deleteRecord: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteModuleRecord(input.id);
      return { success: true };
    }),
});

