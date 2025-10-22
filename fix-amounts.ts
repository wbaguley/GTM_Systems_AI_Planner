import { drizzle } from "drizzle-orm/mysql2";
import { moduleRecords } from "./drizzle/schema";
import { eq } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL!);

async function fixAmounts() {
  const records = await db.select().from(moduleRecords).where(eq(moduleRecords.moduleId, 1));
  
  console.log(`Found ${records.length} platform records to fix`);
  
  for (const record of records) {
    const data = record.data as any;
    
    // Divide all amounts by 100
    const fixedData = {
      ...data,
      monthlyAmount: data.monthlyAmount ? parseFloat(data.monthlyAmount) / 100 : 0,
      yearlyAmount: data.yearlyAmount ? parseFloat(data.yearlyAmount) / 100 : 0,
      oneTimeAmount: data.oneTimeAmount ? parseFloat(data.oneTimeAmount) / 100 : 0,
      balanceUsage: data.balanceUsage ? parseFloat(data.balanceUsage) / 100 : 0,
    };
    
    await db.update(moduleRecords)
      .set({ data: fixedData })
      .where(eq(moduleRecords.id, record.id));
  }
  
  console.log("✅ All amounts fixed!");
}

fixAmounts().catch(console.error);

