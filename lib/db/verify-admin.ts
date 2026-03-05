import { config } from "dotenv";
config({ path: ".env" });

import { db } from "@/lib/db";
import { adminUser, account } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function verifyAdmin() {
  console.log("🔍 Verifying admin user and account...\n");

  const users = await db.select().from(adminUser).where(eq(adminUser.email, "admin@oliv-restaurant.ch"));

  if (users.length === 0) {
    console.log("❌ No admin user found!");
    process.exit(1);
  }

  const user = users[0];
  console.log("✅ Admin User Found:");
  console.log("   ID:", user.id);
  console.log("   Email:", user.email);
  console.log("   Name:", user.name);
  console.log("   Role:", user.role);
  console.log("   Email Verified:", user.emailVerified);

  const accounts = await db.select().from(account).where(eq(account.userId, user.id));

  if (accounts.length === 0) {
    console.log("\n❌ No credential account found for this user!");
    process.exit(1);
  }

  const credAccount = accounts.find(a => a.providerId === "credential");

  if (!credAccount) {
    console.log("\n❌ No credential provider account found!");
    console.log("   Available providers:", accounts.map(a => a.providerId));
    process.exit(1);
  }

  console.log("\n✅ Credential Account Found:");
  console.log("   Account ID:", credAccount.accountId);
  console.log("   Provider:", credAccount.providerId);
  console.log("   Has Password:", !!credAccount.password);
  console.log("   Password Length:", credAccount.password?.length);

  console.log("\n✅ Everything looks good! You should be able to log in now.");
  console.log("\n📝 Login credentials:");
  console.log("   Email: admin@oliv-restaurant.ch");
  console.log("   Password: admin123");

  process.exit(0);
}

verifyAdmin().catch(console.error);
