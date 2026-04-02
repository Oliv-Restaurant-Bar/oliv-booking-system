import { db } from '../lib/db';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log("Applying manual migrations...");
  
  const p15 = fs.readFileSync(path.join(__dirname, '../lib/db/migrations/0015_dusty_morlocks.sql'), 'utf8');
  let statements = p15.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s.length > 0);
  for (const s of statements) {
    console.log("Executing:", s);
    try {
      await db.execute(sql.raw(s));
    } catch (e: any) {
      console.log("Skipped or errored:", e.message);
    }
  }

  const p16 = fs.readFileSync(path.join(__dirname, '../lib/db/migrations/0016_free_winter_soldier.sql'), 'utf8');
  statements = p16.split('--> statement-breakpoint').map(s => s.trim()).filter(s => s.length > 0);
  for (const s of statements) {
    console.log("Executing:", s);
    try {
      await db.execute(sql.raw(s));
    } catch (e: any) {
      console.log("Skipped or errored:", e.message);
    }
  }

  console.log("Done");
  process.exit(0);
}

main().catch(console.error);
