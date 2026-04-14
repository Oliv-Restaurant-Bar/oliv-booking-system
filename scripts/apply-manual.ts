import { db } from '../lib/db';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log("Applying manual migrations...");
  
  const migrations = [
    '0017_hot_roland_deschain.sql',
    '0018_organic_the_leader.sql',
    '0019_remarkable_falcon.sql',
    '0020_youthful_wolfsbane.sql'
  ];

  for (const migration of migrations) {
    console.log(`\n--- Applying ${migration} ---`);
    try {
      const content = fs.readFileSync(path.join(__dirname, `../lib/db/migrations/${migration}`), 'utf8');
      const statements = content.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s.length > 0);
      
      for (const s of statements) {
        console.log("Executing:", s.substring(0, 50) + (s.length > 50 ? "..." : ""));
        try {
          await db.execute(sql.raw(s));
          console.log("   Success!");
        } catch (e: any) {
          console.log("   Skipped/Errored:", e.message || e);
          if (e.detail) console.log("   Detail:", e.detail);
          if (e.code) console.log("   Code:", e.code);
        }
      }
    } catch (err: any) {
      console.error(`Failed to read or process ${migration}:`, err.message);
    }
  }

  console.log("\nAll migrations processed.");
  process.exit(0);
}

main().catch(console.error);
