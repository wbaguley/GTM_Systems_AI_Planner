import { mysqlTable, varchar, text, int, timestamp, json, boolean } from 'drizzle-orm/mysql-core';

/**
 * ICP & Sales Enablement Assessment Schema
 * 
 * This schema supports:
 * 1. ICP Discovery Assessment
 * 2. Sales Methodology & Enablement Maturity Assessment
 * 3. AI-powered analysis with methodology recommendations
 * 4. Scoring and action plans
 * 5. PDF report generation
 */

// Main assessment table
export const icpAssessments = mysqlTable('icp_assessments', {
  id: int('id').primaryKey().autoincrement(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  industry: varchar('industry', { length: 255 }),
  companySize: varchar('company_size', { length: 50 }), // employees count range
  revenue: varchar('revenue', { length: 50 }), // revenue range
  status: varchar('status', { length: 50 }).notNull().default('draft'), // draft, in_progress, completed
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Assessment sections (ICP Discovery, Sales Methodology, Enablement Maturity)
export const icpAssessmentSections = mysqlTable('icp_assessment_sections', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 255 }).notNull(), // e.g., "ICP Discovery", "Sales Methodology", "Enablement Maturity"
  description: text('description'),
  order: int('order').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Assessment questions
export const icpAssessmentQuestions = mysqlTable('icp_assessment_questions', {
  id: int('id').primaryKey().autoincrement(),
  sectionId: int('section_id').notNull(),
  category: varchar('category', { length: 255 }).notNull(), // e.g., "Business Model", "Target Market", "Sales Process"
  question: text('question').notNull(),
  questionType: varchar('question_type', { length: 50 }).notNull(), // text, textarea, select, multiselect, rating, boolean
  options: json('options'), // For select/multiselect questions
  helpText: text('help_text'),
  required: boolean('required').notNull().default(true),
  order: int('order').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// User responses to assessment questions
export const icpAssessmentResponses = mysqlTable('icp_assessment_responses', {
  id: int('id').primaryKey().autoincrement(),
  assessmentId: int('assessment_id').notNull(),
  questionId: int('question_id').notNull(),
  response: text('response').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// AI-generated ICP profiles (can be multiple if serving different verticals)
export const icpProfiles = mysqlTable('icp_profiles', {
  id: int('id').primaryKey().autoincrement(),
  assessmentId: int('assessment_id').notNull(),
  profileName: varchar('profile_name', { length: 255 }).notNull(), // e.g., "Enterprise Healthcare", "SMB Manufacturing"
  vertical: varchar('vertical', { length: 255 }),
  description: text('description').notNull(),
  painPoints: json('pain_points'), // Array of pain points
  buyingBehaviors: json('buying_behaviors'), // Array of behaviors
  decisionCriteria: json('decision_criteria'), // Array of criteria
  recommendedMethodology: varchar('recommended_methodology', { length: 255 }), // e.g., "MEDDIC", "Challenger Sale"
  recommendedMarketing: varchar('recommended_marketing', { length: 255 }), // e.g., "ABM", "Inbound"
  channels: json('channels'), // Array of recommended channels
  messagingFramework: text('messaging_framework'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Assessment results with AI analysis
export const icpAssessmentResults = mysqlTable('icp_assessment_results', {
  id: int('id').primaryKey().autoincrement(),
  assessmentId: int('assessment_id').notNull(),
  
  // Overall scores
  overallScore: int('overall_score').notNull(), // 0-100
  icpClarityScore: int('icp_clarity_score'), // How well-defined their ICP is
  methodologyMaturityScore: int('methodology_maturity_score'), // Sales methodology maturity
  enablementMaturityScore: int('enablement_maturity_score'), // Sales enablement maturity
  
  // Category scores (stored as JSON for flexibility)
  categoryScores: json('category_scores'), // { "Process": 75, "People": 60, "Technology": 80, etc. }
  
  // AI Analysis
  executiveSummary: text('executive_summary').notNull(),
  strengths: json('strengths'), // Array of what's going well
  gaps: json('gaps'), // Array of areas for improvement
  recommendations: json('recommendations'), // Array of prioritized recommendations
  actionPlan: json('action_plan'), // Phased implementation roadmap
  
  // Methodology recommendations
  primaryMethodology: varchar('primary_methodology', { length: 255 }),
  secondaryMethodologies: json('secondary_methodologies'), // Array of alternative methodologies
  methodologyRationale: text('methodology_rationale'),
  
  // Enablement recommendations
  enablementPriorities: json('enablement_priorities'), // Array of priority areas
  quickWins: json('quick_wins'), // Array of quick wins (30 days)
  mediumTermGoals: json('medium_term_goals'), // 60-90 days
  longTermGoals: json('long_term_goals'), // 6-12 months
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Track which sections of the platform reference this ICP
export const icpReferences = mysqlTable('icp_references', {
  id: int('id').primaryKey().autoincrement(),
  assessmentId: int('assessment_id').notNull(),
  referenceType: varchar('reference_type', { length: 100 }).notNull(), // e.g., "playbook", "gtm_framework", "platform"
  referenceId: int('reference_id'), // ID of the referencing entity
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

