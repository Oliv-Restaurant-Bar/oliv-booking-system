import { config } from "dotenv";
config({ path: ".env" });

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { adminUser, account } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

async function createUserWithBetterAuth() {
  console.log("🔐 Creating user using Better Auth API...\n");

  try {
    // Delete existing user/account first
    const existing = await db.query.adminUser.findFirst({
      where: eq(adminUser.email, "admin@oliv-restaurant.ch"),
    });

    if (existing) {
      await db.delete(account).where(eq(account.userId, existing.id));
      await db.delete(adminUser).where(eq(adminUser.id, existing.id));
      console.log("✅ Deleted existing user");
    }

    // Use Better Auth's signUpEmail API which will hash the password correctly
    // We need to provide a headers object with cookie support
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Cookie", "");

    const result = await auth.api.signUpEmail({
      body: {
        email: "admin@oliv-restaurant.ch",
        password: "admin123",
        name: "Super Admin",
        role: "super_admin",
      },
      headers: headers as any,
    });

    console.log("\n✅ User created via Better Auth API");
    console.log("Result:", JSON.stringify(result, null, 2));

    // Update role to super_admin
    await db
      .update(adminUser)
      .set({ role: "super_admin" })
      .where(eq(adminUser.email, "admin@oliv-restaurant.ch"));

    console.log("✅ Updated user role to super_admin");

    console.log("\n📝 Login credentials:");
    console.log("   Email: admin@oliv-restaurant.ch");
    console.log("   Password: admin123");
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  }

  process.exit(0);
}

createUserWithBetterAuth().catch(console.error);
