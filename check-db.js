// Load environment variables before importing anything
import { config } from "dotenv";
config({ path: ".env" });
if (!process.env.DATABASE_URL) {
  config();
}

import { db } from "./lib/db/index.js";
import { adminUser, account } from "./lib/db/schema.js";

async function checkAdmin() {
  const users = await db.select().from(adminUser);
  console.log("\n📋 Admin Users:");
  console.table(users.map(u => ({
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    emailVerified: u.emailVerified,
  })));

  const accounts = await db.select().from(account);
  console.log("\n📋 Accounts:");
  console.table(accounts.map(a => ({
    id: a.id,
    userId: a.userId,
    providerId: a.providerId,
    accountId: a.accountId,
    hasPassword: !!a.password,
  })));

  process.exit(0);
}

checkAdmin().catch(console.error);
