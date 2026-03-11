/**
 * Add system_settings table to database
 * Run with: npm run db:add-settings
 */

import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function addSettingsTable() {
  console.log('Adding system_settings table to database...');

  try {
    // Create the system_settings table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "system_settings" (
        "id" text PRIMARY KEY NOT NULL,
        "language" text NOT NULL DEFAULT 'English',
        "time_zone" text NOT NULL DEFAULT 'Europe/Zurich',
        "date_format" text NOT NULL DEFAULT 'DD/MM/YYYY',
        "currency" text NOT NULL DEFAULT 'CHF',
        "show_currency_symbol" boolean NOT NULL DEFAULT true,
        "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
        "updated_by" text
      );
    `);

    // Create index
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "system_settings_id_idx" ON "system_settings" ("id");
    `);

    // Insert default settings
    await db.execute(sql`
      INSERT INTO "system_settings" (id, language, time_zone, date_format, currency, show_currency_symbol)
      VALUES ('system', 'English', 'Europe/Zurich', 'DD/MM/YYYY', 'CHF', true)
      ON CONFLICT ("id") DO NOTHING;
    `);

    console.log('✅ system_settings table created successfully!');
    console.log('Default settings inserted.');
  } catch (error) {
    console.error('❌ Error creating system_settings table:', error);
    process.exit(1);
  }
}

addSettingsTable()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
