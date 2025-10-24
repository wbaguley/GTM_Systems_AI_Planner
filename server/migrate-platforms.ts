import { getDb } from "./db";
import { modules, moduleFields, moduleSections, moduleRecords } from "../drizzle/schema";
import { platforms } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Migration script to convert the fixed Platforms table to the dynamic module system
 * This will:
 * 1. Create a "Platforms" module
 * 2. Create all the standard platform fields
 * 3. Migrate existing platform data to module_records
 */

async function migratePlatforms(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  console.log("Starting Platforms migration...");

  // Step 1: Create or get Platforms module
  const existingModules = await db.select().from(modules).where(eq(modules.name, "Platforms"));
  let platformsModule;

  if (existingModules.length > 0) {
    platformsModule = existingModules[0];
    console.log("Platforms module already exists, using existing module");
  } else {
    const [newModule] = await db.insert(modules).values({
      userId,
      name: "Platforms",
      singularName: "Platform",
      pluralName: "Platforms",
      icon: "Package",
      description: "Manage your tech stack platforms and subscriptions",
      isSystem: true,
    });
    platformsModule = { id: newModule.insertId, userId, name: "Platforms" };
    console.log("Created Platforms module");
  }

  const moduleId = platformsModule.id;

  // Step 2: Create default fields
  const defaultFields = [
    {
      moduleId,
      fieldKey: "platform",
      label: "Platform Name",
      fieldType: "text" as any,
      isRequired: true,
      isUnique: false,
      displayOrder: 0,
      columnSpan: 2,
      isSystem: true,
    },
    {
      moduleId,
      fieldKey: "useCase",
      label: "Use Case",
      fieldType: "longtext" as any,
      placeholder: "What is this platform used for?",
      isRequired: false,
      displayOrder: 1,
      columnSpan: 3,
      isSystem: true,
    },
    {
      moduleId,
      fieldKey: "website",
      label: "Website URL",
      fieldType: "url" as any,
      placeholder: "https://example.com",
      isRequired: false,
      displayOrder: 2,
      columnSpan: 2,
      isSystem: true,
    },
    {
      moduleId,
      fieldKey: "logoUrl",
      label: "Logo URL",
      fieldType: "url" as any,
      isRequired: false,
      displayOrder: 3,
      columnSpan: 2,
      isSystem: true,
    },
    {
      moduleId,
      fieldKey: "costOwner",
      label: "Cost Owner",
      fieldType: "select" as any,
      options: ["Client", "GTM Planetary", "Both"] as any,
      isRequired: true,
      displayOrder: 4,
      columnSpan: 1,
      isSystem: true,
    },
    {
      moduleId,
      fieldKey: "status",
      label: "Status",
      fieldType: "select" as any,
      options: ["Active", "Inactive", "Cancelled"] as any,
      isRequired: true,
      displayOrder: 5,
      columnSpan: 1,
      isSystem: true,
    },
    {
      moduleId,
      fieldKey: "billingType",
      label: "Billing Type",
      fieldType: "select" as any,
      options: ["Monthly", "Yearly", "OneTime", "Usage", "Free Plan", "Pay as you go"] as any,
      isRequired: false,
      displayOrder: 6,
      columnSpan: 1,
      isSystem: true,
    },
    {
      moduleId,
      fieldKey: "licenses",
      label: "Licenses / User Seats",
      fieldType: "text" as any,
      placeholder: "e.g., 5 users",
      isRequired: false,
      displayOrder: 7,
      columnSpan: 1,
      isSystem: true,
    },
    {
      moduleId,
      fieldKey: "monthlyAmount",
      label: "Monthly Amount ($)",
      fieldType: "currency" as any,
      isRequired: false,
      displayOrder: 8,
      columnSpan: 1,
      isSystem: true,
    },
    {
      moduleId,
      fieldKey: "yearlyAmount",
      label: "Yearly Amount ($)",
      fieldType: "currency" as any,
      isRequired: false,
      displayOrder: 9,
      columnSpan: 1,
      isSystem: true,
    },
    {
      moduleId,
      fieldKey: "oneTimeAmount",
      label: "One-Time Amount ($)",
      fieldType: "currency" as any,
      isRequired: false,
      displayOrder: 10,
      columnSpan: 1,
      isSystem: true,
    },
    {
      moduleId,
      fieldKey: "balanceUsage",
      label: "Balance / Usage ($)",
      fieldType: "currency" as any,
      isRequired: false,
      displayOrder: 11,
      columnSpan: 1,
      isSystem: true,
    },
    {
      moduleId,
      fieldKey: "renewalDate",
      label: "Renewal Date",
      fieldType: "date" as any,
      isRequired: false,
      displayOrder: 12,
      columnSpan: 1,
      isSystem: true,
    },
    {
      moduleId,
      fieldKey: "renewalDay",
      label: "Renewal Day of Month",
      fieldType: "number" as any,
      isRequired: false,
      displayOrder: 13,
      columnSpan: 1,
      isSystem: true,
    },
    {
      moduleId,
      fieldKey: "isMyToolbelt",
      label: "My Toolbelt",
      fieldType: "checkbox" as any,
      isRequired: false,
      displayOrder: 14,
      columnSpan: 1,
      isSystem: true,
    },
    {
      moduleId,
      fieldKey: "isInternalBusiness",
      label: "Internal Business Platform",
      fieldType: "checkbox" as any,
      isRequired: false,
      displayOrder: 15,
      columnSpan: 1,
      isSystem: true,
    },
    {
      moduleId,
      fieldKey: "isSolutionPartner",
      label: "Solution Partner",
      fieldType: "checkbox" as any,
      isRequired: false,
      displayOrder: 16,
      columnSpan: 1,
      isSystem: true,
    },
    {
      moduleId,
      fieldKey: "notesForManus",
      label: "Notes for Manus",
      fieldType: "longtext" as any,
      isRequired: false,
      displayOrder: 17,
      columnSpan: 3,
      isSystem: true,
    },
    {
      moduleId,
      fieldKey: "notesForStaff",
      label: "Notes for GTM Planetary Staff",
      fieldType: "longtext" as any,
      isRequired: false,
      displayOrder: 18,
      columnSpan: 3,
      isSystem: true,
    },
  ];

  // Check if fields already exist
  const existingFields = await db.select().from(moduleFields).where(eq(moduleFields.moduleId, moduleId));
  
  if (existingFields.length === 0) {
    await db.insert(moduleFields).values(defaultFields);
    console.log(`Created ${defaultFields.length} default fields`);
  } else {
    console.log("Fields already exist, skipping field creation");
  }

  // Step 3: Migrate existing platform data
  const existingPlatforms = await db.select().from(platforms).where(eq(platforms.userId, userId));
  console.log(`Found ${existingPlatforms.length} existing platforms to migrate`);

  for (const platform of existingPlatforms) {
    // Create module record with all field values in data JSON
    const data = {
      platform: platform.platform,
      useCase: platform.useCase || "",
      website: platform.website || "",
      logoUrl: platform.logoUrl || "",
      costOwner: platform.costOwner,
      status: platform.status,
      billingType: platform.billingType || "",
      licenses: platform.licenses || "",
      monthlyAmount: platform.monthlyAmount?.toString() || "0",
      yearlyAmount: platform.yearlyAmount?.toString() || "0",
      oneTimeAmount: platform.oneTimeAmount?.toString() || "0",
      balanceUsage: platform.balanceUsage?.toString() || "0",
      renewalDate: platform.renewalDate || "",
      renewalDay: platform.renewalDay?.toString() || "0",
      isMyToolbelt: platform.isMyToolbelt ? "true" : "false",
      isInternalBusiness: platform.isInternalBusiness ? "true" : "false",
      isSolutionPartner: platform.isSolutionPartner ? "true" : "false",
      notesForManus: platform.notesForManus || "",
      notesForStaff: platform.notesForStaff || "",
    };

    await db.insert(moduleRecords).values({
      moduleId,
      userId,
      data,
    });

    console.log(`Migrated platform: ${platform.platform}`);
  }

  console.log("Migration completed successfully!");
  return { moduleId, migratedCount: existingPlatforms.length };
}

// Export for use in server
export { migratePlatforms };

