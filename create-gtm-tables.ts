import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL!);

async function createGtmTables() {
  console.log("Creating GTM Framework tables...");
  
  try {
    // Create gtm_frameworks table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS gtm_frameworks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        slug VARCHAR(100) NOT NULL UNIQUE,
        description TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        icon VARCHAR(50),
        colorScheme VARCHAR(50),
        expertTrainingData JSON,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log("✓ Created gtm_frameworks table");
    
    // Create gtm_framework_questions table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS gtm_framework_questions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        frameworkId INT NOT NULL,
        category VARCHAR(255) NOT NULL,
        questionText TEXT NOT NULL,
        questionType VARCHAR(50) NOT NULL,
        options JSON,
        orderIndex INT NOT NULL DEFAULT 0,
        isRequired INT NOT NULL DEFAULT 1,
        helpText TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log("✓ Created gtm_framework_questions table");
    
    // Create gtm_assessments table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS gtm_assessments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        frameworkId INT NOT NULL,
        companyName VARCHAR(255),
        industry VARCHAR(255),
        status VARCHAR(50) NOT NULL DEFAULT 'in_progress',
        completedAt TIMESTAMP NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log("✓ Created gtm_assessments table");
    
    // Create gtm_assessment_responses table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS gtm_assessment_responses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        assessmentId INT NOT NULL,
        questionId INT NOT NULL,
        responseValue TEXT NOT NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log("✓ Created gtm_assessment_responses table");
    
    // Create gtm_assessment_results table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS gtm_assessment_results (
        id INT AUTO_INCREMENT PRIMARY KEY,
        assessmentId INT NOT NULL UNIQUE,
        overallScore INT NOT NULL,
        categoryScores JSON,
        strengths JSON,
        gaps JSON,
        recommendations JSON,
        actionPlan JSON,
        aiAnalysis TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log("✓ Created gtm_assessment_results table");
    
    console.log("\n✅ All GTM Framework tables created successfully!");
  } catch (error) {
    console.error("Error creating tables:", error);
  }
  
  process.exit(0);
}

createGtmTables();

