import "dotenv/config";
import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function main() {
  console.log("🗑️ Dropping legacy billing_address column...");

  try {
    // Check if the column exists first to avoid errors
    const checkColumn = await db.execute(sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'bookings' AND column_name = 'billing_address';
    `);

    const rows = 'rows' in checkColumn ? checkColumn.rows : checkColumn;
    
    if ((rows as any[]).length > 0) {
      await db.execute(sql`ALTER TABLE bookings DROP COLUMN billing_address;`);
      console.log("✅ Column 'billing_address' dropped successfully.");
    } else {
      console.log("ℹ️ Column 'billing_address' does not exist. Skipping.");
    }

  } catch (error) {
    console.error("❌ Error dropping column:", error);
    process.exit(1);
  }

  console.log("✨ Migration complete.");
  process.exit(0);
}

main();
