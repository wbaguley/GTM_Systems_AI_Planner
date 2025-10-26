import { getDb } from "../db";
import { icpAssessmentSections, icpAssessmentQuestions } from "../../drizzle/schema";

const sections = [
  {
    name: "Company & Market Profile",
    description: "Understanding your ideal customer's company characteristics and market position",
    order: 1,
  },
  {
    name: "Buyer Persona & Decision Making",
    description: "Identifying key decision makers, their roles, and buying process",
    order: 2,
  },
  {
    name: "Pain Points & Value Alignment",
    description: "Understanding customer challenges and how your solution delivers value",
    order: 3,
  },
];

const questions = [
  // Section 1: Company & Market Profile (24 questions)
  {
    sectionName: "Company & Market Profile",
    category: "Company Profile",
    question: "What is the ideal company size (number of employees)?",
    questionType: "select",
    options: ["1-10", "11-50", "51-200", "201-1000", "1000+"],
    order: 1,
  },
  {
    sectionName: "Company & Market Profile",
    category: "Company & Market Profile",
    question: "What is the ideal annual revenue range?",
    questionType: "range",
    options: ["<$1M", "$1M-$10M", "$10M-$50M", "$50M-$100M", "$100M+"],
    order: 2,
  },
  {
    sectionName: "Company & Market Profile",
    category: "Company & Market Profile",
    question: "Which industries are the best fit?",
    questionType: "multiselect",
    options: ["Technology", "Healthcare", "Finance", "Retail", "Manufacturing", "Education", "Other"],
    order: 3,
  },
  {
    sectionName: "Company & Market Profile",
    category: "Company & Market Profile",
    question: "What geographic regions do they operate in?",
    questionType: "multiselect",
    options: ["North America", "Europe", "Asia Pacific", "Latin America", "Middle East", "Africa", "Global"],
    order: 4,
  },
  {
    sectionName: "Company & Market Profile",
    category: "Company & Market Profile",
    question: "What is their business model?",
    questionType: "multiselect",
    options: ["B2B", "B2C", "B2B2C", "Marketplace", "SaaS", "E-commerce", "Services"],
    order: 5,
  },
  {
    sectionName: "Company & Market Profile",
    category: "Company & Market Profile",
    question: "What is their growth stage?",
    questionType: "multiselect",
    options: ["Startup", "Growth", "Mature", "Enterprise"],
    order: 6,
  },
  {
    sectionName: "Company & Market Profile",
    category: "Company & Market Profile",
    question: "What is their funding status?",
    questionType: "multiselect",
    options: ["Bootstrapped", "Seed", "Series A", "Series B+", "Public", "Profitable"],
    order: 7,
  },
  {
    sectionName: "Company & Market Profile",
    category: "Company & Market Profile",
    question: "What technologies do they currently use?",
    questionType: "text",
    order: 8,
  },
  {
    sectionName: "Company & Market Profile",
    category: "Company & Market Profile",
    question: "What is their tech stack maturity?",
    questionType: "rating",
    options: ["1", "2", "3", "4", "5"],
    order: 9,
  },
  {
    sectionName: "Company & Market Profile",
    category: "Company & Market Profile",
    question: "Do they have a dedicated IT/tech team?",
    questionType: "boolean",
    options: ["Yes", "No"],
    order: 10,
  },
  {
    sectionName: "Company & Market Profile",
    category: "Company & Market Profile",
    question: "What is their digital transformation maturity?",
    questionType: "rating",
    options: ["1", "2", "3", "4", "5"],
    order: 11,
  },
  {
    sectionName: "Company & Market Profile",
    category: "Company & Market Profile",
    question: "What compliance requirements do they have?",
    questionType: "multiselect",
    options: ["GDPR", "HIPAA", "SOC 2", "ISO 27001", "PCI DSS", "None", "Other"],
    order: 12,
  },
  {
    sectionName: "Company & Market Profile",
    category: "Company & Market Profile",
    question: "What is their typical budget for solutions like yours?",
    questionType: "range",
    options: ["<$10K", "$10K-$50K", "$50K-$100K", "$100K-$500K", "$500K+"],
    order: 13,
  },
  {
    sectionName: "Company & Market Profile",
    category: "Company & Market Profile",
    question: "What is their procurement process?",
    questionType: "text",
    order: 14,
  },
  {
    sectionName: "Company & Market Profile",
    category: "Company & Market Profile",
    question: "How long is their typical sales cycle?",
    questionType: "range",
    options: ["<1 month", "1-3 months", "3-6 months", "6-12 months", "12+ months"],
    order: 15,
  },
  {
    sectionName: "Company & Market Profile",
    category: "Company & Market Profile",
    question: "What is their preferred contract length?",
    questionType: "multiselect",
    options: ["Monthly", "Quarterly", "Annual", "Multi-year"],
    order: 16,
  },
  {
    sectionName: "Company & Market Profile",
    category: "Company & Market Profile",
    question: "Do they prefer cloud, on-premise, or hybrid solutions?",
    questionType: "multiselect",
    options: ["Cloud", "On-premise", "Hybrid"],
    order: 17,
  },
  {
    sectionName: "Company & Market Profile",
    category: "Company & Market Profile",
    question: "What is their data security posture?",
    questionType: "rating",
    options: ["1", "2", "3", "4", "5"],
    order: 18,
  },
  {
    sectionName: "Company & Market Profile",
    category: "Company & Market Profile",
    question: "Do they have existing vendor relationships in your category?",
    questionType: "boolean",
    options: ["Yes", "No"],
    order: 19,
  },
  {
    sectionName: "Company & Market Profile",
    category: "Company & Market Profile",
    question: "What are their top 3 business priorities?",
    questionType: "text",
    order: 20,
  },
  {
    sectionName: "Company & Market Profile",
    category: "Company & Market Profile",
    question: "What are their key performance indicators (KPIs)?",
    questionType: "text",
    order: 21,
  },
  {
    sectionName: "Company & Market Profile",
    category: "Company & Market Profile",
    question: "What is their competitive landscape?",
    questionType: "text",
    order: 22,
  },
  {
    sectionName: "Company & Market Profile",
    category: "Company & Market Profile",
    question: "What is their market position?",
    questionType: "multiselect",
    options: ["Market Leader", "Challenger", "Follower", "Niche Player"],
    order: 23,
  },
  {
    sectionName: "Company & Market Profile",
    category: "Company & Market Profile",
    question: "What is their innovation appetite?",
    questionType: "rating",
    options: ["1", "2", "3", "4", "5"],
    order: 24,
  },

  // Section 2: Buyer Persona & Decision Making (24 questions)
  {
    sectionName: "Buyer Persona & Decision Making",
    category: "Buyer Persona & Decision Making",
    question: "Who is the primary decision maker?",
    questionType: "multiselect",
    options: ["CEO", "CTO", "CFO", "CMO", "VP", "Director", "Manager", "Other"],
    order: 1,
  },
  {
    sectionName: "Buyer Persona & Decision Making",
    category: "Buyer Persona & Decision Making",
    question: "What is their department?",
    questionType: "multiselect",
    options: ["Executive", "IT", "Marketing", "Sales", "Operations", "Finance", "HR", "Product"],
    order: 2,
  },
  {
    sectionName: "Buyer Persona & Decision Making",
    category: "Buyer Persona & Decision Making",
    question: "What is their seniority level?",
    questionType: "multiselect",
    options: ["C-Level", "VP", "Director", "Manager", "Individual Contributor"],
    order: 3,
  },
  {
    sectionName: "Buyer Persona & Decision Making",
    category: "Buyer Persona & Decision Making",
    question: "How many people are involved in the buying decision?",
    questionType: "range",
    options: ["1", "2-3", "4-6", "7-10", "10+"],
    order: 4,
  },
  {
    sectionName: "Buyer Persona & Decision Making",
    category: "Buyer Persona & Decision Making",
    question: "Who are the key influencers?",
    questionType: "text",
    order: 5,
  },
  {
    sectionName: "Buyer Persona & Decision Making",
    category: "Buyer Persona & Decision Making",
    question: "Who are potential blockers?",
    questionType: "text",
    order: 6,
  },
  {
    sectionName: "Buyer Persona & Decision Making",
    category: "Buyer Persona & Decision Making",
    question: "What is their typical age range?",
    questionType: "range",
    options: ["20-30", "31-40", "41-50", "51-60", "60+"],
    order: 7,
  },
  {
    sectionName: "Buyer Persona & Decision Making",
    category: "Buyer Persona & Decision Making",
    question: "What is their educational background?",
    questionType: "multiselect",
    options: ["High School", "Bachelor's", "Master's", "PhD", "Technical Certification"],
    order: 8,
  },
  {
    sectionName: "Buyer Persona & Decision Making",
    category: "Buyer Persona & Decision Making",
    question: "What are their professional goals?",
    questionType: "text",
    order: 9,
  },
  {
    sectionName: "Buyer Persona & Decision Making",
    category: "Buyer Persona & Decision Making",
    question: "What are their personal motivations?",
    questionType: "text",
    order: 10,
  },
  {
    sectionName: "Buyer Persona & Decision Making",
    category: "Buyer Persona & Decision Making",
    question: "What are their biggest fears or concerns?",
    questionType: "text",
    order: 11,
  },
  {
    sectionName: "Buyer Persona & Decision Making",
    category: "Buyer Persona & Decision Making",
    question: "How do they prefer to consume information?",
    questionType: "multiselect",
    options: ["Blog posts", "Whitepapers", "Videos", "Webinars", "Podcasts", "Case studies", "Demos"],
    order: 12,
  },
  {
    sectionName: "Buyer Persona & Decision Making",
    category: "Buyer Persona & Decision Making",
    question: "What social media platforms do they use?",
    questionType: "multiselect",
    options: ["LinkedIn", "Twitter", "Facebook", "Instagram", "YouTube", "TikTok", "None"],
    order: 13,
  },
  {
    sectionName: "Buyer Persona & Decision Making",
    category: "Buyer Persona & Decision Making",
    question: "What industry publications do they read?",
    questionType: "text",
    order: 14,
  },
  {
    sectionName: "Buyer Persona & Decision Making",
    category: "Buyer Persona & Decision Making",
    question: "What events or conferences do they attend?",
    questionType: "text",
    order: 15,
  },
  {
    sectionName: "Buyer Persona & Decision Making",
    category: "Buyer Persona & Decision Making",
    question: "What professional communities are they part of?",
    questionType: "text",
    order: 16,
  },
  {
    sectionName: "Buyer Persona & Decision Making",
    category: "Buyer Persona & Decision Making",
    question: "How tech-savvy are they?",
    questionType: "rating",
    options: ["1", "2", "3", "4", "5"],
    order: 17,
  },
  {
    sectionName: "Buyer Persona & Decision Making",
    category: "Buyer Persona & Decision Making",
    question: "What is their decision-making style?",
    questionType: "multiselect",
    options: ["Data-driven", "Intuitive", "Collaborative", "Consensus-based", "Top-down"],
    order: 18,
  },
  {
    sectionName: "Buyer Persona & Decision Making",
    category: "Buyer Persona & Decision Making",
    question: "What is their risk tolerance?",
    questionType: "rating",
    options: ["1", "2", "3", "4", "5"],
    order: 19,
  },
  {
    sectionName: "Buyer Persona & Decision Making",
    category: "Buyer Persona & Decision Making",
    question: "What proof points do they need to see?",
    questionType: "multiselect",
    options: ["ROI calculation", "Case studies", "References", "Free trial", "Demo", "Analyst reports"],
    order: 20,
  },
  {
    sectionName: "Buyer Persona & Decision Making",
    category: "Buyer Persona & Decision Making",
    question: "What objections do they typically raise?",
    questionType: "text",
    order: 21,
  },
  {
    sectionName: "Buyer Persona & Decision Making",
    category: "Buyer Persona & Decision Making",
    question: "What is their preferred communication channel?",
    questionType: "multiselect",
    options: ["Email", "Phone", "Video call", "In-person", "Chat", "Social media"],
    order: 22,
  },
  {
    sectionName: "Buyer Persona & Decision Making",
    category: "Buyer Persona & Decision Making",
    question: "What is their preferred meeting time?",
    questionType: "multiselect",
    options: ["Morning", "Afternoon", "Evening", "Flexible"],
    order: 23,
  },
  {
    sectionName: "Buyer Persona & Decision Making",
    category: "Buyer Persona & Decision Making",
    question: "How do they prefer to be followed up with?",
    questionType: "text",
    order: 24,
  },

  // Section 3: Pain Points & Value Alignment (24 questions)
  {
    sectionName: "Pain Points & Value Alignment",
    category: "Pain Points & Value Alignment",
    question: "What are their top 3 business challenges?",
    questionType: "text",
    order: 1,
  },
  {
    sectionName: "Pain Points & Value Alignment",
    category: "Pain Points & Value Alignment",
    question: "What specific pain points does your solution address?",
    questionType: "text",
    order: 2,
  },
  {
    sectionName: "Pain Points & Value Alignment",
    category: "Pain Points & Value Alignment",
    question: "What is the cost of not solving this problem?",
    questionType: "text",
    order: 3,
  },
  {
    sectionName: "Pain Points & Value Alignment",
    category: "Pain Points & Value Alignment",
    question: "What triggers them to look for a solution?",
    questionType: "text",
    order: 4,
  },
  {
    sectionName: "Pain Points & Value Alignment",
    category: "Pain Points & Value Alignment",
    question: "What is their current solution or workaround?",
    questionType: "text",
    order: 5,
  },
  {
    sectionName: "Pain Points & Value Alignment",
    category: "Pain Points & Value Alignment",
    question: "What are the limitations of their current approach?",
    questionType: "text",
    order: 6,
  },
  {
    sectionName: "Pain Points & Value Alignment",
    category: "Pain Points & Value Alignment",
    question: "What outcomes are they trying to achieve?",
    questionType: "text",
    order: 7,
  },
  {
    sectionName: "Pain Points & Value Alignment",
    category: "Pain Points & Value Alignment",
    question: "What metrics will they use to measure success?",
    questionType: "text",
    order: 8,
  },
  {
    sectionName: "Pain Points & Value Alignment",
    category: "Pain Points & Value Alignment",
    question: "What is their expected ROI?",
    questionType: "text",
    order: 9,
  },
  {
    sectionName: "Pain Points & Value Alignment",
    category: "Pain Points & Value Alignment",
    question: "What is their expected payback period?",
    questionType: "range",
    options: ["<3 months", "3-6 months", "6-12 months", "12-24 months", "24+ months"],
    order: 10,
  },
  {
    sectionName: "Pain Points & Value Alignment",
    category: "Pain Points & Value Alignment",
    question: "What features are must-haves vs nice-to-haves?",
    questionType: "text",
    order: 11,
  },
  {
    sectionName: "Pain Points & Value Alignment",
    category: "Pain Points & Value Alignment",
    question: "What integrations are required?",
    questionType: "text",
    order: 12,
  },
  {
    sectionName: "Pain Points & Value Alignment",
    category: "Pain Points & Value Alignment",
    question: "What level of customization do they need?",
    questionType: "rating",
    options: ["1", "2", "3", "4", "5"],
    order: 13,
  },
  {
    sectionName: "Pain Points & Value Alignment",
    category: "Pain Points & Value Alignment",
    question: "What level of support do they expect?",
    questionType: "multiselect",
    options: ["Self-service", "Email", "Chat", "Phone", "Dedicated CSM", "24/7 support"],
    order: 14,
  },
  {
    sectionName: "Pain Points & Value Alignment",
    category: "Pain Points & Value Alignment",
    question: "What training or onboarding do they need?",
    questionType: "multiselect",
    options: ["Documentation", "Video tutorials", "Live training", "Onboarding specialist", "None"],
    order: 15,
  },
  {
    sectionName: "Pain Points & Value Alignment",
    category: "Pain Points & Value Alignment",
    question: "What is their implementation timeline?",
    questionType: "range",
    options: ["<1 month", "1-3 months", "3-6 months", "6-12 months", "12+ months"],
    order: 16,
  },
  {
    sectionName: "Pain Points & Value Alignment",
    category: "Pain Points & Value Alignment",
    question: "What resources can they dedicate to implementation?",
    questionType: "text",
    order: 17,
  },
  {
    sectionName: "Pain Points & Value Alignment",
    category: "Pain Points & Value Alignment",
    question: "What are their scalability requirements?",
    questionType: "text",
    order: 18,
  },
  {
    sectionName: "Pain Points & Value Alignment",
    category: "Pain Points & Value Alignment",
    question: "What are their security requirements?",
    questionType: "text",
    order: 19,
  },
  {
    sectionName: "Pain Points & Value Alignment",
    category: "Pain Points & Value Alignment",
    question: "What are their data privacy concerns?",
    questionType: "text",
    order: 20,
  },
  {
    sectionName: "Pain Points & Value Alignment",
    category: "Pain Points & Value Alignment",
    question: "What are their uptime/reliability requirements?",
    questionType: "multiselect",
    options: ["99%", "99.9%", "99.99%", "99.999%"],
    order: 21,
  },
  {
    sectionName: "Pain Points & Value Alignment",
    category: "Pain Points & Value Alignment",
    question: "What is their tolerance for downtime?",
    questionType: "text",
    order: 22,
  },
  {
    sectionName: "Pain Points & Value Alignment",
    category: "Pain Points & Value Alignment",
    question: "What are their future growth plans?",
    questionType: "text",
    order: 23,
  },
  {
    sectionName: "Pain Points & Value Alignment",
    category: "Pain Points & Value Alignment",
    question: "How does your solution align with their strategic goals?",
    questionType: "text",
    order: 24,
  },
];

export async function seedICPAssessment() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  console.log("Seeding ICP Assessment...");

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

  console.log("ICP Assessment seeding complete!");
  console.log(`Total: ${sections.length} sections, ${questions.length} questions`);
}

// Run if called directly
seedICPAssessment()
  .then(() => {
    console.log("Seed completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });

