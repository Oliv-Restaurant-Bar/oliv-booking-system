import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

// Load environment variables from .env
import * as dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(process.cwd(), '.env') });

async function addVenueDescription() {
  try {
    console.log('Adding description column to venues table...');

    await db.execute(sql`
      ALTER TABLE venues
      ADD COLUMN IF NOT EXISTS description text;
    `);

    console.log('✅ Description column added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding column:', error);
    process.exit(1);
  }
}

addVenueDescription();
