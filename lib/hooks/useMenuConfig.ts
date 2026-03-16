'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';

import {
  Category,
  AddonGroup,
  MenuItemData,
  VariantOption,
  AddonItem
} from '../types';
import {
  updateMenuCategory,
  deleteMenuCategory,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  createAddonGroup,
  updateAddonGroup,
  deleteAddonGroup,
  createAddonItem,
  updateAddonItem,
  deleteAddonItem,
  updateItemAddonGroups,
  createMenuCategory,
} from '@/lib/actions/menu';
import { handleImageUpload } from '../utils/menuUtils';

export function useMenuConfig() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [addonGroups, setAddonGroups] = useState<AddonGroup[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'items' | 'addons'>('items');

  // Modal & Dropdown states
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddMenuItemModalOpen, setIsAddMenuItemModalOpen] = useState(false);
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [openAddonGroupDropdownId, setOpenAddonGroupDropdownId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingMenuItemId, setEditingMenuItemId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [deleteMenuItemId, setDeleteMenuItemId] = useState<string | null>(null);
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);
  const [isItemSettingsModalOpen, setIsItemSettingsModalOpen] = useState(false);
  const [settingsMenuItemId, setSettingsMenuItemId] = useState<string | null>(null);
  const [isAddAddonItemModalOpen, setIsAddAddonItemModalOpen] = useState(false);
  const [editingAddonItemId, setEditingAddonItemId] = useState<string | null>(null);
  const [deleteAddonItemId, setDeleteAddonItemId] = useState<string | null>(null);
  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [isAddChoiceModalOpen, setIsAddChoiceModalOpen] = useState(false);

  // Forms states
  const [showItemSettings, setShowItemSettings] = useState(false);
  const [showAddons, setShowAddons] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const [pricingMode, setPricingMode] = useState<'price' | 'variants'>('price');

  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    image: null as File | null,
    imageUrl: '' as string,
  });

  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    pricingType: 'per_person' as 'per_person' | 'flat_fee' | 'billed_by_consumption',
    image: null as File | null,
    imageUrl: '' as string,
    isActive: true,
    variants: [] as VariantOption[],
    assignedAddonGroups: [] as string[],
    isCombo: false,
    averageConsumption: '' as string,
    dietaryType: 'none' as 'veg' | 'non-veg' | 'vegan' | 'none',
    dietaryTags: [] as string[],
    ingredients: '',
    allergens: [] as string[],
    additives: [] as string[],
    nutritionalInfo: {
      servingSize: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: '',
      sugar: '',
      sodium: '',
    },
  });

  const [newGroup, setNewGroup] = useState({
    name: '',
    subtitle: '',
    type: 'optional' as 'optional' | 'mandatory',
    minSelect: 0,
    maxSelect: 1,
  });

  const [newAddonItem, setNewAddonItem] = useState({
    name: '',
    price: '',
    dietaryType: 'none' as 'veg' | 'non-veg' | 'vegan' | 'none',
    isActive: true,
  });

  const [itemSettings, setItemSettings] = useState({
    dietaryType: 'none' as 'veg' | 'non-veg' | 'vegan' | 'none',
    dietaryTags: [] as string[],
    ingredients: '',
    allergens: [] as string[],
    additives: [] as string[],
    nutritionalInfo: {
      servingSize: '',
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: '',
      sugar: '',
      sodium: '',
    },
  });

  // Validation state placeholders (will be managed by useMenuValidation and passed here if needed, or initialized here)
  const [categoryErrors, setCategoryErrors] = useState<any>({});
  const [categoryTouched, setCategoryTouched] = useState<any>({});
  const [menuItemErrors, setMenuItemErrors] = useState<any>({});
  const [menuItemTouched, setMenuItemTouched] = useState<any>({});
  const [addonGroupErrors, setAddonGroupErrors] = useState<any>({});
  const [addonGroupTouched, setAddonGroupTouched] = useState<any>({});
  const [addonItemErrors, setAddonItemErrors] = useState<any>({});
  const [addonItemTouched, setAddonItemTouched] = useState<any>({});

  // Fetch data
  const fetchMenuData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/menu');
      if (response.ok) {
        const data = await response.json();
        const mappedCategories: Category[] = data.categories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description || '',
          image: cat.imageUrl || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop',
          isActive: cat.isActive,
          isExpanded: false,
          guestCount: cat.guestCount || false,
          items: data.itemsByCategory[cat.id]?.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            image: item.imageUrl || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop',
            price: Number(item.pricePerPerson) || 0,
            pricingType: item.pricingType || 'per_person',
            isActive: item.isActive,
            variants: item.variants || [],
            dietaryType: (cat.name === 'Beverages' || cat.name === 'Drinks') ? 'none' : (item.dietaryType || 'none'),
            dietaryTags: item.dietaryTags || [],
            ingredients: item.ingredients || '',
            allergens: item.allergens || [],
            additives: item.additives || [],
            nutritionalInfo: item.nutritionalInfo || {
              servingSize: '', calories: '', protein: '', carbs: '', fat: '', fiber: '', sugar: '', sodium: ''
            },
            assignedAddonGroups: (data.itemAddonGroups || []).filter((a: any) => a.itemId === item.id).map((a: any) => a.addonGroupId),
          })) || [],
          assignedAddonGroups: (data.categoryAddonGroups || []).filter((a: any) => a.categoryId === cat.id).map((a: any) => a.addonGroupId),
        }));
        setCategories(mappedCategories);

        const mappedAddonGroups: AddonGroup[] = data.addonGroups.map((group: any) => ({
          id: group.id,
          name: group.name,
          subtitle: group.subtitle || '',
          minSelect: group.minSelect,
          maxSelect: group.maxSelect,
          isRequired: group.minSelect > 0,
          isExpanded: false,
          isActive: group.isActive ?? true,
          items: data.addonItemsByGroup[group.id]?.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: Number(item.price),
            isActive: item.isActive,
            dietaryType: item.dietaryType || 'none',
          })) || [],
        }));
        setAddonGroups(mappedAddonGroups);
      }
    } catch (error) {
      console.error('Error fetching menu data:', error);
      toast.error('Failed to load menu data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMenuData();
  }, [fetchMenuData]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((cat) => cat.id === active.id);
      const newIndex = categories.findIndex((cat) => cat.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newCategories = [...categories];
        const [movedCategory] = newCategories.splice(oldIndex, 1);
        newCategories.splice(newIndex, 0, movedCategory);
        setCategories(newCategories);

        const updates = newCategories.map((cat, index) => ({
          id: cat.id,
          sortOrder: index,
        }));

        try {
          for (const update of updates) {
            await updateMenuCategory(update.id, { sortOrder: update.sortOrder });
          }
          console.log('✅ Category order updated');
        } catch (error) {
          console.error('Error updating category order:', error);
          setCategories(categories);
        }
      }
    }
  };

  // Handlers
  const toggleGroupExpanded = (groupId: string) => {
    setAddonGroups(prev => prev.map(group =>
      group.id === groupId ? { ...group, isExpanded: !group.isExpanded } : group
    ));
  };

  const toggleAddonGroupActive = async (groupId: string) => {
    const group = addonGroups.find(g => g.id === groupId);
    if (!group) return;

    const newActive = !group.isActive;
    setAddonGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, isActive: newActive } : g
    ));

    const result = await updateAddonGroup(groupId, { isActive: newActive } as any);
    if (!result.success) {
      setAddonGroups(prev => prev.map(g =>
        g.id === groupId ? { ...g, isActive: group.isActive } : g
      ));
      toast.error(result.error || 'Failed to update group');
    }
  };

  const toggleAddonItemActive = async (groupId: string, itemId: string) => {
    const group = addonGroups.find(g => g.id === groupId);
    const item = group?.items.find(i => i.id === itemId);
    if (!item) return;

    const newActive = !item.isActive;
    setAddonGroups(prev => prev.map(g =>
      g.id === groupId
        ? {
          ...g,
          items: g.items.map(i =>
            i.id === itemId ? { ...i, isActive: newActive } : i
          ),
        }
        : g
    ));

    const result = await updateAddonItem(itemId, { isActive: newActive } as any);
    if (!result.success) {
      setAddonGroups(prev => prev.map(g =>
        g.id === groupId
          ? {
            ...g,
            items: g.items.map(i =>
              i.id === itemId ? { ...i, isActive: item.isActive } : i
            ),
          }
          : g
      ));
      toast.error(result.error || 'Failed to update item');
    }
  };

  const duplicateAddonGroup = (groupId: string) => {
    const groupToDuplicate = addonGroups.find(g => g.id === groupId);
    if (groupToDuplicate) {
      const newGrp: AddonGroup = {
        ...groupToDuplicate,
        id: `addon-group-${Date.now()}`,
        name: `${groupToDuplicate.name} (Copy)`,
        items: groupToDuplicate.items.map(item => ({
          ...item,
          id: `addon-item-${Date.now()}-${Math.random()}`,
        })),
      };
      setAddonGroups(prev => [...prev, newGrp]);
    }
  };

  const toggleCategoryExpanded = (categoryId: string) => {
    setCategories(prev => prev.map(cat =>
      cat.id === categoryId ? { ...cat, isExpanded: !cat.isExpanded } : cat
    ));
  };

  const toggleCategoryActive = async (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;

    const newActive = !category.isActive;
    setCategories(prev => prev.map(cat =>
      cat.id === categoryId ? { ...cat, isActive: newActive } : cat
    ));

    const result = await updateMenuCategory(categoryId, { isActive: newActive });
    if (!result.success) {
      setCategories(prev => prev.map(cat =>
        cat.id === categoryId ? { ...cat, isActive: category.isActive } : cat
      ));
      toast.error(result.error || 'Failed to update category');
    } else {
      toast.success('Category visibility updated successfully');
    }
  };

  const toggleGuestCount = async (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;

    const newValue = !category.guestCount;
    const result = await updateMenuCategory(categoryId, { guestCount: newValue });
    if (result.success) {
      setCategories(prev => prev.map(cat =>
        cat.id === categoryId ? { ...cat, guestCount: newValue } : cat
      ));
      toast.success('Guest count setting updated successfully');
    } else {
      toast.error(result.error || 'Failed to update category');
    }
  };

  const toggleMenuItemActive = async (categoryId: string, itemId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    const item = category?.items.find(i => i.id === itemId);
    if (!item) return;

    const newActive = !item.isActive;
    setCategories(prev => prev.map(cat =>
      cat.id === categoryId
        ? {
          ...cat,
          items: cat.items.map(i =>
            i.id === itemId ? { ...i, isActive: newActive } : i
          ),
        }
        : cat
    ));

    const result = await updateMenuItem(itemId, { isActive: newActive });
    if (!result.success) {
      setCategories(prev => prev.map(cat =>
        cat.id === categoryId
          ? {
            ...cat,
            items: cat.items.map(i =>
              i.id === itemId ? { ...i, isActive: item.isActive } : i
            ),
          }
          : cat
      ));
      toast.error(result.error || 'Failed to update item');
    }
  };

  const handleSaveItemSettings = async () => {
    if (!settingsMenuItemId || !activeCategoryId) return;

    try {
      const result = await updateMenuItem(settingsMenuItemId, {
        dietaryType: itemSettings.dietaryType as any,
        dietaryTags: itemSettings.dietaryTags,
        ingredients: itemSettings.ingredients,
        allergens: itemSettings.allergens,
        additives: itemSettings.additives,
        nutritionalInfo: itemSettings.nutritionalInfo,
      });

      if (result.success) {
        setCategories(prev => prev.map(cat =>
          cat.id === activeCategoryId
            ? {
              ...cat,
              items: cat.items.map(item =>
                item.id === settingsMenuItemId
                  ? { ...item, ...itemSettings }
                  : item
              ),
            }
            : cat
        ));
        setIsItemSettingsModalOpen(false);
        setSettingsMenuItemId(null);
        setActiveCategoryId(null);
        toast.success('Item settings saved successfully');
      } else {
        toast.error(result.error || 'Failed to save settings');
      }
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const addVariant = () => {
    const newVariant: VariantOption = {
      id: `variant-${Date.now()}`,
      name: '',
      price: 0,
    };
    setNewMenuItem(prev => ({
      ...prev,
      variants: [...prev.variants, newVariant],
    }));
  };

  const updateVariant = (index: number, field: 'name' | 'price', value: string | number) => {
    const updatedVariants = [...newMenuItem.variants];
    updatedVariants[index] = { ...updatedVariants[index], [field]: value };
    setNewMenuItem(prev => ({ ...prev, variants: updatedVariants }));
  };

  const removeVariant = (index: number) => {
    setNewMenuItem(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
  };

  const handleToggleTag = (tag: string, field: 'dietaryTags' | 'allergens' | 'additives') => {
    const currentArray = newMenuItem[field];
    const newArray = currentArray.includes(tag)
      ? currentArray.filter(t => t !== tag)
      : [...currentArray, tag];

    setNewMenuItem(prev => ({ ...prev, [field]: newArray }));
  };

  const saveCategory = async () => {
    if (!newCategory.name) return;
    setLoading(true);
    try {
      const categoryData = {
        name: newCategory.name,
        nameDe: newCategory.name, // Simplified for now
        description: newCategory.description,
        descriptionDe: newCategory.description,
        imageUrl: newCategory.imageUrl,
        isActive: true,
      };

      if (editingCategoryId) {
        const result = await updateMenuCategory(editingCategoryId, categoryData);
        if (result.success) {
          setCategories(categories.map(cat => cat.id === editingCategoryId ? { ...cat, ...categoryData, image: newCategory.imageUrl } : cat));
          toast.success('Category updated successfully');
        } else {
          toast.error(result.error || 'Failed to update category');
        }
      } else {
        const result = await createMenuCategory({ ...categoryData, sortOrder: categories.length });
        if (result.success && result.data) {
          setCategories([...categories, { ...categoryData, id: result.data.id, image: newCategory.imageUrl, items: [], isActive: true, isExpanded: false, guestCount: false, assignedAddonGroups: [] }]);
          toast.success('Category created successfully');
        } else {
          toast.error(result.error || 'Failed to create category');
        }
      }
      setIsAddCategoryModalOpen(false);
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const saveMenuItem = async () => {
    if (!newMenuItem.name || !activeCategoryId) return;
    setLoading(true);
    try {
      const itemData: any = { // Using any temporarily to bypass strict Drizzle infer types during refactor
        categoryId: activeCategoryId,
        name: newMenuItem.name,
        nameDe: newMenuItem.name,
        description: newMenuItem.description,
        descriptionDe: newMenuItem.description,
        pricePerPerson: pricingMode === 'variants' ? "0" : newMenuItem.price,
        pricingType: newMenuItem.pricingType,
        imageUrl: newMenuItem.imageUrl,
        isActive: newMenuItem.isActive,
        variants: newMenuItem.variants,
        dietaryType: newMenuItem.dietaryType,
        dietaryTags: newMenuItem.dietaryTags,
        ingredients: newMenuItem.ingredients,
        allergens: newMenuItem.allergens,
        additives: newMenuItem.additives,
        nutritionalInfo: newMenuItem.nutritionalInfo,
        isCombo: newMenuItem.isCombo,
        averageConsumption: newMenuItem.averageConsumption ? parseInt(newMenuItem.averageConsumption) : undefined,
      };

      if (editingMenuItemId) {
        const result = await updateMenuItem(editingMenuItemId, itemData);
        if (result.success) {
          setCategories(categories.map(cat => {
            if (cat.id === activeCategoryId) {
              return {
                ...cat,
                items: cat.items.map(item => item.id === editingMenuItemId ? { ...item, ...itemData, image: newMenuItem.imageUrl, price: itemData.pricePerPerson } : item)
              };
            }
            return cat;
          }));
          await updateItemAddonGroups(editingMenuItemId, newMenuItem.assignedAddonGroups);
          toast.success('Menu item updated successfully');
        } else {
          toast.error(result.error || 'Failed to update menu item');
        }
      } else {
        const result = await createMenuItem(itemData);
        if (result.success && result.data) {
          const newItem = { ...itemData, id: result.data.id, image: newMenuItem.imageUrl, price: itemData.pricePerPerson, assignedAddonGroups: newMenuItem.assignedAddonGroups };
          setCategories(categories.map(cat => {
            if (cat.id === activeCategoryId) {
              return { ...cat, items: [...cat.items, newItem] };
            }
            return cat;
          }));
          await updateItemAddonGroups(result.data.id, newMenuItem.assignedAddonGroups);
          toast.success('Menu item created successfully');
        } else {
          toast.error(result.error || 'Failed to create menu item');
        }
      }
      setIsAddMenuItemModalOpen(false);
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const saveAddonGroup = async () => {
    if (!newGroup.name) return;
    try {
      const groupData = {
        name: newGroup.name,
        nameDe: newGroup.name,
        subtitle: newGroup.subtitle,
        subtitleDe: newGroup.subtitle,
        minSelect: newGroup.type === 'mandatory' ? newGroup.minSelect : 0,
        maxSelect: newGroup.maxSelect,
      };

      if (editingGroupId) {
        const result = await updateAddonGroup(editingGroupId, groupData);
        if (result.success) {
          setAddonGroups(addonGroups.map(g => g.id === editingGroupId ? { ...g, ...groupData, isRequired: groupData.minSelect > 0 } : g));
          toast.success('Group updated successfully');
        }
      } else {
        const result = await createAddonGroup(groupData);
        if (result.success && result.data) {
          setAddonGroups([...addonGroups, { ...groupData, id: result.data.id, isRequired: groupData.minSelect > 0, items: [], isExpanded: false, isActive: true }]);
          toast.success('Group created successfully');
        }
      }
      setIsAddGroupModalOpen(false);
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const saveAddonItem = async () => {
    if (!newAddonItem.name || !currentGroupId) return;
    try {
      const itemData = {
        addonGroupId: currentGroupId!,
        name: newAddonItem.name,
        nameDe: newAddonItem.name, // Placeholder for German
        price: Number(newAddonItem.price) || 0,
        dietaryType: newAddonItem.dietaryType,
        isActive: newAddonItem.isActive,
      };

      if (editingAddonItemId) {
        // @ts-ignore - price string vs number mismatch mid-refactor
        const result = await updateAddonItem(editingAddonItemId, itemData);
        if (result.success) {
          setAddonGroups(addonGroups.map(g => {
            if (g.id === currentGroupId) {
              return { ...g, items: g.items.map(i => i.id === editingAddonItemId ? { ...i, ...itemData, price: Number(itemData.price) } : i) };
            }
            return g;
          }));
          toast.success('Item updated successfully');
        }
      } else {
        const result = await createAddonItem(itemData);
        if (result.success && result.data) {
          const newItem = { ...itemData, id: result.data.id, price: Number(itemData.price) };
          setAddonGroups(addonGroups.map(g => {
            if (g.id === currentGroupId) {
              return { ...g, items: [...g.items, newItem] };
            }
            return g;
          }));
          toast.success('Item created successfully');
        }
      }
      setIsAddAddonItemModalOpen(false);
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const deleteCategory = async () => {
    if (!deleteCategoryId) return;
    try {
      const result = await deleteMenuCategory(deleteCategoryId);
      if (result.success) {
        setCategories(categories.filter(c => c.id !== deleteCategoryId));
        toast.success('Category deleted successfully');
      }
    } catch (error) {
      toast.error('Failed to delete category');
    } finally {
      setDeleteCategoryId(null);
    }
  };

  const deleteMenuItemHandler = async () => {
    if (!deleteMenuItemId) return;
    try {
      const result = await deleteMenuItem(deleteMenuItemId);
      if (result.success) {
        setCategories(categories.map(cat => ({
          ...cat,
          items: cat.items.filter(i => i.id !== deleteMenuItemId)
        })));
        toast.success('Item deleted successfully');
      }
    } catch (error) {
      toast.error('Failed to delete item');
    } finally {
      setDeleteMenuItemId(null);
    }
  };

  const deleteAddonGroupHandler = async () => {
    if (!deleteGroupId) return;
    try {
      const result = await deleteAddonGroup(deleteGroupId);
      if (result.success) {
        setAddonGroups(addonGroups.filter(g => g.id !== deleteGroupId));
        toast.success('Group deleted successfully');
      }
    } catch (error) {
      toast.error('Failed to delete group');
    } finally {
      setDeleteGroupId(null);
    }
  };

  const deleteAddonItemHandler = async () => {
    if (!deleteAddonItemId || !currentGroupId) return;
    try {
      const result = await deleteAddonItem(deleteAddonItemId);
      if (result.success) {
        setAddonGroups(addonGroups.map(g => {
          if (g.id === currentGroupId) {
            return { ...g, items: g.items.filter(i => i.id !== deleteAddonItemId) };
          }
          return g;
        }));
        toast.success('Item deleted successfully');
      }
    } catch (error) {
      toast.error('Failed to delete item');
    } finally {
      setDeleteAddonItemId(null);
      setCurrentGroupId(null);
    }
  };

  const duplicateMenuItem = async (categoryId: string, item: any) => {
    // Basic duplication logic
    try {
      const { id, ...itemData } = item;
      const result = await createMenuItem({ ...itemData, name: `${item.name} (Copy)`, categoryId });
      if (result.success && result.data) {
        fetchMenuData(); // Refresh all to be safe and simple
        toast.success('Item duplicated successfully');
      }
    } catch (error) {
      toast.error('Failed to duplicate item');
    }
  };

  const sensors_dnd = sensors; // Keep name consistency if needed

  return {
    // State
    loading,
    categories,
    setCategories,
    addonGroups,
    setAddonGroups,
    uploadingImage,
    setUploadingImage,
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,

    // Modals & Dropdowns
    isAddCategoryModalOpen, setIsAddCategoryModalOpen,
    isAddMenuItemModalOpen, setIsAddMenuItemModalOpen,
    isAddGroupModalOpen, setIsAddGroupModalOpen,
    openDropdownId, setOpenDropdownId,
    openAddonGroupDropdownId, setOpenAddonGroupDropdownId,
    editingCategoryId, setEditingCategoryId,
    editingMenuItemId, setEditingMenuItemId,
    editingGroupId, setEditingGroupId,
    deleteCategoryId, setDeleteCategoryId,
    deleteMenuItemId, setDeleteMenuItemId,
    deleteGroupId, setDeleteGroupId,
    isItemSettingsModalOpen, setIsItemSettingsModalOpen,
    settingsMenuItemId, setSettingsMenuItemId,
    isAddAddonItemModalOpen, setIsAddAddonItemModalOpen,
    editingAddonItemId, setEditingAddonItemId,
    deleteAddonItemId, setDeleteAddonItemId,
    currentGroupId, setCurrentGroupId,
    activeCategoryId, setActiveCategoryId,
    isAddChoiceModalOpen, setIsAddChoiceModalOpen,

    // Form states
    showItemSettings, setShowItemSettings,
    showAddons, setShowAddons,
    showChoices, setShowChoices,
    pricingMode, setPricingMode,
    newCategory, setNewCategory,
    newMenuItem, setNewMenuItem,
    newGroup, setNewGroup,
    newAddonItem, setNewAddonItem,
    itemSettings, setItemSettings,

    // Validation states
    categoryErrors, setCategoryErrors,
    categoryTouched, setCategoryTouched,
    menuItemErrors, setMenuItemErrors,
    menuItemTouched, setMenuItemTouched,
    addonGroupErrors, setAddonGroupErrors,
    addonGroupTouched, setAddonGroupTouched,
    addonItemErrors, setAddonItemErrors,
    addonItemTouched, setAddonItemTouched,

    // Methods
    sensors,
    handleDragEnd,
    toggleGroupExpanded,
    toggleAddonGroupActive,
    toggleAddonItemActive,
    duplicateAddonGroup,
    toggleCategoryExpanded,
    toggleCategoryActive,
    toggleGuestCount,
    toggleMenuItemActive,
    handleSaveItemSettings,
    addVariant,
    updateVariant,
    removeVariant,
    handleToggleTag,
    filteredCategories: categories.filter(cat =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.items.some(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    ),
    fetchMenuData,
    saveCategory,
    saveMenuItem,
    saveAddonGroup,
    saveAddonItem,
    deleteCategory,
    deleteMenuItemHandler,
    deleteAddonGroupHandler,
    deleteAddonItemHandler,
    duplicateMenuItem,
    handleImageUpload: (file: File) => handleImageUpload(file, setUploadingImage),
  };
}
