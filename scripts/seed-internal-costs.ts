/**
 * Script to populate internal_cost for all existing menu items.
 * Logic: Random value between 7 and (item_price - 3).
 * Run with: npx tsx scripts/seed-internal-costs.ts
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env
dotenv.config({ path: resolve(process.cwd(), '.env') });

import { db } from '../lib/db';
import { menuItems } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function seedInternalCosts() {
  try {
    console.log('🌱 Starting to seed internal costs for menu items...');

    // Fetch all menu items
    const allItems = await db.select().from(menuItems);
    console.log(`Found ${allItems.length} items to update.`);

    let updatedCount = 0;

    for (const item of allItems) {
      const price = parseFloat(item.pricePerPerson || '0');
      
      if (price === 0) {
        console.log(`Skipping item "${item.name}" (ID: ${item.id}) due to zero price.`);
        continue;
      }

      const minVal = 7;
      const maxVal = Math.max(minVal, price - 3);
      
      // Generate random value between minVal and maxVal
      // If price-3 is less than 7, it will default to 7
      const randomCost = Math.floor(Math.random() * (maxVal - minVal + 1) + minVal);
      
      // Ensure cost doesn't exceed price if price is very low (safety check)
      const finalCost = Math.min(randomCost, price * 0.8).toFixed(2);

      await db.update(menuItems)
        .set({ internalCost: finalCost })
        .where(eq(menuItems.id, item.id));
      
      updatedCount++;
    }

    console.log(`✅ Successfully updated ${updatedCount} menu items with internal costs.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding internal costs:', error);
    process.exit(1);
  }
}

seedInternalCosts();
