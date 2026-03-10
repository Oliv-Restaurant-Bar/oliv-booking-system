import { config } from "dotenv";
config({ path: ".env" });

import { db } from "@/lib/db";
import { adminUser, account, bookingAuditLog, bookingContactHistory, bookings } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { randomUUID } from "crypto";
import { scryptAsync } from "@noble/hashes/scrypt.js";
import { hex } from "@better-auth/utils/hex";

/**
 * Better Auth compatible password hashing using scrypt
 * Format: {salt}:{hash} (both hex-encoded)
 */
async function hashPassword(password: string): Promise<string> {
  const salt = hex.encode(crypto.getRandomValues(new Uint8Array(16)));
  const key = await scryptAsync(
    password.normalize("NFKC"),
    salt,
    {
      N: 16384,
      p: 1,
      r: 16,
      dkLen: 64,
    }
  );
  return `${salt}:${hex.encode(key)}`;
}

async function resetAdmin() {
  console.log("🔄 Resetting admin user...");

  try {
    const adminEmail = "admin@oliv-restaurant.ch";

    // Delete existing admin account
    const existingAdmin = await db.query.adminUser.findFirst({
      where: eq(adminUser.email, adminEmail),
    });

    if (existingAdmin) {
      // Delete booking audit logs first (foreign key constraint)
      await db.delete(bookingAuditLog).where(eq(bookingAuditLog.adminUserId, existingAdmin.id));
      console.log("✅ Deleted booking audit logs");

      // Delete booking contact history (foreign key constraint)
      await db.delete(bookingContactHistory).where(eq(bookingContactHistory.adminUserId, existingAdmin.id));
      console.log("✅ Deleted booking contact history");

      // Remove admin references from bookings (foreign key constraints)
      await db.update(bookings)
        .set({ lockedBy: null, assignedTo: null })
        .where(or(eq(bookings.assignedTo, existingAdmin.id), eq(bookings.lockedBy, existingAdmin.id)));
      console.log("✅ Cleared admin references from bookings");

      // Delete account first (foreign key constraint)
      await db.delete(account).where(eq(account.userId, existingAdmin.id));
      console.log("✅ Deleted existing admin account");

      // Delete admin user
      await db.delete(adminUser).where(eq(adminUser.id, existingAdmin.id));
      console.log("✅ Deleted existing admin user");
    }

    // Hash the new password
    const hashedPassword = await hashPassword("admin123");

    // Create new admin user
    const adminId = randomUUID();
    await db.insert(adminUser).values({
      id: adminId,
      name: "Super Admin",
      email: adminEmail,
      emailVerified: true,
      role: "super_admin",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("✅ Created new admin user");

    // Create credential account with password
    await db.insert(account).values({
      id: randomUUID(),
      userId: adminId,
      accountId: adminEmail,
      providerId: "credential",
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log("✅ Created new admin account");

    console.log("\n🎉 Admin user reset successfully!");
    console.log("\n📝 New login credentials:");
    console.log("   Email: " + adminEmail);
    console.log("   Password: admin123");
  } catch (error) {
    console.error("❌ Reset failed:", error);
    process.exit(1);
  }
}

resetAdmin().then(() => process.exit(0));
