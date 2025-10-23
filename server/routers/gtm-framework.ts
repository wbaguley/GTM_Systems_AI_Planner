import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getAllFrameworks,
  getFrameworkBySlug,
  getFrameworkById,
  getFrameworkQuestions,
  createAssessment,
  getUserAssessments,
  getAssessmentById,
  updateAssessmentStatus,
  saveAssessmentResponse,
  getAssessmentResponses,
  saveAssessmentResult,
  getAssessmentResult,
} from "../db/helpers/gtm-framework";

export const gtmFrameworkRouter = router({
  // Get all frameworks
  listFrameworks: protectedProcedure.query(async () => {
    return getAllFrameworks();
  }),

  // Get framework by slug
  getFramework: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return getFrameworkBySlug(input.slug);
    }),

  // Get framework questions
  getQuestions: protectedProcedure
    .input(z.object({ frameworkId: z.number() }))
    .query(async ({ input }) => {
      return getFrameworkQuestions(input.frameworkId);
    }),

  // Create new assessment
  createAssessment: protectedProcedure
    .input(
      z.object({
        frameworkId: z.number(),
        companyName: z.string().optional(),
        industry: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return createAssessment({
        userId: ctx.user.id,
        frameworkId: input.frameworkId,
        companyName: input.companyName,
        industry: input.industry,
        status: "in_progress",
      });
    }),

  // Get user's assessments
  listAssessments: protectedProcedure.query(async ({ ctx }) => {
    return getUserAssessments(ctx.user.id);
  }),

  // Get assessment by ID
  getAssessment: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      return getAssessmentById(input.id, ctx.user.id);
    }),

  // Save assessment response
  saveResponse: protectedProcedure
    .input(
      z.object({
        assessmentId: z.number(),
        questionId: z.number(),
        responseValue: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await saveAssessmentResponse(input);
    }),

  // Get assessment responses
  getResponses: protectedProcedure
    .input(z.object({ assessmentId: z.number() }))
    .query(async ({ input }) => {
      return getAssessmentResponses(input.assessmentId);
    }),

  // Complete assessment and generate results
  completeAssessment: protectedProcedure
    .input(z.object({ assessmentId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Mark assessment as completed
      await updateAssessmentStatus(
        input.assessmentId,
        ctx.user.id,
        "completed",
        new Date()
      );
      
      return { success: true };
    }),

  // Save assessment result (from AI analysis)
  saveResult: protectedProcedure
    .input(
      z.object({
        assessmentId: z.number(),
        overallScore: z.number(),
        categoryScores: z.record(z.string(), z.number()),
        strengths: z.array(z.string()),
        gaps: z.array(z.string()),
        recommendations: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
            priority: z.enum(["high", "medium", "low"]),
          })
        ),
        actionPlan: z.array(
          z.object({
            phase: z.string(),
            actions: z.array(z.string()),
            timeline: z.string(),
          })
        ),
        aiAnalysis: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      await saveAssessmentResult(input);
    }),

  // Get assessment result
  getResult: protectedProcedure
    .input(z.object({ assessmentId: z.number() }))
    .query(async ({ input }) => {
      return getAssessmentResult(input.assessmentId);
    }),
});

