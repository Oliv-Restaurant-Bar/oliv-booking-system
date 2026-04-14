import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function main() {
  console.log("Checking database tables...");
  try {
    const result = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log("Tables in public schema:");
    console.table(result);
    
    console.log("\nChecking addon_items columns...");
    const addonCols = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'addon_items'
    `);
    console.table(addonCols);
    
  } catch (error: any) {
    console.error("Error:", error.message);
  }
  process.exit(0);
}

main();
