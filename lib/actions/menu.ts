'use server';

import { db } from "@/lib/db";
import { menuCategories, menuItems, menuItemDependencies, addons, addonGroups, addonItems, categoryAddonGroups } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { requireAuth, requirePermissionWrapper } from "@/lib/auth/rbac-middleware";
import { Permission } from "@/lib/auth/rbac";

// Menu Categories
export async function createMenuCategory(input: {
  name: string;
  nameDe: string;
  description?: string;
  descriptionDe?: string;
  sortOrder?: number;
}) {
  try {
    // Require CREATE_MENU_CATEGORY permission
    await requirePermissionWrapper(Permission.CREATE_MENU_CATEGORY);

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
    // Require EDIT_MENU_CATEGORY permission
    await requirePermissionWrapper(Permission.EDIT_MENU_CATEGORY);

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
    // Require DELETE_MENU_CATEGORY permission
    await requirePermissionWrapper(Permission.DELETE_MENU_CATEGORY);

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
    // Require VIEW_MENU permission
    await requirePermissionWrapper(Permission.VIEW_MENU);

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
  pricingType?: "per_person" | "flat_fee" | "billed_by_consumption";
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
        pricingType: input.pricingType || "per_person",
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

// Addons (old table - deprecated, use addon_groups and addon_items instead)
export async function createAddon(input: {
  name: string;
  nameDe: string;
  description?: string;
  descriptionDe?: string;
  price: number;
  pricingType: "per_person" | "flat_fee" | "billed_by_consumption";
}) {
  try {
    const [addon] = await db
      .insert(addons)
      .values({
        id: randomUUID(),
        name: input.name,
        nameDe: input.nameDe,
        description: input.description,
        descriptionDe: input.descriptionDe,
        price: input.price.toString(),
        pricingType: input.pricingType,
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
    const addonGroupsResult = await getAllAddonGroups();
    const addonItemsResult = await getAllAddonItems();

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

    // Group addon items by addon group
    const addonItemsByGroup = new Map();
    if (addonItemsResult.success) {
      addonItemsResult.data.forEach((item: any) => {
        if (!addonItemsByGroup.has(item.addonGroupId)) {
          addonItemsByGroup.set(item.addonGroupId, []);
        }
        addonItemsByGroup.get(item.addonGroupId)!.push(item);
      });
    }

    return {
      categories: categoriesResult.data,
      items: itemsResult.data,
      addons: addonsResult.data,
      addonGroups: addonGroupsResult.data || [],
      addonItems: addonItemsResult.data || [],
      itemsByCategory: Object.fromEntries(itemsByCategory),
      addonItemsByGroup: Object.fromEntries(addonItemsByGroup),
    };
  } catch (error) {
    console.error("Error fetching all menu data:", error);
    return {
      categories: [],
      items: [],
      addons: [],
      addonGroups: [],
      addonItems: [],
      itemsByCategory: {},
      addonItemsByGroup: {},
    };
  }
}

// ==================== ADDON GROUPS ====================

export async function createAddonGroup(input: {
  name: string;
  nameDe: string;
  subtitle?: string;
  subtitleDe?: string;
  minSelect?: number;
  maxSelect?: number;
  isRequired?: boolean;
  sortOrder?: number;
}) {
  try {
    const [addonGroup] = await db
      .insert(addonGroups)
      .values({
        id: randomUUID(),
        ...input,
        isActive: true,
      })
      .returning();

    revalidatePath("/admin/menu-config");

    return { success: true, data: addonGroup };
  } catch (error) {
    console.error("Error creating addon group:", error);
    return { success: false, error: "Failed to create addon group" };
  }
}

export async function updateAddonGroup(id: string, updates: Partial<typeof addonGroups.$inferInsert>) {
  try {
    const [addonGroup] = await db
      .update(addonGroups)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(addonGroups.id, id))
      .returning();

    revalidatePath("/admin/menu-config");

    return { success: true, data: addonGroup };
  } catch (error) {
    console.error("Error updating addon group:", error);
    return { success: false, error: "Failed to update addon group" };
  }
}

export async function deleteAddonGroup(id: string) {
  try {
    await db.delete(addonGroups).where(eq(addonGroups.id, id));

    revalidatePath("/admin/menu-config");

    return { success: true };
  } catch (error) {
    console.error("Error deleting addon group:", error);
    return { success: false, error: "Failed to delete addon group" };
  }
}

export async function getAddonGroups() {
  try {
    const groups = await db
      .select()
      .from(addonGroups)
      .where(eq(addonGroups.isActive, true))
      .orderBy(asc(addonGroups.sortOrder));

    return { success: true, data: groups };
  } catch (error) {
    console.error("Error fetching addon groups:", error);
    return { success: false, error: "Failed to fetch addon groups", data: [] };
  }
}

export async function getAllAddonGroups() {
  try {
    const groups = await db
      .select()
      .from(addonGroups)
      .orderBy(asc(addonGroups.sortOrder));

    return { success: true, data: groups };
  } catch (error) {
    console.error("Error fetching all addon groups:", error);
    return { success: false, error: "Failed to fetch all addon groups", data: [] };
  }
}

// ==================== ADDON ITEMS ====================

export async function createAddonItem(input: {
  addonGroupId: string;
  name: string;
  nameDe: string;
  description?: string;
  descriptionDe?: string;
  price: number;
  pricingType?: "per_person" | "flat_fee" | "billed_by_consumption";
  dietaryType?: string;
  sortOrder?: number;
}) {
  try {
    const [addonItem] = await db
      .insert(addonItems)
      .values({
        id: randomUUID(),
        name: input.name,
        nameDe: input.nameDe,
        description: input.description,
        descriptionDe: input.descriptionDe,
        addonGroupId: input.addonGroupId,
        price: input.price.toString(),
        pricingType: input.pricingType || "per_person",
        dietaryType: input.dietaryType,
        sortOrder: input.sortOrder,
        isActive: true,
      })
      .returning();

    revalidatePath("/admin/menu-config");

    return { success: true, data: addonItem };
  } catch (error) {
    console.error("Error creating addon item:", error);
    return { success: false, error: "Failed to create addon item" };
  }
}

export async function updateAddonItem(id: string, updates: Partial<typeof addonItems.$inferInsert>) {
  try {
    const [addonItem] = await db
      .update(addonItems)
      .set({
        ...updates,
        price: updates.price?.toString(),
        updatedAt: new Date(),
      })
      .where(eq(addonItems.id, id))
      .returning();

    revalidatePath("/admin/menu-config");

    return { success: true, data: addonItem };
  } catch (error) {
    console.error("Error updating addon item:", error);
    return { success: false, error: "Failed to update addon item" };
  }
}

export async function deleteAddonItem(id: string) {
  try {
    await db.delete(addonItems).where(eq(addonItems.id, id));

    revalidatePath("/admin/menu-config");

    return { success: true };
  } catch (error) {
    console.error("Error deleting addon item:", error);
    return { success: false, error: "Failed to delete addon item" };
  }
}

export async function getAddonItems(addonGroupId?: string) {
  try {
    let query = db
      .select()
      .from(addonItems)
      .where(eq(addonItems.isActive, true));

    if (addonGroupId) {
      // @ts-ignore - neon-http driver type limitation
      query = query.where(eq(addonItems.addonGroupId, addonGroupId));
    }

    // @ts-ignore - neon-http doesn't support orderBy in this context
    const items = await query.orderBy(asc(addonItems.sortOrder));

    return { success: true, data: items };
  } catch (error) {
    console.error("Error fetching addon items:", error);
    return { success: false, error: "Failed to fetch addon items", data: [] };
  }
}

export async function getAllAddonItems(addonGroupId?: string) {
  try {
    let query = db.select().from(addonItems);

    if (addonGroupId) {
      // @ts-ignore - neon-http driver type limitation
      query = query.where(eq(addonItems.addonGroupId, addonGroupId));
    }

    // @ts-ignore - neon-http doesn't support orderBy in this context
    const items = await query.orderBy(asc(addonItems.sortOrder));

    return { success: true, data: items };
  } catch (error) {
    console.error("Error fetching all addon items:", error);
    return { success: false, error: "Failed to fetch all addon items", data: [] };
  }
}

// ==================== CATEGORY ADDON GROUPS ====================

export async function assignAddonGroupToCategory(input: {
  categoryId: string;
  addonGroupId: string;
}) {
  try {
    const [assignment] = await db
      .insert(categoryAddonGroups)
      .values({
        id: randomUUID(),
        ...input,
      })
      .returning();

    revalidatePath("/admin/menu-config");

    return { success: true, data: assignment };
  } catch (error) {
    console.error("Error assigning addon group to category:", error);
    return { success: false, error: "Failed to assign addon group to category" };
  }
}

export async function removeAddonGroupFromCategory(categoryId: string, addonGroupId: string) {
  try {
    await db
      .delete(categoryAddonGroups)
      .where(eq(categoryAddonGroups.categoryId, categoryId))
      // @ts-ignore
      .where(eq(categoryAddonGroups.addonGroupId, addonGroupId));

    revalidatePath("/admin/menu-config");

    return { success: true };
  } catch (error) {
    console.error("Error removing addon group from category:", error);
    return { success: false, error: "Failed to remove addon group from category" };
  }
}

export async function updateCategoryAddonGroups(categoryId: string, addonGroupIds: string[]) {
  try {
    // First, remove all existing assignments for this category
    await db.delete(categoryAddonGroups).where(eq(categoryAddonGroups.categoryId, categoryId));

    // Then, add new assignments
    if (addonGroupIds.length > 0) {
      await db.insert(categoryAddonGroups).values(
        addonGroupIds.map((addonGroupId) => ({
          id: randomUUID(),
          categoryId,
          addonGroupId,
        }))
      );
    }

    revalidatePath("/admin/menu-config");

    return { success: true };
  } catch (error) {
    console.error("Error updating category addon groups:", error);
    return { success: false, error: "Failed to update category addon groups" };
  }
}

export async function getCategoryAddonGroups(categoryId: string) {
  try {
    const assignments = await db
      .select()
      .from(categoryAddonGroups)
      .where(eq(categoryAddonGroups.categoryId, categoryId));

    return { success: true, data: assignments };
  } catch (error) {
    console.error("Error fetching category addon groups:", error);
    return { success: false, error: "Failed to fetch category addon groups", data: [] };
  }
}
