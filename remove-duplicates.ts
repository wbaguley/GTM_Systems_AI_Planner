import { drizzle } from "drizzle-orm/mysql2";
import { eq, and, sql } from "drizzle-orm";
import { moduleRecords } from "./drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

async function removeDuplicates() {
  try {
    // Get all records for Platforms module
    const records = await db.select().from(moduleRecords).where(eq(moduleRecords.moduleId, 2));
    
    console.log(`Total records: ${records.length}`);
    
    // Group by platform name to find duplicates
    const platformMap = new Map<string, any[]>();
    
    records.forEach((record: any) => {
      const platformName = record.data?.platform || "Unknown";
      if (!platformMap.has(platformName)) {
        platformMap.set(platformName, []);
      }
      platformMap.get(platformName)!.push(record);
    });
    
    let duplicatesRemoved = 0;
    
    // For each platform with duplicates, keep the first one and delete the rest
    for (const [name, platformRecords] of platformMap.entries()) {
      if (platformRecords.length > 1) {
        console.log(`Found ${platformRecords.length} duplicates of "${name}"`);
        
        // Sort by ID and keep the first one (lowest ID)
        platformRecords.sort((a, b) => a.id - b.id);
        
        // Delete all except the first
        for (let i = 1; i < platformRecords.length; i++) {
          await db.delete(moduleRecords).where(eq(moduleRecords.id, platformRecords[i].id));
          duplicatesRemoved++;
        }
      }
    }
    
    console.log(`\n✅ Removed ${duplicatesRemoved} duplicate records`);
    console.log(`✅ Unique platforms remaining: ${platformMap.size}`);
    
  } catch (error) {
    console.error("❌ Error removing duplicates:", error);
  }
  process.exit(0);
}

removeDuplicates();

