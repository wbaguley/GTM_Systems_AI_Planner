import { getDb } from "../db";
import { gtmFrameworks, gtmFrameworkQuestions } from "../../drizzle/schema";

const frameworks = [
  {
    name: "AARRR (Pirate Metrics)",
    slug: "aarrr",
    description: "A framework for tracking customer lifecycle metrics: Acquisition, Activation, Retention, Revenue, and Referral.",
    category: "Growth",
    icon: "TrendingUp",
    colorScheme: "blue",
  },
  {
    name: "Bow Tie Model",
    slug: "bow-tie",
    description: "Visualizes the customer journey from awareness to advocacy, focusing on both acquisition and retention.",
    category: "Customer Journey",
    icon: "Users",
    colorScheme: "green",
  },
  {
    name: "SaaS Metrics Framework",
    slug: "saas-metrics",
    description: "Key metrics for SaaS businesses including MRR, ARR, Churn Rate, CAC, LTV, and more.",
    category: "Metrics",
    icon: "BarChart",
    colorScheme: "purple",
  },
  {
    name: "T2D3 Framework",
    slug: "t2d3",
    description: "Triple, Triple, Double, Double, Double - A growth framework for scaling SaaS companies.",
    category: "Growth",
    icon: "Rocket",
    colorScheme: "orange",
  },
  {
    name: "Product-Led Growth (PLG)",
    slug: "plg",
    description: "A go-to-market strategy that relies on the product itself as the primary driver of customer acquisition, conversion, and expansion.",
    category: "Strategy",
    icon: "Zap",
    colorScheme: "yellow",
  },
];

// We'll add questions after frameworks are inserted
const questionsTemplate = [
  // AARRR Questions
  {
    frameworkSlug: "aarrr",
    category: "Acquisition",
    questionText: "What are your primary customer acquisition channels?",
    questionType: "text",
    orderIndex: 1,
  },
  {
    frameworkSlug: "aarrr",
    category: "Acquisition",
    questionText: "What is your Customer Acquisition Cost (CAC)?",
    questionType: "number",
    orderIndex: 2,
  },
  {
    frameworkSlug: "aarrr",
    category: "Activation",
    questionText: "What defines an 'activated' user in your product?",
    questionType: "text",
    orderIndex: 3,
  },
  {
    frameworkSlug: "aarrr",
    category: "Retention",
    questionText: "What is your monthly retention rate?",
    questionType: "number",
    orderIndex: 4,
  },
  {
    frameworkSlug: "aarrr",
    category: "Revenue",
    questionText: "What is your Average Revenue Per User (ARPU)?",
    questionType: "number",
    orderIndex: 5,
  },
  {
    frameworkSlug: "aarrr",
    category: "Referral",
    questionText: "What percentage of customers come from referrals?",
    questionType: "number",
    orderIndex: 6,
  },
  
  // Bow Tie Questions
  {
    frameworkSlug: "bow-tie",
    category: "Awareness",
    questionText: "How do potential customers first learn about your product?",
    questionType: "text",
    orderIndex: 1,
  },
  {
    frameworkSlug: "bow-tie",
    category: "Consideration",
    questionText: "What content or resources help prospects evaluate your solution?",
    questionType: "text",
    orderIndex: 2,
  },
  {
    frameworkSlug: "bow-tie",
    category: "Purchase",
    questionText: "What is your average sales cycle length?",
    questionType: "text",
    orderIndex: 3,
  },
  {
    frameworkSlug: "bow-tie",
    category: "Adoption",
    questionText: "How do you onboard new customers?",
    questionType: "text",
    orderIndex: 4,
  },
  {
    frameworkSlug: "bow-tie",
    category: "Expansion",
    questionText: "What upsell or cross-sell opportunities exist?",
    questionType: "text",
    orderIndex: 5,
  },
  {
    frameworkSlug: "bow-tie",
    category: "Advocacy",
    questionText: "How do you turn customers into advocates?",
    questionType: "text",
    orderIndex: 6,
  },
  
  // SaaS Metrics Questions
  {
    frameworkSlug: "saas-metrics",
    category: "Revenue",
    questionText: "What is your Monthly Recurring Revenue (MRR)?",
    questionType: "number",
    orderIndex: 1,
  },
  {
    frameworkSlug: "saas-metrics",
    category: "Revenue",
    questionText: "What is your Annual Recurring Revenue (ARR)?",
    questionType: "number",
    orderIndex: 2,
  },
  {
    frameworkSlug: "saas-metrics",
    category: "Churn",
    questionText: "What is your monthly churn rate?",
    questionType: "number",
    orderIndex: 3,
  },
  {
    frameworkSlug: "saas-metrics",
    category: "Customer Value",
    questionText: "What is your Customer Lifetime Value (LTV)?",
    questionType: "number",
    orderIndex: 4,
  },
  {
    frameworkSlug: "saas-metrics",
    category: "Efficiency",
    questionText: "What is your LTV:CAC ratio?",
    questionType: "number",
    orderIndex: 5,
  },
];

export async function seedGTMFrameworks() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  console.log("Seeding GTM Frameworks...");

  // Insert frameworks and get their IDs
  const frameworkMap = new Map<string, number>();
  
  for (const framework of frameworks) {
    try {
      const [result] = await db.insert(gtmFrameworks).values(framework);
      frameworkMap.set(framework.slug, result.insertId);
      console.log(`✓ Inserted framework: ${framework.name}`);
    } catch (error) {
      console.error(`✗ Failed to insert framework ${framework.name}:`, error);
    }
  }

  // Insert questions with frameworkId
  for (const question of questionsTemplate) {
    try {
      const frameworkId = frameworkMap.get(question.frameworkSlug);
      if (!frameworkId) {
        console.error(`✗ Framework not found for slug: ${question.frameworkSlug}`);
        continue;
      }
      
      const { frameworkSlug, ...questionData } = question;
      await db.insert(gtmFrameworkQuestions).values({
        frameworkId,
        ...questionData,
      });
      console.log(`✓ Inserted question for ${question.frameworkSlug}`);
    } catch (error) {
      console.error(`✗ Failed to insert question:`, error);
    }
  }

  console.log("GTM Frameworks seeding complete!");
}

// Run if called directly
seedGTMFrameworks()
  .then(() => {
    console.log("Seed completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  });

