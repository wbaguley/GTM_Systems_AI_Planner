import { drizzle } from "drizzle-orm/mysql2";
import { sql } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL!);

async function dropOldGtmTables() {
  console.log("Dropping old GTM tables...");
  
  try {
    // Drop tables in reverse order of dependencies
    await db.execute(sql`DROP TABLE IF EXISTS gtm_assessment_results`);
    console.log("✓ Dropped gtm_assessment_results");
    
    await db.execute(sql`DROP TABLE IF EXISTS gtm_assessment_responses`);
    console.log("✓ Dropped gtm_assessment_responses");
    
    await db.execute(sql`DROP TABLE IF EXISTS gtm_assessments`);
    console.log("✓ Dropped gtm_assessments");
    
    await db.execute(sql`DROP TABLE IF EXISTS gtm_framework_questions`);
    console.log("✓ Dropped gtm_framework_questions");
    
    await db.execute(sql`DROP TABLE IF EXISTS gtm_frameworks`);
    console.log("✓ Dropped gtm_frameworks");
    
    await db.execute(sql`DROP TABLE IF EXISTS gtm_questions`);
    console.log("✓ Dropped gtm_questions (old table)");
    
    console.log("\n✅ All old GTM tables dropped successfully!");
  } catch (error) {
    console.error("Error dropping tables:", error);
  }
  
  process.exit(0);
}

dropOldGtmTables();

