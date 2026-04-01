import { config } from "dotenv";
config({ path: ".env" });

import { db } from "@/lib/db";
import {
    menuCategories,
    menuItems,
    addonGroups,
    addonItems,
    categoryAddonGroups,
    itemAddonGroups,
} from "@/lib/db/schema";
import { randomUUID } from "crypto";
import * as fs from "fs";
import * as path from "path";

async function seed() {
    console.log("📂 Reading oliv-menu-import.json...");

    const jsonPath = path.join(process.cwd(), "oliv-menu-import.json");
    if (!fs.existsSync(jsonPath)) {
        console.error("❌ File not found: oliv-menu-import.json");
        process.exit(1);
    }

    const jsonRaw = fs.readFileSync(jsonPath, "utf-8");
    // Strip single-line comments (// ...) which are not valid JSON but present in the file
    const jsonClean = jsonRaw.replace(/\/\/.*$/gm, "");
    const data = JSON.parse(jsonClean);

    // Mapping of JSON IDs to newly generated UUIDs
    const idMap: Record<string, string> = {};

    const getUuid = (oldId: string) => {
        if (!idMap[oldId]) {
            idMap[oldId] = randomUUID();
        }
        return idMap[oldId];
    };

    try {
        console.log("🧹 Cleaning existing menu data...");
        // Order matters for deletion due to foreign keys
        await db.delete(itemAddonGroups);
        await db.delete(categoryAddonGroups);
        await db.delete(addonItems);
        await db.delete(addonGroups);
        await db.delete(menuItems);
        await db.delete(menuCategories);

        console.log("🌱 Seeding Categories...");
        for (const cat of data.categories) {
            await db.insert(menuCategories).values({
                id: getUuid(cat.id),
                name: cat.name,
                nameDe: cat.nameDe,
                description: cat.description,
                descriptionDe: cat.descriptionDe,
                sortOrder: cat.sortOrder || 0,
                isActive: cat.isActive !== false,
                guestCount: cat.guestCount === true,
            });
        }

        console.log("🌱 Seeding Addon Groups...");
        for (const ag of data.addonGroups) {
            await db.insert(addonGroups).values({
                id: getUuid(ag.id),
                name: ag.name,
                nameDe: ag.nameDe,
                subtitle: ag.subtitle,
                subtitleDe: ag.subtitleDe,
                minSelect: ag.minSelect ?? 0,
                maxSelect: ag.maxSelect ?? 1,
                isRequired: ag.isRequired === true,
                sortOrder: ag.sortOrder || 0,
                isActive: ag.isActive !== false,
            });
        }

        console.log("🌱 Seeding Menu Items...");
        for (const item of data.items) {
            await db.insert(menuItems).values({
                id: getUuid(item.id),
                categoryId: getUuid(item.categoryId),
                name: item.name,
                nameDe: item.nameDe,
                description: item.description,
                descriptionDe: item.descriptionDe,
                pricePerPerson: item.pricePerPerson.toString(),
                pricingType: item.pricingType || "per_person",
                averageConsumption: item.averageConsumption,
                imageUrl: item.imageUrl,
                isActive: item.isActive !== false,
                variants: item.variants || [],
                dietaryType: item.dietaryType || "none",
                dietaryTags: item.dietaryTags || [],
                ingredients: item.ingredients,
                allergens: item.allergens || [],
                additives: item.additives || [],
                nutritionalInfo: item.nutritionalInfo,
                sortOrder: item.sortOrder || 0,
            });
        }

        console.log("🌱 Seeding Addon Items...");
        for (const ai of data.addonItems) {
            await db.insert(addonItems).values({
                id: getUuid(ai.id),
                addonGroupId: getUuid(ai.addonGroupId),
                name: ai.name,
                nameDe: ai.nameDe,
                description: ai.description,
                descriptionDe: ai.descriptionDe,
                price: ai.price.toString(),
                pricingType: ai.pricingType || "per_person",
                dietaryType: ai.dietaryType,
                isActive: ai.isActive !== false,
                sortOrder: ai.sortOrder || 0,
            });
        }

        console.log("🔗 Linking Category Addon Groups...");
        for (const cag of data.categoryAddonGroups || []) {
            await db.insert(categoryAddonGroups).values({
                categoryId: getUuid(cag.categoryId),
                addonGroupId: getUuid(cag.addonGroupId),
            });
        }

        console.log("🔗 Linking Item Addon Groups...");
        for (const iag of data.itemAddonGroups || []) {
            await db.insert(itemAddonGroups).values({
                itemId: getUuid(iag.itemId),
                addonGroupId: getUuid(iag.addonGroupId),
            });
        }

        console.log("✅ Menu seeding completed successfully!");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
}

seed().then(() => process.exit(0));
