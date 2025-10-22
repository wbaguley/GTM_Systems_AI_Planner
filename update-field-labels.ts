import { drizzle } from "drizzle-orm/mysql2";
import { eq } from "drizzle-orm";
import { moduleFields } from "./drizzle/schema";

const db = drizzle(process.env.DATABASE_URL!);

async function updateLabels() {
  try {
    // Update "Notes for Manus" to "AI Notes"
    await db.update(moduleFields)
      .set({ label: "AI Notes" })
      .where(eq(moduleFields.fieldKey, "notesForManus"));
    
    // Update "Notes for GTM Planetary Staff" to "Notes"
    await db.update(moduleFields)
      .set({ label: "Notes" })
      .where(eq(moduleFields.fieldKey, "notesForStaff"));
    
    // Update "My Toolbelt" to "Toolkit"
    await db.update(moduleFields)
      .set({ label: "Toolkit" })
      .where(eq(moduleFields.fieldKey, "isMyToolbelt"));
    
    console.log("✅ Labels updated successfully!");
  } catch (error) {
    console.error("❌ Error updating labels:", error);
  }
  process.exit(0);
}

updateLabels();

