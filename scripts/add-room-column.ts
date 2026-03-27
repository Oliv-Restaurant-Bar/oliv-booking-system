/**
 * Script to add 'room' column to leads and bookings tables
 * Run with: npx tsx scripts/add-room-column.ts
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env
dotenv.config({ path: resolve(process.cwd(), '.env') });

import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function addRoomColumn() {
  try {
    console.log('🔧 Adding room column to leads and bookings tables...');

    // Add to leads table
    await db.execute(sql`
      ALTER TABLE leads 
      ADD COLUMN IF NOT EXISTS room text;
    `);
    console.log('✅ room column added to leads table!');

    // Add to bookings table
    await db.execute(sql`
      ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS room text;
    `);
    console.log('✅ room column added to bookings table!');

    console.log('🎉 Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding room column:', error);
    process.exit(1);
  }
}

addRoomColumn();
