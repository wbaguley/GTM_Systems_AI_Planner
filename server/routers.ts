import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { modulesRouter } from "./routers-modules";
import { gtmFrameworkRouter } from "./routers/gtm-framework";
import { playbookRouter } from './routers/playbook';
import { icpAssessmentRouter } from './routers/icp-assessment';
import { subscriptionsRouter } from "./routers-subscriptions";
import { platformDocumentsRouter } from "./routers-platform-documents";
import { z } from "zod";
import { settingsRouter } from "./routers-settings";
import { aiUploadRouter } from "./routers-ai-upload";
import { customFieldsRouter } from "./routers-custom-fields";
import { usersRouter } from "./routers-users";
import { sopRouter } from "./routes/sop";
import { uploadRouter } from "./routes/upload";
import { 
  getUserPlatforms, 
  getPlatformById, 
  createPlatform, 
  updatePlatform, 
  deletePlatform 
} from "./db";
import {
  getPlatformCustomFieldValues,
  upsertCustomFieldValue,
} from "./db-custom-fields";

export const appRouter = router({
  system: systemRouter,
  settings: settingsRouter,
  modules: modulesRouter,
  aiUpload: aiUploadRouter,
  customFields: customFieldsRouter,
  gtmFramework: gtmFrameworkRouter,
  playbook: playbookRouter,
  icpAssessment: icpAssessmentRouter,
  subscriptions: subscriptionsRouter,
  platformDocuments: platformDocumentsRouter,
  users: usersRouter,
  sop: sopRouter,
  upload: uploadRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  platforms: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return getUserPlatforms(ctx.user.id);
    }),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const platform = await getPlatformById(input.id, ctx.user.id);
        if (!platform) return null;
        
        const customFieldValues = await getPlatformCustomFieldValues(input.id);
        return {
          ...platform,
          customFieldValues: customFieldValues.reduce((acc, cfv) => {
            acc[cfv.fieldKey] = cfv.value;
            return acc;
          }, {} as Record<string, string | null>),
        };
      }),

    create: protectedProcedure
      .input(z.object({
        platform: z.string(),
        useCase: z.string().optional(),
        website: z.string().optional(),
        logoUrl: z.string().optional(),
        costOwner: z.enum(["Client", "GTM Planetary", "Both"]),
        status: z.enum(["Active", "Inactive", "Cancelled"]).default("Active"),
        billingType: z.enum(["Monthly", "Yearly", "OneTime", "Usage", "Free Plan", "Pay as you go"]).optional(),
        licenses: z.string().optional(),
        monthlyAmount: z.number().default(0),
        yearlyAmount: z.number().default(0),
        oneTimeAmount: z.number().default(0),
        balanceUsage: z.number().default(0),
        renewalDate: z.string().optional(),
        renewalDay: z.number().optional(),
        toolkit: z.boolean().default(false),
        isInternalBusiness: z.boolean().default(false),
        isSolutionPartner: z.boolean().default(false),
        notesForAI: z.string().optional(),
        internalnotes: z.string().optional(),
        customFieldValues: z.record(z.string(), z.string().nullable()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { renewalDate, customFieldValues, ...rest } = input;
        const result = await createPlatform({
          ...rest,
          userId: ctx.user.id,
          renewalDate: renewalDate ? new Date(renewalDate) : undefined,
        });
        
        // Save custom field values
        if (customFieldValues && result.id) {
          for (const [fieldKey, value] of Object.entries(customFieldValues)) {
            await upsertCustomFieldValue(result.id, fieldKey, value);
          }
        }
        
        return result;
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        platform: z.string().optional(),
        useCase: z.string().optional(),
        website: z.string().optional(),
        logoUrl: z.string().optional(),
        costOwner: z.enum(["Client", "GTM Planetary", "Both"]).optional(),
        status: z.enum(["Active", "Inactive", "Cancelled"]).optional(),
        billingType: z.enum(["Monthly", "Yearly", "OneTime", "Usage", "Free Plan", "Pay as you go"]).optional(),
        licenses: z.string().optional(),
        monthlyAmount: z.number().optional(),
        yearlyAmount: z.number().optional(),
        oneTimeAmount: z.number().optional(),
        balanceUsage: z.number().optional(),
        renewalDate: z.string().optional(),
        renewalDay: z.number().optional(),
        toolkit: z.boolean().optional(),
        isInternalBusiness: z.boolean().optional(),
        isSolutionPartner: z.boolean().optional(),
        notesForAI: z.string().optional(),
        internalnotes: z.string().optional(),
        customFieldValues: z.record(z.string(), z.string().nullable()).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, renewalDate, customFieldValues, ...data } = input;
        await updatePlatform(id, ctx.user.id, {
          ...data,
          renewalDate: renewalDate ? new Date(renewalDate) : undefined,
        });
        
        // Update custom field values
        if (customFieldValues) {
          for (const [fieldKey, value] of Object.entries(customFieldValues)) {
            await upsertCustomFieldValue(id, fieldKey, value);
          }
        }
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return deletePlatform(input.id, ctx.user.id);
      }),

    stats: protectedProcedure.query(async ({ ctx }) => {
      const allPlatforms = await getUserPlatforms(ctx.user.id);
      
      const activeCount = allPlatforms.filter(p => p.status === "Active").length;
      const cancelledCount = allPlatforms.filter(p => p.status === "Cancelled").length;
      
      const monthlyTotal = allPlatforms
        .filter(p => p.status === "Active")
        .reduce((sum, p) => sum + (p.monthlyAmount || 0), 0);
      
      const yearlyTotal = allPlatforms
        .filter(p => p.status === "Active")
        .reduce((sum, p) => sum + (p.yearlyAmount || 0), 0);
      
      const estimatedAnnual = monthlyTotal * 12 + yearlyTotal;
      
      // Get upcoming renewals (next 30 days)
      const today = new Date();
      const thirtyDaysFromNow = new Date(today);
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      
      const upcomingRenewals = allPlatforms.filter(p => {
        if (!p.renewalDate || p.status !== "Active") return false;
        const renewalDate = new Date(p.renewalDate);
        return renewalDate >= today && renewalDate <= thirtyDaysFromNow;
      });
      
      return {
        totalPlatforms: allPlatforms.length,
        activeCount,
        cancelledCount,
        monthlyTotal,
        yearlyTotal,
        estimatedAnnual,
        upcomingRenewals: upcomingRenewals.map(p => ({
          id: p.id,
          platform: p.platform,
          renewalDate: p.renewalDate,
          amount: p.billingType === "Monthly" ? p.monthlyAmount : p.yearlyAmount,
        })),
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;

