/**
 * Script to add missing columns to menu_items table
 * Run with: npx tsx scripts/update-menu-items-schema.ts
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env
dotenv.config({ path: resolve(process.cwd(), '.env') });

import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function updateMenuItemsSchema() {
  try {
    console.log('🔧 Updating menu_items table schema...');

    // Add is_recommended column
    console.log('  → Adding is_recommended column...');
    await db.execute(sql`
      ALTER TABLE menu_items 
      ADD COLUMN IF NOT EXISTS is_recommended boolean NOT NULL DEFAULT false;
    `);

    console.log('✅ menu_items table updated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating table:', error);
    process.exit(1);
  }
}

updateMenuItemsSchema();
