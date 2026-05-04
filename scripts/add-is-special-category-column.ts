/**
 * Script to add is_special_category column to menu_categories table
 * Run with: npm run db:add-special-category
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env
dotenv.config({ path: resolve(process.cwd(), '.env') });

import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function updateMenuCategoriesSchema() {
  try {
    console.log('🔧 Updating menu_categories table schema...');

    // Add is_special_category column
    console.log('  → Adding is_special_category column...');
    await db.execute(sql`
      ALTER TABLE menu_categories 
      ADD COLUMN IF NOT EXISTS is_special_category boolean DEFAULT false;
    `);

    console.log('✅ menu_categories table updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating table:', error);
    process.exit(1);
  }
}

updateMenuCategoriesSchema();
