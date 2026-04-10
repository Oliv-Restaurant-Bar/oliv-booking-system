/**
 * Script to add internal_cost column to menu_items table
 * Run with: npx tsx scripts/add-internal-cost-column.ts
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env
dotenv.config({ path: resolve(process.cwd(), '.env') });

import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function addInternalCostColumn() {
  try {
    console.log('🔧 Adding internal_cost column to menu_items table...');

    await db.execute(sql`
      ALTER TABLE menu_items
      ADD COLUMN IF NOT EXISTS internal_cost decimal(10, 2);
    `);

    console.log('✅ internal_cost column added successfully!');
    console.log('   The column is now available in the database.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding column:', error);
    process.exit(1);
  }
}

addInternalCostColumn();
