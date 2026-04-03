import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  const sql = postgres(process.env.DATABASE_URL!);
  try {
    console.log("Checking current columns for 'bookings'...");
    const beforeCols = await sql`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'bookings' AND table_schema = 'public';
    `;
    console.log("Columns before:", beforeCols.map(c => c.column_name).join(", "));

    console.log("Applying 'deleted_at' column manually...");
    await sql`
      ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "deleted_at" timestamp;
    `;
    
    const afterCols = await sql`
      SELECT column_name FROM information_schema.columns WHERE table_name = 'bookings' AND table_schema = 'public';
    `;
    console.log("Columns after:", afterCols.map(c => c.column_name).join(", "));
    
    if (afterCols.some(c => c.column_name === 'deleted_at')) {
      console.log("✅ Column 'deleted_at' is PRESENT in information_schema.");
    } else {
      console.log("❌ Column 'deleted_at' is STILL MISSING in information_schema!");
    }

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
