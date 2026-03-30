/**
 * Script to add vegan_count column to booking_checkins table
 * Run with: npx tsx scripts/add-vegan-count-column.ts
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env
dotenv.config({ path: resolve(process.cwd(), '.env') });

import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function addVeganCountColumn() {
  try {
    console.log('🔧 Adding vegan_count column to booking_checkins table...');

    await db.execute(sql`
      ALTER TABLE booking_checkins
      ADD COLUMN IF NOT EXISTS vegan_count integer;
    `);

    console.log('✅ vegan_count column added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding column:', error);
    process.exit(1);
  }
}

addVeganCountColumn();
