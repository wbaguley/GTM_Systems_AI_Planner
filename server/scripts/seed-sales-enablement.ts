import { getDb } from "../db";
import { icpAssessmentSections, icpAssessmentQuestions } from "../../drizzle/schema";

const sections = [
  {
    name: "Sales Methodology",
    description: "Assess your sales process, methodology alignment, and sales effectiveness",
    order: 4,
  },
  {
    name: "Sales Enablement Maturity",
    description: "Evaluate your sales enablement tools, content, and training programs",
    order: 5,
  },
];

const questions = [
  // Section 4: Sales Methodology (20 questions)
  {
    sectionName: "Sales Methodology",
    category: "Sales Process",
    question: "What sales methodology do you currently use?",
    questionType: "multiselect",
    options: ["MEDDIC", "SPIN Selling", "Challenger Sale", "Solution Selling", "Consultative Selling", "Value Selling", "None", "Custom"],
    order: 1,
  },
  {
    sectionName: "Sales Methodology",
    category: "Sales Process",
    question: "How well-defined is your sales process?",
    questionType: "rating",
    options: ["1", "2", "3", "4", "5"],
    order: 2,
  },
  {
    sectionName: "Sales Methodology",
    category: "Sales Process",
    question: "What is your average sales cycle length?",
    questionType: "select",
    options: ["<30 days", "30-60 days", "60-90 days", "90-180 days", "180+ days"],
    order: 3,
  },
  {
    sectionName: "Sales Methodology",
    category: "Sales Process",
    question: "What is your win rate?",
    questionType: "select",
    options: ["<10%", "10-20%", "20-30%", "30-40%", "40-50%", "50%+"],
    order: 4,
  },
  {
    sectionName: "Sales Methodology",
    category: "Sales Process",
    question: "How do you qualify leads?",
    questionType: "text",
    order: 5,
  },
  {
    sectionName: "Sales Methodology",
    category: "Sales Process",
    question: "What is your lead-to-opportunity conversion rate?",
    questionType: "select",
    options: ["<5%", "5-10%", "10-20%", "20-30%", "30%+"],
    order: 6,
  },
  {
    sectionName: "Sales Methodology",
    category: "Sales Process",
    question: "What is your opportunity-to-close conversion rate?",
    questionType: "select",
    options: ["<10%", "10-20%", "20-30%", "30-40%", "40%+"],
    order: 7,
  },
  {
    sectionName: "Sales Methodology",
    category: "Sales Team",
    question: "How many sales reps do you have?",
    questionType: "select",
    options: ["1-5", "6-10", "11-25", "26-50", "50+"],
    order: 8,
  },
  {
    sectionName: "Sales Methodology",
    category: "Sales Team",
    question: "What is your sales team structure?",
    questionType: "multiselect",
    options: ["SDRs/BDRs", "AEs", "SEs", "CSMs", "Sales Managers", "Sales Ops"],
    order: 9,
  },
  {
    sectionName: "Sales Methodology",
    category: "Sales Team",
    question: "What is your average quota attainment?",
    questionType: "select",
    options: ["<50%", "50-70%", "70-90%", "90-100%", "100%+"],
    order: 10,
  },
  {
    sectionName: "Sales Methodology",
    category: "Sales Team",
    question: "What is your sales rep ramp time?",
    questionType: "select",
    options: ["<1 month", "1-3 months", "3-6 months", "6-12 months", "12+ months"],
    order: 11,
  },
  {
    sectionName: "Sales Methodology",
    category: "Sales Team",
    question: "What is your sales rep turnover rate?",
    questionType: "select",
    options: ["<10%", "10-20%", "20-30%", "30-40%", "40%+"],
    order: 12,
  },
  {
    sectionName: "Sales Methodology",
    category: "Sales Tools",
    question: "What CRM do you use?",
    questionType: "select",
    options: ["Salesforce", "HubSpot", "Pipedrive", "Zoho", "Microsoft Dynamics", "Other", "None"],
    order: 13,
  },
  {
    sectionName: "Sales Methodology",
    category: "Sales Tools",
    question: "What sales engagement tools do you use?",
    questionType: "multiselect",
    options: ["Outreach", "SalesLoft", "Apollo", "LinkedIn Sales Navigator", "ZoomInfo", "Other", "None"],
    order: 14,
  },
  {
    sectionName: "Sales Methodology",
    category: "Sales Tools",
    question: "How well is your CRM adopted by the sales team?",
    questionType: "rating",
    options: ["1", "2", "3", "4", "5"],
    order: 15,
  },
  {
    sectionName: "Sales Methodology",
    category: "Sales Performance",
    question: "How do you measure sales performance?",
    questionType: "text",
    order: 16,
  },
  {
    sectionName: "Sales Methodology",
    category: "Sales Performance",
    question: "What are your key sales metrics?",
    questionType: "text",
    order: 17,
  },
  {
    sectionName: "Sales Methodology",
    category: "Sales Performance",
    question: "How often do you review sales performance?",
    questionType: "select",
    options: ["Daily", "Weekly", "Bi-weekly", "Monthly", "Quarterly", "Rarely"],
    order: 18,
  },
  {
    sectionName: "Sales Methodology",
    category: "Sales Performance",
    question: "Do you have a sales playbook?",
    questionType: "boolean",
    options: ["Yes", "No"],
    order: 19,
  },
  {
    sectionName: "Sales Methodology",
    category: "Sales Performance",
    question: "How often is your sales playbook updated?",
    questionType: "select",
    options: ["Monthly", "Quarterly", "Annually", "Rarely", "Never"],
    order: 20,
  },

  // Section 5: Sales Enablement Maturity (20 questions)
  {
    sectionName: "Sales Enablement Maturity",
    category: "Enablement Strategy",
    question: "Do you have a dedicated sales enablement function?",
    questionType: "boolean",
    options: ["Yes", "No"],
    order: 1,
  },
  {
    sectionName: "Sales Enablement Maturity",
    category: "Enablement Strategy",
    question: "How many people are on your enablement team?",
    questionType: "select",
    options: ["0", "1", "2-3", "4-5", "6+"],
    order: 2,
  },
  {
    sectionName: "Sales Enablement Maturity",
    category: "Enablement Strategy",
    question: "What is your enablement budget as % of revenue?",
    questionType: "select",
    options: ["<0.5%", "0.5-1%", "1-2%", "2-3%", "3%+"],
    order: 3,
  },
  {
    sectionName: "Sales Enablement Maturity",
    category: "Training & Onboarding",
    question: "How long is your sales onboarding program?",
    questionType: "select",
    options: ["<1 week", "1-2 weeks", "2-4 weeks", "1-3 months", "3+ months"],
    order: 4,
  },
  {
    sectionName: "Sales Enablement Maturity",
    category: "Training & Onboarding",
    question: "How often do you provide ongoing sales training?",
    questionType: "select",
    options: ["Weekly", "Monthly", "Quarterly", "Annually", "Rarely", "Never"],
    order: 5,
  },
  {
    sectionName: "Sales Enablement Maturity",
    category: "Training & Onboarding",
    question: "What training topics do you cover?",
    questionType: "multiselect",
    options: ["Product knowledge", "Sales skills", "Industry knowledge", "Competitor knowledge", "Tools training", "Soft skills"],
    order: 6,
  },
  {
    sectionName: "Sales Enablement Maturity",
    category: "Training & Onboarding",
    question: "How do you measure training effectiveness?",
    questionType: "text",
    order: 7,
  },
  {
    sectionName: "Sales Enablement Maturity",
    category: "Content & Resources",
    question: "Do you have a centralized content repository?",
    questionType: "boolean",
    options: ["Yes", "No"],
    order: 8,
  },
  {
    sectionName: "Sales Enablement Maturity",
    category: "Content & Resources",
    question: "What types of sales content do you have?",
    questionType: "multiselect",
    options: ["Pitch decks", "Case studies", "One-pagers", "ROI calculators", "Demo scripts", "Email templates", "Battle cards"],
    order: 9,
  },
  {
    sectionName: "Sales Enablement Maturity",
    category: "Content & Resources",
    question: "How often do you update sales content?",
    questionType: "select",
    options: ["Weekly", "Monthly", "Quarterly", "Annually", "Rarely"],
    order: 10,
  },
  {
    sectionName: "Sales Enablement Maturity",
    category: "Content & Resources",
    question: "Do you track content usage and effectiveness?",
    questionType: "boolean",
    options: ["Yes", "No"],
    order: 11,
  },
  {
    sectionName: "Sales Enablement Maturity",
    category: "Tools & Technology",
    question: "What enablement tools do you use?",
    questionType: "multiselect",
    options: ["Highspot", "Seismic", "Showpad", "Guru", "Lessonly", "MindTickle", "Other", "None"],
    order: 12,
  },
  {
    sectionName: "Sales Enablement Maturity",
    category: "Tools & Technology",
    question: "How well-integrated are your enablement tools with your CRM?",
    questionType: "rating",
    options: ["1", "2", "3", "4", "5"],
    order: 13,
  },
  {
    sectionName: "Sales Enablement Maturity",
    category: "Tools & Technology",
    question: "Do you use conversation intelligence tools?",
    questionType: "multiselect",
    options: ["Gong", "Chorus", "Clari", "ExecVision", "Other", "None"],
    order: 14,
  },
  {
    sectionName: "Sales Enablement Maturity",
    category: "Coaching & Development",
    question: "How often do sales managers coach their reps?",
    questionType: "select",
    options: ["Daily", "Weekly", "Bi-weekly", "Monthly", "Rarely", "Never"],
    order: 15,
  },
  {
    sectionName: "Sales Enablement Maturity",
    category: "Coaching & Development",
    question: "Do you have a structured coaching program?",
    questionType: "boolean",
    options: ["Yes", "No"],
    order: 16,
  },
  {
    sectionName: "Sales Enablement Maturity",
    category: "Coaching & Development",
    question: "How do you identify coaching opportunities?",
    questionType: "text",
    order: 17,
  },
  {
    sectionName: "Sales Enablement Maturity",
    category: "Metrics & Analytics",
    question: "What enablement metrics do you track?",
    questionType: "text",
    order: 18,
  },
  {
    sectionName: "Sales Enablement Maturity",
    category: "Metrics & Analytics",
    question: "How do you measure enablement ROI?",
    questionType: "text",
    order: 19,
  },
  {
    sectionName: "Sales Enablement Maturity",
    category: "Metrics & Analytics",
    question: "How mature is your sales enablement program overall?",
    questionType: "rating",
    options: ["1", "2", "3", "4", "5"],
    order: 20,
  },
];

export async function seedSalesEnablement() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  console.log("Seeding Sales Methodology and Enablement sections...");

  // Insert sections and get their IDs
  const sectionMap = new Map<string, number>();
  
  for (const section of sections) {
    try {
      const [result] = await db.insert(icpAssessmentSections).values(section);
      sectionMap.set(section.name, result.insertId);
      console.log(`✓ Inserted section: ${section.name}`);
    } catch (error) {
      console.error(`✗ Failed to insert section ${section.name}:`, error);
    }
  }

  // Insert questions with sectionId
  for (const question of questions) {
    try {
      const sectionId = sectionMap.get(question.sectionName);
      if (!sectionId) {
        console.error(`✗ Section not found for: ${question.sectionName}`);
        continue;
      }
      
      const { sectionName, ...questionData } = question;
      await db.insert(icpAssessmentQuestions).values({
        sectionId,
        ...questionData,
      });
      console.log(`✓ Inserted question ${questionData.order} for ${question.sectionName}`);
    } catch (error) {
      console.error(`✗ Failed to insert question:`, error);
    }
  }

  console.log("Sales Methodology and Enablement seeding complete!");
  console.log(`Total: ${sections.length} sections, ${questions.length} questions`);
}

// Run if called directly
seedSalesEnablement()
  .then(() => {
    console.log("Seed completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });

