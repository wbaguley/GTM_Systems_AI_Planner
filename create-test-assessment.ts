import { getDb } from './server/db';
import { icpAssessments } from './drizzle/schema-icp-assessment';

async function createTestAssessment() {
  const db = await getDb();
  if (!db) {
    console.error('Database not available');
    return;
  }

  const result = await db.insert(icpAssessments).values({
    userId: 'test-user-123',
    companyName: 'Test Company Inc.',
    industry: 'Technology/SaaS',
    companySize: '11-50 employees',
    revenue: '$1M-$5M',
    status: 'in_progress',
  });

  console.log('Test assessment created:', result);
  console.log('Assessment ID:', result[0].insertId);
  process.exit(0);
}

createTestAssessment().catch(console.error);
