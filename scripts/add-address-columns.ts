/**
 * Script to add missing address and event columns to bookings table
 * Run with: npx tsx scripts/add-address-columns.ts
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env as soon as possible
dotenv.config({ path: resolve(process.cwd(), '.env') });

import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function addAddressColumns() {
  try {
    console.log('🔧 Adding missing columns to bookings table...');

    const columnsToAdd = [
      { name: 'street', type: 'text' },
      { name: 'plz', type: 'text' },
      { name: 'business', type: 'text' },
      { name: 'occasion', type: 'text' },
      { name: 'reference', type: 'text' },
      { name: 'payment_method', type: 'text' },
      { name: 'use_same_address_for_billing', type: 'boolean DEFAULT true' },
      { name: 'billing_street', type: 'text' },
      { name: 'billing_plz', type: 'text' },
      { name: 'billing_location', type: 'text' },
      { name: 'billing_reference', type: 'text' }
    ];

    for (const col of columnsToAdd) {
      console.log(`   Adding column: ${col.name}...`);
      try {
        await db.execute(sql.raw(`
          ALTER TABLE bookings
          ADD COLUMN IF NOT EXISTS ${col.name} ${col.type};
        `));
        console.log(`   ✅ ${col.name} added.`);
      } catch (err: any) {
        if (err.message?.includes('already exists')) {
          console.log(`   ℹ️ ${col.name} already exists.`);
        } else {
          throw err;
        }
      }
    }

    console.log('\n✅ All columns added successfully!');
    console.log('   The database schema is now up to date.');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error adding columns:', error);
    process.exit(1);
  }
}

addAddressColumns();
