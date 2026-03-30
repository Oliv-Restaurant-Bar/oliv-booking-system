/**
 * Diagnostic script to check table columns
 * Run with: npx dotenv -e .env -- tsx scripts/check-columns.ts
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env
dotenv.config({ path: resolve(process.cwd(), '.env') });

import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function checkColumns() {
  try {
    console.log('🔍 Checking booking_checkins table columns...');
    const result = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'booking_checkins'
      ORDER BY ordinal_position;
    `);
    
    console.log('Result found:', result.length, 'columns');
    result.forEach((col: any) => {
      console.log(`- ${col.column_name}: ${col.data_type}`);
    });

    // Also check menu_items for dietary_type
    console.log('\n🔍 Checking menu_items table columns for new dietary fields...');
    const menuResult = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'menu_items'
      AND column_name IN ('dietary_type', 'dietary_tags', 'ingredients', 'allergens', 'additives', 'nutritional_info')
      ORDER BY column_name;
    `);
    
    console.log('Result found:', menuResult.length, 'new columns');
    menuResult.forEach((col: any) => {
      console.log(`- ${col.column_name}: ${col.data_type}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error checking columns:', error);
    process.exit(1);
  }
}

checkColumns();
