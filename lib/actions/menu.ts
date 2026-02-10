'use server';

import { db } from "@/lib/db";
import { menuCategories, menuItems, menuItemDependencies, addons } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

// Menu Categories
export async function createMenuCategory(input: {
  name: string;
  nameDe: string;
  description?: string;
  descriptionDe?: string;
  sortOrder?: number;
}) {
  try {
    const [category] = await db
      .insert(menuCategories)
      .values({
        id: randomUUID(),
        ...input,
        isActive: true,
      })
      .returning();

    revalidatePath("/admin/menu-config");

    return { success: true, data: category };
  } catch (error) {
    console.error("Error creating menu category:", error);
    return { success: false, error: "Failed to create menu category" };
  }
}

export async function updateMenuCategory(id: string, updates: Partial<typeof menuCategories.$inferInsert>) {
  try {
    const [category] = await db
      .update(menuCategories)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(menuCategories.id, id))
      .returning();

    revalidatePath("/admin/menu-config");

    return { success: true, data: category };
  } catch (error) {
    console.error("Error updating menu category:", error);
    return { success: false, error: "Failed to update menu category" };
  }
}

export async function deleteMenuCategory(id: string) {
  try {
    await db.delete(menuCategories).where(eq(menuCategories.id, id));

    revalidatePath("/admin/menu-config");

    return { success: true };
  } catch (error) {
    console.error("Error deleting menu category:", error);
    return { success: false, error: "Failed to delete menu category" };
  }
}

export async function getMenuCategories() {
  try {
    const categories = await db
      .select()
      .from(menuCategories)
      .where(eq(menuCategories.isActive, true))
      .orderBy(asc(menuCategories.sortOrder));

    return { success: true, data: categories };
  } catch (error) {
    console.error("Error fetching menu categories:", error);
    return { success: false, error: "Failed to fetch menu categories", data: [] };
  }
}

// Get ALL categories (including inactive ones) - for admin panel
export async function getAllMenuCategories() {
  try {
    const categories = await db
      .select()
      .from(menuCategories)
      .orderBy(asc(menuCategories.sortOrder));

    return { success: true, data: categories };
  } catch (error) {
    console.error("Error fetching all menu categories:", error);
    return { success: false, error: "Failed to fetch all menu categories", data: [] };
  }
}

// Menu Items
export async function createMenuItem(input: {
  categoryId: string;
  name: string;
  nameDe: string;
  description?: string;
  descriptionDe?: string;
  pricePerPerson: number;
  imageUrl?: string;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  sortOrder?: number;
}) {
  try {
    const [item] = await db
      .insert(menuItems)
      .values({
        id: randomUUID(),
        ...input,
        pricePerPerson: input.pricePerPerson.toString(),
        isActive: true,
      })
      .returning();

    revalidatePath("/admin/menu-config");

    return { success: true, data: item };
  } catch (error) {
    console.error("Error creating menu item:", error);
    return { success: false, error: "Failed to create menu item" };
  }
}

export async function updateMenuItem(id: string, updates: Partial<typeof menuItems.$inferInsert>) {
  try {
    const [item] = await db
      .update(menuItems)
      .set({
        ...updates,
        pricePerPerson: updates.pricePerPerson?.toString(),
        updatedAt: new Date(),
      })
      .where(eq(menuItems.id, id))
      .returning();

    revalidatePath("/admin/menu-config");

    return { success: true, data: item };
  } catch (error) {
    console.error("Error updating menu item:", error);
    return { success: false, error: "Failed to update menu item" };
  }
}

export async function deleteMenuItem(id: string) {
  try {
    await db.delete(menuItems).where(eq(menuItems.id, id));

    revalidatePath("/admin/menu-config");

    return { success: true };
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return { success: false, error: "Failed to delete menu item" };
  }
}

export async function getMenuItems(categoryId?: string) {
  try {
    let query = db
      .select()
      .from(menuItems)
      .where(eq(menuItems.isActive, true));

    if (categoryId) {
      // @ts-ignore - neon-http driver type limitation
      query = query.where(eq(menuItems.categoryId, categoryId));
    }

    // @ts-ignore - neon-http doesn't support orderBy in this context
    const items = await query.orderBy(asc(menuItems.sortOrder));

    return { success: true, data: items };
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return { success: false, error: "Failed to fetch menu items", data: [] };
  }
}

// Get ALL menu items (including inactive ones) - for admin panel
export async function getAllMenuItems(categoryId?: string) {
  try {
    let query = db
      .select()
      .from(menuItems);

    if (categoryId) {
      // @ts-ignore - neon-http driver type limitation
      query = query.where(eq(menuItems.categoryId, categoryId));
    }

    // @ts-ignore - neon-http doesn't support orderBy in this context
    const items = await query.orderBy(asc(menuItems.sortOrder));

    return { success: true, data: items };
  } catch (error) {
    console.error("Error fetching all menu items:", error);
    return { success: false, error: "Failed to fetch all menu items", data: [] };
  }
}

export async function getMenuItemById(id: string) {
  try {
    const [item] = await db.select().from(menuItems).where(eq(menuItems.id, id)).limit(1);

    if (!item) {
      return { success: false, error: "Menu item not found", data: null };
    }

    return { success: true, data: item };
  } catch (error) {
    console.error("Error fetching menu item:", error);
    return { success: false, error: "Failed to fetch menu item", data: null };
  }
}

// Addons
export async function createAddon(input: {
  name: string;
  nameDe: string;
  description?: string;
  descriptionDe?: string;
  price: number;
  pricingType: "per_person" | "per_item" | "flat_fee";
}) {
  try {
    const [addon] = await db
      .insert(addons)
      .values({
        id: randomUUID(),
        ...input,
        price: input.price.toString(),
        isActive: true,
      })
      .returning();

    revalidatePath("/admin/menu-config");

    return { success: true, data: addon };
  } catch (error) {
    console.error("Error creating addon:", error);
    return { success: false, error: "Failed to create addon" };
  }
}

export async function updateAddon(id: string, updates: Partial<typeof addons.$inferInsert>) {
  try {
    const [addon] = await db
      .update(addons)
      .set({
        ...updates,
        price: updates.price?.toString(),
      })
      .where(eq(addons.id, id))
      .returning();

    revalidatePath("/admin/menu-config");

    return { success: true, data: addon };
  } catch (error) {
    console.error("Error updating addon:", error);
    return { success: false, error: "Failed to update addon" };
  }
}

export async function deleteAddon(id: string) {
  try {
    await db.delete(addons).where(eq(addons.id, id));

    revalidatePath("/admin/menu-config");

    return { success: true };
  } catch (error) {
    console.error("Error deleting addon:", error);
    return { success: false, error: "Failed to delete addon" };
  }
}

export async function getAddons() {
  try {
    const addonList = await db
      .select()
      .from(addons)
      .where(eq(addons.isActive, true));

    return { success: true, data: addonList };
  } catch (error) {
    console.error("Error fetching addons:", error);
    return { success: false, error: "Failed to fetch addons", data: [] };
  }
}

export async function getCompleteMenuData() {
  try {
    const categoriesResult = await getMenuCategories();
    const itemsResult = await getMenuItems();
    const addonsResult = await getAddons();

    if (!categoriesResult.success || !itemsResult.success || !addonsResult.success) {
      throw new Error("Failed to fetch menu data");
    }

    // Group items by category
    const itemsByCategory = new Map();
    itemsResult.data.forEach((item: any) => {
      if (!itemsByCategory.has(item.categoryId)) {
        itemsByCategory.set(item.categoryId, []);
      }
      itemsByCategory.get(item.categoryId)!.push(item);
    });

    return {
      categories: categoriesResult.data,
      items: itemsResult.data,
      addons: addonsResult.data,
      itemsByCategory: Object.fromEntries(itemsByCategory),
    };
  } catch (error) {
    console.error("Error fetching complete menu data:", error);
    return {
      categories: [],
      items: [],
      addons: [],
      itemsByCategory: {},
    };
  }
}

// Get ALL menu data (including inactive categories/items) - for admin panel
export async function getAllMenuData() {
  try {
    const categoriesResult = await getAllMenuCategories();
    const itemsResult = await getAllMenuItems();
    const addonsResult = await getAddons();

    if (!categoriesResult.success || !itemsResult.success || !addonsResult.success) {
      throw new Error("Failed to fetch all menu data");
    }

    // Group items by category
    const itemsByCategory = new Map();
    itemsResult.data.forEach((item: any) => {
      if (!itemsByCategory.has(item.categoryId)) {
        itemsByCategory.set(item.categoryId, []);
      }
      itemsByCategory.get(item.categoryId)!.push(item);
    });

    return {
      categories: categoriesResult.data,
      items: itemsResult.data,
      addons: addonsResult.data,
      itemsByCategory: Object.fromEntries(itemsByCategory),
    };
  } catch (error) {
    console.error("Error fetching all menu data:", error);
    return {
      categories: [],
      items: [],
      addons: [],
      itemsByCategory: {},
    };
  }
}
