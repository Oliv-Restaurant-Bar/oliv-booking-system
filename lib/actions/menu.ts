'use server';

import { db } from "@/lib/db";
import { menuCategories, menuItems, menuItemDependencies, addons, addonGroups, addonItems, categoryAddonGroups, itemAddonGroups } from "@/lib/db/schema";
import { eq, asc, and, isNull } from "drizzle-orm";
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
  useSpecialCalculation?: boolean;
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
        useSpecialCalculation: input.useSpecialCalculation ?? false,
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

    // ✅ SECURITY FIX: Whitelist allowed fields to prevent mass assignment
    const allowedFields: Array<'name' | 'nameDe' | 'description' | 'descriptionDe' | 'sortOrder' | 'isActive' | 'useSpecialCalculation'> = [
      'name',
      'nameDe',
      'description',
      'descriptionDe',
      'sortOrder',
      'isActive',
      'useSpecialCalculation',
    ];

    const sanitizedUpdates: any = {};
    for (const field of allowedFields) {
      if (field in updates) {
        sanitizedUpdates[field] = updates[field];
      }
    }

    // Prevent changing immutable fields
    delete (sanitizedUpdates as any).id;
    delete (sanitizedUpdates as any).createdAt;
    delete (sanitizedUpdates as any).deletedAt;

    const [category] = await db
      .update(menuCategories)
      .set({ ...sanitizedUpdates, updatedAt: new Date() })
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

    // Soft delete: Set deleted_at timestamp instead of actually deleting
    await db
      .update(menuCategories)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(menuCategories.id, id));

    revalidatePath("/admin/menu-config");

    return { success: true };
  } catch (error) {
    console.error("Error deleting menu category:", error);
    return { success: false, error: "Failed to delete menu category" };
  }
}

export async function updateMenuCategoryOrder(orderedIds: string[]) {
  try {
    await requirePermissionWrapper(Permission.EDIT_MENU_CATEGORY);

    await db.transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx
          .update(menuCategories)
          .set({ sortOrder: i, updatedAt: new Date() })
          .where(eq(menuCategories.id, orderedIds[i]));
      }
    });

    revalidatePath("/admin/menu-config");
    return { success: true };
  } catch (error) {
    console.error("Error updating menu category order:", error);
    return { success: false, error: "Failed to update category order" };
  }
}

export async function getMenuCategories() {
  try {
    const categories = await db
      .select()
      .from(menuCategories)
      .where(and(eq(menuCategories.isActive, true), isNull(menuCategories.deletedAt)))
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
    // Require VIEW_MENU permission
    await requirePermissionWrapper(Permission.VIEW_MENU);

    const categories = await db
      .select()
      .from(menuCategories)
      .where(isNull(menuCategories.deletedAt))  // Exclude deleted
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
  sortOrder?: number;
  variants?: any[];
  dietaryType?: "veg" | "non-veg" | "vegan" | "none";
  dietaryTags?: string[];
  ingredients?: string;
  allergens?: string[];
  additives?: string[];
  averageConsumption?: number;
  nutritionalInfo?: {
    servingSize: string;
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
    sugar: string;
    sodium: string;
  };
}) {
  try {
    // Require CREATE_MENU_ITEM permission
    await requirePermissionWrapper(Permission.CREATE_MENU_ITEM);

    const allowedFields: Array<keyof typeof menuItems.$inferInsert> = [
      'categoryId',
      'name',
      'nameDe',
      'description',
      'descriptionDe',
      'pricePerPerson',
      'pricingType',
      'averageConsumption',
      'imageUrl',
      'isActive',
      'variants',
      'dietaryType',
      'dietaryTags',
      'ingredients',
      'allergens',
      'additives',
      'nutritionalInfo',
      'sortOrder'
    ];

    const sanitizedInput: any = {};
    for (const field of allowedFields) {
      if (field in input) {
        sanitizedInput[field] = input[field as keyof typeof input];
      }
    }

    // Ensure pricePerPerson is string
    if (sanitizedInput.pricePerPerson !== undefined && sanitizedInput.pricePerPerson !== null) {
      sanitizedInput.pricePerPerson = sanitizedInput.pricePerPerson.toString();
    }

    const [item] = await db
      .insert(menuItems)
      .values({
        id: randomUUID(),
        ...sanitizedInput,
        pricingType: sanitizedInput.pricingType || "per_person",
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
    // Require EDIT_MENU_ITEM permission
    await requirePermissionWrapper(Permission.EDIT_MENU_ITEM);

    const allowedFields: Array<keyof typeof menuItems.$inferInsert> = [
      'categoryId',
      'name',
      'nameDe',
      'description',
      'descriptionDe',
      'pricePerPerson',
      'pricingType',
      'averageConsumption',
      'imageUrl',
      'isActive',
      'variants',
      'dietaryType',
      'dietaryTags',
      'ingredients',
      'allergens',
      'additives',
      'nutritionalInfo',
      'sortOrder'
    ];

    const sanitizedUpdates: any = {};
    for (const field of allowedFields) {
      if (field in updates) {
        sanitizedUpdates[field] = updates[field];
      }
    }

    // Ensure pricePerPerson is string if provided
    if (sanitizedUpdates.pricePerPerson !== undefined && sanitizedUpdates.pricePerPerson !== null) {
      sanitizedUpdates.pricePerPerson = sanitizedUpdates.pricePerPerson.toString();
    }

    const [item] = await db
      .update(menuItems)
      .set({
        ...sanitizedUpdates,
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
    // Require DELETE_MENU_ITEM permission
    await requirePermissionWrapper(Permission.DELETE_MENU_ITEM);

    // Soft delete: Set deleted_at timestamp instead of actually deleting
    await db
      .update(menuItems)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(menuItems.id, id));

    revalidatePath("/admin/menu-config");

    return { success: true };
  } catch (error) {
    console.error("Error deleting menu item:", error);
    return { success: false, error: "Failed to delete menu item" };
  }
}

export async function updateMenuItemOrder(orderedIds: string[]) {
  try {
    await requirePermissionWrapper(Permission.EDIT_MENU_ITEM);

    await db.transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx
          .update(menuItems)
          .set({ sortOrder: i, updatedAt: new Date() })
          .where(eq(menuItems.id, orderedIds[i]));
      }
    });

    revalidatePath("/admin/menu-config");
    return { success: true };
  } catch (error) {
    console.error("Error updating menu item order:", error);
    return { success: false, error: "Failed to update item order" };
  }
}

export async function getMenuItems(categoryId?: string) {
  try {
    const conditions = [
      eq(menuItems.isActive, true),
      isNull(menuItems.deletedAt)  // Exclude deleted
    ];

    if (categoryId) {
      conditions.push(eq(menuItems.categoryId, categoryId));
    }

    const items = await db
      .select()
      .from(menuItems)
      .where(and(...conditions))
      .orderBy(asc(menuItems.sortOrder));

    const mappedItems = items.map(item => ({
      ...item,
      price: parseFloat(item.pricePerPerson),
      image: item.imageUrl
    }));

    return { success: true, data: mappedItems };
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return { success: false, error: "Failed to fetch menu items", data: [] };
  }
}

// Get ALL menu items (including inactive ones) - for admin panel
export async function getAllMenuItems(categoryId?: string) {
  try {
    // Require VIEW_MENU permission
    await requirePermissionWrapper(Permission.VIEW_MENU);

    const items = await db
      .select()
      .from(menuItems)
      .where(
        categoryId
          ? and(eq(menuItems.categoryId, categoryId), isNull(menuItems.deletedAt))
          : isNull(menuItems.deletedAt)
      )
      .orderBy(asc(menuItems.sortOrder));

    const mappedItems = items.map(item => ({
      ...item,
      price: parseFloat(item.pricePerPerson),
      image: item.imageUrl
    }));

    return { success: true, data: mappedItems };
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

    const mappedItem = {
      ...item,
      price: parseFloat(item.pricePerPerson),
      image: item.imageUrl
    };

    return { success: true, data: mappedItem };
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
    // Require CREATE_ADDON permission
    await requirePermissionWrapper(Permission.CREATE_ADDON);

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
    // Require EDIT_ADDON permission
    await requirePermissionWrapper(Permission.EDIT_ADDON);

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
    // Require DELETE_ADDON permission
    await requirePermissionWrapper(Permission.DELETE_ADDON);

    // Soft delete: Set deleted_at timestamp instead of actually deleting
    await db
      .update(addons)
      .set({ deletedAt: new Date() })
      .where(eq(addons.id, id));

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
      .where(and(eq(addons.isActive, true), isNull(addons.deletedAt)));

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
    const addonGroupsResult = await getAddonGroups();
    const addonItemsResult = await getAddonItems();

    // Fetch active assignments
    const categoryAddons = await db.select().from(categoryAddonGroups);
    const itemAddons = await db.select().from(itemAddonGroups);

    // Map assignments for quick lookup
    const categoryAddonsMap = new Map<string, string[]>();
    categoryAddons.forEach(a => {
      if (a.categoryId && a.addonGroupId) {
        const existing = categoryAddonsMap.get(a.categoryId) || [];
        categoryAddonsMap.set(a.categoryId, [...existing, a.addonGroupId]);
      }
    });

    const itemAddonsMap = new Map<string, string[]>();
    itemAddons.forEach(a => {
      if (a.itemId && a.addonGroupId) {
        const existing = itemAddonsMap.get(a.itemId) || [];
        itemAddonsMap.set(a.itemId, [...existing, a.addonGroupId]);
      }
    });

    // Merge assignments into categories and items
    const categoriesWithAddons = categoriesResult.data.map(cat => ({
      ...cat,
      assignedAddonGroups: categoryAddonsMap.get(cat.id) || [],
    }));

    const itemsWithAddons = itemsResult.data.map(item => ({
      ...item,
      assignedAddonGroups: itemAddonsMap.get(item.id) || [],
    }));

    // Group items by category (using merged items)
    const itemsByCategory = new Map();
    itemsWithAddons.forEach((item: any) => {
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
      categories: categoriesWithAddons,
      items: itemsWithAddons,
      addons: addonsResult.data,
      addonGroups: addonGroupsResult.data || [],
      addonItems: addonItemsResult.data || [],
      itemsByCategory: Object.fromEntries(itemsByCategory),
      addonItemsByGroup: Object.fromEntries(addonItemsByGroup),
      categoryAddonGroups: categoryAddons,
      itemAddonGroups: itemAddons,
    };
  } catch (error) {
    console.error("Error fetching complete menu data:", error);
    return {
      categories: [],
      items: [],
      addons: [],
      addonGroups: [],
      addonItems: [],
      itemsByCategory: {},
      addonItemsByGroup: {},
      categoryAddonGroups: [],
      itemAddonGroups: [],
    };
  }
}

// Get ALL menu data (including inactive categories/items) - for admin panel
export async function getAllMenuData() {
  try {
    // Require VIEW_MENU permission
    await requirePermissionWrapper(Permission.VIEW_MENU);

    const categoriesResult = await getAllMenuCategories();
    const itemsResult = await getAllMenuItems();
    const addonsResult = await getAddons();
    const addonGroupsResult = await getAllAddonGroups();
    const addonItemsResult = await getAllAddonItems();

    // Fetch all assignments without requiring a new standalone function
    const categoryAddons = await db.select().from(categoryAddonGroups);
    const itemAddons = await db.select().from(itemAddonGroups);

    if (!categoriesResult.success || !itemsResult.success || !addonsResult.success) {
      throw new Error("Failed to fetch all menu data");
    }

    // Map assignments for quick lookup
    const categoryAddonsMap = new Map<string, string[]>();
    categoryAddons.forEach(a => {
      if (a.categoryId && a.addonGroupId) {
        const existing = categoryAddonsMap.get(a.categoryId) || [];
        categoryAddonsMap.set(a.categoryId, [...existing, a.addonGroupId]);
      }
    });

    const itemAddonsMap = new Map<string, string[]>();
    itemAddons.forEach(a => {
      if (a.itemId && a.addonGroupId) {
        const existing = itemAddonsMap.get(a.itemId) || [];
        itemAddonsMap.set(a.itemId, [...existing, a.addonGroupId]);
      }
    });

    // Merge assignments into categories and items
    const categoriesWithAddons = categoriesResult.data.map(cat => ({
      ...cat,
      assignedAddonGroups: categoryAddonsMap.get(cat.id) || [],
    }));

    const itemsWithAddons = itemsResult.data.map(item => ({
      ...item,
      assignedAddonGroups: itemAddonsMap.get(item.id) || [],
    }));

    // Group items by category (using merged items)
    const itemsByCategory = new Map();
    itemsWithAddons.forEach((item: any) => {
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
      categories: categoriesWithAddons,
      items: itemsWithAddons,
      addons: addonsResult.data,
      addonGroups: addonGroupsResult.data || [],
      addonItems: addonItemsResult.data || [],
      itemsByCategory: Object.fromEntries(itemsByCategory),
      addonItemsByGroup: Object.fromEntries(addonItemsByGroup),
      categoryAddonGroups: categoryAddons,
      itemAddonGroups: itemAddons,
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
      categoryAddonGroups: [],
      itemAddonGroups: [],
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
    // Require CREATE_ADDON permission
    await requirePermissionWrapper(Permission.CREATE_ADDON);

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
    // Require EDIT_ADDON permission
    await requirePermissionWrapper(Permission.EDIT_ADDON);

    // ✅ SECURITY FIX: Whitelist allowed fields to prevent mass assignment
    const allowedFields: Array<'name' | 'nameDe' | 'description' | 'descriptionDe' | 'minSelect' | 'maxSelect' | 'isActive'> = [
      'name',
      'nameDe',
      'description',
      'descriptionDe',
      'minSelect',
      'maxSelect',
      'isActive',
    ];

    const sanitizedUpdates: Record<string, any> = {};
    for (const field of allowedFields) {
      if (field in updates) {
        sanitizedUpdates[field] = updates[field as keyof typeof updates];
      }
    }

    // Prevent changing immutable fields
    delete (sanitizedUpdates as any).id;
    delete (sanitizedUpdates as any).createdAt;
    delete (sanitizedUpdates as any).deletedAt;

    const [addonGroup] = await db
      .update(addonGroups)
      .set({ ...sanitizedUpdates, updatedAt: new Date() })
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
    // Require DELETE_ADDON permission
    await requirePermissionWrapper(Permission.DELETE_ADDON);

    await db.delete(addonGroups).where(eq(addonGroups.id, id));

    revalidatePath("/admin/menu-config");

    return { success: true };
  } catch (error) {
    console.error("Error deleting addon group:", error);
    return { success: false, error: "Failed to delete addon group" };
  }
}

export async function updateAddonGroupOrder(orderedIds: string[]) {
  try {
    await requirePermissionWrapper(Permission.EDIT_ADDON);

    await db.transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx
          .update(addonGroups)
          .set({ sortOrder: i, updatedAt: new Date() })
          .where(eq(addonGroups.id, orderedIds[i]));
      }
    });

    revalidatePath("/admin/menu-config");
    return { success: true };
  } catch (error) {
    console.error("Error updating addon group order:", error);
    return { success: false, error: "Failed to update group order" };
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
    // Require VIEW_MENU permission
    await requirePermissionWrapper(Permission.VIEW_MENU);

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
    // Require CREATE_ADDON permission
    await requirePermissionWrapper(Permission.CREATE_ADDON);

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
    // Require EDIT_ADDON permission
    await requirePermissionWrapper(Permission.EDIT_ADDON);

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
    // Require DELETE_ADDON permission
    await requirePermissionWrapper(Permission.DELETE_ADDON);

    await db.delete(addonItems).where(eq(addonItems.id, id));

    revalidatePath("/admin/menu-config");

    return { success: true };
  } catch (error) {
    console.error("Error deleting addon item:", error);
    return { success: false, error: "Failed to delete addon item" };
  }
}

export async function updateAddonItemOrder(orderedIds: string[]) {
  try {
    await requirePermissionWrapper(Permission.EDIT_ADDON);

    await db.transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx
          .update(addonItems)
          .set({ sortOrder: i, updatedAt: new Date() })
          .where(eq(addonItems.id, orderedIds[i]));
      }
    });

    revalidatePath("/admin/menu-config");
    return { success: true };
  } catch (error) {
    console.error("Error updating addon item order:", error);
    return { success: false, error: "Failed to update addon item order" };
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

    const mappedItems = items.map(item => ({
      ...item,
      price: parseFloat(item.price)
    }));

    return { success: true, data: mappedItems };
  } catch (error) {
    console.error("Error fetching addon items:", error);
    return { success: false, error: "Failed to fetch addon items", data: [] };
  }
}

export async function getAllAddonItems(addonGroupId?: string) {
  try {
    // Require VIEW_MENU permission
    await requirePermissionWrapper(Permission.VIEW_MENU);

    let query = db.select().from(addonItems);

    if (addonGroupId) {
      // @ts-ignore - neon-http driver type limitation
      query = query.where(eq(addonItems.addonGroupId, addonGroupId));
    }

    // @ts-ignore - neon-http doesn't support orderBy in this context
    const items = await query.orderBy(asc(addonItems.sortOrder));

    const mappedItems = items.map(item => ({
      ...item,
      price: parseFloat(item.price)
    }));

    return { success: true, data: mappedItems };
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
    // Require EDIT_MENU_CATEGORY permission
    await requirePermissionWrapper(Permission.EDIT_MENU_CATEGORY);

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
    // Require EDIT_MENU_CATEGORY permission
    await requirePermissionWrapper(Permission.EDIT_MENU_CATEGORY);

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
    // Require EDIT_MENU_CATEGORY permission
    await requirePermissionWrapper(Permission.EDIT_MENU_CATEGORY);

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

// ==================== ITEM ADDON GROUPS ====================

export async function assignAddonGroupToItem(input: {
  itemId: string;
  addonGroupId: string;
}) {
  try {
    // Require EDIT_MENU_ITEM permission
    await requirePermissionWrapper(Permission.EDIT_MENU_ITEM);

    const [assignment] = await db
      .insert(itemAddonGroups)
      .values({
        id: randomUUID(),
        ...input,
      })
      .returning();

    revalidatePath("/admin/menu-config");

    return { success: true, data: assignment };
  } catch (error) {
    console.error("Error assigning addon group to item:", error);
    return { success: false, error: "Failed to assign addon group to item" };
  }
}

export async function removeAddonGroupFromItem(itemId: string, addonGroupId: string) {
  try {
    // Require EDIT_MENU_ITEM permission
    await requirePermissionWrapper(Permission.EDIT_MENU_ITEM);

    await db
      .delete(itemAddonGroups)
      .where(and(eq(itemAddonGroups.itemId, itemId), eq(itemAddonGroups.addonGroupId, addonGroupId)));

    revalidatePath("/admin/menu-config");

    return { success: true };
  } catch (error) {
    console.error("Error removing addon group from item:", error);
    return { success: false, error: "Failed to remove addon group from item" };
  }
}

export async function updateItemAddonGroups(itemId: string, addonGroupIds: string[]) {
  try {
    // Require EDIT_MENU_ITEM permission
    await requirePermissionWrapper(Permission.EDIT_MENU_ITEM);

    // First, remove all existing assignments for this item
    await db.delete(itemAddonGroups).where(eq(itemAddonGroups.itemId, itemId));

    // Then, add new assignments
    if (addonGroupIds.length > 0) {
      await db.insert(itemAddonGroups).values(
        addonGroupIds.map((addonGroupId) => ({
          id: randomUUID(),
          itemId,
          addonGroupId,
        }))
      );
    }

    revalidatePath("/admin/menu-config");

    return { success: true };
  } catch (error) {
    console.error("Error updating item addon groups:", error);
    return { success: false, error: "Failed to update item addon groups" };
  }
}

export async function getItemAddonGroups(itemId: string) {
  try {
    const assignments = await db
      .select()
      .from(itemAddonGroups)
      .where(eq(itemAddonGroups.itemId, itemId));

    return { success: true, data: assignments };
  } catch (error) {
    console.error("Error fetching item addon groups:", error);
    return { success: false, error: "Failed to fetch item addon groups", data: [] };
  }
}
