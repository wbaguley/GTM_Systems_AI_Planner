import type { GtmFramework, GtmFrameworkQuestion, GtmAssessmentResponse } from "../../drizzle/schema";

interface AnalysisResult {
  overallScore: number;
  categoryScores: Record<string, number>;
  strengths: string[];
  gaps: string[];
  recommendations: Array<{
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
  }>;
  actionPlan: Array<{
    phase: string;
    actions: string[];
    timeline: string;
  }>;
  aiAnalysis: string;
}

export async function analyzeAssessment(
  framework: GtmFramework,
  questions: GtmFrameworkQuestion[],
  responses: GtmAssessmentResponse[]
): Promise<AnalysisResult> {
  // Build response map for easy lookup
  const responseMap = new Map<number, string>();
  responses.forEach((r) => {
    responseMap.set(r.questionId, r.responseValue);
  });

  // Group questions by category
  const categorizedQuestions = new Map<string, GtmFrameworkQuestion[]>();
  questions.forEach((q) => {
    if (!categorizedQuestions.has(q.category)) {
      categorizedQuestions.set(q.category, []);
    }
    categorizedQuestions.get(q.category)!.push(q);
  });

  // Calculate category scores
  const categoryScores: Record<string, number> = {};
  for (const [category, catQuestions] of Array.from(categorizedQuestions.entries())) {
    let totalScore = 0;
    let scoredQuestions = 0;

    for (const question of catQuestions) {
      const response = responseMap.get(question.id);
      if (!response) continue;

      let score = 0;
      if (question.questionType === "rating") {
        // Rating questions (1-5) -> convert to 0-100
        score = (parseInt(response) / 5) * 100;
        scoredQuestions++;
      } else if (question.questionType === "multipleChoice") {
        // Multiple choice -> presence of answer = 50, quality assessed by AI
        score = 50;
        scoredQuestions++;
      } else if (question.questionType === "text") {
        // Text responses -> length and quality heuristic
        const wordCount = response.split(/\s+/).length;
        if (wordCount > 20) score = 70;
        else if (wordCount > 10) score = 50;
        else if (wordCount > 0) score = 30;
        scoredQuestions++;
      }

      totalScore += score;
    }

    categoryScores[category] = scoredQuestions > 0 ? Math.round(totalScore / scoredQuestions) : 0;
  }

  // Calculate overall score
  const overallScore = Math.round(
    Object.values(categoryScores).reduce((sum, score) => sum + score, 0) /
      Object.keys(categoryScores).length
  );

  // Generate AI analysis using framework expert training data
  const expertData = framework.expertTrainingData as any;
  const aiAnalysis = await generateExpertAnalysis(
    framework,
    expertData,
    questions,
    responses,
    responseMap,
    categoryScores,
    overallScore
  );

  // Extract structured insights from AI analysis
  const strengths = extractStrengths(categoryScores, expertData, responses, responseMap);
  const gaps = extractGaps(categoryScores, expertData, responses, responseMap);
  const recommendations = generateRecommendations(framework, categoryScores, expertData, gaps);
  const actionPlan = generateActionPlan(framework, recommendations);

  return {
    overallScore,
    categoryScores,
    strengths,
    gaps,
    recommendations,
    actionPlan,
    aiAnalysis,
  };
}

function extractStrengths(
  categoryScores: Record<string, number>,
  expertData: any,
  responses: GtmAssessmentResponse[],
  responseMap: Map<number, string>
): string[] {
  const strengths: string[] = [];

  // Identify high-scoring categories
  for (const [category, score] of Object.entries(categoryScores)) {
    if (score >= 70) {
      strengths.push(`Strong performance in ${category} (${score}/100)`);
    }
  }

  // Add framework-specific strengths based on best practices
  if (expertData?.bestPractices) {
    const practices = expertData.bestPractices as string[];
    if (strengths.length > 0) {
      strengths.push(`Alignment with ${practices[0]?.toLowerCase() || "best practices"}`);
    }
  }

  if (strengths.length === 0) {
    strengths.push("Willingness to assess and improve GTM strategy");
    strengths.push("Engagement with structured framework analysis");
  }

  return strengths.slice(0, 5);
}

function extractGaps(
  categoryScores: Record<string, number>,
  expertData: any,
  responses: GtmAssessmentResponse[],
  responseMap: Map<number, string>
): string[] {
  const gaps: string[] = [];

  // Identify low-scoring categories
  for (const [category, score] of Object.entries(categoryScores)) {
    if (score < 50) {
      gaps.push(`${category} needs significant improvement (${score}/100)`);
    } else if (score < 70) {
      gaps.push(`${category} has room for optimization (${score}/100)`);
    }
  }

  // Add framework-specific gaps based on common pitfalls
  if (expertData?.commonPitfalls && gaps.length < 3) {
    const pitfalls = expertData.commonPitfalls as string[];
    gaps.push(`Risk of ${pitfalls[0]?.toLowerCase() || "common pitfalls"}`);
  }

  if (gaps.length === 0) {
    gaps.push("Opportunity to formalize framework implementation");
  }

  return gaps.slice(0, 5);
}

function generateRecommendations(
  framework: GtmFramework,
  categoryScores: Record<string, number>,
  expertData: any,
  gaps: string[]
): Array<{ title: string; description: string; priority: "high" | "medium" | "low" }> {
  const recommendations: Array<{
    title: string;
    description: string;
    priority: "high" | "medium" | "low";
  }> = [];

  // High priority: Address critical gaps
  const criticalCategories = Object.entries(categoryScores)
    .filter(([_, score]) => score < 50)
    .map(([category]) => category);

  if (criticalCategories.length > 0) {
    recommendations.push({
      title: `Prioritize ${criticalCategories[0]} Improvements`,
      description: `This category scored lowest and requires immediate attention. ${
        expertData?.bestPractices?.[0] || "Focus on foundational improvements first."
      }`,
      priority: "high",
    });
  }

  // Medium priority: Framework-specific best practices
  if (expertData?.bestPractices) {
    const practices = expertData.bestPractices as string[];
    recommendations.push({
      title: `Implement ${framework.name} Best Practices`,
      description: practices.slice(0, 2).join(". ") + ".",
      priority: "medium",
    });
  }

  // Medium priority: Measurement and tracking
  if (expertData?.keyMetrics) {
    const metrics = expertData.keyMetrics as string[];
    recommendations.push({
      title: "Establish Key Metrics Tracking",
      description: `Track ${metrics.slice(0, 3).join(", ")} to measure progress and validate improvements.`,
      priority: "medium",
    });
  }

  // Low priority: Avoid common pitfalls
  if (expertData?.commonPitfalls) {
    const pitfalls = expertData.commonPitfalls as string[];
    recommendations.push({
      title: "Avoid Common Pitfalls",
      description: `Be mindful of: ${pitfalls[0]?.toLowerCase() || "common mistakes"}. ${
        pitfalls[1]?.toLowerCase() || ""
      }`,
      priority: "low",
    });
  }

  // Low priority: Long-term optimization
  recommendations.push({
    title: "Continuous Improvement",
    description: `Regularly reassess your ${framework.name} implementation and iterate based on results and market changes.`,
    priority: "low",
  });

  return recommendations.slice(0, 6);
}

function generateActionPlan(
  framework: GtmFramework,
  recommendations: Array<{ title: string; description: string; priority: "high" | "medium" | "low" }>
): Array<{ phase: string; actions: string[]; timeline: string }> {
  const actionPlan = [];

  // Phase 1: Immediate Actions (High Priority)
  const highPriority = recommendations.filter((r) => r.priority === "high");
  if (highPriority.length > 0) {
    actionPlan.push({
      phase: "Phase 1: Foundation (Weeks 1-4)",
      actions: highPriority.map((r) => r.title),
      timeline: "Complete within 1 month",
    });
  }

  // Phase 2: Core Implementation (Medium Priority)
  const mediumPriority = recommendations.filter((r) => r.priority === "medium");
  if (mediumPriority.length > 0) {
    actionPlan.push({
      phase: "Phase 2: Implementation (Months 2-3)",
      actions: mediumPriority.map((r) => r.title),
      timeline: "Complete within 2-3 months",
    });
  }

  // Phase 3: Optimization (Low Priority)
  const lowPriority = recommendations.filter((r) => r.priority === "low");
  if (lowPriority.length > 0) {
    actionPlan.push({
      phase: "Phase 3: Optimization (Months 4-6)",
      actions: lowPriority.map((r) => r.title),
      timeline: "Complete within 4-6 months",
    });
  }

  // Phase 4: Ongoing
  actionPlan.push({
    phase: "Phase 4: Continuous Improvement (Ongoing)",
    actions: [
      "Monitor key metrics monthly",
      "Conduct quarterly framework reviews",
      "Iterate based on results and feedback",
    ],
    timeline: "Ongoing",
  });

  return actionPlan;
}

async function generateExpertAnalysis(
  framework: GtmFramework,
  expertData: any,
  questions: GtmFrameworkQuestion[],
  responses: GtmAssessmentResponse[],
  responseMap: Map<number, string>,
  categoryScores: Record<string, number>,
  overallScore: number
): Promise<string> {
  // Build a comprehensive analysis narrative
  const analysis: string[] = [];

  analysis.push(`# ${framework.name} Assessment Analysis\n`);
  analysis.push(`**Overall Score: ${overallScore}/100**\n`);

  analysis.push(`## Executive Summary\n`);
  analysis.push(
    `Based on your responses to the ${framework.name} assessment, your organization scores ${overallScore}/100 overall. `
  );

  if (overallScore >= 80) {
    analysis.push(
      `This indicates strong alignment with ${framework.name} principles and best practices. `
    );
  } else if (overallScore >= 60) {
    analysis.push(
      `This indicates moderate alignment with ${framework.name} principles, with significant opportunities for improvement. `
    );
  } else {
    analysis.push(
      `This indicates substantial room for improvement in implementing ${framework.name} principles. `
    );
  }

  analysis.push(`\n## Category Performance\n`);
  for (const [category, score] of Object.entries(categoryScores)) {
    analysis.push(`- **${category}**: ${score}/100`);
    if (score >= 70) {
      analysis.push(` - Strong performance`);
    } else if (score >= 50) {
      analysis.push(` - Needs improvement`);
    } else {
      analysis.push(` - Critical gap`);
    }
    analysis.push(`\n`);
  }

  analysis.push(`\n## Framework Principles\n`);
  if (expertData?.principles) {
    analysis.push(`The ${framework.name} framework is built on these core principles:\n`);
    (expertData.principles as string[]).forEach((principle, idx) => {
      analysis.push(`${idx + 1}. ${principle}\n`);
    });
  }

  analysis.push(`\n## Key Insights\n`);
  analysis.push(
    `Your assessment reveals both strengths and opportunities for improvement. The detailed recommendations below provide a roadmap for enhancing your ${framework.name} implementation.\n`
  );

  if (expertData?.successIndicators) {
    analysis.push(`\n## Success Indicators to Track\n`);
    (expertData.successIndicators as string[]).forEach((indicator) => {
      analysis.push(`- ${indicator}\n`);
    });
  }

  return analysis.join("");
}

