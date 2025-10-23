import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db-gtm-framework";
import { invokeLLM } from "./_core/llm";

export const gtmFrameworkRouter = router({
  // Get all questions
  getQuestions: protectedProcedure.query(async () => {
    return await db.getGtmQuestions();
  }),

  // Get questions by category
  getQuestionsByCategory: protectedProcedure
    .input(z.object({ category: z.string() }))
    .query(async ({ input }) => {
      return await db.getGtmQuestionsByCategory(input.category);
    }),

  // Create new assessment
  createAssessment: protectedProcedure
    .input(z.object({
      companyName: z.string().optional(),
      industry: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const id = await db.createGtmAssessment({
        userId: ctx.user.id,
        companyName: input.companyName,
        industry: input.industry,
        status: "in_progress",
      });
      return { id };
    }),

  // Submit assessment responses and get AI analysis
  submitAssessment: protectedProcedure
    .input(z.object({
      id: z.number(),
      responses: z.record(z.string(), z.any()),
    }))
    .mutation(async ({ input }) => {
      // Calculate scores based on responses
      const scores = calculateScores(input.responses);
      
      // Generate AI insights
      const aiAnalysis = await generateAIAnalysis(input.responses, scores);
      
      // Update assessment with scores and AI insights
      await db.updateGtmAssessment(input.id, {
        responses: input.responses,
        overallScore: scores.overall,
        marketStrategyScore: scores.marketStrategy,
        salesProcessScore: scores.salesProcess,
        marketingOpsScore: scores.marketingOps,
        customerSuccessScore: scores.customerSuccess,
        revenueOpsScore: scores.revenueOps,
        teamEnablementScore: scores.teamEnablement,
        strengths: aiAnalysis.strengths,
        gaps: aiAnalysis.gaps,
        recommendations: aiAnalysis.recommendations,
        actionPlan: aiAnalysis.actionPlan,
        status: "completed",
      });
      
      return { success: true, scores, aiAnalysis };
    }),

  // Get assessment by ID
  getAssessment: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getGtmAssessment(input.id);
    }),

  // Get all assessments for current user
  getMyAssessments: protectedProcedure.query(async ({ ctx }) => {
    return await db.getUserGtmAssessments(ctx.user.id);
  }),

  // Delete assessment
  deleteAssessment: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.deleteGtmAssessment(input.id);
      return { success: true };
    }),
});

// Helper function to calculate scores from responses
function calculateScores(responses: Record<string, any>) {
  const categoryScores: Record<string, number[]> = {
    marketStrategy: [],
    salesProcess: [],
    marketingOps: [],
    customerSuccess: [],
    revenueOps: [],
    teamEnablement: [],
  };
  
  // Map question IDs to categories and extract scores
  Object.entries(responses).forEach(([questionId, answer]) => {
    const qId = parseInt(questionId);
    
    // Determine category based on question ID ranges (from seed script)
    let category = "";
    let score = 0;
    
    if (qId >= 1 && qId <= 6) category = "marketStrategy";
    else if (qId >= 7 && qId <= 12) category = "salesProcess";
    else if (qId >= 13 && qId <= 18) category = "marketingOps";
    else if (qId >= 19 && qId <= 24) category = "customerSuccess";
    else if (qId >= 25 && qId <= 30) category = "revenueOps";
    else if (qId >= 31 && qId <= 36) category = "teamEnablement";
    
    // Extract numeric score from answer
    if (typeof answer === "number") {
      score = (answer / 5) * 100; // Convert 1-5 scale to 0-100
    } else if (typeof answer === "string") {
      if (answer === "yes") score = 100;
      else if (answer === "partial") score = 60;
      else if (answer === "no") score = 0;
      else {
        // For multiple choice, assign scores based on value
        const value = parseInt(answer);
        if (!isNaN(value)) {
          score = (value / 5) * 100;
        }
      }
    } else if (typeof answer === "object" && answer.value) {
      score = (answer.value / 5) * 100;
    }
    
    if (category && categoryScores[category]) {
      categoryScores[category].push(score);
    }
  });
  
  // Calculate average scores for each category
  const avgScores = {
    marketStrategy: Math.round(average(categoryScores.marketStrategy)),
    salesProcess: Math.round(average(categoryScores.salesProcess)),
    marketingOps: Math.round(average(categoryScores.marketingOps)),
    customerSuccess: Math.round(average(categoryScores.customerSuccess)),
    revenueOps: Math.round(average(categoryScores.revenueOps)),
    teamEnablement: Math.round(average(categoryScores.teamEnablement)),
  };
  
  // Calculate overall score (weighted average)
  const overall = Math.round(
    (avgScores.marketStrategy * 0.2 +
     avgScores.salesProcess * 0.2 +
     avgScores.marketingOps * 0.15 +
     avgScores.customerSuccess * 0.15 +
     avgScores.revenueOps * 0.15 +
     avgScores.teamEnablement * 0.15)
  );
  
  return {
    overall,
    ...avgScores,
  };
}

function average(arr: number[]): number {
  if (arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// Helper function to generate AI analysis
async function generateAIAnalysis(responses: Record<string, any>, scores: any) {
  const prompt = `You are a GTM (Go-To-Market) strategy expert analyzing a company's GTM maturity assessment.

Assessment Scores:
- Overall GTM Maturity: ${scores.overall}/100
- Market Strategy: ${scores.marketStrategy}/100
- Sales Process: ${scores.salesProcess}/100
- Marketing Operations: ${scores.marketingOps}/100
- Customer Success: ${scores.customerSuccess}/100
- Revenue Operations: ${scores.revenueOps}/100
- Team & Enablement: ${scores.teamEnablement}/100

Based on these scores, provide a comprehensive analysis in the following format:

1. **Strengths** (2-3 bullet points): What are they doing well? Which areas show maturity?

2. **Gaps** (3-4 bullet points): What are the critical weaknesses? Where do they need immediate improvement?

3. **Recommendations** (4-5 bullet points): Specific, actionable recommendations prioritized by impact.

4. **Action Plan** (Step-by-step roadmap): A 90-day action plan with specific milestones to improve their GTM maturity score.

Keep the tone professional but encouraging. Focus on practical, implementable advice.`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "You are a GTM strategy expert helping companies improve their go-to-market operations." },
        { role: "user", content: prompt }
      ],
    });
    
    const content = typeof response.choices[0].message.content === 'string' 
      ? response.choices[0].message.content 
      : JSON.stringify(response.choices[0].message.content);
    
    // Parse the response into sections
    const sections = {
      strengths: extractSection(content, "Strengths"),
      gaps: extractSection(content, "Gaps"),
      recommendations: extractSection(content, "Recommendations"),
      actionPlan: extractSection(content, "Action Plan"),
    };
    
    return sections;
  } catch (error) {
    console.error("Error generating AI analysis:", error);
    return {
      strengths: "Analysis pending...",
      gaps: "Analysis pending...",
      recommendations: "Analysis pending...",
      actionPlan: "Analysis pending...",
    };
  }
}

function extractSection(content: string, sectionName: string): string {
  const regex = new RegExp(`\\*\\*${sectionName}\\*\\*[:\\s]*([\\s\\S]*?)(?=\\*\\*|$)`, "i");
  const match = content.match(regex);
  return match ? match[1].trim() : "";
}

