import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { moduleRecords } from "./drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

async function debugStats() {
  const records = await db.select().from(moduleRecords).where(eq(moduleRecords.moduleId, 2));
  
  let monthlyTotal = 0;
  let yearlyTotal = 0;
  let activeCount = 0;
  
  console.log("Analyzing records...\n");
  
  records.forEach((record: any) => {
    const data = record.data || {};
    const status = data.status;
    
    if (status === "Active") {
      activeCount++;
      const monthly = parseFloat(data.monthlyAmount || "0");
      const yearly = parseFloat(data.yearlyAmount || "0");
      
      if (monthly > 0 || yearly > 0) {
        console.log(`${data.platform || "Unknown"}: Monthly=$${monthly}, Yearly=$${yearly}`);
      }
      
      monthlyTotal += monthly;
      yearlyTotal += yearly;
    }
  });
  
  console.log(`\nTotal Active: ${activeCount}`);
  console.log(`Monthly Total: $${monthlyTotal.toFixed(2)}`);
  console.log(`Yearly Total: $${yearlyTotal.toFixed(2)}`);
  console.log(`Estimated Annual: $${((monthlyTotal * 12) + yearlyTotal).toFixed(2)}`);
  
  process.exit(0);
}

debugStats();

