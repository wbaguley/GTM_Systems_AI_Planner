import { z } from 'zod';
import { router, protectedProcedure } from '../_core/trpc';
import * as icpHelpers from '../db/helpers/icp-assessment';
import { ICPAnalysisService } from '../services/icp-analysis';

export const icpAssessmentRouter = router({
  // Create new assessment
  create: protectedProcedure
    .input(
      z.object({
        companyName: z.string(),
        industry: z.string().optional(),
        companySize: z.string().optional(),
        revenue: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }: { input: { companyName: string; industry?: string; companySize?: string; revenue?: string }; ctx: any }) => {
      return await icpHelpers.createAssessment({
        userId: ctx.user.openId,
        ...input,
      });
    }),

  // Get all user's assessments
  list: protectedProcedure.query(async ({ ctx }: { ctx: any }) => {
    return await icpHelpers.getUserAssessments(ctx.user.openId);
  }),

  // Get assessment by ID
  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }: { input: { id: number } }) => {
      return await icpHelpers.getAssessmentById(input.id);
    }),

  // Get all sections
  getSections: protectedProcedure.query(async () => {
    return await icpHelpers.getAllSections();
  }),

  // Get questions by section
  getQuestionsBySection: protectedProcedure
    .input(z.object({ sectionId: z.number() }))
    .query(async ({ input }: { input: { sectionId: number } }) => {
      return await icpHelpers.getQuestionsBySection(input.sectionId);
    }),

  // Get all questions
  getAllQuestions: protectedProcedure.query(async () => {
    return await icpHelpers.getAllQuestions();
  }),

  // Get questions (alias for getQuestionsBySection for backward compatibility)
  getQuestions: protectedProcedure
    .input(z.object({ sectionId: z.number() }))
    .query(async ({ input }: { input: { sectionId: number } }) => {
      return await icpHelpers.getQuestionsBySection(input.sectionId);
    }),

  // Save response
  saveResponse: protectedProcedure
    .input(
      z.object({
        assessmentId: z.number(),
        questionId: z.number(),
        response: z.string(),
      })
    )
    .mutation(async ({ input }: { input: { assessmentId: number; questionId: number; response: string } }) => {
      await icpHelpers.saveResponse(input);
      return { success: true };
    }),

  // Get assessment responses
  getResponses: protectedProcedure
    .input(z.object({ assessmentId: z.number() }))
    .query(async ({ input }: { input: { assessmentId: number } }) => {
      return await icpHelpers.getAssessmentResponses(input.assessmentId);
    }),

  // Update assessment status
  updateStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.string(),
      })
    )
    .mutation(async ({ input }: { input: { id: number; status: string } }) => {
      await icpHelpers.updateAssessmentStatus(input.id, input.status);
      return { success: true };
    }),

  // Get ICP profiles
  getProfiles: protectedProcedure
    .input(z.object({ assessmentId: z.number() }))
    .query(async ({ input }: { input: { assessmentId: number } }) => {
      return await icpHelpers.getICPProfiles(input.assessmentId);
    }),

  // Get assessment results
  getResults: protectedProcedure
    .input(z.object({ assessmentId: z.number() }))
    .query(async ({ input }: { input: { assessmentId: number } }) => {
      return await icpHelpers.getAssessmentResults(input.assessmentId);
    }),

  // Delete assessment
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }: { input: { id: number } }) => {
      await icpHelpers.deleteAssessment(input.id);
      return { success: true };
    }),

  // Generate AI analysis
  generateAnalysis: protectedProcedure
    .input(z.object({ assessmentId: z.number() }))
    .mutation(async ({ input }: { input: { assessmentId: number } }) => {
      const service = new ICPAnalysisService();
      return await service.analyzeAssessment(input.assessmentId);
    }),

  // Get AI analysis results
  getAnalysis: protectedProcedure
    .input(z.object({ assessmentId: z.number() }))
    .query(async ({ input }: { input: { assessmentId: number } }) => {
      const service = new ICPAnalysisService();
      return await service.getAnalysisResults(input.assessmentId);
    }),
});

