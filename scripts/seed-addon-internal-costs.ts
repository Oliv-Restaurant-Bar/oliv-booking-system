/**
 * Script to populate internal_cost for all existing addon items.
 * Logic: Random value between 2 and (price - 1).
 * Run with: npx tsx scripts/seed-addon-internal-costs.ts
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env
dotenv.config({ path: resolve(process.cwd(), '.env') });

import { db } from '../lib/db';
import { addonItems } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

async function seedAddonInternalCosts() {
  try {
    console.log('🌱 Starting to seed internal costs for addon items...');

    // Fetch all addon items
    const allItems = await db.select().from(addonItems);
    console.log(`Found ${allItems.length} addon items to update.`);

    let updatedCount = 0;

    for (const item of allItems) {
      const price = parseFloat(item.price || '0');
      
      if (price === 0) {
        console.log(`Skipping item "${item.name}" (ID: ${item.id}) due to zero price.`);
        continue;
      }

      const minVal = 2; // Addons are typically cheaper, so starting from 2
      const maxVal = Math.max(minVal, price - 1);
      
      // Generate random value between minVal and maxVal
      const randomCost = Math.floor(Math.random() * (maxVal - minVal + 1) + minVal);
      
      // Safety check: ensure cost doesn't exceed price
      const finalCost = Math.min(randomCost, price * 0.7).toFixed(2);

      await db.update(addonItems)
        .set({ internalCost: finalCost })
        .where(eq(addonItems.id, item.id));
      
      updatedCount++;
    }

    console.log(`✅ Successfully updated ${updatedCount} addon items with internal costs.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding internal costs:', error);
    process.exit(1);
  }
}

seedAddonInternalCosts();
