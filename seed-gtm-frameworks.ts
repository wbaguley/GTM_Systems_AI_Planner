import { drizzle } from "drizzle-orm/mysql2";
import { gtmFrameworks, gtmFrameworkQuestions } from "./drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

const frameworksData = [
  {
    name: "AARRR (Pirate Metrics)",
    slug: "aarrr",
    description: "Dave McClure's framework for tracking customer lifecycle through Acquisition, Activation, Retention, Referral, and Revenue metrics.",
    category: "Growth & Metrics",
    icon: "TrendingUp",
    colorScheme: "blue",
    expertTrainingData: {
      principles: [
        "Focus on actionable metrics over vanity metrics",
        "Track the entire customer lifecycle from acquisition to revenue",
        "Optimize each stage of the funnel independently",
        "Use cohort analysis to measure retention",
        "Balance growth across all five stages"
      ],
      bestPractices: [
        "Define clear metrics for each AARRR stage",
        "Set up automated tracking and dashboards",
        "Run experiments to optimize each funnel stage",
        "Focus on retention before scaling acquisition",
        "Build viral loops into the product experience"
      ],
      commonPitfalls: [
        "Focusing only on acquisition while ignoring retention",
        "Not tracking cohort-based metrics",
        "Optimizing for vanity metrics instead of business outcomes",
        "Scaling acquisition before product-market fit",
        "Ignoring the referral stage entirely"
      ],
      keyMetrics: [
        "Customer Acquisition Cost (CAC)",
        "Activation rate (% completing key action)",
        "Retention rate by cohort",
        "Viral coefficient (K-factor)",
        "Customer Lifetime Value (LTV)"
      ],
      successIndicators: [
        "LTV:CAC ratio above 3:1",
        "Month-over-month retention above 80%",
        "Viral coefficient above 1.0",
        "Clear funnel optimization roadmap",
        "Data-driven decision making culture"
      ]
    }
  },
  {
    name: "Lean Startup",
    slug: "lean-startup",
    description: "Eric Ries' methodology for building products through validated learning, rapid experimentation, and iterative product releases.",
    category: "Product Development",
    icon: "Rocket",
    colorScheme: "green",
    expertTrainingData: {
      principles: [
        "Build-Measure-Learn feedback loop",
        "Validated learning over assumptions",
        "Minimum Viable Product (MVP) approach",
        "Pivot or persevere based on data",
        "Innovation accounting for progress tracking"
      ],
      bestPractices: [
        "Start with a clear hypothesis to test",
        "Build the smallest MVP to test assumptions",
        "Define success metrics before building",
        "Run rapid experiments with real customers",
        "Be willing to pivot based on learnings"
      ],
      commonPitfalls: [
        "Building too much before testing with customers",
        "Confusing MVP with a bad product",
        "Not defining clear success criteria",
        "Pivoting too quickly without enough data",
        "Ignoring customer feedback"
      ],
      keyMetrics: [
        "Time through Build-Measure-Learn loop",
        "Number of validated learnings per sprint",
        "Customer feedback response rate",
        "Experiment success rate",
        "Pivot/persevere decision frequency"
      ],
      successIndicators: [
        "Rapid iteration cycles (weekly or bi-weekly)",
        "High customer engagement in testing",
        "Clear validated learnings documented",
        "Evidence-based pivot decisions",
        "Product-market fit indicators improving"
      ]
    }
  },
  {
    name: "Blue Ocean Strategy",
    slug: "blue-ocean",
    description: "W. Chan Kim and Renée Mauborgne's framework for creating uncontested market space by making competition irrelevant.",
    category: "Strategy & Positioning",
    icon: "Waves",
    colorScheme: "cyan",
    expertTrainingData: {
      principles: [
        "Create uncontested market space (Blue Ocean)",
        "Make competition irrelevant",
        "Create and capture new demand",
        "Break the value-cost trade-off",
        "Align the whole system in pursuit of differentiation and low cost"
      ],
      bestPractices: [
        "Use the Strategy Canvas to visualize current competition",
        "Apply the Four Actions Framework (Eliminate, Reduce, Raise, Create)",
        "Focus on non-customers to unlock new demand",
        "Reconstruct market boundaries",
        "Execute with tipping point leadership"
      ],
      commonPitfalls: [
        "Competing in red oceans (existing markets)",
        "Incremental improvements instead of value innovation",
        "Not considering non-customers",
        "Focusing on beating competition instead of creating value",
        "Failing to align organization with new strategy"
      ],
      keyMetrics: [
        "Market share in new category",
        "Customer acquisition from non-traditional segments",
        "Value innovation index",
        "Competitive differentiation score",
        "Cost structure vs. industry average"
      ],
      successIndicators: [
        "Creating a new market category",
        "Low direct competition",
        "Strong differentiation with lower costs",
        "Attracting non-customers",
        "Sustainable competitive advantage"
      ]
    }
  },
  {
    name: "Jobs-to-be-Done (JTBD)",
    slug: "jtbd",
    description: "Clayton Christensen's framework for understanding customer motivation by focusing on the 'job' customers hire products to do.",
    category: "Customer Understanding",
    icon: "Target",
    colorScheme: "purple",
    expertTrainingData: {
      principles: [
        "Customers 'hire' products to get a job done",
        "Focus on the job, not the product",
        "Understand functional, emotional, and social dimensions",
        "Identify the 'struggling moment' that triggers purchase",
        "Competition is anything customers hire for the same job"
      ],
      bestPractices: [
        "Conduct JTBD interviews to uncover real motivations",
        "Map the job from trigger to satisfaction",
        "Identify switching triggers and barriers",
        "Focus on progress, not features",
        "Design solutions around the complete job"
      ],
      commonPitfalls: [
        "Confusing jobs with tasks or activities",
        "Focusing on demographics instead of circumstances",
        "Adding features without understanding the job",
        "Ignoring emotional and social dimensions",
        "Not identifying the struggling moment"
      ],
      keyMetrics: [
        "Job satisfaction score",
        "Time to job completion",
        "Switching cost from alternatives",
        "Job outcome achievement rate",
        "Customer effort score for job completion"
      ],
      successIndicators: [
        "Clear articulation of customer jobs",
        "Product aligned with job outcomes",
        "Lower switching barriers than competition",
        "High job satisfaction scores",
        "Evidence of customers 'firing' alternatives"
      ]
    }
  },
  {
    name: "STP Marketing",
    slug: "stp-marketing",
    description: "Segmentation, Targeting, and Positioning framework for identifying and reaching the right customers with the right message.",
    category: "Marketing Strategy",
    icon: "Users",
    colorScheme: "orange",
    expertTrainingData: {
      principles: [
        "Segment the market into distinct groups",
        "Target the most attractive segments",
        "Position your offering uniquely in customer minds",
        "Align messaging with segment needs",
        "Create differentiated value propositions"
      ],
      bestPractices: [
        "Use multiple segmentation criteria (demographic, psychographic, behavioral)",
        "Evaluate segment attractiveness systematically",
        "Develop clear positioning statements",
        "Test positioning with target customers",
        "Align all marketing activities with positioning"
      ],
      commonPitfalls: [
        "Trying to serve everyone (no segmentation)",
        "Segmenting without targeting",
        "Weak or unclear positioning",
        "Positioning based on features not benefits",
        "Inconsistent messaging across channels"
      ],
      keyMetrics: [
        "Segment penetration rate",
        "Message recall and recognition",
        "Brand positioning strength",
        "Segment profitability",
        "Customer acquisition cost by segment"
      ],
      successIndicators: [
        "Clear, defensible market segments",
        "Focused targeting strategy",
        "Distinctive positioning vs. competitors",
        "High message resonance with target segments",
        "Efficient marketing spend"
      ]
    }
  },
  {
    name: "Bowling Alley Strategy",
    slug: "bowling-alley",
    description: "Geoffrey Moore's strategy for crossing the chasm by dominating niche segments sequentially, like knocking down bowling pins.",
    category: "Market Entry",
    icon: "Zap",
    colorScheme: "red",
    expertTrainingData: {
      principles: [
        "Start with a single niche segment (the headpin)",
        "Dominate that niche completely before expanding",
        "Use success in one niche to knock down adjacent niches",
        "Build whole product solutions for each niche",
        "Create word-of-mouth within niche communities"
      ],
      bestPractices: [
        "Choose a beachhead niche you can dominate",
        "Develop complete solutions for niche needs",
        "Build strong references within the niche",
        "Map adjacent niches for sequential expansion",
        "Resist premature expansion to multiple segments"
      ],
      commonPitfalls: [
        "Trying to serve multiple segments simultaneously",
        "Choosing too broad a niche",
        "Moving to next niche before dominating current one",
        "Incomplete solutions that don't fully solve niche problems",
        "Underestimating the importance of niche references"
      ],
      keyMetrics: [
        "Market share within target niche",
        "Reference customer count in niche",
        "Niche-specific Net Promoter Score",
        "Time to niche dominance",
        "Adjacent niche penetration rate"
      ],
      successIndicators: [
        "Dominant position in initial niche (>50% share)",
        "Strong reference customers in niche",
        "Word-of-mouth growth within niche",
        "Clear path to adjacent niches",
        "Whole product solution for niche"
      ]
    }
  },
  {
    name: "Product-Market Fit",
    slug: "product-market-fit",
    description: "Marc Andreessen's concept of achieving strong market demand for your product, measured by customer retention and organic growth.",
    category: "Product Strategy",
    icon: "CheckCircle",
    colorScheme: "emerald",
    expertTrainingData: {
      principles: [
        "Product-market fit means being in a good market with a product that satisfies it",
        "You can feel it when it happens (strong pull from market)",
        "Retention is the best indicator of fit",
        "Achieve fit before scaling growth",
        "Fit is not permanent - markets evolve"
      ],
      bestPractices: [
        "Measure product-market fit with Sean Ellis test (>40% 'very disappointed')",
        "Track cohort retention curves",
        "Monitor organic growth and word-of-mouth",
        "Iterate rapidly based on customer feedback",
        "Focus on core value proposition clarity"
      ],
      commonPitfalls: [
        "Scaling before achieving fit",
        "Confusing initial traction with fit",
        "Not measuring retention properly",
        "Ignoring negative feedback",
        "Declaring fit prematurely"
      ],
      keyMetrics: [
        "Sean Ellis PMF score (% very disappointed)",
        "Cohort retention rate",
        "Net Promoter Score (NPS)",
        "Organic growth rate",
        "Customer engagement metrics"
      ],
      successIndicators: [
        "Sean Ellis score above 40%",
        "Flat or improving retention curves",
        "Strong word-of-mouth growth",
        "Customers actively recruiting others",
        "Difficulty keeping up with demand"
      ]
    }
  },
  {
    name: "Four Actions Framework",
    slug: "four-actions",
    description: "Part of Blue Ocean Strategy - a tool to reconstruct buyer value elements by asking which factors to Eliminate, Reduce, Raise, and Create.",
    category: "Value Innovation",
    icon: "Grid",
    colorScheme: "indigo",
    expertTrainingData: {
      principles: [
        "Eliminate factors the industry takes for granted",
        "Reduce factors well below industry standard",
        "Raise factors well above industry standard",
        "Create factors the industry has never offered",
        "Simultaneously pursue differentiation and low cost"
      ],
      bestPractices: [
        "Challenge every industry assumption",
        "Focus on buyer value, not competitor benchmarking",
        "Look across alternative industries for ideas",
        "Engage cross-functional teams in the exercise",
        "Test new value curves with target customers"
      ],
      commonPitfalls: [
        "Only raising and creating (ignoring eliminate and reduce)",
        "Not being bold enough in eliminations",
        "Focusing on features instead of value",
        "Benchmarking against competitors",
        "Failing to execute the new value proposition"
      ],
      keyMetrics: [
        "Cost reduction from eliminations",
        "Value increase from creations",
        "Customer willingness to pay",
        "Competitive differentiation score",
        "Value-to-cost ratio"
      ],
      successIndicators: [
        "Significantly different value curve from competitors",
        "Lower cost structure with higher perceived value",
        "Customer excitement about new factors",
        "Difficulty for competitors to imitate",
        "Clear strategic focus"
      ]
    }
  }
];

const questionsData = [
  // AARRR Questions
  {
    framework: "aarrr",
    category: "Acquisition",
    questions: [
      {
        questionText: "What are your primary customer acquisition channels?",
        questionType: "multipleChoice",
        options: ["Organic Search", "Paid Ads", "Social Media", "Referrals", "Content Marketing", "Partnerships", "Direct Sales", "Other"],
        helpText: "Select all channels you currently use to acquire customers"
      },
      {
        questionText: "What is your current Customer Acquisition Cost (CAC)?",
        questionType: "text",
        helpText: "Average cost to acquire one customer (e.g., $50, $500, or 'Unknown')"
      },
      {
        questionText: "How do you track which channels drive the most valuable customers?",
        questionType: "rating",
        helpText: "Rate your tracking capability from 1 (no tracking) to 5 (comprehensive attribution)"
      }
    ]
  },
  {
    framework: "aarrr",
    category: "Activation",
    questions: [
      {
        questionText: "What is the key action that indicates a user is 'activated'?",
        questionType: "text",
        helpText: "The 'aha moment' or first value delivery (e.g., 'completed first project', 'sent first invoice')"
      },
      {
        questionText: "What percentage of new users complete this activation action?",
        questionType: "text",
        helpText: "Your activation rate (e.g., '45%' or 'Unknown')"
      },
      {
        questionText: "How optimized is your onboarding experience?",
        questionType: "rating",
        helpText: "Rate from 1 (no onboarding) to 5 (highly optimized, data-driven onboarding)"
      }
    ]
  },
  {
    framework: "aarrr",
    category: "Retention",
    questions: [
      {
        questionText: "What is your month-over-month retention rate?",
        questionType: "text",
        helpText: "Percentage of customers who return each month (e.g., '75%' or 'Unknown')"
      },
      {
        questionText: "Do you track cohort-based retention?",
        questionType: "multipleChoice",
        options: ["Yes, actively", "Yes, but not regularly", "No, but planning to", "No"],
        helpText: "Cohort analysis shows retention patterns over time"
      },
      {
        questionText: "What strategies do you use to improve retention?",
        questionType: "text",
        helpText: "Email campaigns, product improvements, customer success, etc."
      }
    ]
  },
  {
    framework: "aarrr",
    category: "Referral",
    questions: [
      {
        questionText: "Do you have a formal referral program?",
        questionType: "multipleChoice",
        options: ["Yes, active program", "Yes, but not promoted", "Planning to build", "No"],
        helpText: "Formal programs incentivize customers to refer others"
      },
      {
        questionText: "What is your viral coefficient (K-factor)?",
        questionType: "text",
        helpText: "Average number of new customers each customer brings (e.g., '0.5', '1.2', or 'Unknown')"
      },
      {
        questionText: "How easy is it for customers to share your product?",
        questionType: "rating",
        helpText: "Rate from 1 (no sharing features) to 5 (built-in viral loops)"
      }
    ]
  },
  {
    framework: "aarrr",
    category: "Revenue",
    questions: [
      {
        questionText: "What is your Customer Lifetime Value (LTV)?",
        questionType: "text",
        helpText: "Average revenue per customer over their lifetime (e.g., '$1,200' or 'Unknown')"
      },
      {
        questionText: "What is your LTV:CAC ratio?",
        questionType: "text",
        helpText: "Healthy ratio is 3:1 or higher (e.g., '3.5:1' or 'Unknown')"
      },
      {
        questionText: "How do you optimize for revenue growth?",
        questionType: "text",
        helpText: "Upsells, cross-sells, pricing optimization, etc."
      }
    ]
  },
  
  // Lean Startup Questions
  {
    framework: "lean-startup",
    category: "Build-Measure-Learn",
    questions: [
      {
        questionText: "How quickly can you go through a Build-Measure-Learn cycle?",
        questionType: "multipleChoice",
        options: ["Less than 1 week", "1-2 weeks", "2-4 weeks", "1-3 months", "Longer than 3 months"],
        helpText: "Speed of iteration is critical to validated learning"
      },
      {
        questionText: "Do you define success metrics before building features?",
        questionType: "multipleChoice",
        options: ["Always", "Usually", "Sometimes", "Rarely", "Never"],
        helpText: "Pre-defining metrics prevents confirmation bias"
      },
      {
        questionText: "How do you validate assumptions before building?",
        questionType: "text",
        helpText: "Customer interviews, landing pages, prototypes, etc."
      }
    ]
  },
  {
    framework: "lean-startup",
    category: "Minimum Viable Product",
    questions: [
      {
        questionText: "How do you define 'minimum' in your MVP?",
        questionType: "text",
        helpText: "Smallest set of features to test core hypothesis"
      },
      {
        questionText: "How many MVPs or experiments have you run in the last quarter?",
        questionType: "text",
        helpText: "Number of experiments (e.g., '5', '12', or '0')"
      },
      {
        questionText: "What percentage of your experiments validate your hypotheses?",
        questionType: "text",
        helpText: "Success rate (e.g., '40%' or 'Unknown')"
      }
    ]
  },
  {
    framework: "lean-startup",
    category: "Validated Learning",
    questions: [
      {
        questionText: "How do you document and share validated learnings?",
        questionType: "text",
        helpText: "Wiki, meetings, reports, etc."
      },
      {
        questionText: "Have you made any pivots based on validated learning?",
        questionType: "multipleChoice",
        options: ["Yes, major pivot", "Yes, minor pivots", "Considering pivot", "No pivots"],
        helpText: "Pivots are course corrections based on learning"
      },
      {
        questionText: "How data-driven are your product decisions?",
        questionType: "rating",
        helpText: "Rate from 1 (gut feel) to 5 (completely data-driven)"
      }
    ]
  },
  
  // Blue Ocean Strategy Questions
  {
    framework: "blue-ocean",
    category: "Market Analysis",
    questions: [
      {
        questionText: "Are you competing in a red ocean (crowded market) or creating a blue ocean?",
        questionType: "multipleChoice",
        options: ["Red ocean (intense competition)", "Mostly red ocean", "Mix of both", "Mostly blue ocean", "Blue ocean (little competition)"],
        helpText: "Red oceans are bloody with competition; blue oceans are uncontested"
      },
      {
        questionText: "Who are your main competitors?",
        questionType: "text",
        helpText: "List 3-5 main competitors or 'No direct competitors'"
      },
      {
        questionText: "What makes your offering different from alternatives?",
        questionType: "text",
        helpText: "Your unique value proposition"
      }
    ]
  },
  {
    framework: "blue-ocean",
    category: "Value Innovation",
    questions: [
      {
        questionText: "What industry factors can you eliminate that competitors take for granted?",
        questionType: "text",
        helpText: "Features, services, or processes to remove"
      },
      {
        questionText: "What factors can you reduce well below industry standard?",
        questionType: "text",
        helpText: "Areas to simplify or de-emphasize"
      },
      {
        questionText: "What factors can you raise well above industry standard?",
        questionType: "text",
        helpText: "Areas to excel and differentiate"
      },
      {
        questionText: "What factors can you create that the industry has never offered?",
        questionType: "text",
        helpText: "New innovations or value elements"
      }
    ]
  },
  {
    framework: "blue-ocean",
    category: "Non-Customers",
    questions: [
      {
        questionText: "Have you identified non-customers who could benefit from your offering?",
        questionType: "multipleChoice",
        options: ["Yes, actively targeting", "Yes, identified but not targeting", "Partially identified", "No"],
        helpText: "Non-customers are those who don't use current solutions"
      },
      {
        questionText: "What prevents non-customers from using existing solutions?",
        questionType: "text",
        helpText: "Barriers like cost, complexity, accessibility, etc."
      }
    ]
  },
  
  // JTBD Questions
  {
    framework: "jtbd",
    category: "Job Definition",
    questions: [
      {
        questionText: "What job are customers hiring your product to do?",
        questionType: "text",
        helpText: "The core job in customer's own words (not your product description)"
      },
      {
        questionText: "What is the functional dimension of the job?",
        questionType: "text",
        helpText: "The practical, objective task to accomplish"
      },
      {
        questionText: "What is the emotional dimension of the job?",
        questionType: "text",
        helpText: "How customers want to feel when the job is done"
      },
      {
        questionText: "What is the social dimension of the job?",
        questionType: "text",
        helpText: "How customers want to be perceived by others"
      }
    ]
  },
  {
    framework: "jtbd",
    category: "Struggling Moment",
    questions: [
      {
        questionText: "What triggers customers to look for a solution?",
        questionType: "text",
        helpText: "The 'struggling moment' or catalyst for change"
      },
      {
        questionText: "What are customers using before they switch to your product?",
        questionType: "text",
        helpText: "The alternatives they 'fire' to 'hire' you"
      },
      {
        questionText: "What barriers prevent customers from switching to your solution?",
        questionType: "text",
        helpText: "Switching costs, habits, anxiety, etc."
      }
    ]
  },
  {
    framework: "jtbd",
    category: "Job Performance",
    questions: [
      {
        questionText: "How well does your product help customers complete the job?",
        questionType: "rating",
        helpText: "Rate from 1 (poorly) to 5 (exceptionally well)"
      },
      {
        questionText: "What aspects of the job does your product not address?",
        questionType: "text",
        helpText: "Gaps in job coverage"
      },
      {
        questionText: "How do you measure job satisfaction?",
        questionType: "text",
        helpText: "Metrics or feedback mechanisms"
      }
    ]
  },
  
  // STP Marketing Questions
  {
    framework: "stp-marketing",
    category: "Segmentation",
    questions: [
      {
        questionText: "How do you segment your market?",
        questionType: "multipleChoice",
        options: ["Demographic", "Geographic", "Psychographic", "Behavioral", "Firmographic (B2B)", "Multiple criteria", "No segmentation"],
        helpText: "Select all segmentation approaches you use"
      },
      {
        questionText: "How many distinct segments have you identified?",
        questionType: "text",
        helpText: "Number of segments (e.g., '3', '5', or 'Haven't segmented')"
      },
      {
        questionText: "Are your segments measurable, accessible, and actionable?",
        questionType: "rating",
        helpText: "Rate from 1 (no) to 5 (yes, all segments meet these criteria)"
      }
    ]
  },
  {
    framework: "stp-marketing",
    category: "Targeting",
    questions: [
      {
        questionText: "Which segment(s) are you primarily targeting?",
        questionType: "text",
        helpText: "Your primary target segment(s)"
      },
      {
        questionText: "What makes these segments attractive?",
        questionType: "text",
        helpText: "Size, growth, profitability, fit, etc."
      },
      {
        questionText: "Do you have different strategies for different segments?",
        questionType: "multipleChoice",
        options: ["Yes, fully differentiated", "Yes, partially differentiated", "No, same strategy for all", "Only targeting one segment"],
        helpText: "Differentiated vs. undifferentiated targeting"
      }
    ]
  },
  {
    framework: "stp-marketing",
    category: "Positioning",
    questions: [
      {
        questionText: "What is your positioning statement?",
        questionType: "text",
        helpText: "For [target], who [need], [product] is [category] that [benefit]. Unlike [competition], we [differentiation]."
      },
      {
        questionText: "How differentiated is your positioning from competitors?",
        questionType: "rating",
        helpText: "Rate from 1 (not differentiated) to 5 (highly differentiated)"
      },
      {
        questionText: "Is your positioning consistent across all marketing channels?",
        questionType: "multipleChoice",
        options: ["Yes, completely consistent", "Mostly consistent", "Somewhat consistent", "Inconsistent"],
        helpText: "Consistency builds strong positioning"
      }
    ]
  },
  
  // Bowling Alley Questions
  {
    framework: "bowling-alley",
    category: "Beachhead Niche",
    questions: [
      {
        questionText: "Have you identified a specific beachhead niche to dominate?",
        questionType: "multipleChoice",
        options: ["Yes, actively dominating", "Yes, identified but early stage", "Considering options", "No"],
        helpText: "The 'headpin' - your first target niche"
      },
      {
        questionText: "What is your beachhead niche?",
        questionType: "text",
        helpText: "Specific industry, use case, or customer segment"
      },
      {
        questionText: "What is your current market share in this niche?",
        questionType: "text",
        helpText: "Percentage or 'Unknown' (aim for >50%)"
      }
    ]
  },
  {
    framework: "bowling-alley",
    category: "Whole Product",
    questions: [
      {
        questionText: "Do you offer a complete solution for your niche's needs?",
        questionType: "rating",
        helpText: "Rate from 1 (partial solution) to 5 (complete whole product)"
      },
      {
        questionText: "What gaps exist in your whole product offering?",
        questionType: "text",
        helpText: "Missing features, integrations, services, etc."
      },
      {
        questionText: "How many reference customers do you have in your beachhead niche?",
        questionType: "text",
        helpText: "Number of referenceable customers (aim for 10+)"
      }
    ]
  },
  {
    framework: "bowling-alley",
    category: "Adjacent Niches",
    questions: [
      {
        questionText: "Have you mapped adjacent niches for sequential expansion?",
        questionType: "multipleChoice",
        options: ["Yes, clear roadmap", "Yes, partially mapped", "Considering", "No"],
        helpText: "The bowling pins to knock down next"
      },
      {
        questionText: "What adjacent niches are you targeting next?",
        questionType: "text",
        helpText: "List 2-3 adjacent niches"
      },
      {
        questionText: "How will success in your current niche help you win adjacent niches?",
        questionType: "text",
        helpText: "References, word-of-mouth, product improvements, etc."
      }
    ]
  },
  
  // Product-Market Fit Questions
  {
    framework: "product-market-fit",
    category: "Fit Measurement",
    questions: [
      {
        questionText: "Have you measured product-market fit using the Sean Ellis test?",
        questionType: "multipleChoice",
        options: ["Yes, recently", "Yes, but not recently", "No, but planning to", "No"],
        helpText: "Ask: 'How would you feel if you could no longer use this product?'"
      },
      {
        questionText: "What percentage of users would be 'very disappointed' without your product?",
        questionType: "text",
        helpText: "Sean Ellis PMF score (>40% indicates fit)"
      },
      {
        questionText: "How would you rate your current product-market fit?",
        questionType: "rating",
        helpText: "Rate from 1 (no fit) to 5 (strong fit)"
      }
    ]
  },
  {
    framework: "product-market-fit",
    category: "Retention & Growth",
    questions: [
      {
        questionText: "What do your cohort retention curves look like?",
        questionType: "multipleChoice",
        options: ["Flat or improving (good fit)", "Declining slowly", "Declining rapidly", "Don't track cohorts"],
        helpText: "Flat retention curves indicate strong fit"
      },
      {
        questionText: "What percentage of your growth is organic (word-of-mouth)?",
        questionType: "text",
        helpText: "Organic growth percentage (e.g., '60%' or 'Unknown')"
      },
      {
        questionText: "Are customers actively recruiting others to use your product?",
        questionType: "multipleChoice",
        options: ["Yes, frequently", "Yes, occasionally", "Rarely", "No"],
        helpText: "Strong indicator of product-market fit"
      }
    ]
  },
  {
    framework: "product-market-fit",
    category: "Value Proposition",
    questions: [
      {
        questionText: "Can you clearly articulate your core value proposition in one sentence?",
        questionType: "text",
        helpText: "Your core value proposition"
      },
      {
        questionText: "Do customers describe your product the same way you do?",
        questionType: "multipleChoice",
        options: ["Yes, very similar", "Somewhat similar", "Different", "Don't know"],
        helpText: "Alignment indicates clear value communication"
      },
      {
        questionText: "What is your Net Promoter Score (NPS)?",
        questionType: "text",
        helpText: "NPS score (e.g., '45' or 'Unknown')"
      }
    ]
  },
  
  // Four Actions Framework Questions
  {
    framework: "four-actions",
    category: "Eliminate",
    questions: [
      {
        questionText: "What factors does your industry compete on that should be eliminated?",
        questionType: "text",
        helpText: "Features, services, or processes that add cost but little value"
      },
      {
        questionText: "What industry assumptions have you challenged?",
        questionType: "text",
        helpText: "Conventional wisdom you're questioning"
      },
      {
        questionText: "How much cost reduction have you achieved through eliminations?",
        questionType: "text",
        helpText: "Percentage or dollar amount (e.g., '30%' or 'Unknown')"
      }
    ]
  },
  {
    framework: "four-actions",
    category: "Reduce",
    questions: [
      {
        questionText: "What factors should be reduced well below industry standard?",
        questionType: "text",
        helpText: "Areas to simplify or de-emphasize"
      },
      {
        questionText: "Are you over-delivering on factors customers don't value?",
        questionType: "multipleChoice",
        options: ["Yes, significantly", "Yes, somewhat", "No", "Don't know"],
        helpText: "Over-delivery wastes resources"
      }
    ]
  },
  {
    framework: "four-actions",
    category: "Raise",
    questions: [
      {
        questionText: "What factors should be raised well above industry standard?",
        questionType: "text",
        helpText: "Areas to excel and differentiate"
      },
      {
        questionText: "How are you delivering exceptional value in these areas?",
        questionType: "text",
        helpText: "Specific ways you're exceeding standards"
      }
    ]
  },
  {
    framework: "four-actions",
    category: "Create",
    questions: [
      {
        questionText: "What factors should be created that the industry has never offered?",
        questionType: "text",
        helpText: "New value elements or innovations"
      },
      {
        questionText: "Have you looked across alternative industries for inspiration?",
        questionType: "multipleChoice",
        options: ["Yes, actively", "Yes, occasionally", "No, but planning to", "No"],
        helpText: "Cross-industry insights drive innovation"
      },
      {
        questionText: "How are customers responding to your new value factors?",
        questionType: "text",
        helpText: "Customer feedback on innovations"
      }
    ]
  }
];

async function seedFrameworks() {
  console.log("Seeding GTM Frameworks...\n");
  
  try {
    // Insert frameworks and store their IDs
    const frameworkIds: Record<string, number> = {};
    
    for (const framework of frameworksData) {
      const [result] = await db.insert(gtmFrameworks).values(framework);
      frameworkIds[framework.slug] = result.insertId;
      console.log(`✓ Inserted framework: ${framework.name}`);
    }
    
    console.log("\nSeeding Framework Questions...\n");
    
    // Insert questions for each framework
    let totalQuestions = 0;
    for (const questionSet of questionsData) {
      const frameworkId = frameworkIds[questionSet.framework];
      if (!frameworkId) {
        console.error(`Framework not found: ${questionSet.framework}`);
        continue;
      }
      
      let orderIndex = 0;
      for (const question of questionSet.questions) {
        await db.insert(gtmFrameworkQuestions).values({
          frameworkId,
          category: questionSet.category,
          questionText: question.questionText,
          questionType: question.questionType,
          options: question.options || null,
          orderIndex: orderIndex++,
          isRequired: 1,
          helpText: question.helpText || null
        });
        totalQuestions++;
      }
      
      console.log(`✓ Inserted ${questionSet.questions.length} questions for ${questionSet.framework} - ${questionSet.category}`);
    }
    
    console.log(`\n✅ Successfully seeded ${frameworksData.length} frameworks and ${totalQuestions} questions!`);
  } catch (error) {
    console.error("Error seeding data:", error);
  }
  
  process.exit(0);
}

seedFrameworks();

