import { drizzle } from "drizzle-orm/mysql2";
import { moduleRecords } from "./drizzle/schema";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL!);

async function checkData() {
  const records = await db.select().from(moduleRecords).where(eq(moduleRecords.moduleId, 1)).limit(5);
  
  console.log("Sample platform records:");
  records.forEach((record: any) => {
    const data = record.data || {};
    console.log(`\nPlatform: ${data.platform}`);
    console.log(`  Monthly: ${data.monthlyAmount} (type: ${typeof data.monthlyAmount})`);
    console.log(`  Yearly: ${data.yearlyAmount} (type: ${typeof data.yearlyAmount})`);
    console.log(`  One-Time: ${data.oneTimeAmount} (type: ${typeof data.oneTimeAmount})`);
    console.log(`  Balance: ${data.balanceUsage} (type: ${typeof data.balanceUsage})`);
    console.log(`  Status: ${data.status}`);
  });
}

checkData().catch(console.error);

