/**
 * Script to add internal_cost column to addon_items table
 * Run with: npx tsx scripts/add-addon-internal-cost-column.ts
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env
dotenv.config({ path: resolve(process.cwd(), '.env') });

import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function addAddonInternalCostColumn() {
  try {
    console.log('🔧 Adding internal_cost column to addon_items table...');

    await db.execute(sql`
      ALTER TABLE addon_items
      ADD COLUMN IF NOT EXISTS internal_cost decimal(10, 2);
    `);

    console.log('✅ internal_cost column added successfully to addon_items!');
    console.log('   The column is now available in the database.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding column:', error);
    process.exit(1);
  }
}

addAddonInternalCostColumn();
