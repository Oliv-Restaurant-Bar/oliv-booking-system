import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const sql = postgres(process.env.DATABASE_URL!);
  try {
    console.log("Applying 'deleted_at' column manually...");
    await sql`
      ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
    `;
    console.log("✅ Column 'deleted_at' added successfully (or already exists).");

    console.log("Ensuring 'billing_address' is removed...");
    await sql`
      ALTER TABLE "bookings" DROP COLUMN IF EXISTS "billing_address";
    `;
    console.log("✅ Column 'billing_address' removed successfully (or already gone).");

  } catch (error) {
    console.error("❌ Error applying database changes:", error);
  } finally {
    await sql.end();
  }
}

main();
