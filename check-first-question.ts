import { getDb } from './server/db';
import { icpAssessmentQuestions } from './drizzle/schema-icp-assessment';
import { eq } from 'drizzle-orm';

async function checkFirstQuestion() {
  const db = await getDb();
  if (!db) {
    console.error('Database not available');
    return;
  }

  const questions = await db.select().from(icpAssessmentQuestions).where(eq(icpAssessmentQuestions.sectionId, 1)).limit(5);
  
  console.log('First 5 questions from ICP Discovery section:');
  questions.forEach((q, i) => {
    console.log(`\n${i + 1}. ${q.question}`);
    console.log(`   Type: ${q.questionType}`);
    console.log(`   Options: ${q.options ? JSON.stringify(q.options) : 'null'}`);
    console.log(`   Help: ${q.helpText}`);
  });
  
  process.exit(0);
}

checkFirstQuestion().catch(console.error);
