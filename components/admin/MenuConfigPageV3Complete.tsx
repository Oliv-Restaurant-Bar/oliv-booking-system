'use client';

import { useState, useEffect, useMemo } from 'react';
import { UtensilsCrossed, ListPlus, Calendar } from 'lucide-react';
import { useMenuConfigTranslation, useCommonTranslation } from '@/lib/i18n/client';
import { ConfirmationModal } from '../user/ConfirmationModal';
import { ItemSettingsModal } from '../user/ItemSettingsModal';
import { toast } from 'sonner';
import { SkeletonMenuConfig } from '@/components/ui/skeleton-loaders';
import {
  menuCategoryNameSchema,
  menuCategoryDescriptionSchema,
  menuItemNameSchema,
  menuItemDescriptionSchema,
  menuItemPriceSchema,
  menuItemIngredientsSchema,
  menuItemVariantNameSchema,
  menuItemVariantPriceSchema,
  nutritionalInfoValueSchema,
  addonGroupNameSchema,
  addonItemNameSchema,
  addonItemPriceSchema,
} from '@/lib/validation/schemas';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  sortableKeyboardCoordinates,
  useSortable,
} from '@dnd-kit/sortable';
import {
  createMenuCategory,
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
  updateCategoryAddonGroups,
  getAllAddonGroups,
  updateItemAddonGroups,
  updateMenuCategoryOrder,
  updateMenuItemOrder,
  updateAddonGroupOrder,
  updateAddonItemOrder,
  createVisibilitySchedule,
  updateVisibilitySchedule,
  deleteVisibilitySchedule,
  getAllVisibilitySchedules,
  updateCategoryVisibilitySchedules,
  updateItemVisibilitySchedules,
} from '@/lib/actions/menu';
import { Permission, hasPermission } from '@/lib/auth/rbac';
import { MenuItemData, Category, AddonGroup, AddonItem, VisibilitySchedule } from '@/lib/types';

// Extracted Components
import { AddCategoryModal } from './AddCategoryModal';
import { AddMenuItemModal } from './AddMenuItemModal';
import { AddChoiceModal } from './AddChoiceModal';
import { AddGroupModal } from './AddGroupModal';
import { AddAddonItemModal } from './AddAddonItemModal';
import { MenuCategoriesTab } from './MenuCategoriesTab';
import { ChoicesAddonsTab } from './ChoicesAddonsTab';
import { VisibilitiesTab } from './VisibilitiesTab';
import { AddVisibilityModal } from './AddVisibilityModal';
import { AssignVisibilityModal } from './AssignVisibilityModal';

function SortableCategory({
  id,
  children,
}: {
  id: string;
  children: (dragProps: { attributes: any; listeners: any; isDragging: boolean }) => React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children({
        attributes,
        listeners,
        isDragging,
      })}
    </div>
  );
}

function SortableItem({
  id,
  children,
}: {
  id: string;
  children: (dragProps: { attributes: any; listeners: any; isDragging: boolean }) => React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    zIndex: isDragging ? 100 : undefined,
    position: isDragging ? 'relative' as any : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children({
        attributes,
        listeners,
        isDragging,
      })}
    </div>
  );
}

interface MenuConfigPageProps {
  user: any;
  initialData?: any;
}

export function MenuConfigPage({ user, initialData }: MenuConfigPageProps) {
  const t = useMenuConfigTranslation();
  const ct = useCommonTranslation();

  const [activeTab, setActiveTab] = useState<'items' | 'addons' | 'visibilities'>('items');
  const [loading, setLoading] = useState(!initialData);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Helper to process raw menu data into the state format
  const processMenuData = (data: any) => {
    const itemsByCategory = data.itemsByCategory || {};
    const addonItemsByGroup = data.addonItemsByGroup || {};

    const assembledCategories = (data.categories || []).map((cat: any) => ({
      ...cat,
      items: itemsByCategory[cat.id] || [],
      isExpanded: false,
      useSpecialCalculation: !!cat.useSpecialCalculation,
    }));

    const assembledAddonGroups = (data.addonGroups || []).map((group: any) => ({
      ...group,
      items: addonItemsByGroup[group.id] || [],
      isExpanded: false,
    }));

    const visibilitySchedulesData = data.visibilitySchedules || [];

    return { assembledCategories, assembledAddonGroups, visibilitySchedules: visibilitySchedulesData };
  };

  const initialStates = useMemo(() => {
    if (initialData) {
      return processMenuData(initialData);
    }
    return { assembledCategories: [], assembledAddonGroups: [], visibilitySchedules: [] };
  }, [initialData]);

  const [categories, setCategories] = useState<Category[]>(initialStates.assembledCategories);
  const [addonGroups, setAddonGroups] = useState<AddonGroup[]>(initialStates.assembledAddonGroups);
  const [visibilitySchedules, setVisibilitySchedules] = useState<VisibilitySchedule[]>(initialStates.visibilitySchedules);
  const [searchQuery, setSearchQuery] = useState('');

  const role = user?.role || 'read_only';

  // RBAC permissions
  const canCreateCategory = hasPermission(role as any, Permission.CREATE_MENU_CATEGORY);
  const canEditCategory = hasPermission(role as any, Permission.EDIT_MENU_CATEGORY);
  const canDeleteCategory = hasPermission(role as any, Permission.DELETE_MENU_CATEGORY);
  const canCreateItem = hasPermission(role as any, Permission.CREATE_MENU_ITEM);
  const canEditItem = hasPermission(role as any, Permission.EDIT_MENU_ITEM);
  const canDeleteItem = hasPermission(role as any, Permission.DELETE_MENU_ITEM);
  const canManageAddons = hasPermission(role as any, Permission.CREATE_ADDON);

  // Modals state
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddMenuItemModalOpen, setIsAddMenuItemModalOpen] = useState(false);
  const [isItemSettingsModalOpen, setIsItemSettingsModalOpen] = useState(false);
  const [isAddChoiceModalOpen, setIsAddChoiceModalOpen] = useState(false);
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [isAddAddonItemModalOpen, setIsAddAddonItemModalOpen] = useState(false);
  const [isAddVisibilityModalOpen, setIsAddVisibilityModalOpen] = useState(false);
  const [isAssignVisibilityModalOpen, setIsAssignVisibilityModalOpen] = useState(false);

  // Form states and errors (omitted logic for brevity, keeping state names same)
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState<{
    name: string;
    description: string;
    image: File | null;
    imageUrl: string;
    useSpecialCalculation: boolean;
  }>({
    name: '',
    description: '',
    image: null,
    imageUrl: '',
    useSpecialCalculation: false
  });
  const [categoryErrors, setCategoryErrors] = useState<{ name?: string; description?: string }>({});
  const [categoryTouched, setCategoryTouched] = useState({ name: false, description: false });

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [editingMenuItemId, setEditingMenuItemId] = useState<string | null>(null);
  const [pricingMode, setPricingMode] = useState<'price' | 'variants'>('price');
  const [newMenuItem, setNewMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    internalCost: '',
    pricingType: 'per_person' as 'per_person' | 'flat_fee' | 'billed_by_consumption',
    averageConsumption: '',
    image: null as File | null,
    imageUrl: '',
    isActive: true,
    variants: [] as any[],
    dietaryType: 'veg' as any,
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
    assignedAddonGroups: [] as string[],
  });
  const [menuItemErrors, setMenuItemErrors] = useState<{ name?: string; description?: string }>({});
  const [menuItemTouched, setMenuItemTouched] = useState({ name: false, description: false });
  const [showItemSettings, setShowItemSettings] = useState(false);
  const [showAddons, setShowAddons] = useState(false);
  const [showChoices, setShowChoices] = useState(false);

  const [settingsMenuItemId, setSettingsMenuItemId] = useState<string | null>(null);
  const [itemSettings, setItemSettings] = useState<MenuItemData | null>(null);

  const [choiceCategoryId, setChoiceCategoryId] = useState<string | null>(null);
  const [choiceItemId, setChoiceItemId] = useState<string | null>(null);
  const [selectedAddonGroups, setSelectedAddonGroups] = useState<string[]>([]);

  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [newGroup, setNewGroup] = useState({ name: '', subtitle: '', type: 'optional' as any, minSelect: 0, maxSelect: 1 });

  const [currentGroupId, setCurrentGroupId] = useState<string | null>(null);
  const [editingAddonItemId, setEditingAddonItemId] = useState<string | null>(null);
  const [newAddonItem, setNewAddonItem] = useState({
    name: '',
    price: '',
    internalCost: '',
    dietaryType: 'veg' as any,
    isActive: true,
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

  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [deleteMenuItemId, setDeleteMenuItemId] = useState<string | null>(null);
  const [deleteGroupId, setDeleteGroupId] = useState<string | null>(null);
  const [deleteAddonItemId, setDeleteAddonItemId] = useState<string | null>(null);
  const [deleteVisibilityId, setDeleteVisibilityId] = useState<string | null>(null);

  const [editingVisibilityId, setEditingVisibilityId] = useState<string | null>(null);
  const [newVisibility, setNewVisibility] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
  });

  const [assignVisibilityCategoryId, setAssignVisibilityCategoryId] = useState<string | null>(null);
  const [assignVisibilityItemId, setAssignVisibilityItemId] = useState<string | null>(null);
  const [selectedVisibilitySchedules, setSelectedVisibilitySchedules] = useState<string[]>([]);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [openAddonGroupDropdownId, setOpenAddonGroupDropdownId] = useState<string | null>(null);

  // Drag and drop sensors
  const sensorsState = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Data fetching
  useEffect(() => {
    if (initialData) return;

    async function fetchData() {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/menu');
        if (response.ok) {
          const data = await response.json();
          const { assembledCategories, assembledAddonGroups, visibilitySchedules } = processMenuData(data);
          setCategories(assembledCategories);
          setAddonGroups(assembledAddonGroups);
          setVisibilitySchedules(visibilitySchedules);
        }
      } catch (error) {
        toast.error(t('messages.loadFailed'));
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Sync validation errors
  const displayCategoryErrors = {
    name: categoryTouched.name && !menuCategoryNameSchema.safeParse(newCategory.name).success ? t('validation.nameRequired') : undefined,
    description: categoryTouched.description && !menuCategoryDescriptionSchema.safeParse(newCategory.description).success ? t('validation.descTooLong') : undefined,
  };

  const displayMenuItemErrors = {
    name: menuItemTouched.name && !menuItemNameSchema.safeParse(newMenuItem.name).success ? t('validation.nameRequired') : undefined,
    description: menuItemTouched.description && !menuItemDescriptionSchema.safeParse(newMenuItem.description).success ? t('validation.descTooLong') : undefined,
  };

  const onEditCategory = (category: Category) => {
    setEditingCategoryId(category.id);
    setNewCategory({
      name: category.name,
      description: category.description || '',
      image: null,
      imageUrl: category.image || '',
      useSpecialCalculation: !!category.useSpecialCalculation,
    });
    setCategoryTouched({ name: false, description: false });
    setIsAddCategoryModalOpen(true);
  };

  // Simplified Handlers (linking to extracted components)
  const handleSaveCategory = async () => {
    if (editingCategoryId) {
      const result = await updateMenuCategory(editingCategoryId, {
        name: newCategory.name,
        nameDe: newCategory.name,
        description: newCategory.description,
        descriptionDe: newCategory.description,
        useSpecialCalculation: !!newCategory.useSpecialCalculation,
      });
      if (result.success) {
        setCategories(categories.map(cat =>
          cat.id === editingCategoryId
            ? { ...cat, name: newCategory.name, description: newCategory.description, image: newCategory.image ? URL.createObjectURL(newCategory.image) : newCategory.imageUrl, useSpecialCalculation: !!newCategory.useSpecialCalculation }
            : cat
        ));
        setIsAddCategoryModalOpen(false);
        toast.success(t('messages.settingsSaved'));
      }
    } else {
      const result = await createMenuCategory({
        name: newCategory.name,
        nameDe: newCategory.name,
        description: newCategory.description,
        descriptionDe: newCategory.description,
        useSpecialCalculation: !!newCategory.useSpecialCalculation,
      });
      if (result.success && result.data) {
        setCategories([...categories, {
          id: result.data.id,
          name: newCategory.name,
          description: newCategory.description,
          image: newCategory.image ? URL.createObjectURL(newCategory.image) : (result.data as any).image,
          isActive: true,
          isExpanded: false,
          guestCount: false,
          useSpecialCalculation: !!newCategory.useSpecialCalculation,
          items: [],
        }]);
        setIsAddCategoryModalOpen(false);
        toast.success(t('messages.settingsSaved'));
      }
    }
  };

  const handleSaveMenuItem = async () => {
    const itemData = {
      name: newMenuItem.name,
      nameDe: newMenuItem.name, // Fallback
      description: newMenuItem.description,
      descriptionDe: newMenuItem.description, // Fallback
      price: parseFloat(newMenuItem.price) || 0,
      pricePerPerson: parseFloat(newMenuItem.price) || 0,
      internalCost: parseFloat(newMenuItem.internalCost) || 0,
      pricingType: newMenuItem.pricingType,
      averageConsumption: parseInt(newMenuItem.averageConsumption) || 1,
      imageUrl: newMenuItem.imageUrl || null,
      isActive: newMenuItem.isActive,
      dietaryType: newMenuItem.dietaryType as any,
      dietaryTags: newMenuItem.dietaryTags,
      ingredients: newMenuItem.ingredients,
      allergens: newMenuItem.allergens,
      additives: newMenuItem.additives,
      nutritionalInfo: newMenuItem.nutritionalInfo as any,
      assignedAddonGroups: newMenuItem.assignedAddonGroups,
      variants: newMenuItem.variants,
    };

    if (editingMenuItemId) {
      const result = await updateMenuItem(editingMenuItemId, { ...itemData, price: itemData.price.toString() } as any);
      if (result.success) {
        setCategories(categories.map(cat => ({
          ...cat,
          items: cat.items.map(i => i.id === editingMenuItemId ? { ...i, ...itemData, image: newMenuItem.imageUrl } : i)
        })));
        setIsAddMenuItemModalOpen(false);
        toast.success(t('messages.settingsSaved'));
      }
    } else if (activeCategoryId) {
      const result = await createMenuItem({ ...itemData, categoryId: activeCategoryId } as any);
      if (result.success && result.data) {
        setCategories(prev => prev.map(cat =>
          cat.id === activeCategoryId
            ? { ...cat, items: [...cat.items, { ...itemData, id: result.data.id, image: newMenuItem.imageUrl }] as any[] }
            : cat
        ));
        setIsAddMenuItemModalOpen(false);
        toast.success(t('messages.settingsSaved'));
      }
    }
  };

  const handleSaveItemSettings = async () => {
    if (settingsMenuItemId && itemSettings) {
      const result = await updateMenuItem(settingsMenuItemId, itemSettings as any);
      if (result.success) {
        setCategories(categories.map(cat => ({
          ...cat,
          items: cat.items.map(i => i.id === settingsMenuItemId ? { ...i, ...itemSettings } : i)
        })));
        setIsItemSettingsModalOpen(false);
        toast.success(t('messages.settingsSaved'));
      }
    }
  };

  const handleSaveChoice = async () => {
    if (choiceCategoryId) {
      const result = await updateCategoryAddonGroups(choiceCategoryId, selectedAddonGroups);
      if (result.success) {
        setCategories(categories.map(cat =>
          cat.id === choiceCategoryId ? { ...cat, assignedAddonGroups: selectedAddonGroups } : cat
        ));
        setIsAddChoiceModalOpen(false);
        toast.success(t('messages.choicesUpdated'));
      }
    } else if (choiceItemId) {
      const result = await updateItemAddonGroups(choiceItemId, selectedAddonGroups);
      if (result.success) {
        setCategories(categories.map(cat => ({
          ...cat,
          items: cat.items.map(i => i.id === choiceItemId ? { ...i, assignedAddonGroups: selectedAddonGroups } : i)
        })));
        setIsAddChoiceModalOpen(false);
        toast.success(t('messages.choicesUpdated'));
      }
    }
  };

  const handleSaveGroup = async () => {
    const groupData = {
      name: newGroup.name,
      nameDe: newGroup.name,
      subtitle: newGroup.subtitle,
      subtitleDe: newGroup.subtitle,
      isRequired: newGroup.type === 'mandatory',
      minSelect: newGroup.minSelect,
      maxSelect: newGroup.maxSelect,
    };

    if (editingGroupId) {
      const result = await updateAddonGroup(editingGroupId, groupData as any);
      if (result.success) {
        setAddonGroups(addonGroups.map(g => g.id === editingGroupId ? { ...g, ...groupData } as any : g));
        setIsAddGroupModalOpen(false);
        toast.success(t('messages.groupUpdated') || 'Group updated');
      }
    } else {
      const result = await createAddonGroup(groupData);
      if (result.success && result.data) {
        setAddonGroups([...addonGroups, { ...groupData, id: result.data.id, isActive: true, isExpanded: false, items: [] } as any]);
        setIsAddGroupModalOpen(false);
        toast.success(t('messages.groupCreated') || 'Group created');
      }
    }
  };

  const onDuplicateCategory = async (cat: Category) => {
    const result = await createMenuCategory({
      name: `Copy of ${cat.name}`,
      nameDe: `Kopie von ${cat.name}`,
      description: cat.description,
      descriptionDe: cat.description,
    });
    if (result.success && result.data) {
      setCategories([...categories, {
        ...cat,
        id: result.data.id,
        name: `Copy of ${cat.name}`,
        isActive: true,
        isExpanded: false,
      }]);
      toast.success(t('messages.categoryDuplicated'));
    } else {
      toast.error(t('messages.duplicateFailed'));
    }
  };

  const onDuplicateMenuItem = async (categoryId: string, item: MenuItemData) => {
    const itemData = {
      ...item,
      name: `Copy of ${item.name}`,
      nameDe: `Kopie von ${item.name}`,
      price: (item.price || 0).toString(),
      internalCost: (item.internalCost || 0).toString(),
      categoryId: categoryId,
    };
    const result = await createMenuItem(itemData as any);
    if (result.success && result.data) {
      setCategories(categories.map(cat =>
        cat.id === categoryId
          ? { ...cat, items: [...cat.items, { ...itemData, id: result.data.id, price: parseFloat(itemData.price) }] as any[] }
          : cat
      ));
      toast.success(t('messages.itemDuplicated'));
    } else {
      toast.error(t('messages.duplicateFailed'));
    }
  };

  const onDuplicateAddonGroup = async (group: AddonGroup) => {
    const groupData = {
      name: `Copy of ${group.name}`,
      nameDe: `Kopie von ${group.name}`,
      subtitle: group.subtitle,
      subtitleDe: group.subtitle,
      isRequired: group.isRequired,
      minSelect: group.minSelect,
      maxSelect: group.maxSelect,
    };
    const result = await createAddonGroup(groupData);
    if (result.success && result.data) {
      // Also duplicate items in group
      const newGroupId = result.data.id;
      const duplicatedItems = [];
      for (const item of group.items) {
        const itemResult = await createAddonItem({
          name: item.name,
          nameDe: item.name,
          price: item.price,
          internalCost: item.internalCost,
          dietaryType: item.dietaryType as any,
          addonGroupId: newGroupId,
        });
        if (itemResult.success && itemResult.data) {
          duplicatedItems.push({ ...item, id: itemResult.data.id });
        }
      }
      setAddonGroups([...addonGroups, { ...groupData, id: newGroupId, items: duplicatedItems as any[], isActive: true, isExpanded: false } as any]);
      toast.success(t('messages.groupDuplicated'));
    } else {
      toast.error(t('messages.duplicateFailed'));
    }
  };

  const handleSaveAddonItem = async () => {
    if (!currentGroupId) return;

    const itemData = {
      name: newAddonItem.name,
      nameDe: newAddonItem.name, // Fallback
      price: parseFloat(newAddonItem.price) || 0,
      internalCost: parseFloat(newAddonItem.internalCost) || 0,
      dietaryType: newAddonItem.dietaryType,
      isActive: newAddonItem.isActive,
    };

    if (editingAddonItemId) {
      const result = await updateAddonItem(editingAddonItemId, { ...itemData, price: itemData.price.toString(), internalCost: itemData.internalCost.toString() } as any);
      if (result.success) {
        setAddonGroups(addonGroups.map(g =>
          g.id === currentGroupId ? { ...g, items: g.items.map(i => i.id === editingAddonItemId ? { ...i, ...itemData } : i) } : g
        ));
        setIsAddAddonItemModalOpen(false);
        toast.success(t('messages.settingsSaved'));
      }
    } else {
      const result = await createAddonItem({ ...itemData, addonGroupId: currentGroupId });
      if (result.success && result.data) {
        setAddonGroups(addonGroups.map(g =>
          g.id === currentGroupId ? { ...g, items: [...g.items, { ...itemData, id: result.data.id }] as any[] } : g
        ));
        setIsAddAddonItemModalOpen(false);
        toast.success(t('messages.settingsSaved'));
      }
    }
  };

  const handleSaveVisibility = async () => {
    const data = {
      name: newVisibility.name,
      description: newVisibility.description || null,
      startDate: newVisibility.startDate ? new Date(newVisibility.startDate) : new Date(),
      endDate: newVisibility.endDate ? new Date(newVisibility.endDate) : new Date(),
    };

    if (editingVisibilityId) {
      const result = await updateVisibilitySchedule(editingVisibilityId, data as any);
      if (result.success) {
        setVisibilitySchedules(visibilitySchedules.map(s => s.id === editingVisibilityId ? { ...s, ...data } as any : s));
        setIsAddVisibilityModalOpen(false);
        toast.success('Visibility schedule updated');
      }
    } else {
      const result = await createVisibilitySchedule(data as any);
      if (result.success && result.data) {
        setVisibilitySchedules([...visibilitySchedules, result.data as any]);
        setIsAddVisibilityModalOpen(false);
        toast.success('Visibility schedule created');
      }
    }
  };

  const handleSaveVisibilityAssignment = async () => {
    if (assignVisibilityCategoryId) {
      const result = await updateCategoryVisibilitySchedules(assignVisibilityCategoryId, selectedVisibilitySchedules);
      if (result.success) {
        setCategories(categories.map(cat =>
          cat.id === assignVisibilityCategoryId ? { ...cat, assignedVisibilitySchedules: selectedVisibilitySchedules } : cat
        ));
        setIsAssignVisibilityModalOpen(false);
        toast.success('Category visibility updated');
      }
    } else if (assignVisibilityItemId) {
      const result = await updateItemVisibilitySchedules(assignVisibilityItemId, selectedVisibilitySchedules);
      if (result.success) {
        setCategories(categories.map(cat => ({
          ...cat,
          items: cat.items.map(i => i.id === assignVisibilityItemId ? { ...i, assignedVisibilitySchedules: selectedVisibilitySchedules } : i)
        })));
        setIsAssignVisibilityModalOpen(false);
        toast.success('Item visibility updated');
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // 1. Handle Categories Reordering
    const activeCategoryIndex = categories.findIndex(c => c.id === active.id);
    const overCategoryIndex = categories.findIndex(c => c.id === over.id);

    if (activeCategoryIndex !== -1 && overCategoryIndex !== -1) {
      const newCategories = [...categories];
      const [moved] = newCategories.splice(activeCategoryIndex, 1);
      newCategories.splice(overCategoryIndex, 0, moved);
      setCategories(newCategories);

      try {
        const result = await updateMenuCategoryOrder(newCategories.map(c => c.id));
        if (!result.success) {
          toast.error(t('messages.updateOrderFailed') || 'Failed to update category order');
        } else {
          toast.success(t('messages.orderUpdated') || 'Order updated successfully');
        }
      } catch (error) {
        toast.error(t('messages.updateOrderFailed') || 'Failed to update category order');
      }
      return;
    }

    // 2. Handle Menu Items Reordering
    let activeItemCategory: Category | undefined;
    let activeItemIndex = -1;

    for (const cat of categories) {
      const idx = (cat.items || []).findIndex(i => i.id === active.id);
      if (idx !== -1) {
        activeItemCategory = cat;
        activeItemIndex = idx;
        break;
      }
    }

    if (activeItemCategory) {
      const overItemIndex = activeItemCategory.items.findIndex(i => i.id === over.id);
      if (overItemIndex !== -1) {
        const newItems = [...activeItemCategory.items];
        const [moved] = newItems.splice(activeItemIndex, 1);
        newItems.splice(overItemIndex, 0, moved);

        setCategories(categories.map(c =>
          c.id === activeItemCategory!.id ? { ...c, items: newItems } : c
        ));

        try {
          const result = await updateMenuItemOrder(newItems.map(i => i.id));
          if (!result.success) {
            toast.error(t('messages.updateOrderFailed') || 'Failed to update item order');
          } else {
            toast.success(t('messages.orderUpdated') || 'Order updated successfully');
          }
        } catch (error) {
          toast.error(t('messages.updateOrderFailed') || 'Failed to update item order');
        }
      }
      return;
    }

    // 3. Handle Addon Groups Reordering
    const activeGroupIndex = addonGroups.findIndex(g => g.id === active.id);
    const overGroupIndex = addonGroups.findIndex(g => g.id === over.id);

    if (activeGroupIndex !== -1 && overGroupIndex !== -1) {
      const newGroups = [...addonGroups];
      const [moved] = newGroups.splice(activeGroupIndex, 1);
      newGroups.splice(overGroupIndex, 0, moved);
      setAddonGroups(newGroups);

      try {
        const result = await updateAddonGroupOrder(newGroups.map(g => g.id));
        if (!result.success) {
          toast.error(t('messages.updateOrderFailed') || 'Failed to update group order');
        } else {
          toast.success(t('messages.orderUpdated') || 'Order updated successfully');
        }
      } catch (error) {
        toast.error(t('messages.updateOrderFailed') || 'Failed to update group order');
      }
      return;
    }

    // 4. Handle Addon Items Reordering
    let activeAddonGroup: AddonGroup | undefined;
    let activeAddonIndex = -1;

    for (const group of addonGroups) {
      const idx = (group.items || []).findIndex(i => i.id === active.id);
      if (idx !== -1) {
        activeAddonGroup = group;
        activeAddonIndex = idx;
        break;
      }
    }

    if (activeAddonGroup) {
      const overAddonIndex = activeAddonGroup.items.findIndex(i => i.id === over.id);
      if (overAddonIndex !== -1) {
        const newItems = [...activeAddonGroup.items];
        const [moved] = newItems.splice(activeAddonIndex, 1);
        newItems.splice(overAddonIndex, 0, moved);

        setAddonGroups(addonGroups.map(g =>
          g.id === activeAddonGroup!.id ? { ...g, items: newItems } : g
        ));

        try {
          const result = await updateAddonItemOrder(newItems.map(i => i.id));
          if (!result.success) {
            toast.error(t('messages.updateOrderFailed') || 'Failed to update addon item order');
          } else {
            toast.success(t('messages.orderUpdated') || 'Order updated successfully');
          }
        } catch (error) {
          toast.error(t('messages.updateOrderFailed') || 'Failed to update addon item order');
        }
      }
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/admin/menu/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      return data.url;
    } finally {
      setUploadingImage(false);
    }
  };

  const filteredCategories = useMemo(() => {
    return categories
      .map(cat => ({
        ...cat,
        isExpanded: searchQuery === '' ? cat.isExpanded : true,
        items: cat.items.filter(item =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }))
      .filter(cat => searchQuery === '' || cat.items.length > 0);
  }, [categories, searchQuery]);

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1">
        {loading && <SkeletonMenuConfig />}

        {!loading && (
          <>
            {/* Tabs Header */}
            <div className="flex items-center mb-6 overflow-hidden">
              <div className="flex flex-wrap items-center gap-1 p-1 bg-card border border-border rounded-xl w-full sm:w-auto">
                <button
                  onClick={() => setActiveTab('items')}
                  className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 flex-1 sm:flex-none ${activeTab === 'items'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  <span className="whitespace-nowrap">{t('tabs.items')}</span>
                </button>
                <button
                  onClick={() => setActiveTab('addons')}
                  className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 flex-1 sm:flex-none ${activeTab === 'addons'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                >
                  <ListPlus className="w-4 h-4" />
                  <span className="whitespace-nowrap">{t('tabs.addons')}</span>
                </button>
                <button
                  onClick={() => setActiveTab('visibilities')}
                  className={`px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 flex-1 sm:flex-none ${activeTab === 'visibilities'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                >
                  <Calendar className="w-4 h-4" />
                  <span className="whitespace-nowrap">{t('tabs.visibilities')}</span>
                </button>
              </div>
            </div>

            {/* Tab Content */}
            {!isMounted ? (
              <SkeletonMenuConfig />
            ) : (
              <>
                {activeTab === 'items' && (
                  <MenuCategoriesTab
                    filteredCategories={filteredCategories}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    canCreateCategory={canCreateCategory}
                    canEditCategory={canEditCategory}
                    canDeleteCategory={canDeleteCategory}
                    canCreateItem={canCreateItem}
                    canEditItem={canEditItem}
                    canDeleteItem={canDeleteItem}
                    onAddCategory={() => {
                      setEditingCategoryId(null);
                      setNewCategory({ name: '', description: '', image: null, imageUrl: '', useSpecialCalculation: false });
                      setIsAddCategoryModalOpen(true);
                    }}
                    onEditCategory={onEditCategory}
                    onDeleteCategory={(id: string) => setDeleteCategoryId(id)}
                    onToggleCategoryExpanded={(id: string) => setCategories(categories.map(c => c.id === id ? { ...c, isExpanded: !c.isExpanded } : c))}
                    onToggleCategoryActive={async (id: string) => {
                      const cat = categories.find(c => c.id === id);
                      if (cat) {
                        const result = await updateMenuCategory(id, { isActive: !cat.isActive });
                        if (result.success) {
                          setCategories(categories.map(c => c.id === id ? { ...c, isActive: !cat.isActive } : c));
                          toast.success(cat.isActive ? t('messages.categoryHidden') : t('messages.categoryShown'));
                        } else {
                          toast.error(t('messages.updateStatusFailed'));
                        }
                      }
                    }}
                    onAddMenuItem={(id: string) => {
                      setActiveCategoryId(id);
                      setEditingMenuItemId(null);
                      setNewMenuItem({
                        name: '', description: '', price: '', internalCost: '', pricingType: 'per_person', averageConsumption: '',
                        image: null, imageUrl: '', isActive: true, variants: [], assignedAddonGroups: [],
                        dietaryType: 'veg', dietaryTags: [], ingredients: '', allergens: [], additives: [],
                        nutritionalInfo: { servingSize: '', calories: '', protein: '', carbs: '', fat: '', fiber: '', sugar: '', sodium: '' }
                      });
                      setIsAddMenuItemModalOpen(true);
                    }}
                    onEditMenuItem={(catId: string, item: MenuItemData) => {
                      setActiveCategoryId(catId);
                      setEditingMenuItemId(item.id);
                      setNewMenuItem({
                        ...item, 
                        price: (item.price ?? '').toString(),
                        internalCost: (item.internalCost ?? '').toString(),
                        pricingType: item.pricingType || 'per_person',
                        averageConsumption: (item as any).averageConsumption ? String((item as any).averageConsumption) : '1',
                        image: null, imageUrl: item.image,
                        variants: item.variants || [],
                        assignedAddonGroups: item.assignedAddonGroups || [],
                        nutritionalInfo: (item as any).nutritionalInfo || { servingSize: '', calories: '', protein: '', carbs: '', fat: '', fiber: '', sugar: '', sodium: '' }
                      });
                      setIsAddMenuItemModalOpen(true);
                    }}
                    onDeleteMenuItem={(catId: string, itemId: string) => {
                      setActiveCategoryId(catId);
                      setDeleteMenuItemId(itemId);
                    }}
                    onToggleMenuItemActive={async (catId: string, itemId: string) => {
                      const item = categories.find(c => c.id === catId)?.items.find(i => i.id === itemId);
                      if (item) {
                        const result = await updateMenuItem(itemId, { isActive: !item.isActive });
                        if (result.success) {
                          setCategories(categories.map(c => c.id === catId ?
                            { ...c, items: c.items.map(i => i.id === itemId ? { ...i, isActive: !i.isActive } : i) } : c
                          ));
                          toast.success(item.isActive ? t('messages.itemHidden') : t('messages.itemShown'));
                        } else {
                          toast.error(t('messages.updateStatusFailed'));
                        }
                      }
                    }}
                    onDuplicateMenuItem={onDuplicateMenuItem}
                    onDuplicateCategory={onDuplicateCategory}
                    onOpenItemSettings={(catId: string, item: MenuItemData) => {
                      setSettingsMenuItemId(item.id);
                      setItemSettings(item);
                      setIsItemSettingsModalOpen(true);
                    }}
                    onAddChoice={(catId: string, itemId?: string) => {
                      setChoiceCategoryId(itemId ? null : catId);
                      setChoiceItemId(itemId || null);
                      if (itemId) setActiveCategoryId(catId);
                      const groups = itemId ?
                        categories.find(c => c.id === catId)?.items.find(i => i.id === itemId)?.assignedAddonGroups :
                        categories.find(c => c.id === catId)?.assignedAddonGroups;
                      setSelectedAddonGroups(groups || []);
                      setIsAddChoiceModalOpen(true);
                    }}
                    onAddVisibility={(catId: string, itemId?: string) => {
                      setAssignVisibilityCategoryId(itemId ? null : catId);
                      setAssignVisibilityItemId(itemId || null);
                      if (itemId) setActiveCategoryId(catId);
                      const schedules = itemId ?
                        categories.find(c => c.id === catId)?.items.find(i => i.id === itemId)?.assignedVisibilitySchedules :
                        categories.find(c => c.id === catId)?.assignedVisibilitySchedules;
                      setSelectedVisibilitySchedules(schedules || []);
                      setIsAssignVisibilityModalOpen(true);
                    }}
                    SortableCategory={SortableCategory}
                    SortableItem={SortableItem}
                    sensors={sensorsState}
                    handleDragEnd={handleDragEnd}
                    openDropdownId={openDropdownId}
                    setOpenDropdownId={setOpenDropdownId}
                  />
                )}

                {activeTab === 'addons' && (
                  <ChoicesAddonsTab
                    addonGroups={addonGroups}
                    canManageAddons={canManageAddons}
                    onAddGroup={() => {
                      setEditingGroupId(null);
                      setNewGroup({ name: '', subtitle: '', type: 'optional', minSelect: 0, maxSelect: 1 });
                      setIsAddGroupModalOpen(true);
                    }}
                    onEditGroup={(group) => {
                      setEditingGroupId(group.id);
                      setNewGroup({
                        name: group.name, subtitle: group.subtitle || '',
                        type: group.isRequired ? 'mandatory' : 'optional',
                        minSelect: group.minSelect, maxSelect: group.maxSelect
                      });
                      setIsAddGroupModalOpen(true);
                    }}
                    onDeleteGroup={(id) => setDeleteGroupId(id)}
                    onToggleGroupExpanded={(id) => setAddonGroups(addonGroups.map(g => g.id === id ? { ...g, isExpanded: !g.isExpanded } : g))}
                    onToggleAddonGroupActive={async (id) => {
                      const group = addonGroups.find(g => g.id === id);
                      if (group) {
                        const result = await updateAddonGroup(id, { isActive: !group.isActive });
                        if (result.success) {
                          setAddonGroups(addonGroups.map(g => g.id === id ? { ...g, isActive: !g.isActive } : g));
                          toast.success(group.isActive ? t('messages.groupHidden') : t('messages.groupShown'));
                        } else {
                          toast.error(t('messages.updateStatusFailed'));
                        }
                      }
                    }}
                    onDuplicateAddonGroup={(id) => {
                      const group = addonGroups.find(g => g.id === id);
                      if (group) onDuplicateAddonGroup(group);
                    }}
                    onAddAddonItem={(id) => {
                      setCurrentGroupId(id);
                      setEditingAddonItemId(null);
                      setNewAddonItem({
                        name: '',
                        price: '',
                        internalCost: '',
                        dietaryType: 'veg',
                        isActive: true,
                        dietaryTags: [],
                        ingredients: '',
                        allergens: [],
                        additives: [],
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
                      setIsAddAddonItemModalOpen(true);
                    }}
                    onEditAddonItem={(groupId, item) => {
                      setCurrentGroupId(groupId);
                      setEditingAddonItemId(item.id);
                      setNewAddonItem({
                        ...item,
                        price: (item.price ?? '').toString(),
                        internalCost: (item.internalCost ?? '').toString(),
                        dietaryTags: (item as any).dietaryTags || [],
                        ingredients: (item as any).ingredients || '',
                        allergens: (item as any).allergens || [],
                        additives: (item as any).additives || [],
                        nutritionalInfo: (item as any).nutritionalInfo || {
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
                      setIsAddAddonItemModalOpen(true);
                    }}
                    onDeleteAddonItem={(groupId, itemId) => {
                      setCurrentGroupId(groupId);
                      setDeleteAddonItemId(itemId);
                    }}
                    onToggleAddonItemActive={async (groupId, itemId) => {
                      const item = addonGroups.find(g => g.id === groupId)?.items.find(i => i.id === itemId);
                      if (item) {
                        const result = await updateAddonItem(itemId, { isActive: !item.isActive });
                        if (result.success) {
                          setAddonGroups(addonGroups.map(g => g.id === groupId ?
                            { ...g, items: g.items.map(i => i.id === itemId ? { ...i, isActive: !i.isActive } : i) } : g
                          ));
                          toast.success(item.isActive ? t('messages.addonHidden') : t('messages.addonShown'));
                        } else {
                          toast.error(t('messages.updateStatusFailed'));
                        }
                      }
                    }}
                    openAddonGroupDropdownId={openAddonGroupDropdownId}
                    setOpenAddonGroupDropdownId={setOpenAddonGroupDropdownId}
                    SortableGroup={SortableCategory}
                    SortableAddonItem={SortableItem}
                    sensors={sensorsState}
                    handleDragEnd={handleDragEnd}
                  />
                )}

                {activeTab === 'visibilities' && (
                  <VisibilitiesTab
                    visibilitySchedules={visibilitySchedules}
                    canManageSchedules={canManageAddons}
                    onAddSchedule={() => {
                      setEditingVisibilityId(null);
                      setNewVisibility({ name: '', description: '', startDate: '', endDate: '' });
                      setIsAddVisibilityModalOpen(true);
                    }}
                    onEditSchedule={(schedule) => {
                      setEditingVisibilityId(schedule.id);
                      setNewVisibility({
                        name: schedule.name,
                        description: schedule.description || '',
                        startDate: schedule.startDate ? new Date(schedule.startDate).toISOString().split('T')[0] : '',
                        endDate: schedule.endDate ? new Date(schedule.endDate).toISOString().split('T')[0] : ''
                      });
                      setIsAddVisibilityModalOpen(true);
                    }}
                    onDeleteSchedule={(id) => setDeleteVisibilityId(id)}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <AddCategoryModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        editingCategoryId={editingCategoryId}
        newCategory={newCategory}
        setNewCategory={setNewCategory}
        uploadingImage={uploadingImage}
        handleImageUpload={handleImageUpload}
        onSave={handleSaveCategory}
        displayCategoryErrors={displayCategoryErrors}
        categoryTouched={categoryTouched}
        setCategoryTouched={setCategoryTouched}
      />

      <AddMenuItemModal
        isOpen={isAddMenuItemModalOpen}
        onClose={() => setIsAddMenuItemModalOpen(false)}
        editingMenuItemId={editingMenuItemId}
        activeCategoryId={activeCategoryId}
        setActiveCategoryId={setActiveCategoryId}
        categories={categories}
        newMenuItem={newMenuItem}
        setNewMenuItem={setNewMenuItem}
        pricingMode={pricingMode}
        setPricingMode={setPricingMode}
        uploadingImage={uploadingImage}
        handleImageUpload={handleImageUpload}
        onSave={handleSaveMenuItem}
        displayMenuItemErrors={displayMenuItemErrors}
        menuItemTouched={menuItemTouched}
        setMenuItemTouched={setMenuItemTouched}
        showItemSettings={showItemSettings}
        setShowItemSettings={setShowItemSettings}
        showAddons={showAddons}
        setShowAddons={setShowAddons}
        addonGroups={addonGroups}
        addVariant={() => setNewMenuItem({ ...newMenuItem, variants: [...newMenuItem.variants, { id: Math.random().toString(), name: '', price: 0, internalCost: 0 }] })}
        updateVariant={(index, field, value) => {
          const v = [...newMenuItem.variants];
          v[index] = { ...v[index], [field]: value };
          setNewMenuItem({ ...newMenuItem, variants: v });
        }}
        removeVariant={(index) => setNewMenuItem({ ...newMenuItem, variants: newMenuItem.variants.filter((_, i) => i !== index) })}
        handleToggleTag={(tag, field) => {
          const arr = newMenuItem[field] as string[];
          setNewMenuItem({ ...newMenuItem, [field]: arr.includes(tag) ? arr.filter(t => t !== tag) : [...arr, tag] });
        }}
      />

      <AddChoiceModal
        isOpen={isAddChoiceModalOpen}
        onClose={() => setIsAddChoiceModalOpen(false)}
        choiceCategoryId={choiceCategoryId}
        choiceItemId={choiceItemId}
        activeCategoryId={activeCategoryId}
        categories={categories}
        addonGroups={addonGroups}
        selectedAddonGroups={selectedAddonGroups}
        setSelectedAddonGroups={setSelectedAddonGroups}
        onSave={handleSaveChoice}
      />

      <AddGroupModal
        isOpen={isAddGroupModalOpen}
        onClose={() => setIsAddGroupModalOpen(false)}
        editingGroupId={editingGroupId}
        newGroup={newGroup}
        setNewGroup={setNewGroup}
        onSave={handleSaveGroup}
      />

      <AddAddonItemModal
        isOpen={isAddAddonItemModalOpen}
        onClose={() => setIsAddAddonItemModalOpen(false)}
        editingAddonItemId={editingAddonItemId}
        currentGroupId={currentGroupId}
        newAddonItem={newAddonItem}
        setNewAddonItem={setNewAddonItem}
        onSave={handleSaveAddonItem}
      />

      <AddVisibilityModal
        isOpen={isAddVisibilityModalOpen}
        onClose={() => setIsAddVisibilityModalOpen(false)}
        editingVisibilityId={editingVisibilityId}
        newVisibility={newVisibility}
        setNewVisibility={setNewVisibility}
        onSave={handleSaveVisibility}
      />

      <AssignVisibilityModal
        isOpen={isAssignVisibilityModalOpen}
        onClose={() => setIsAssignVisibilityModalOpen(false)}
        assignCategoryId={assignVisibilityCategoryId}
        assignItemId={assignVisibilityItemId}
        activeCategoryId={activeCategoryId}
        categories={categories}
        visibilitySchedules={visibilitySchedules}
        selectedSchedules={selectedVisibilitySchedules}
        setSelectedSchedules={setSelectedVisibilitySchedules}
        onSave={handleSaveVisibilityAssignment}
      />

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={!!deleteCategoryId}
        onClose={() => setDeleteCategoryId(null)}
        onConfirm={async () => {
          if (deleteCategoryId) {
            const result = await deleteMenuCategory(deleteCategoryId);
            if (result.success) {
              setCategories(categories.filter(c => c.id !== deleteCategoryId));
              setDeleteCategoryId(null);
              toast.success(t('messages.categoryDeleted'));
            }
          }
        }}
        title={t('confirmations.deleteCategory')}
        message={t('confirmations.deleteCategoryDesc')}
      />

      <ConfirmationModal
        isOpen={!!deleteMenuItemId}
        onClose={() => setDeleteMenuItemId(null)}
        onConfirm={async () => {
          if (deleteMenuItemId && activeCategoryId) {
            const result = await deleteMenuItem(deleteMenuItemId);
            if (result.success) {
              setCategories(categories.map(c => c.id === activeCategoryId ? { ...c, items: c.items.filter(i => i.id !== deleteMenuItemId) } : c));
              setDeleteMenuItemId(null);
              toast.success(t('messages.itemDeleted'));
            }
          }
        }}
        title={t('confirmations.deleteItem')}
        message={t('confirmations.deleteItemDesc')}
      />

      <ConfirmationModal
        isOpen={!!deleteGroupId}
        onClose={() => setDeleteGroupId(null)}
        onConfirm={async () => {
          if (deleteGroupId) {
            const result = await deleteAddonGroup(deleteGroupId);
            if (result.success) {
              setAddonGroups(addonGroups.filter(g => g.id !== deleteGroupId));
              setDeleteGroupId(null);
              toast.success(t('messages.groupDeleted'));
            }
          }
        }}
        title={t('confirmations.deleteGroup')}
        message={t('confirmations.deleteGroupDesc')}
      />

      <ConfirmationModal
        isOpen={!!deleteAddonItemId}
        onClose={() => setDeleteAddonItemId(null)}
        onConfirm={async () => {
          if (deleteAddonItemId && currentGroupId) {
            const result = await deleteAddonItem(deleteAddonItemId);
            if (result.success) {
              setAddonGroups(addonGroups.map(g => g.id === currentGroupId ? { ...g, items: g.items.filter(i => i.id !== deleteAddonItemId) } : g));
              setDeleteAddonItemId(null);
              toast.success(t('messages.addonDeleted'));
            }
          }
        }}
        title={t('confirmations.deleteAddonItem')}
        message={t('confirmations.deleteAddonItemDesc')}
      />

      <ConfirmationModal
        isOpen={!!deleteVisibilityId}
        onClose={() => setDeleteVisibilityId(null)}
        onConfirm={async () => {
          if (deleteVisibilityId) {
            const result = await deleteVisibilitySchedule(deleteVisibilityId);
            if (result.success) {
              setVisibilitySchedules(visibilitySchedules.filter(s => s.id !== deleteVisibilityId));
              setDeleteVisibilityId(null);
              toast.success('Visibility schedule deleted');
            }
          }
        }}
        title="Delete Visibility Schedule"
        message="Are you sure you want to delete this visibility schedule? This will remove it from all assigned categories and items."
      />

      {isItemSettingsModalOpen && itemSettings && (
        <ItemSettingsModal
          isOpen={isItemSettingsModalOpen}
          onClose={() => setIsItemSettingsModalOpen(false)}
          itemSettings={itemSettings}
          setItemSettings={setItemSettings}
          onSave={handleSaveItemSettings}
        />
      )}
    </div>
  );
}
