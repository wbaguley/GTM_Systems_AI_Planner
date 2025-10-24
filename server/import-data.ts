import { getDb } from "./db";
import { platforms } from "../drizzle/schema";
import * as fs from "fs";
import * as path from "path";

interface ImportPlatform {
  platform: string;
  useCase?: string | null;
  website?: string | null;
  costOwner: "Client" | "GTM Planetary" | "Both";
  status: "Active" | "Inactive" | "Cancelled";
  billingType?: "Monthly" | "Yearly" | "OneTime" | "Usage" | "Free Plan" | "Pay as you go" | null;
  licenses?: string | null;
  monthlyAmount: number;
  yearlyAmount: number;
  oneTimeAmount: number;
  balanceUsage: number;
  renewalDate?: string | null;
  renewalDay?: number | null;
  isMyToolbelt: boolean;
  isInternalBusiness: boolean;
  isSolutionPartner: boolean;
  notesForManus?: string | null;
  notesForStaff?: string | null;
}

export async function importPlatformsFromJson(userId: number, jsonPath: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Read JSON file
  const jsonData = fs.readFileSync(jsonPath, "utf-8");
  const platformsData: ImportPlatform[] = JSON.parse(jsonData);

  let imported = 0;
  let errors = 0;

  for (const platformData of platformsData) {
    try {
      await db.insert(platforms).values({
        userId,
        platform: platformData.platform,
        useCase: platformData.useCase,
        website: platformData.website,
        costOwner: platformData.costOwner,
        status: platformData.status,
        billingType: platformData.billingType,
        licenses: platformData.licenses,
        monthlyAmount: platformData.monthlyAmount,
        yearlyAmount: platformData.yearlyAmount,
        oneTimeAmount: platformData.oneTimeAmount,
        balanceUsage: platformData.balanceUsage,
        renewalDate: platformData.renewalDate ? new Date(platformData.renewalDate) : undefined,
        renewalDay: platformData.renewalDay,
        isMyToolbelt: platformData.isMyToolbelt,
        isInternalBusiness: platformData.isInternalBusiness,
        isSolutionPartner: platformData.isSolutionPartner,
        notesForManus: platformData.notesForManus,
        notesForStaff: platformData.notesForStaff,
      });
      imported++;
    } catch (error) {
      console.error(`Failed to import platform ${platformData.platform}:`, error);
      errors++;
    }
  }

  return { imported, errors, total: platformsData.length };
}

// Run import if called directly
const userId = parseInt(process.argv[2] || "1");
const jsonPath = process.argv[3] || "/home/ubuntu/platforms_import.json";

if (process.argv.length >= 2) {
  importPlatformsFromJson(userId, jsonPath)
    .then((result) => {
      console.log(`Import complete: ${result.imported} imported, ${result.errors} errors out of ${result.total} total`);
      process.exit(0);
    })
    .catch((error) => {
      console.error("Import failed:", error);
      process.exit(1);
    });
}

