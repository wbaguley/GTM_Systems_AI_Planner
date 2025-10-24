import { getDb } from './server/db';
import { icpAssessmentResponses } from './drizzle/schema-icp-assessment';
import { eq } from 'drizzle-orm';

async function checkResponses() {
  const db = await getDb();
  if (!db) {
    console.error('Database not available');
    return;
  }

  const responses = await db.select().from(icpAssessmentResponses).where(eq(icpAssessmentResponses.assessmentId, 2));
  
  console.log(`Found ${responses.length} responses for assessment ID 2:`);
  responses.forEach((r) => {
    console.log(`\nQuestion ID: ${r.questionId}`);
    console.log(`Response: ${r.response}`);
    console.log(`Created: ${r.createdAt}`);
  });
  
  process.exit(0);
}

checkResponses().catch(console.error);
