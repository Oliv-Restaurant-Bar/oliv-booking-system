/**
 * Script to add billing_address column to bookings table
 * Run with: npx tsx scripts/add-billing-address-column.ts
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env
dotenv.config({ path: resolve(process.cwd(), '.env') });

import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function addBillingAddressColumn() {
  try {
    console.log('🔧 Adding billing_address column to bookings table...');

    await db.execute(sql`
      ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS billing_address text;
    `);

    console.log('✅ billing_address column added successfully!');
    console.log('   The column is now available in the database.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding column:', error);
    process.exit(1);
  }
}

addBillingAddressColumn();
