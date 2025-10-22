import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import {
  getUserCustomFields,
  createCustomField,
  updateCustomField,
  deleteCustomField,
  reorderCustomFields,
} from "./db-custom-fields";

export const customFieldsRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return getUserCustomFields(ctx.user.id);
  }),

  create: protectedProcedure
    .input(
      z.object({
        fieldKey: z.string(),
        label: z.string(),
        fieldType: z.enum([
          "text",
          "longtext",
          "number",
          "percentage",
          "checkbox",
          "url",
          "phone",
          "date",
          "select",
        ]),
        placeholder: z.string().optional(),
        required: z.boolean().default(false),
        options: z.array(z.string()).optional(),
        displayOrder: z.number().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return createCustomField({
        userId: ctx.user.id,
        fieldKey: input.fieldKey,
        label: input.label,
        fieldType: input.fieldType,
        placeholder: input.placeholder,
        required: input.required ? 1 : 0,
        options: input.options ? JSON.stringify(input.options) : null,
        displayOrder: input.displayOrder,
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        fieldKey: z.string().optional(),
        label: z.string().optional(),
        fieldType: z
          .enum([
            "text",
            "longtext",
            "number",
            "percentage",
            "checkbox",
            "url",
            "phone",
            "date",
            "select",
          ])
          .optional(),
        placeholder: z.string().optional(),
        required: z.boolean().optional(),
        options: z.array(z.string()).optional(),
        displayOrder: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, required, options, ...rest } = input;
      return updateCustomField(id, ctx.user.id, {
        ...rest,
        required: required !== undefined ? (required ? 1 : 0) : undefined,
        options: options ? JSON.stringify(options) : undefined,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      return deleteCustomField(input.id, ctx.user.id);
    }),

  reorder: protectedProcedure
    .input(z.object({ fieldIds: z.array(z.number()) }))
    .mutation(async ({ ctx, input }) => {
      return reorderCustomFields(ctx.user.id, input.fieldIds);
    }),
});

