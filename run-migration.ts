import "dotenv/config";
import { migratePlatforms } from "./server/migrate-platforms";
import { getUser, upsertUser } from "./server/db";
import { ENV } from "./server/_core/env";

async function main() {
  console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "Not set");
  
  // Use the owner's openId from environment
  const ownerOpenId = ENV.ownerOpenId || "default-owner-openid";
  console.log("Looking for user with openId:", ownerOpenId);
  
  let user = await getUser(ownerOpenId);
  
  if (!user) {
    console.log("User not found, creating...");
    await upsertUser({
      openId: ownerOpenId,
      name: ENV.ownerName || "Owner",
      email: "owner@gtmplanetary.com",
      role: "admin",
    });
    user = await getUser(ownerOpenId);
  }
  
  if (!user) {
    console.error("Failed to create user");
    process.exit(1);
  }
  
  console.log("Running migration for user:", user.email);
  await migratePlatforms(user.id);
  console.log("Migration complete!");
  process.exit(0);
}

main().catch(console.error);

