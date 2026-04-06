/**
 * Script to add use_special_calculation column to menu_categories table
 * Run with: npx tsx scripts/add-use-special-calculation-column.ts
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env
dotenv.config({ path: resolve(process.cwd(), '.env') });

import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function addUseSpecialCalculationColumn() {
  try {
    console.log('🔧 Adding use_special_calculation column to menu_categories table...');

    await db.execute(sql`
      ALTER TABLE menu_categories
      ADD COLUMN IF NOT EXISTS use_special_calculation boolean DEFAULT false;
    `);

    console.log('✅ use_special_calculation column added successfully!');
    console.log('   The column is now available in the database.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding column:', error);
    process.exit(1);
  }
}

addUseSpecialCalculationColumn();
