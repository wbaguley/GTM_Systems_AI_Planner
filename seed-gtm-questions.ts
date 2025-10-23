import { drizzle } from "drizzle-orm/mysql2";
import { gtmQuestions } from "./drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const questions = [
  // Market Strategy (6 questions)
  {
    category: "market_strategy",
    question: "How well-defined is your Ideal Customer Profile (ICP)?",
    questionType: "scale",
    options: JSON.stringify([
      { value: 1, label: "Not defined - we target anyone who will buy" },
      { value: 2, label: "Loosely defined - we have a general idea" },
      { value: 3, label: "Partially defined - we know some key characteristics" },
      { value: 4, label: "Well-defined - we have documented ICPs with firmographics" },
      { value: 5, label: "Highly refined - we have detailed ICPs with psychographics and validated personas" }
    ]),
    weight: 3,
    displayOrder: 1,
  },
  {
    category: "market_strategy",
    question: "How clear is your value proposition and positioning in the market?",
    questionType: "scale",
    options: JSON.stringify([
      { value: 1, label: "Unclear - we struggle to articulate our differentiation" },
      { value: 2, label: "Basic - we can explain what we do" },
      { value: 3, label: "Moderate - we have a value prop but it's not unique" },
      { value: 4, label: "Strong - we have clear differentiation from competitors" },
      { value: 5, label: "Exceptional - we own a category and have proven messaging" }
    ]),
    weight: 3,
    displayOrder: 2,
  },
  {
    category: "market_strategy",
    question: "How well do you understand your total addressable market (TAM) and serviceable market (SAM)?",
    questionType: "scale",
    options: JSON.stringify([
      { value: 1, label: "No analysis done" },
      { value: 2, label: "Rough estimates only" },
      { value: 3, label: "Basic research completed" },
      { value: 4, label: "Detailed analysis with data" },
      { value: 5, label: "Comprehensive market sizing with segmentation" }
    ]),
    weight: 2,
    displayOrder: 3,
  },
  {
    category: "market_strategy",
    question: "Do you have a documented go-to-market strategy?",
    questionType: "yes_no",
    options: JSON.stringify([
      { value: "yes", label: "Yes, documented and regularly reviewed" },
      { value: "partial", label: "Partially - some elements documented" },
      { value: "no", label: "No formal documentation" }
    ]),
    weight: 2,
    displayOrder: 4,
  },
  {
    category: "market_strategy",
    question: "How well do you track competitive intelligence?",
    questionType: "scale",
    options: JSON.stringify([
      { value: 1, label: "Not tracked" },
      { value: 2, label: "Ad-hoc monitoring" },
      { value: 3, label: "Regular competitor research" },
      { value: 4, label: "Systematic tracking with tools" },
      { value: 5, label: "Comprehensive competitive intelligence program" }
    ]),
    weight: 1,
    displayOrder: 5,
  },
  {
    category: "market_strategy",
    question: "How aligned are your sales and marketing teams on target accounts and messaging?",
    questionType: "scale",
    options: JSON.stringify([
      { value: 1, label: "Not aligned - working in silos" },
      { value: 2, label: "Minimal alignment" },
      { value: 3, label: "Some coordination" },
      { value: 4, label: "Well-aligned with regular sync" },
      { value: 5, label: "Fully integrated with shared goals and metrics" }
    ]),
    weight: 3,
    displayOrder: 6,
  },

  // Sales Process (6 questions)
  {
    category: "sales_process",
    question: "Do you have a defined and documented sales methodology?",
    questionType: "multiple_choice",
    options: JSON.stringify([
      { value: "none", label: "No formal methodology" },
      { value: "basic", label: "Basic process, not formalized" },
      { value: "challenger", label: "Challenger Sale" },
      { value: "sandler", label: "Sandler Selling System" },
      { value: "spin", label: "SPIN Selling" },
      { value: "value", label: "Value-Based Selling" },
      { value: "solution", label: "Solution Selling" },
      { value: "custom", label: "Custom methodology" }
    ]),
    weight: 3,
    displayOrder: 7,
  },
  {
    category: "sales_process",
    question: "How mature is your sales pipeline management?",
    questionType: "scale",
    options: JSON.stringify([
      { value: 1, label: "No formal pipeline - tracking in spreadsheets" },
      { value: 2, label: "Basic CRM usage" },
      { value: 3, label: "Defined stages with some automation" },
      { value: 4, label: "Well-defined stages with clear exit criteria" },
      { value: 5, label: "Optimized pipeline with predictive analytics" }
    ]),
    weight: 3,
    displayOrder: 8,
  },
  {
    category: "sales_process",
    question: "How accurate is your sales forecasting?",
    questionType: "scale",
    options: JSON.stringify([
      { value: 1, label: "No forecasting process" },
      { value: 2, label: "Gut-feel based estimates" },
      { value: 3, label: "Basic pipeline-based forecasting" },
      { value: 4, label: "Data-driven forecasting with historical trends" },
      { value: 5, label: "AI-powered predictive forecasting with high accuracy" }
    ]),
    weight: 2,
    displayOrder: 9,
  },
  {
    category: "sales_process",
    question: "Do you have standardized sales playbooks and cadences?",
    questionType: "yes_no",
    options: JSON.stringify([
      { value: "yes", label: "Yes, comprehensive playbooks for all scenarios" },
      { value: "partial", label: "Some playbooks for key scenarios" },
      { value: "no", label: "No standardized playbooks" }
    ]),
    weight: 2,
    displayOrder: 10,
  },
  {
    category: "sales_process",
    question: "How well do you qualify leads before they enter the sales pipeline?",
    questionType: "scale",
    options: JSON.stringify([
      { value: 1, label: "No qualification - all leads go to sales" },
      { value: 2, label: "Basic qualification criteria" },
      { value: 3, label: "BANT or similar framework" },
      { value: 4, label: "Multi-criteria scoring system" },
      { value: 5, label: "AI-powered lead scoring with predictive models" }
    ]),
    weight: 2,
    displayOrder: 11,
  },
  {
    category: "sales_process",
    question: "What is your average sales cycle length and consistency?",
    questionType: "scale",
    options: JSON.stringify([
      { value: 1, label: "Highly variable - no predictability" },
      { value: 2, label: "Somewhat variable" },
      { value: 3, label: "Moderately consistent" },
      { value: 4, label: "Consistent with known patterns" },
      { value: 5, label: "Highly predictable and optimized" }
    ]),
    weight: 1,
    displayOrder: 12,
  },

  // Marketing Operations (6 questions)
  {
    category: "marketing_ops",
    question: "How sophisticated is your demand generation strategy?",
    questionType: "scale",
    options: JSON.stringify([
      { value: 1, label: "No formal demand gen strategy" },
      { value: 2, label: "Basic tactics (email, social)" },
      { value: 3, label: "Multi-channel campaigns" },
      { value: 4, label: "Integrated campaigns with attribution" },
      { value: 5, label: "Full-funnel orchestration with AI optimization" }
    ]),
    weight: 3,
    displayOrder: 13,
  },
  {
    category: "marketing_ops",
    question: "Do you have marketing automation in place?",
    questionType: "scale",
    options: JSON.stringify([
      { value: 1, label: "No automation" },
      { value: 2, label: "Basic email automation" },
      { value: 3, label: "Multi-channel automation (HubSpot, Marketo, etc.)" },
      { value: 4, label: "Advanced workflows with personalization" },
      { value: 5, label: "AI-powered automation with dynamic content" }
    ]),
    weight: 2,
    displayOrder: 14,
  },
  {
    category: "marketing_ops",
    question: "How well do you track marketing attribution and ROI?",
    questionType: "scale",
    options: JSON.stringify([
      { value: 1, label: "No attribution tracking" },
      { value: 2, label: "Last-touch attribution only" },
      { value: 3, label: "First-touch and last-touch" },
      { value: 4, label: "Multi-touch attribution model" },
      { value: 5, label: "Advanced attribution with ML and revenue impact" }
    ]),
    weight: 3,
    displayOrder: 15,
  },
  {
    category: "marketing_ops",
    question: "How mature is your content marketing strategy?",
    questionType: "scale",
    options: JSON.stringify([
      { value: 1, label: "No content strategy" },
      { value: 2, label: "Ad-hoc content creation" },
      { value: 3, label: "Content calendar and basic SEO" },
      { value: 4, label: "Strategic content aligned to buyer journey" },
      { value: 5, label: "Data-driven content engine with personalization" }
    ]),
    weight: 2,
    displayOrder: 16,
  },
  {
    category: "marketing_ops",
    question: "Do you have a lead nurturing program?",
    questionType: "yes_no",
    options: JSON.stringify([
      { value: "yes", label: "Yes, automated nurture tracks by segment" },
      { value: "partial", label: "Basic email nurture sequences" },
      { value: "no", label: "No formal nurture program" }
    ]),
    weight: 2,
    displayOrder: 17,
  },
  {
    category: "marketing_ops",
    question: "How well do you measure and optimize conversion rates across the funnel?",
    questionType: "scale",
    options: JSON.stringify([
      { value: 1, label: "No conversion tracking" },
      { value: 2, label: "Basic funnel metrics" },
      { value: 3, label: "Conversion tracking at key stages" },
      { value: 4, label: "Detailed funnel analysis with A/B testing" },
      { value: 5, label: "Continuous optimization with experimentation framework" }
    ]),
    weight: 2,
    displayOrder: 18,
  },

  // Customer Success (6 questions)
  {
    category: "customer_success",
    question: "Do you have a structured customer onboarding process?",
    questionType: "scale",
    options: JSON.stringify([
      { value: 1, label: "No formal onboarding" },
      { value: 2, label: "Basic welcome email" },
      { value: 3, label: "Documented onboarding checklist" },
      { value: 4, label: "Structured onboarding with milestones" },
      { value: 5, label: "White-glove onboarding with success metrics" }
    ]),
    weight: 3,
    displayOrder: 19,
  },
  {
    category: "customer_success",
    question: "How do you track customer health and engagement?",
    questionType: "scale",
    options: JSON.stringify([
      { value: 1, label: "No tracking" },
      { value: 2, label: "Manual check-ins" },
      { value: 3, label: "Basic usage metrics" },
      { value: 4, label: "Health score with multiple signals" },
      { value: 5, label: "Predictive health scoring with intervention workflows" }
    ]),
    weight: 3,
    displayOrder: 20,
  },
  {
    category: "customer_success",
    question: "What is your customer retention rate?",
    questionType: "scale",
    options: JSON.stringify([
      { value: 1, label: "Below 70% annual retention" },
      { value: 2, label: "70-80% retention" },
      { value: 3, label: "80-90% retention" },
      { value: 4, label: "90-95% retention" },
      { value: 5, label: "Above 95% retention" }
    ]),
    weight: 3,
    displayOrder: 21,
  },
  {
    category: "customer_success",
    question: "Do you have a customer expansion/upsell strategy?",
    questionType: "yes_no",
    options: JSON.stringify([
      { value: "yes", label: "Yes, systematic expansion playbook" },
      { value: "partial", label: "Opportunistic upsells" },
      { value: "no", label: "No expansion strategy" }
    ]),
    weight: 2,
    displayOrder: 22,
  },
  {
    category: "customer_success",
    question: "How do you gather and act on customer feedback?",
    questionType: "scale",
    options: JSON.stringify([
      { value: 1, label: "No formal feedback process" },
      { value: 2, label: "Ad-hoc surveys" },
      { value: 3, label: "Regular NPS or CSAT surveys" },
      { value: 4, label: "Multi-channel feedback with closed-loop process" },
      { value: 5, label: "Voice of customer program with product integration" }
    ]),
    weight: 2,
    displayOrder: 23,
  },
  {
    category: "customer_success",
    question: "Do you have a customer advocacy or reference program?",
    questionType: "yes_no",
    options: JSON.stringify([
      { value: "yes", label: "Yes, formal advocacy program" },
      { value: "partial", label: "Informal referrals and case studies" },
      { value: "no", label: "No advocacy program" }
    ]),
    weight: 1,
    displayOrder: 24,
  },

  // Revenue Operations (6 questions)
  {
    category: "revenue_ops",
    question: "How integrated is your tech stack (CRM, marketing automation, CS tools)?",
    questionType: "scale",
    options: JSON.stringify([
      { value: 1, label: "Siloed tools with no integration" },
      { value: 2, label: "Basic integrations" },
      { value: 3, label: "Core systems integrated" },
      { value: 4, label: "Fully integrated tech stack" },
      { value: 5, label: "Unified revenue platform with single source of truth" }
    ]),
    weight: 3,
    displayOrder: 25,
  },
  {
    category: "revenue_ops",
    question: "How clean and reliable is your data?",
    questionType: "scale",
    options: JSON.stringify([
      { value: 1, label: "Significant data quality issues" },
      { value: 2, label: "Some duplicates and inconsistencies" },
      { value: 3, label: "Moderate data quality" },
      { value: 4, label: "Good data hygiene with governance" },
      { value: 5, label: "Excellent data quality with automated enrichment" }
    ]),
    weight: 3,
    displayOrder: 26,
  },
  {
    category: "revenue_ops",
    question: "Do you have documented revenue processes and workflows?",
    questionType: "yes_no",
    options: JSON.stringify([
      { value: "yes", label: "Yes, comprehensive process documentation" },
      { value: "partial", label: "Some processes documented" },
      { value: "no", label: "No formal documentation" }
    ]),
    weight: 2,
    displayOrder: 27,
  },
  {
    category: "revenue_ops",
    question: "How sophisticated is your revenue reporting and analytics?",
    questionType: "scale",
    options: JSON.stringify([
      { value: 1, label: "Basic spreadsheet reports" },
      { value: 2, label: "Standard CRM reports" },
      { value: 3, label: "Custom dashboards" },
      { value: 4, label: "Advanced analytics with BI tools" },
      { value: 5, label: "Predictive analytics and AI-powered insights" }
    ]),
    weight: 2,
    displayOrder: 28,
  },
  {
    category: "revenue_ops",
    question: "Do you have a dedicated Revenue Operations function or team?",
    questionType: "yes_no",
    options: JSON.stringify([
      { value: "yes", label: "Yes, dedicated RevOps team" },
      { value: "partial", label: "Shared responsibility across teams" },
      { value: "no", label: "No RevOps function" }
    ]),
    weight: 2,
    displayOrder: 29,
  },
  {
    category: "revenue_ops",
    question: "How well do you track and optimize key revenue metrics (CAC, LTV, payback period)?",
    questionType: "scale",
    options: JSON.stringify([
      { value: 1, label: "Not tracked" },
      { value: 2, label: "Basic tracking" },
      { value: 3, label: "Regular monitoring" },
      { value: 4, label: "Active optimization" },
      { value: 5, label: "Advanced modeling and scenario planning" }
    ]),
    weight: 3,
    displayOrder: 30,
  },

  // Team & Enablement (6 questions)
  {
    category: "team_enablement",
    question: "Do you have a formal sales enablement program?",
    questionType: "yes_no",
    options: JSON.stringify([
      { value: "yes", label: "Yes, comprehensive enablement program" },
      { value: "partial", label: "Basic training materials" },
      { value: "no", label: "No formal enablement" }
    ]),
    weight: 3,
    displayOrder: 31,
  },
  {
    category: "team_enablement",
    question: "How structured is your onboarding for new GTM hires?",
    questionType: "scale",
    options: JSON.stringify([
      { value: 1, label: "No formal onboarding" },
      { value: 2, label: "Basic orientation" },
      { value: 3, label: "Structured 30-day plan" },
      { value: 4, label: "Comprehensive 90-day ramp program" },
      { value: 5, label: "World-class onboarding with certification" }
    ]),
    weight: 2,
    displayOrder: 32,
  },
  {
    category: "team_enablement",
    question: "Do you have documented playbooks for common sales scenarios?",
    questionType: "yes_no",
    options: JSON.stringify([
      { value: "yes", label: "Yes, comprehensive playbook library" },
      { value: "partial", label: "Some playbooks available" },
      { value: "no", label: "No documented playbooks" }
    ]),
    weight: 2,
    displayOrder: 33,
  },
  {
    category: "team_enablement",
    question: "How do you measure and track team performance?",
    questionType: "scale",
    options: JSON.stringify([
      { value: 1, label: "No formal metrics" },
      { value: 2, label: "Basic activity tracking" },
      { value: 3, label: "KPIs with dashboards" },
      { value: 4, label: "Balanced scorecard approach" },
      { value: 5, label: "OKRs with real-time performance management" }
    ]),
    weight: 3,
    displayOrder: 34,
  },
  {
    category: "team_enablement",
    question: "How frequently do you provide ongoing training and development?",
    questionType: "scale",
    options: JSON.stringify([
      { value: 1, label: "No ongoing training" },
      { value: 2, label: "Annual training events" },
      { value: 3, label: "Quarterly training sessions" },
      { value: 4, label: "Monthly skill development" },
      { value: 5, label: "Continuous learning culture with micro-learning" }
    ]),
    weight: 2,
    displayOrder: 35,
  },
  {
    category: "team_enablement",
    question: "Do you have a coaching and feedback culture?",
    questionType: "scale",
    options: JSON.stringify([
      { value: 1, label: "No formal coaching" },
      { value: 2, label: "Annual reviews only" },
      { value: 3, label: "Quarterly check-ins" },
      { value: 4, label: "Regular 1-on-1s with coaching" },
      { value: 5, label: "Continuous feedback with peer coaching" }
    ]),
    weight: 2,
    displayOrder: 36,
  },
];

async function seedQuestions() {
  console.log("Seeding GTM Framework questions...");
  
  for (const q of questions) {
    await db.insert(gtmQuestions).values(q);
  }
  
  console.log(`✅ Seeded ${questions.length} questions across 6 categories`);
  console.log("\nCategories:");
  console.log("- Market Strategy: 6 questions");
  console.log("- Sales Process: 6 questions");
  console.log("- Marketing Operations: 6 questions");
  console.log("- Customer Success: 6 questions");
  console.log("- Revenue Operations: 6 questions");
  console.log("- Team & Enablement: 6 questions");
}

seedQuestions().catch(console.error);

