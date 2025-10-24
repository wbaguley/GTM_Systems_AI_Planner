import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { getDb } from '../db';
import { getApiKey } from '../db-apikeys';
import { 
  icpAssessments, 
  icpAssessmentResponses, 
  icpAssessmentQuestions,
  icpAssessmentSections,
  icpAssessmentResults 
} from '../../drizzle/schema-icp-assessment';
import { eq } from 'drizzle-orm';

interface AnalysisResult {
  icp_analysis: {
    summary: string;
    ideal_customer_profile: {
      company_characteristics: string[];
      decision_makers: string[];
      pain_points: string[];
      buying_triggers: string[];
    };
    target_segments: Array<{
      segment_name: string;
      description: string;
      priority: string;
      rationale: string;
    }>;
    revenue_model_insights: string;
    market_opportunity: string;
  };
  methodology_analysis: {
    maturity_score: number;
    maturity_level: string;
    current_state: string;
    recommended_methodology: string;
    methodology_rationale: string;
    strengths: string[];
    gaps: Array<{
      gap: string;
      impact: string;
      recommendation: string;
    }>;
    improvement_roadmap: Array<{
      phase: string;
      initiatives: string[];
    }>;
  };
  enablement_analysis: {
    maturity_score: number;
    maturity_level: string;
    current_state: string;
    strengths: string[];
    weaknesses: string[];
    quick_wins: Array<{
      initiative: string;
      effort: string;
      impact: string;
      timeline: string;
    }>;
    strategic_initiatives: Array<{
      initiative: string;
      effort: string;
      impact: string;
      timeline: string;
    }>;
  };
  overall_recommendations: {
    top_priorities: string[];
    success_metrics: string[];
    estimated_impact: string;
    next_steps: string[];
  };
}

export class ICPAnalysisService {
  private userId: number;

  constructor(userId: number) {
    this.userId = userId;
  }

  /**
   * Generate AI analysis for a completed assessment
   */
  async analyzeAssessment(assessmentId: number): Promise<any> {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    // 1. Fetch assessment details
    const assessment = await db
      .select()
      .from(icpAssessments)
      .where(eq(icpAssessments.id, assessmentId))
      .limit(1);

    if (!assessment || assessment.length === 0) {
      throw new Error(`Assessment ${assessmentId} not found`);
    }

    const assessmentData = assessment[0];

    // 2. Fetch all responses with questions
    const responses = await db
      .select({
        questionId: icpAssessmentResponses.questionId,
        response: icpAssessmentResponses.response,
        question: icpAssessmentQuestions.question,
        category: icpAssessmentQuestions.category,
        sectionId: icpAssessmentQuestions.sectionId,
        questionType: icpAssessmentQuestions.questionType,
      })
      .from(icpAssessmentResponses)
      .innerJoin(
        icpAssessmentQuestions,
        eq(icpAssessmentResponses.questionId, icpAssessmentQuestions.id)
      )
      .where(eq(icpAssessmentResponses.assessmentId, assessmentId));

    if (responses.length === 0) {
      throw new Error('No responses found for this assessment');
    }

    // 3. Fetch sections
    const sections = await db
      .select()
      .from(icpAssessmentSections)
      .orderBy(icpAssessmentSections.order);

    // 4. Build the analysis prompt
    const prompt = this.buildAnalysisPrompt(assessmentData, responses, sections);

    // 5. Call LLM API
    const aiResponse = await this.callLLM(prompt);

    // 6. Parse and validate response
    const analysisResult = this.parseAIResponse(aiResponse);

    // 7. Save results to database
    await this.saveAnalysisResults(db, assessmentId, analysisResult);

    // 8. Update assessment status
    await db
      .update(icpAssessments)
      .set({ 
        status: 'completed',
        completedAt: new Date()
      })
      .where(eq(icpAssessments.id, assessmentId));

    return analysisResult;
  }

  /**
   * Build the comprehensive analysis prompt
   */
  private buildAnalysisPrompt(
    assessment: any,
    responses: any[],
    sections: any[]
  ): string {
    // Group responses by section
    const responsesBySection: Record<number, any[]> = {};
    responses.forEach(r => {
      if (!responsesBySection[r.sectionId]) {
        responsesBySection[r.sectionId] = [];
      }
      responsesBySection[r.sectionId].push(r);
    });

    let prompt = `Analyze the following ICP & Sales Enablement Assessment for ${assessment.companyName}.

COMPANY CONTEXT:
- Company Name: ${assessment.companyName}
- Industry: ${assessment.industry || 'Not specified'}
- Company Size: ${assessment.companySize || 'Not specified'}
- Revenue: ${assessment.revenue || 'Not specified'}

`;

    // Add responses for each section
    sections.forEach((section, index) => {
      const sectionResponses = responsesBySection[section.id] || [];
      
      prompt += `\nSECTION ${index + 1}: ${section.name.toUpperCase()}\n`;
      prompt += `Description: ${section.description || 'N/A'}\n\n`;

      if (sectionResponses.length > 0) {
        sectionResponses.forEach((r, i) => {
          prompt += `Q${i + 1}: ${r.question}\n`;
          prompt += `A: ${r.response}\n\n`;
        });
      } else {
        prompt += `No responses for this section.\n\n`;
      }
    });

    prompt += `
Please provide a comprehensive analysis in the following JSON format. Be specific, actionable, and tailored to this company's industry and context.

{
  "icp_analysis": {
    "summary": "Executive summary of ICP findings (2-3 paragraphs)",
    "ideal_customer_profile": {
      "company_characteristics": ["characteristic 1", "characteristic 2", "characteristic 3"],
      "decision_makers": ["role 1", "role 2", "role 3"],
      "pain_points": ["pain 1", "pain 2", "pain 3"],
      "buying_triggers": ["trigger 1", "trigger 2", "trigger 3"]
    },
    "target_segments": [
      {
        "segment_name": "Segment Name",
        "description": "Detailed description of this segment",
        "priority": "High|Medium|Low",
        "rationale": "Why this segment is a good fit"
      }
    ],
    "revenue_model_insights": "Analysis of revenue streams, pricing strategy, and deal economics",
    "market_opportunity": "Assessment of market potential and growth opportunities"
  },
  "methodology_analysis": {
    "maturity_score": 3.5,
    "maturity_level": "Defined|Developing|Initial|Managed|Optimizing",
    "current_state": "Description of current sales methodology and process maturity",
    "recommended_methodology": "Best-fit sales methodology (e.g., MEDDIC, SPIN, Challenger, Sandler, Solution Selling)",
    "methodology_rationale": "Why this methodology is the best fit for this company",
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "gaps": [
      {
        "gap": "Gap description",
        "impact": "High|Medium|Low",
        "recommendation": "How to address this gap"
      }
    ],
    "improvement_roadmap": [
      {
        "phase": "Phase 1: Quick Wins (0-3 months)",
        "initiatives": ["initiative 1", "initiative 2", "initiative 3"]
      },
      {
        "phase": "Phase 2: Foundation Building (3-6 months)",
        "initiatives": ["initiative 1", "initiative 2", "initiative 3"]
      },
      {
        "phase": "Phase 3: Optimization (6-12 months)",
        "initiatives": ["initiative 1", "initiative 2", "initiative 3"]
      }
    ]
  },
  "enablement_analysis": {
    "maturity_score": 2.8,
    "maturity_level": "Developing|Initial|Defined|Managed|Optimizing",
    "current_state": "Description of current sales enablement state",
    "strengths": ["strength 1", "strength 2", "strength 3"],
    "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
    "quick_wins": [
      {
        "initiative": "Quick win description",
        "effort": "Low|Medium|High",
        "impact": "Low|Medium|High",
        "timeline": "1-2 weeks|2-4 weeks|1-2 months"
      }
    ],
    "strategic_initiatives": [
      {
        "initiative": "Strategic initiative description",
        "effort": "Low|Medium|High",
        "impact": "Low|Medium|High",
        "timeline": "3-6 months|6-12 months"
      }
    ]
  },
  "overall_recommendations": {
    "top_priorities": ["priority 1", "priority 2", "priority 3"],
    "success_metrics": ["metric 1", "metric 2", "metric 3"],
    "estimated_impact": "Expected business impact over 6-12 months",
    "next_steps": ["step 1", "step 2", "step 3"]
  }
}

IMPORTANT: Return ONLY valid JSON. Do not include any markdown formatting, code blocks, or explanatory text. The response should start with { and end with }.`;

    return prompt;
  }

  /**
   * Call LLM API with the analysis prompt
   */
  private async callLLM(prompt: string): Promise<string> {
    const systemPrompt = `You are an expert sales methodology and GTM strategy consultant specializing in helping B2B companies optimize their ideal customer profiles and sales processes. You have deep expertise in:

- ICP development and customer segmentation
- Sales methodology frameworks (MEDDIC, SPIN, Challenger, Sandler, Solution Selling, etc.)
- Sales enablement best practices
- Revenue operations and process optimization
- Trade and skilled-service industry business models

Your analysis should be:
- Data-driven and objective based on the assessment responses
- Actionable with specific, practical recommendations
- Tailored to the company's industry, size, and maturity level
- Focused on both quick wins and strategic initiatives
- Written in clear, jargon-free language that business owners can understand
- Honest about gaps while being constructive and encouraging

You must return ONLY valid JSON without any markdown formatting or code blocks.`;

    // Try providers in order: OpenAI, Anthropic, Ollama
    const providers = ['openai', 'anthropic', 'ollama'];
    
    for (const provider of providers) {
      const config = await getApiKey(this.userId, provider);
      
      if (provider === 'openai' && config?.apiKey) {
        return await this.callOpenAI(systemPrompt, prompt, config.apiKey);
      } else if (provider === 'anthropic' && config?.apiKey) {
        return await this.callAnthropic(systemPrompt, prompt, config.apiKey);
      } else if (provider === 'ollama' && config?.serverUrl) {
        return await this.callOllama(systemPrompt, prompt, config.serverUrl);
      }
    }

    throw new Error('No AI provider configured. Please configure OpenAI, Anthropic, or Ollama in Settings.');
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(systemPrompt: string, prompt: string, apiKey: string): Promise<string> {
    const openai = new OpenAI({ apiKey });
    
    // Use environment variable for model if set, otherwise default to gpt-4o-mini
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS || '3000', 10);

    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: maxTokens,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI');
    }

    return content;
  }

  /**
   * Call Anthropic API
   */
  private async callAnthropic(systemPrompt: string, prompt: string, apiKey: string): Promise<string> {
    const anthropic = new Anthropic({ apiKey });
    
    const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
    const maxTokens = parseInt(process.env.ANTHROPIC_MAX_TOKENS || '4000', 10);

    const response = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [
        { role: 'user', content: prompt }
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Anthropic');
    }

    return content.text;
  }

  /**
   * Call Ollama API
   */
  private async callOllama(systemPrompt: string, prompt: string, serverUrl: string): Promise<string> {
    const model = process.env.OLLAMA_MODEL || 'mistral';
    
    // Ensure serverUrl doesn't have trailing slash
    const baseUrl = serverUrl.replace(/\/$/, '');
    const endpoint = `${baseUrl}/api/generate`;
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt: `${systemPrompt}\n\n${prompt}`,
          stream: false,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ollama API error (${response.status}): ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Ollama returned non-JSON response. Check if Ollama is running at ${baseUrl}. Response: ${text.substring(0, 200)}`);
      }

      const data = await response.json();
      
      if (!data.response) {
        throw new Error('Ollama response missing "response" field');
      }
      
      return data.response;
    } catch (error: any) {
      if (error.message.includes('fetch failed') || error.code === 'ECONNREFUSED') {
        throw new Error(`Cannot connect to Ollama server at ${baseUrl}. Make sure Ollama is running and accessible.`);
      }
      throw error;
    }
  }

  /**
   * Parse and validate the AI response
   */
  private parseAIResponse(response: string): AnalysisResult {
    try {
      // Remove markdown code blocks if present
      let cleanedResponse = response.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(cleanedResponse);

      // Basic validation
      if (!parsed.icp_analysis || !parsed.methodology_analysis || !parsed.enablement_analysis) {
        throw new Error('Invalid analysis structure');
      }

      return parsed as AnalysisResult;
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      console.error('Response:', response);
      throw new Error('Failed to parse AI analysis response');
    }
  }

  /**
   * Save analysis results to database
   */
  private async saveAnalysisResults(
    db: any,
    assessmentId: number,
    analysis: AnalysisResult
  ): Promise<void> {
    // Check if results already exist
    const existing = await db
      .select()
      .from(icpAssessmentResults)
      .where(eq(icpAssessmentResults.assessmentId, assessmentId))
      .limit(1);

    const resultsData = {
      assessmentId,
      overallScore: Math.round(
        (analysis.methodology_analysis.maturity_score * 20 + 
         analysis.enablement_analysis.maturity_score * 20) / 2
      ),
      icpClarityScore: 75, // Placeholder - could be calculated from responses
      methodologyMaturityScore: Math.round(analysis.methodology_analysis.maturity_score * 20),
      enablementMaturityScore: Math.round(analysis.enablement_analysis.maturity_score * 20),
      categoryScores: {},
      executiveSummary: analysis.icp_analysis.summary,
      strengths: analysis.methodology_analysis.strengths,
      gaps: analysis.methodology_analysis.gaps,
      recommendations: analysis.overall_recommendations.top_priorities,
      actionPlan: analysis.methodology_analysis.improvement_roadmap,
      primaryMethodology: analysis.methodology_analysis.recommended_methodology,
      secondaryMethodologies: [],
      methodologyRationale: analysis.methodology_analysis.methodology_rationale,
      enablementPriorities: analysis.overall_recommendations.top_priorities,
      quickWins: analysis.enablement_analysis.quick_wins,
      mediumTermGoals: analysis.enablement_analysis.strategic_initiatives.filter(i => 
        i.timeline.includes('3-6')
      ),
      longTermGoals: analysis.enablement_analysis.strategic_initiatives.filter(i => 
        i.timeline.includes('6-12')
      ),
    };

    if (existing && existing.length > 0) {
      // Update existing results
      await db
        .update(icpAssessmentResults)
        .set({
          ...resultsData,
          updatedAt: new Date()
        })
        .where(eq(icpAssessmentResults.assessmentId, assessmentId));
    } else {
      // Insert new results
      await db.insert(icpAssessmentResults).values(resultsData);
    }
  }

  /**
   * Get existing analysis results
   */
  async getAnalysisResults(assessmentId: number): Promise<any> {
    const db = await getDb();
    if (!db) {
      throw new Error('Database not available');
    }

    const results = await db
      .select()
      .from(icpAssessmentResults)
      .where(eq(icpAssessmentResults.assessmentId, assessmentId))
      .limit(1);

    if (!results || results.length === 0) {
      return null;
    }

    return results[0];
  }
}

