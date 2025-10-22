import { drizzle } from "drizzle-orm/mysql2";
import { moduleRecords, modules, users } from "./drizzle/schema";
import { eq } from "drizzle-orm";
import * as fs from "fs";

const db = drizzle(process.env.DATABASE_URL!);

async function importFreshData() {
  // Read JSON file
  const platforms = JSON.parse(fs.readFileSync('/home/ubuntu/platforms-fresh.json', 'utf-8'));
  
  // Get Platforms module
  const [platformsModule] = await db.select().from(modules).where(eq(modules.name, "Platforms")).limit(1);
  if (!platformsModule) {
    console.error("Platforms module not found!");
    return;
  }
  
  // Get first user
  const [user] = await db.select().from(users).limit(1);
  if (!user) {
    console.error("No users found!");
    return;
  }
  
  // Clear existing records
  await db.delete(moduleRecords).where(eq(moduleRecords.moduleId, platformsModule.id));
  console.log("✅ Cleared existing records");
  
  // Import fresh data
  for (const platform of platforms) {
    await db.insert(moduleRecords).values({
      moduleId: platformsModule.id,
      userId: user.id,
      data: platform,
      createdBy: user.id,
      updatedBy: user.id,
    });
  }
  
  console.log(`✅ Imported ${platforms.length} platforms with correct amounts!`);
  
  // Verify
  const records = await db.select().from(moduleRecords).where(eq(moduleRecords.moduleId, platformsModule.id)).limit(3);
  console.log("\nSample records:");
  records.forEach((r: any) => {
    console.log(`${r.data.platform}: Monthly=$${r.data.monthlyAmount}, Yearly=$${r.data.yearlyAmount}`);
  });
}

importFreshData().catch(console.error);

