/**
 * Script to add detailed billing fields to bookings table
 * Run with: npx tsx scripts/add-detailed-billing-fields-v2.ts
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env
dotenv.config({ path: resolve(process.cwd(), '.env') });

import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function addDetailedBillingFields() {
  try {
    console.log('🔧 Adding detailed billing fields to bookings table...');

    // Add all new billing columns if they don't exist
    await db.execute(sql`
      ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS use_same_address_for_billing BOOLEAN DEFAULT true,
      ADD COLUMN IF NOT EXISTS billing_street TEXT,
      ADD COLUMN IF NOT EXISTS billing_plz TEXT,
      ADD COLUMN IF NOT EXISTS billing_location TEXT,
      ADD COLUMN IF NOT EXISTS billing_business TEXT,
      ADD COLUMN IF NOT EXISTS billing_email TEXT,
      ADD COLUMN IF NOT EXISTS billing_reference TEXT;
    `);

    console.log('✅ Detailed billing fields added successfully!');
    console.log('   The following columns are now available:');
    console.log('   - use_same_address_for_billing');
    console.log('   - billing_street');
    console.log('   - billing_plz');
    console.log('   - billing_location');
    console.log('   - billing_business');
    console.log('   - billing_email');
    console.log('   - billing_reference');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding columns:', error);
    process.exit(1);
  }
}

addDetailedBillingFields();
