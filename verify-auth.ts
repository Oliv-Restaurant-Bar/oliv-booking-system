import { config } from "dotenv";
config({ path: ".env" });

import { db } from "@/lib/db";
import { adminUser } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

async function verify() {
  const user = await db.query.adminUser.findFirst({
    where: eq(adminUser.email, "admin@oliv-restaurant.ch"),
  });

  if (user) {
    console.log("Found user:", user.email);
    console.log("Has password:", !!user.password);
    console.log("Role:", user.role);
    if (!user.password) {
      console.error("FAIL: User has no password");
      process.exit(1);
    }
    if (user.role !== "super_admin") {
      console.error("FAIL: User role is not super_admin");
      process.exit(1);
    }
  } else {
    console.error("FAIL: User not found");
    process.exit(1);
  }
}

verify()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
