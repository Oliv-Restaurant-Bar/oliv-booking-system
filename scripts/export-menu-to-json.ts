/**
 * Export current menu data to JSON file
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { writeFileSync } from 'fs';
import { db, menuCategories, menuItems, addonGroups, addonItems, categoryAddonGroups, itemAddonGroups } from '../lib/db';
import { asc, and, isNull, eq } from 'drizzle-orm';

// Load environment variables
config({ path: resolve(process.cwd(), '.env') });

interface MenuExport {
  categories: Array<{
    id: string;
    name: string;
    nameDe: string;
    description: string | null;
    descriptionDe: string | null;
    sortOrder: number;
    isActive: boolean;
    guestCount: boolean;
  }>;
  items: Array<{
    id: string;
    categoryId: string | null;
    name: string;
    nameDe: string;
    description: string | null;
    descriptionDe: string | null;
    pricePerPerson: string;
    pricingType: string;
    averageConsumption: number | null;
    imageUrl: string | null;
    isActive: boolean;
    variants: any;
    isCombo: boolean;
    dietaryType: string;
    dietaryTags: string[];
    ingredients: string | null;
    allergens: string[];
    additives: string[];
    nutritionalInfo: any;
    sortOrder: number;
  }>;
  addonGroups: Array<{
    id: string;
    name: string;
    nameDe: string;
    subtitle: string | null;
    subtitleDe: string | null;
    minSelect: number;
    maxSelect: number;
    isRequired: boolean;
    sortOrder: number;
    isActive: boolean;
  }>;
  addonItems: Array<{
    id: string;
    addonGroupId: string | null;
    name: string;
    nameDe: string;
    description: string | null;
    descriptionDe: string | null;
    price: string;
    pricingType: string;
    dietaryType: string | null;
    isActive: boolean;
    sortOrder: number;
  }>;
  categoryAddonGroups: Array<{
    categoryId: string | null;
    addonGroupId: string | null;
  }>;
  itemAddonGroups: Array<{
    itemId: string | null;
    addonGroupId: string | null;
  }>;
  exportedAt: string;
  summary: {
    totalCategories: number;
    totalItems: number;
    totalAddonGroups: number;
    totalAddonItems: number;
  };
}

async function exportMenuToJson() {
  try {
    console.log('📤 Starting menu export to JSON...\n');

    // 1. Fetch all menu categories (excluding deleted)
    const categories = await db
      .select()
      .from(menuCategories)
      .where(isNull(menuCategories.deletedAt))
      .orderBy(asc(menuCategories.sortOrder));

    console.log(`✅ Found ${categories.length} categories`);

    // 2. Fetch all menu items (excluding deleted)
    const items = await db
      .select()
      .from(menuItems)
      .where(isNull(menuItems.deletedAt))
      .orderBy(asc(menuItems.sortOrder));

    console.log(`✅ Found ${items.length} menu items`);

    // 3. Fetch all addon groups
    const addonGroupsList = await db
      .select()
      .from(addonGroups)
      .orderBy(asc(addonGroups.sortOrder));

    console.log(`✅ Found ${addonGroupsList.length} addon groups`);

    // 4. Fetch all addon items
    const addonItemsList = await db
      .select()
      .from(addonItems)
      .orderBy(asc(addonItems.sortOrder));

    console.log(`✅ Found ${addonItemsList.length} addon items`);

    // 5. Fetch category-addon group assignments
    const categoryAddonGroupsList = await db
      .select()
      .from(categoryAddonGroups);

    console.log(`✅ Found ${categoryAddonGroupsList.length} category-addon group assignments`);

    // 6. Fetch item-addon group assignments
    const itemAddonGroupsList = await db
      .select()
      .from(itemAddonGroups);

    console.log(`✅ Found ${itemAddonGroupsList.length} item-addon group assignments`);

    // 7. Create export object
    const menuExport: MenuExport = {
      categories: categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        nameDe: cat.nameDe,
        description: cat.description,
        descriptionDe: cat.descriptionDe,
        sortOrder: cat.sortOrder,
        isActive: cat.isActive,
        guestCount: cat.guestCount,
      })),
      items: items.map(item => ({
        id: item.id,
        categoryId: item.categoryId,
        name: item.name,
        nameDe: item.nameDe,
        description: item.description,
        descriptionDe: item.descriptionDe,
        pricePerPerson: item.pricePerPerson,
        pricingType: item.pricingType,
        averageConsumption: item.averageConsumption,
        imageUrl: item.imageUrl,
        isActive: item.isActive,
        variants: item.variants,
        isCombo: item.isCombo,
        dietaryType: item.dietaryType,
        dietaryTags: item.dietaryTags || [],
        ingredients: item.ingredients,
        allergens: item.allergens || [],
        additives: item.additives || [],
        nutritionalInfo: item.nutritionalInfo,
        sortOrder: item.sortOrder,
      })),
      addonGroups: addonGroupsList.map(ag => ({
        id: ag.id,
        name: ag.name,
        nameDe: ag.nameDe,
        subtitle: ag.subtitle,
        subtitleDe: ag.subtitleDe,
        minSelect: ag.minSelect,
        maxSelect: ag.maxSelect,
        isRequired: ag.isRequired,
        sortOrder: ag.sortOrder,
        isActive: ag.isActive,
      })),
      addonItems: addonItemsList.map(ai => ({
        id: ai.id,
        addonGroupId: ai.addonGroupId,
        name: ai.name,
        nameDe: ai.nameDe,
        description: ai.description,
        descriptionDe: ai.descriptionDe,
        price: ai.price,
        pricingType: ai.pricingType,
        dietaryType: ai.dietaryType,
        isActive: ai.isActive,
        sortOrder: ai.sortOrder,
      })),
      categoryAddonGroups: categoryAddonGroupsList.map(cag => ({
        categoryId: cag.categoryId,
        addonGroupId: cag.addonGroupId,
      })),
      itemAddonGroups: itemAddonGroupsList.map(iag => ({
        itemId: iag.itemId,
        addonGroupId: iag.addonGroupId,
      })),
      exportedAt: new Date().toISOString(),
      summary: {
        totalCategories: categories.length,
        totalItems: items.length,
        totalAddonGroups: addonGroupsList.length,
        totalAddonItems: addonItemsList.length,
      },
    };

    // 8. Write to JSON file
    const outputPath = resolve(process.cwd(), 'menu-export.json');
    writeFileSync(outputPath, JSON.stringify(menuExport, null, 2), 'utf-8');

    console.log('\n🎉 Menu export completed successfully!');
    console.log(`📄 Exported to: ${outputPath}`);
    console.log('\n📊 Summary:');
    console.log(`   - Categories: ${menuExport.summary.totalCategories}`);
    console.log(`   - Menu Items: ${menuExport.summary.totalItems}`);
    console.log(`   - Addon Groups: ${menuExport.summary.totalAddonGroups}`);
    console.log(`   - Addon Items: ${menuExport.summary.totalAddonItems}`);
    console.log(`   - Category-Addon Assignments: ${menuExport.categoryAddonGroups.length}`);
    console.log(`   - Item-Addon Assignments: ${menuExport.itemAddonGroups.length}`);

  } catch (error) {
    console.error('❌ Error exporting menu:', error);
    throw error;
  }
}

// Run the export
exportMenuToJson()
  .then(() => {
    console.log('\n✅ Export completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Export failed:', error);
    process.exit(1);
  });
