'use client';

import { useState, useEffect } from 'react';
import { GripVertical, Edit2, MoreVertical, Plus, ChevronDown, ChevronRight, Trash2, Eye, EyeOff, Search, UtensilsCrossed, ListPlus, Upload, X, Copy, Settings, Check, Users } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { DietaryIcon } from '@/components/user/DietaryIcon';
import { Modal } from '../user/Modal';
import { ConfirmationModal } from '../user/ConfirmationModal';
import { ItemSettingsModal } from '../user/ItemSettingsModal';
import { Button } from '../user/Button';
import { Tooltip } from '../user/Tooltip';
import { NativeRadio } from '../ui/NativeRadio';
import { toast } from 'sonner';
import { SkeletonMenuCategory } from '@/components/ui/skeleton-loaders';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
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
  getAllAddonItems,
  updateItemAddonGroups,
} from '@/lib/actions/menu';
import { Permission, hasPermission } from '@/lib/auth/rbac';

interface MenuItemData {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  pricingType?: 'per_person' | 'flat_fee' | 'billed_by_consumption';
  isActive: boolean;
  variants: VariantOption[];
  dietaryType: 'veg' | 'non-veg' | 'vegan' | 'none';
  dietaryTags: string[];
  isCombo?: boolean;
  ingredients: string;
  allergens: string[];
  additives: string[];
  nutritionalInfo: {
    servingSize: string;
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
    sugar: string;
    sodium: string;
  };
  assignedAddonGroups?: string[];
}

interface VariantOption {
  id: string;
  name: string;
  price: number;
}

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  isActive: boolean;
  isExpanded: boolean;
  guestCount: boolean;
  items: MenuItemData[];
  assignedAddonGroups?: string[]; // IDs of assigned addon groups
}

interface AddonItem {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  dietaryType: 'veg' | 'non-veg' | 'vegan' | 'none';
}

interface AddonGroup {
  id: string;
  name: string;
  subtitle?: string;
  minSelect: number;
  maxSelect: number;
  items: AddonItem[];
  isExpanded: boolean;
  isRequired: boolean;
  isActive?: boolean;
}



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

// Constants for Item Settings
const dietaryTagOptions = [
  'Gluten Free',
  'Dairy Free',
  'Nut Free',
  'Soy Free',
  'Sugar Free',
  'Low Carb',
  'High Protein',
  'Organic',
  'Local',
  'Seasonal'
];

const allergenOptions = [
  'Peanuts',
  'Tree Nuts',
  'Milk',
  'Eggs',
  'Fish',
  'Shellfish',
  'Soy',
  'Wheat',
  'Sesame',
  'Mustard'
];

const additiveOptions = [
  'Preservatives',
  'Artificial Colors',
  'Artificial Flavors',
  'MSG',
  'Nitrates',
  'Sulfites',
  'BHA/BHT'
];

export function MenuConfigPage({ user }: { user?: any }) {
  const userRole = user?.role;
  const canCreateCategory = hasPermission(userRole, Permission.CREATE_MENU_CATEGORY);
  const canEditCategory = hasPermission(userRole, Permission.EDIT_MENU_CATEGORY);
  const canDeleteCategory = hasPermission(userRole, Permission.DELETE_MENU_CATEGORY);
  const canCreateItem = hasPermission(userRole, Permission.CREATE_MENU_ITEM);
  const canEditItem = hasPermission(userRole, Permission.EDIT_MENU_ITEM);
  const canDeleteItem = hasPermission(userRole, Permission.DELETE_MENU_ITEM);
  const canManageAddons = hasPermission(userRole, Permission.CREATE_ADDON) ||
    hasPermission(userRole, Permission.EDIT_ADDON) ||
    hasPermission(userRole, Permission.DELETE_ADDON);

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [addonGroups, setAddonGroups] = useState<AddonGroup[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'items' | 'addons'>('items');
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
  const [choiceCategoryId, setChoiceCategoryId] = useState<string | null>(null);
  const [choiceItemId, setChoiceItemId] = useState<string | null>(null);
  const [selectedAddonGroups, setSelectedAddonGroups] = useState<string[]>([]);
  // Expandable sections in Add Menu Item modal
  const [showItemSettings, setShowItemSettings] = useState(false);
  const [showAddons, setShowAddons] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  // Pricing mode: 'price' for simple price, 'variants' for variant-based pricing
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
    // Item settings for expandable section
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

  // Fetch menu data from database on component mount
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const response = await fetch('/api/admin/menu');
        if (response.ok) {
          const data = await response.json();

          // Map database categories to component format
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
              isGlutenFree: item.dietaryTags?.includes('Gluten Free') || item.dietaryTags?.includes('gluten-free') || false,
              ingredients: item.ingredients || '',
              allergens: item.allergens || [],
              additives: item.additives || [],
              nutritionalInfo: item.nutritionalInfo || {},
              isCombo: item.isCombo || false,
              assignedAddonGroups: (data.itemAddonGroups || []).filter((a: any) => a.itemId === item.id).map((a: any) => a.addonGroupId),
            })) || [],
            assignedAddonGroups: (data.categoryAddonGroups || []).filter((a: any) => a.categoryId === cat.id).map((a: any) => a.addonGroupId),
          }));

          // Map database addon groups to component format
          const mappedAddons: AddonGroup[] = (data.addonGroups || []).map((group: any) => ({
            id: group.id,
            name: group.name,
            subtitle: group.subtitle || '',
            minSelect: group.minSelect || 0,
            maxSelect: group.maxSelect || 1,
            items: (data.addonItemsByGroup?.[group.id] || []).map((item: any) => ({
              id: item.id,
              name: item.name,
              price: Number(item.price) || 0,
              dietaryType: item.dietaryType || 'none',
              isActive: item.isActive,
            })),
            isExpanded: false,
            isRequired: group.isRequired || false,
            isActive: group.isActive,
          }));

          setCategories(mappedCategories);
          setAddonGroups(mappedAddons);
        } else {
          // Empty arrays on fetch failure
          setCategories([]);
          setAddonGroups([]);
        }
      } catch (error) {
        console.error('Error fetching menu data:', error);
        // Empty arrays on error
        setCategories([]);
        setAddonGroups([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuData();
  }, []);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end for categories
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = categories.findIndex((cat) => cat.id === active.id);
      const newIndex = categories.findIndex((cat) => cat.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        // Reorder categories locally
        const newCategories = [...categories];
        const [movedCategory] = newCategories.splice(oldIndex, 1);
        newCategories.splice(newIndex, 0, movedCategory);
        setCategories(newCategories);

        // Update sort orders for all affected categories
        const updates = newCategories.map((cat, index) => ({
          id: cat.id,
          sortOrder: index,
        }));

        // Send batch update to server
        try {
          for (const update of updates) {
            await updateMenuCategory(update.id, { sortOrder: update.sortOrder });
          }
          console.log('✅ Category order updated');
        } catch (error) {
          console.error('Error updating category order:', error);
          // Revert on error
          setCategories(categories);
        }
      }
    }
  };

  const toggleGroup = (groupId: string) => {
    setAddonGroups(addonGroups.map(group =>
      group.id === groupId ? { ...group, isExpanded: !group.isExpanded } : group
    ));
  };

  const toggleAddonGroupActive = (groupId: string) => {
    setAddonGroups(addonGroups.map(group =>
      group.id === groupId ? { ...group, isActive: group.isActive === false ? true : false } : group
    ));
  };

  const duplicateAddonGroup = (groupId: string) => {
    const groupToDuplicate = addonGroups.find(g => g.id === groupId);
    if (groupToDuplicate) {
      const newGroup: AddonGroup = {
        ...groupToDuplicate,
        id: `addon-group-${Date.now()}`,
        name: `${groupToDuplicate.name} (Copy)`,
        items: groupToDuplicate.items.map(item => ({
          ...item,
          id: `addon-item-${Date.now()}-${Math.random()}`,
        })),
      };
      setAddonGroups([...addonGroups, newGroup]);
    }
  };

  const toggleCategoryExpanded = (categoryId: string) => {
    setCategories(categories.map(cat =>
      cat.id === categoryId ? { ...cat, isExpanded: !cat.isExpanded } : cat
    ));
  };

  const toggleCategoryActive = async (categoryId: string) => {
    // Update local state immediately for responsiveness
    setCategories(categories.map(cat =>
      cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat
    ));

    // Persist to database
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      console.log('Toggling category active:', categoryId, 'to', !category.isActive);
      const result = await updateMenuCategory(categoryId, { isActive: !category.isActive });
      console.log('Update result:', result);
      if (!result.success) {
        console.error('Failed to update category:', result.error);
        // Revert on error
        setCategories(categories.map(cat =>
          cat.id === categoryId ? { ...cat, isActive: category.isActive } : cat
        ));
        toast.error(result.error || 'Failed to update category');
        return;
      }
      // Refresh data from server
      const response = await fetch('/api/admin/menu');
      if (response.ok) {
        const data = await response.json();
        const mappedCategories: Category[] = data.categories.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          description: cat.description || '',
          image: cat.imageUrl || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop',
          isActive: cat.isActive,
          isExpanded: cat.isExpanded || false,
          guestCount: cat.guestCount || false,
          items: data.itemsByCategory[cat.id]?.map((item: any) => ({
            id: item.id,
            name: item.name,
            description: item.description || '',
            image: item.imageUrl || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=400&fit=crop',
            price: Number(item.pricePerPerson) || 0,
            pricingType: item.pricingType || 'per_person',
            isActive: item.isActive,
            variants: [],
            dietaryType: item.dietaryType || 'none',
            dietaryTags: item.dietaryTags || [],
            isGlutenFree: item.dietaryTags?.includes('Gluten Free') || item.dietaryTags?.includes('gluten-free') || false,
            assignedAddonGroups: (data.itemAddonGroups || []).filter((a: any) => a.itemId === item.id).map((a: any) => a.addonGroupId),
          })) || [],
          assignedAddonGroups: (data.categoryAddonGroups || []).filter((a: any) => a.categoryId === cat.id).map((a: any) => a.addonGroupId),
        }));
        setCategories(mappedCategories);
        toast.success('Category visibility updated successfully');
      }
    }
  };

  const toggleGuestCount = async (categoryId: string) => {
    // Persist to database first
    const category = categories.find(cat => cat.id === categoryId);
    if (category) {
      const newValue = !category.guestCount; // Toggle false/undefined to true, true to false
      console.log('Toggling guest count:', categoryId, 'from', category.guestCount, 'to', newValue);
      const result = await updateMenuCategory(categoryId, { guestCount: newValue });
      console.log('Update result:', result);
      if (!result.success) {
        console.error('Failed to update category:', result.error);
        toast.error(result.error || 'Failed to update category');
        return;
      }

      // Update local state only after successful database update
      setCategories(categories.map(cat =>
        cat.id === categoryId ? { ...cat, guestCount: newValue } : cat
      ));
      toast.success('Guest count setting updated successfully');
    }
  };

  const toggleMenuItemActive = async (categoryId: string, itemId: string) => {
    // Find the item
    const category = categories.find(cat => cat.id === categoryId);
    const item = category?.items.find(i => i.id === itemId);
    if (!item) return;

    // Update local state immediately for responsiveness
    setCategories(categories.map(cat =>
      cat.id === categoryId
        ? {
          ...cat,
          items: cat.items.map(i =>
            i.id === itemId ? { ...i, isActive: !i.isActive } : i
          ),
        }
        : cat
    ));

    // Persist to database
    console.log('Toggling item active:', itemId, 'to', !item.isActive);
    const result = await updateMenuItem(itemId, { isActive: !item.isActive });
    console.log('Update item result:', result);
    if (!result.success) {
      console.error('Failed to update item:', result.error);
      // Revert on error
      setCategories(categories.map(cat =>
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
      // Actually save to backend
      const result = await updateMenuItem(settingsMenuItemId, {
        dietaryType: itemSettings.dietaryType as any,
        dietaryTags: itemSettings.dietaryTags,
        ingredients: itemSettings.ingredients,
        allergens: itemSettings.allergens,
        additives: itemSettings.additives,
        nutritionalInfo: itemSettings.nutritionalInfo,
      });

      if (!result.success) {
        console.error('Failed to save settings:', result.error);
        toast.error(result.error || 'Failed to save settings');
        return;
      }

      setCategories(categories.map(cat =>
        cat.id === activeCategoryId
          ? {
            ...cat,
            items: cat.items.map(item =>
              item.id === settingsMenuItemId
                ? {
                  ...item,
                  dietaryType: itemSettings.dietaryType as any,
                  dietaryTags: itemSettings.dietaryTags,
                  ingredients: itemSettings.ingredients,
                  allergens: itemSettings.allergens,
                  additives: itemSettings.additives,
                  nutritionalInfo: itemSettings.nutritionalInfo,
                }
                : item
            ),
          }
          : cat
      ));

      setIsItemSettingsModalOpen(false);
      setSettingsMenuItemId(null);
      setActiveCategoryId(null);
      toast.success('Item settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const addVariant = () => {
    const newVariant: VariantOption = {
      id: `variant-${Date.now()}`,
      name: '',
      price: 0,
    };
    setNewMenuItem({
      ...newMenuItem,
      variants: [...newMenuItem.variants, newVariant],
    });
  };

  const updateVariant = (index: number, field: 'name' | 'price', value: string | number) => {
    const updatedVariants = [...newMenuItem.variants];
    updatedVariants[index] = {
      ...updatedVariants[index],
      [field]: value,
    };
    setNewMenuItem({
      ...newMenuItem,
      variants: updatedVariants,
    });
  };

  const removeVariant = (index: number) => {
    setNewMenuItem({
      ...newMenuItem,
      variants: newMenuItem.variants.filter((_, i) => i !== index),
    });
  };

  // Helper function for Item Settings tags
  const handleToggleTag = (tag: string, field: 'dietaryTags' | 'allergens' | 'additives') => {
    const currentArray = newMenuItem[field];
    if (currentArray.includes(tag)) {
      setNewMenuItem({
        ...newMenuItem,
        [field]: currentArray.filter(t => t !== tag),
      });
    } else {
      setNewMenuItem({
        ...newMenuItem,
        [field]: [...currentArray, tag],
      });
    }
  };

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.items.some(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="flex flex-col min-h-full">
      <div className="flex-1">
        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <SkeletonMenuCategory key={i} />
            ))}
          </div>
        )}

        {!loading && (
          <>
            {/* Tabs */}
            <div className="flex items-center gap-1 mb-6">
              <div className="inline-flex items-center gap-1 p-1 bg-card border border-border rounded-lg">
                <button
                  onClick={() => setActiveTab('items')}
                  className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${activeTab === 'items'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  Menu Categories
                </button>
                <button
                  onClick={() => setActiveTab('addons')}
                  className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${activeTab === 'addons'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                    }`}
                  style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                >
                  <ListPlus className="w-4 h-4" />
                  Choices & Addons
                </button>
              </div>
            </div>

            {/* Menu Items Tab */}
            {activeTab === 'items' && (
              <div className="bg-card border border-border rounded-xl">
                {/* Search Bar with Add Button */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search menu categories by name, description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                        style={{ fontSize: 'var(--text-base)' }}
                      />
                    </div>
                    {canCreateCategory && (
                      <Button
                        variant="primary"
                        icon={Plus}
                        onClick={() => {
                          setEditingCategoryId(null);
                          setNewCategory({ name: '', description: '', image: null, imageUrl: '' });
                          setIsAddCategoryModalOpen(true);
                        }}
                      >
                        Add New Category
                      </Button>
                    )}
                  </div>
                </div>

                {/* Categories List */}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                  modifiers={[restrictToVerticalAxis]}
                >
                  <SortableContext
                    items={filteredCategories.map(cat => cat.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {filteredCategories.map((category) => (
                      <SortableCategory key={category.id} id={category.id}>
                        {({ attributes, listeners, isDragging }) => (
                          <>
                            <div style={{ opacity: isDragging ? 0.5 : 1 }}>
                              {/* Category Row */}
                              <div className="px-6 py-4 border-b border-border hover:bg-accent/30 transition-colors flex items-center gap-4 group">
                                {/* Drag Handle */}
                                {canEditCategory && (
                                  <button
                                    {...attributes}
                                    {...listeners}
                                    className="text-muted-foreground hover:text-foreground transition-colors cursor-grab active:cursor-grabbing flex-shrink-0"
                                  >
                                    <GripVertical className="w-5 h-5" />
                                  </button>
                                )}

                                {/* Expand/Collapse Button */}
                                <button
                                  onClick={() => toggleCategoryExpanded(category.id)}
                                  className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0 cursor-pointer"
                                >
                                  {category.isExpanded ? (
                                    <ChevronDown className="w-5 h-5" />
                                  ) : (
                                    <Tooltip title="View item details" position="top">
                                      <ChevronRight className="w-5 h-5" />
                                    </Tooltip>
                                  )}
                                </button>

                                {/* Image - Larger rectangular */}
                                <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted relative">
                                  <ImageWithFallback
                                    src={category.image}
                                    alt={category.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>

                                {/* Content - Name, Description, Item Count */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <h4 className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                                      {category.name}
                                    </h4>
                                    {category.items.length > 0 && (
                                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full" style={{ fontSize: 'var(--text-small)' }}>
                                        {category.items.length} {category.items.length === 1 ? 'item' : 'items'}
                                      </span>
                                    )}
                                    {/* {category.guestCount && (
                                      <Tooltip title="Manual guest count enabled" position="top">
                                        <span className="px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full flex items-center gap-1" style={{ fontSize: 'var(--text-small)' }}>
                                          <Users className="w-3 h-3" />
                                          Manual
                                        </span>
                                      </Tooltip>
                                    )} */}
                                  </div>
                                  <p className="text-muted-foreground line-clamp-1" style={{ fontSize: 'var(--text-small)' }}>
                                    {category.description}
                                  </p>
                                </div>

                                {/* Actions - Right side */}
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {canEditCategory && (
                                    <Tooltip title="Edit category" position="top">
                                      <button
                                        onClick={() => {
                                          setEditingCategoryId(category.id);
                                          setNewCategory({
                                            name: category.name,
                                            description: category.description,
                                            image: null,
                                            imageUrl: category.image,
                                          });
                                          setIsAddCategoryModalOpen(true);
                                        }}
                                        className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                    </Tooltip>
                                  )}

                                  {canCreateItem && (
                                    <Tooltip title="Add menu item" position="top">
                                      <button
                                        onClick={() => {
                                          setActiveCategoryId(category.id);
                                          setEditingMenuItemId(null);
                                          setNewMenuItem({
                                            name: '',
                                            description: '',
                                            price: '',
                                            pricingType: 'per_person',
                                            image: null,
                                            imageUrl: '',
                                            isActive: true,
                                            variants: [],
                                            assignedAddonGroups: [],
                                            isCombo: false,
                                            dietaryType: 'veg',
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
                                          setShowItemSettings(false);
                                          setShowAddons(false);
                                          setShowChoices(false);
                                          setPricingMode('price');
                                          setIsAddMenuItemModalOpen(true);
                                        }}
                                        className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                                      >
                                        <Plus className="w-4 h-4" />
                                      </button>
                                    </Tooltip>
                                  )}

                                  {canEditCategory && (
                                    <Tooltip title="Add choice" position="top">
                                      <button
                                        onClick={() => {
                                          setChoiceCategoryId(category.id);
                                          setSelectedAddonGroups(category.assignedAddonGroups || []);
                                          setIsAddChoiceModalOpen(true);
                                        }}
                                        className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                                      >
                                        <ListPlus className="w-4 h-4" />
                                      </button>
                                    </Tooltip>
                                  )}

                                  {(canEditCategory || canDeleteCategory) && (
                                    <div className="relative">
                                      <button
                                        onClick={() => setOpenDropdownId(openDropdownId === category.id ? null : category.id)}
                                        className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                                      >
                                        <MoreVertical className="w-4 h-4" />
                                      </button>

                                      {/* Dropdown Menu */}
                                      {openDropdownId === category.id && (
                                        <>
                                          {/* Backdrop to close dropdown */}
                                          <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setOpenDropdownId(null)}
                                          />

                                          {/* Dropdown */}
                                          <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-20">
                                            {canEditCategory && (
                                              <button
                                                onClick={() => {
                                                  setChoiceCategoryId(category.id);
                                                  setSelectedAddonGroups(category.assignedAddonGroups || []);
                                                  setIsAddChoiceModalOpen(true);
                                                  setOpenDropdownId(null);
                                                }}
                                                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left border-b border-border"
                                              >
                                                <ListPlus className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                                                  Add choice
                                                </span>
                                              </button>
                                            )}

                                            {canCreateCategory && (
                                              <button
                                                onClick={() => {
                                                  console.log('Duplicate', category.name);
                                                  setOpenDropdownId(null);
                                                }}
                                                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left border-b border-border"
                                              >
                                                <Copy className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                                                  Duplicate
                                                </span>
                                              </button>
                                            )}

                                            {canEditCategory && (
                                              <button
                                                onClick={() => {
                                                  toggleCategoryActive(category.id);
                                                  setOpenDropdownId(null);
                                                }}
                                                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left border-b border-border"
                                              >
                                                {category.isActive ? (
                                                  <>
                                                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                                                      Hide
                                                    </span>
                                                  </>
                                                ) : (
                                                  <>
                                                    <Eye className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                                                      Show
                                                    </span>
                                                  </>
                                                )}
                                              </button>
                                            )}

                                            {/* {canEditCategory && (
                                              <button
                                                onClick={() => {
                                                  toggleGuestCount(category.id);
                                                  setOpenDropdownId(null);
                                                }}
                                                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left border-b border-border"
                                              >
                                                <Users className="w-4 h-4 text-muted-foreground" />
                                                <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                                                  {category.guestCount ? 'Auto guest count' : 'Manual guest count'}
                                                </span>
                                              </button>
                                            )} */}

                                            {canDeleteCategory && (
                                              <button
                                                onClick={() => {
                                                  setDeleteCategoryId(category.id);
                                                  setOpenDropdownId(null);
                                                }}
                                                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left"
                                              >
                                                <Trash2 className="w-4 h-4 text-destructive" />
                                                <span className="text-destructive" style={{ fontSize: 'var(--text-base)' }}>
                                                  Remove
                                                </span>
                                              </button>
                                            )}
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Menu Items - Nested under category */}
                              {category.isExpanded && category.items.length > 0 && (
                                <div className="bg-muted/30">
                                  {category.items.map((item, index) => (
                                    <div
                                      key={item.id}
                                      className={`pl-20 pr-6 py-3 flex items-center gap-4 hover:bg-accent/30 transition-colors group ${index !== category.items.length - 1 ? 'border-b border-border/50' : ''
                                        }`}
                                    >
                                      {/* Drag Handle */}
                                      {canEditItem && (
                                        <button className="text-muted-foreground hover:text-foreground transition-colors cursor-grab active:cursor-grabbing flex-shrink-0">
                                          <GripVertical className="w-4 h-4" />
                                        </button>
                                      )}

                                      {/* Image - Smaller for items */}
                                      <div className="w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted relative">
                                        <ImageWithFallback
                                          src={item.image}
                                          alt={item.name}
                                          className="w-full h-full object-cover"
                                        />
                                        {!item.isActive && (
                                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                            <EyeOff className="w-4 h-4 text-white" />
                                          </div>
                                        )}
                                      </div>

                                      {/* Content */}
                                      <div className="flex-1 min-w-0">
                                        <h5 className="text-foreground flex items-center gap-2 flex-wrap mb-0.5" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                                          {item.dietaryType && (
                                            <DietaryIcon type={item.dietaryType as any} size="sm" />
                                          )}
                                          <span>{item.name}</span>
                                          {item.isCombo && (
                                            <span
                                              className="px-2 py-0.5 rounded text-xs uppercase inline-block ml-1"
                                              style={{
                                                backgroundColor: 'rgba(var(--primary-rgb), 0.1)',
                                                color: 'var(--primary)',
                                                fontSize: '10px',
                                                fontWeight: 'var(--font-weight-semibold)',
                                                letterSpacing: '0.5px'
                                              }}
                                            >
                                              Combo Item
                                            </span>
                                          )}
                                        </h5>
                                        <p className="text-muted-foreground line-clamp-1" style={{ fontSize: 'var(--text-small)' }}>
                                          {item.description}
                                        </p>
                                        {item.variants.length > 0 && (
                                          <div className="flex flex-wrap gap-1.5 mt-1.5">
                                            {item.variants.map((variant) => (
                                              <span
                                                key={variant.id}
                                                className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded"
                                                style={{ fontSize: 'var(--text-small)' }}
                                              >
                                                {variant.name}: €{variant.price.toFixed(2)}
                                              </span>
                                            ))}
                                          </div>
                                        )}
                                      </div>

                                      {/* Price */}
                                      <div className="text-right flex-shrink-0">
                                        <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                                          €{item.price.toFixed(2)}
                                        </p>
                                      </div>

                                      {/* Actions */}
                                      <div className="flex items-center gap-1 flex-shrink-0">
                                        {canEditItem && (
                                          <Tooltip title="Edit item" position="top">
                                            <button
                                              onClick={() => {
                                                setActiveCategoryId(category.id);
                                                setEditingMenuItemId(item.id);
                                                setNewMenuItem({
                                                  name: item.name,
                                                  description: item.description,
                                                  price: item.price.toString(),
                                                  pricingType: (item as any).pricingType || 'per_person',
                                                  image: null,
                                                  imageUrl: item.image,
                                                  isActive: item.isActive,
                                                  variants: item.variants || [],
                                                  assignedAddonGroups: item.assignedAddonGroups || [],
                                                  isCombo: item.isCombo || false,
                                                  dietaryType: item.dietaryType || 'none',
                                                  dietaryTags: item.dietaryTags || [],
                                                  ingredients: item.ingredients || '',
                                                  allergens: item.allergens || [],
                                                  additives: item.additives || [],
                                                  nutritionalInfo: {
                                                    servingSize: item.nutritionalInfo?.servingSize || '',
                                                    calories: item.nutritionalInfo?.calories || '',
                                                    protein: item.nutritionalInfo?.protein || '',
                                                    carbs: item.nutritionalInfo?.carbs || '',
                                                    fat: item.nutritionalInfo?.fat || '',
                                                    fiber: item.nutritionalInfo?.fiber || '',
                                                    sugar: item.nutritionalInfo?.sugar || '',
                                                    sodium: item.nutritionalInfo?.sodium || '',
                                                  },
                                                });
                                                setShowItemSettings(false);
                                                setShowAddons(false);
                                                setShowChoices(false);
                                                // Set pricing mode based on whether item has variants
                                                setPricingMode((item.variants && item.variants.length > 0) ? 'variants' : 'price');
                                                setIsAddMenuItemModalOpen(true);
                                              }}
                                              className="p-1.5 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                                            >
                                              <Edit2 className="w-4 h-4" />
                                            </button>
                                          </Tooltip>
                                        )}
                                        {canEditItem && (
                                          <Tooltip title="Item settings" position="top">
                                            <button
                                              onClick={() => {
                                                setActiveCategoryId(category.id);
                                                setSettingsMenuItemId(item.id);
                                                setItemSettings({
                                                  dietaryType: item.dietaryType || 'none',
                                                  dietaryTags: item.dietaryTags || [],
                                                  ingredients: item.ingredients || '',
                                                  allergens: item.allergens || [],
                                                  additives: item.additives || [],
                                                  nutritionalInfo: {
                                                    servingSize: item.nutritionalInfo?.servingSize || '',
                                                    calories: item.nutritionalInfo?.calories || '',
                                                    protein: item.nutritionalInfo?.protein || '',
                                                    carbs: item.nutritionalInfo?.carbs || '',
                                                    fat: item.nutritionalInfo?.fat || '',
                                                    fiber: item.nutritionalInfo?.fiber || '',
                                                    sugar: item.nutritionalInfo?.sugar || '',
                                                    sodium: item.nutritionalInfo?.sodium || '',
                                                  },
                                                });
                                                setIsItemSettingsModalOpen(true);
                                              }}
                                              className="p-1.5 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                                            >
                                              <Settings className="w-4 h-4" />
                                            </button>
                                          </Tooltip>
                                        )}
                                        {canEditItem && (
                                          <Tooltip title="Add choice" position="top">
                                            <button
                                              onClick={() => {
                                                setActiveCategoryId(category.id);
                                                setChoiceItemId(item.id);
                                                setSelectedAddonGroups(item.assignedAddonGroups || []);
                                                setIsAddChoiceModalOpen(true);
                                              }}
                                              className="p-1.5 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                                            >
                                              <ListPlus className="w-4 h-4" />
                                            </button>
                                          </Tooltip>
                                        )}
                                        {canEditItem && (
                                          <Tooltip title={item.isActive ? "Hide item" : "Show item"} position="top">
                                            <button
                                              onClick={() => toggleMenuItemActive(category.id, item.id)}
                                              className="p-1.5 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                                            >
                                              {item.isActive ? (
                                                <Eye className="w-4 h-4" />
                                              ) : (
                                                <EyeOff className="w-4 h-4" />
                                              )}
                                            </button>
                                          </Tooltip>
                                        )}
                                        {canDeleteItem && (
                                          <Tooltip title="Delete item" position="left">
                                            <button
                                              onClick={() => {
                                                setDeleteMenuItemId(item.id);
                                                setActiveCategoryId(category.id);
                                              }}
                                              className="p-1.5 hover:bg-accent rounded-lg transition-colors text-destructive hover:text-destructive cursor-pointer"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </button>
                                          </Tooltip>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Empty state for expanded category with no items */}
                              {category.isExpanded && category.items.length === 0 && (
                                <div className="bg-muted/30 pl-20 pr-6 py-8 text-center">
                                  <p className="text-muted-foreground mb-3" style={{ fontSize: 'var(--text-base)' }}>
                                    No items in this category yet
                                  </p>
                                  {canCreateItem && (
                                    <button
                                      onClick={() => {
                                        setActiveCategoryId(category.id);
                                        setEditingMenuItemId(null);
                                        setNewMenuItem({
                                          name: '',
                                          description: '',
                                          price: '',
                                          pricingType: 'per_person',
                                          image: null,
                                          imageUrl: '',
                                          isActive: true,
                                          variants: [],
                                          assignedAddonGroups: [],
                                          isCombo: false,
                                          dietaryType: 'veg',
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
                                        setShowItemSettings(false);
                                        setShowAddons(false);
                                        setShowChoices(false);
                                        setIsAddMenuItemModalOpen(true);
                                      }}
                                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity inline-flex items-center gap-2"
                                    >
                                      <Plus className="w-4 h-4" />
                                      <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                                        Add First Item
                                      </span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </SortableCategory>
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            )}

            {/* Addons Tab */}
            {activeTab === 'addons' && (
              <div className="bg-card border border-border rounded-xl">
                {/* Search Bar with Add Button */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search choice groups by name..."
                        className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                        style={{ fontSize: 'var(--text-base)' }}
                      />
                    </div>
                    {canManageAddons && (
                      <Button
                        variant="primary"
                        icon={Plus}
                        onClick={() => {
                          setNewGroup({ name: '', subtitle: '', type: 'optional', minSelect: 0, maxSelect: 1 });
                          setIsAddGroupModalOpen(true);
                        }}
                      >
                        Add Group
                      </Button>
                    )}
                  </div>
                </div>

                {/* Choice Groups List */}
                <div>
                  {addonGroups.map((group) => (
                    <div key={group.id}>
                      {/* Group Row */}
                      <div className="px-6 py-4 border-b border-border hover:bg-accent/30 transition-colors flex items-center gap-4 group">
                        {/* Drag Handle */}
                        {canManageAddons && (
                          <button className="text-muted-foreground hover:text-foreground transition-colors cursor-grab active:cursor-grabbing flex-shrink-0">
                            <GripVertical className="w-5 h-5" />
                          </button>
                        )}

                        {/* Expand/Collapse Button */}
                        <button
                          onClick={() => toggleGroup(group.id)}
                          className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                        >
                          {group.isExpanded ? (
                            <ChevronDown className="w-5 h-5" />
                          ) : (
                            <ChevronRight className="w-5 h-5" />
                          )}
                        </button>

                        {/* Content - Name, Description, Item Count */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                              {group.name}
                            </h4>
                            <span className={`px-2 py-0.5 rounded-full ${group.isRequired ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'}`} style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>
                              {group.isRequired ? 'Choice' : 'Addon'}
                            </span>
                            {group.isRequired && (
                              <span className="px-2 py-0.5 bg-destructive/10 text-destructive rounded-full" style={{ fontSize: 'var(--text-small)' }}>
                                Required
                              </span>
                            )}
                            {group.items.length > 0 && (
                              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full" style={{ fontSize: 'var(--text-small)' }}>
                                {group.items.length} {group.items.length === 1 ? 'item' : 'items'}
                              </span>
                            )}
                          </div>
                          <p className="text-muted-foreground line-clamp-1" style={{ fontSize: 'var(--text-small)' }}>
                            Select {group.minSelect}-{group.maxSelect}
                            {group.subtitle && ` • ${group.subtitle}`}
                          </p>
                        </div>

                        {/* Actions - Right side */}
                        {canManageAddons && (
                          <button
                            onClick={() => {
                              setEditingGroupId(group.id);
                              setNewGroup({
                                name: group.name,
                                subtitle: group.subtitle || '',
                                type: group.isRequired ? 'mandatory' : 'optional',
                                minSelect: group.minSelect,
                                maxSelect: group.maxSelect,
                              });
                              setIsAddGroupModalOpen(true);
                            }}
                            className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        )}
                        {canManageAddons && (
                          <button
                            onClick={() => setDeleteGroupId(group.id)}
                            className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                        {canManageAddons && (
                          <div className="relative">
                            <button
                              onClick={() => setOpenAddonGroupDropdownId(openAddonGroupDropdownId === group.id ? null : group.id)}
                              className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground relative z-30"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu */}
                            {openAddonGroupDropdownId === group.id && (
                              <>
                                {/* Backdrop to close dropdown */}
                                <div
                                  className="fixed inset-0 z-40"
                                  onClick={() => setOpenAddonGroupDropdownId(null)}
                                />

                                {/* Dropdown */}
                                <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50">
                                  <button
                                    onClick={() => {
                                      setCurrentGroupId(group.id);
                                      setEditingAddonItemId(null);
                                      setNewAddonItem({
                                        name: '',
                                        price: '',
                                        dietaryType: 'veg',
                                        isActive: true,
                                      });
                                      setIsAddAddonItemModalOpen(true);
                                      setOpenAddonGroupDropdownId(null);
                                    }}
                                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left border-b border-border"
                                  >
                                    <Plus className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                                      Add Item
                                    </span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      toggleAddonGroupActive(group.id);
                                      setOpenAddonGroupDropdownId(null);
                                    }}
                                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left border-b border-border"
                                  >
                                    {group.isActive === false ? (
                                      <Eye className="w-4 h-4 text-muted-foreground" />
                                    ) : (
                                      <EyeOff className="w-4 h-4 text-muted-foreground" />
                                    )}
                                    <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                                      {group.isActive === false ? 'Show' : 'Hide'}
                                    </span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      duplicateAddonGroup(group.id);
                                      setOpenAddonGroupDropdownId(null);
                                    }}
                                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left border-b border-border"
                                  >
                                    <Copy className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                                      Duplicate
                                    </span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      setDeleteGroupId(group.id);
                                      setOpenAddonGroupDropdownId(null);
                                    }}
                                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    <span style={{ fontSize: 'var(--text-base)' }}>
                                      Delete
                                    </span>
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Addon Items - Nested under group */}
                      {group.isExpanded && group.items.length > 0 && (
                        <div className="bg-muted/30">
                          {group.items.map((item, index) => (
                            <div
                              key={item.id}
                              className={`pl-20 pr-6 py-3 flex items-center gap-4 hover:bg-accent/30 transition-colors group ${index !== group.items.length - 1 ? 'border-b border-border/50' : ''}`}
                            >
                              {/* Drag Handle */}
                              {canManageAddons && (
                                <button className="text-muted-foreground hover:text-foreground transition-colors cursor-grab active:cursor-grabbing flex-shrink-0">
                                  <GripVertical className="w-4 h-4" />
                                </button>
                              )}

                              {/* Active Status Indicator */}
                              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h5 className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                                    {item.name}
                                  </h5>
                                  {/* Veg/Non-Veg Indicator */}
                                  <span className={`inline-flex items-center justify-center w-5 h-5 rounded border-2 flex-shrink-0 ${item.dietaryType === 'veg' ? 'border-green-600' : 'border-red-600'}`}>
                                    <span className={`w-2 h-2 rounded-full ${item.dietaryType === 'veg' ? 'bg-green-600' : 'bg-red-600'}`} />
                                  </span>
                                </div>
                              </div>

                              {/* Price */}
                              <div className="text-right flex-shrink-0">
                                <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                                  €{item.price.toFixed(2)}
                                </p>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-1 flex-shrink-0">
                                {canManageAddons && (
                                  <button
                                    onClick={() => {
                                      setCurrentGroupId(group.id);
                                      setEditingAddonItemId(item.id);
                                      setNewAddonItem({
                                        name: item.name,
                                        price: item.price.toString(),
                                        dietaryType: item.dietaryType,
                                        isActive: item.isActive,
                                      });
                                      setIsAddAddonItemModalOpen(true);
                                    }}
                                    className="p-1.5 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                )}
                                {canManageAddons && (
                                  <button
                                    onClick={() => {
                                      const updatedGroups = addonGroups.map(g => {
                                        if (g.id === group.id) {
                                          return {
                                            ...g,
                                            items: g.items.map(i =>
                                              i.id === item.id ? { ...i, isActive: !i.isActive } : i
                                            ),
                                          };
                                        }
                                        return g;
                                      });
                                      setAddonGroups(updatedGroups);
                                    }}
                                    className="p-1.5 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                                  >
                                    {item.isActive ? (
                                      <Eye className="w-4 h-4" />
                                    ) : (
                                      <EyeOff className="w-4 h-4" />
                                    )}
                                  </button>
                                )}
                                {canManageAddons && (
                                  <button
                                    onClick={() => {
                                      setCurrentGroupId(group.id);
                                      setDeleteAddonItemId(item.id);
                                    }}
                                    className="p-1.5 hover:bg-accent rounded-lg transition-colors text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Empty state for expanded group with no items */}
                      {group.isExpanded && group.items.length === 0 && (
                        <div className="bg-muted/30 pl-20 pr-6 py-8 flex flex-col items-center">
                          <p className="text-muted-foreground mb-3" style={{ fontSize: 'var(--text-base)' }}>
                            No items in this choice group yet
                          </p>
                          {canManageAddons && (
                            <Button
                              variant="primary"
                              icon={Plus}
                              onClick={() => {
                                setCurrentGroupId(group.id);
                                setEditingAddonItemId(null);
                                setNewAddonItem({
                                  name: '',
                                  price: '',
                                  dietaryType: 'veg',
                                  isActive: true,
                                });
                                setIsAddAddonItemModalOpen(true);
                              }}
                            >
                              Add First Item
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Copyright Footer */}
            <div className="text-center pt-8 pb-1 mt-auto">
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                © 2026 Restaurant Oliv Restaurant & Bar
              </p>
            </div>

            {/* Add/Edit Category Modal */}
            <Modal
              isOpen={isAddCategoryModalOpen}
              onClose={() => setIsAddCategoryModalOpen(false)}
              icon={UtensilsCrossed}
              title={editingCategoryId ? 'Edit Category' : 'Add New Category'}
              footer={
                <>
                  <Button
                    variant="secondary"
                    icon={X}
                    onClick={() => {
                      setIsAddCategoryModalOpen(false);
                      setNewCategory({ name: '', description: '', image: null, imageUrl: '' });
                      setEditingCategoryId(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    icon={editingCategoryId ? Check : Plus}
                    onClick={async () => {
                      if (editingCategoryId) {
                        // Update existing category
                        console.log('Updating category:', editingCategoryId);
                        const result = await updateMenuCategory(editingCategoryId, {
                          name: newCategory.name,
                          nameDe: newCategory.name,
                          description: newCategory.description,
                          descriptionDe: newCategory.description,
                        });
                        console.log('Update category result:', result);
                        if (result.success) {
                          setCategories(categories.map(cat =>
                            cat.id === editingCategoryId
                              ? { ...cat, name: newCategory.name, description: newCategory.description, image: newCategory.image ? URL.createObjectURL(newCategory.image) : newCategory.imageUrl }
                              : cat
                          ));
                          setIsAddCategoryModalOpen(false);
                          setNewCategory({ name: '', description: '', image: null, imageUrl: '' });
                          setEditingCategoryId(null);
                          toast.success('Category updated successfully');
                        } else {
                          toast.error(result.error || 'Failed to update category');
                        }
                      } else {
                        // Create new category
                        console.log('Creating category:', newCategory.name);
                        const result = await createMenuCategory({
                          name: newCategory.name,
                          nameDe: newCategory.name,
                          description: newCategory.description,
                          descriptionDe: newCategory.description,
                        });
                        console.log('Create category result:', result);
                        if (result.success && result.data) {
                          const newCat: Category = {
                            id: result.data.id,
                            name: newCategory.name,
                            description: newCategory.description,
                            image: newCategory.image ? URL.createObjectURL(newCategory.image) : newCategory.imageUrl,
                            isActive: true,
                            isExpanded: false,
                            guestCount: false,
                            items: [],
                          };
                          setCategories([...categories, newCat]);
                          setIsAddCategoryModalOpen(false);
                          setNewCategory({ name: '', description: '', image: null, imageUrl: '' });
                          setEditingCategoryId(null);
                          toast.success('Category created successfully');
                        } else {
                          toast.error(result.error || 'Failed to create category');
                        }
                      }
                    }}
                    disabled={!newCategory.name || newCategory.name.trim() === '' || newCategory.name.length > 100 || newCategory.description.length > 500}
                  >
                    {editingCategoryId ? 'Save Changes' : 'Add Category'}
                  </Button>
                </>
              }
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    Category Name *
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="e.g., Appetizers, Main Courses"
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    style={{ fontSize: 'var(--text-base)' }}
                  />
                </div>

                <div>
                  <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    Description
                  </label>
                  <textarea
                    value={newCategory.description}
                    maxLength={500}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="Brief description of this category"
                    rows={3}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    style={{ fontSize: 'var(--text-base)' }}
                  />
                </div>

                <div>
                  <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    Category Image
                  </label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 bg-muted/20">
                    {(newCategory.imageUrl || newCategory.image) ? (
                      <div className="space-y-3">
                        <div className="w-full h-48 rounded-lg overflow-hidden bg-muted">
                          <ImageWithFallback
                            src={newCategory.image ? URL.createObjectURL(newCategory.image) : newCategory.imageUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <label className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2">
                          <Upload className="w-4 h-4" />
                          <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                            Change Image
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setNewCategory({ ...newCategory, image: file, imageUrl: '' });
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center py-8 cursor-pointer group">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                          <Upload className="w-8 h-8 text-primary" />
                        </div>
                        <span className="text-foreground mb-1" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                          Upload Image
                        </span>
                        <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                          Click to browse or drag and drop
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setNewCategory({ ...newCategory, image: file, imageUrl: '' });
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </Modal>

            {/* Add/Edit Menu Item Modal */}
            <Modal
              isOpen={isAddMenuItemModalOpen}
              onClose={() => {
                setIsAddMenuItemModalOpen(false);
                setShowItemSettings(false);
                setShowAddons(false);
                setShowChoices(false);
                setPricingMode('price');
              }}
              icon={UtensilsCrossed}
              title={editingMenuItemId ? 'Edit Menu Item' : 'Add New Menu Item'}
              footer={
                <>
                  <Button
                    variant="secondary"
                    icon={X}
                    onClick={() => {
                      setIsAddMenuItemModalOpen(false);
                      setActiveCategoryId(null);
                      setShowItemSettings(false);
                      setShowAddons(false);
                      setShowChoices(false);
                      setPricingMode('price');
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    icon={editingMenuItemId ? Check : Plus}
                    onClick={async () => {
                      if (!activeCategoryId || !newMenuItem.name || (pricingMode === 'price' && !newMenuItem.price) || (pricingMode === 'variants' && newMenuItem.variants.length === 0)) return;

                      if (editingMenuItemId) {
                        // Edit existing item
                        console.log('Updating menu item:', editingMenuItemId);
                        const result = await updateMenuItem(editingMenuItemId, {
                          name: newMenuItem.name,
                          nameDe: newMenuItem.name,
                          description: newMenuItem.description,
                          descriptionDe: newMenuItem.description,
                          pricePerPerson: Number(newMenuItem.price || 0).toString(),
                          pricingType: newMenuItem.pricingType,
                          imageUrl: newMenuItem.imageUrl || newMenuItem.image?.name || '',
                          isActive: newMenuItem.isActive,
                          variants: newMenuItem.variants,
                          isCombo: newMenuItem.isCombo,
                          dietaryType: newMenuItem.dietaryType,
                          dietaryTags: newMenuItem.dietaryTags,
                          ingredients: newMenuItem.ingredients,
                          allergens: newMenuItem.allergens,
                          additives: newMenuItem.additives,
                          nutritionalInfo: newMenuItem.nutritionalInfo,
                        });
                        console.log('Update item result:', result);
                        if (result.success) {
                          await updateItemAddonGroups(editingMenuItemId, newMenuItem.assignedAddonGroups);
                          setCategories(categories.map(cat =>
                            cat.id === activeCategoryId
                              ? {
                                ...cat,
                                items: cat.items.map(item =>
                                  item.id === editingMenuItemId
                                    ? {
                                      ...item,
                                      name: newMenuItem.name,
                                      description: newMenuItem.description,
                                      price: Number(newMenuItem.price || 0),
                                      pricingType: newMenuItem.pricingType,
                                      image: newMenuItem.image ? URL.createObjectURL(newMenuItem.image) : newMenuItem.imageUrl,
                                      isActive: newMenuItem.isActive,
                                      variants: newMenuItem.variants,
                                      isCombo: newMenuItem.isCombo,
                                      assignedAddonGroups: newMenuItem.assignedAddonGroups,
                                      dietaryType: newMenuItem.dietaryType,
                                      dietaryTags: newMenuItem.dietaryTags,
                                      ingredients: newMenuItem.ingredients,
                                      allergens: newMenuItem.allergens,
                                      additives: newMenuItem.additives,
                                      nutritionalInfo: newMenuItem.nutritionalInfo,
                                    }
                                    : item
                                ),
                              }
                              : cat
                          ));
                          setIsAddMenuItemModalOpen(false);
                          setNewMenuItem({
                            name: '',
                            description: '',
                            price: '',
                            pricingType: 'per_person',
                            image: null,
                            imageUrl: '',
                            isActive: true,
                            variants: [],
                            assignedAddonGroups: [],
                            isCombo: false,
                            dietaryType: 'veg',
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
                          setActiveCategoryId(null);
                          setEditingMenuItemId(null);
                          setShowItemSettings(false);
                          setShowAddons(false);
                          setShowChoices(false);
                          setPricingMode('price');
                          toast.success('Menu item updated successfully');
                        } else {
                          toast.error(result.error || 'Failed to update menu item');
                        }
                      } else {
                        // Add new item
                        console.log('Creating menu item:', newMenuItem.name);
                        const result = await createMenuItem({
                          categoryId: activeCategoryId,
                          name: newMenuItem.name,
                          nameDe: newMenuItem.name,
                          description: newMenuItem.description,
                          descriptionDe: newMenuItem.description,
                          pricePerPerson: Number(newMenuItem.price || 0),
                          pricingType: newMenuItem.pricingType,
                          imageUrl: newMenuItem.imageUrl || newMenuItem.image?.name || '',
                          variants: newMenuItem.variants,
                          isCombo: newMenuItem.isCombo,
                          dietaryType: newMenuItem.dietaryType,
                          dietaryTags: newMenuItem.dietaryTags,
                          ingredients: newMenuItem.ingredients,
                          allergens: newMenuItem.allergens,
                          additives: newMenuItem.additives,
                          nutritionalInfo: newMenuItem.nutritionalInfo,
                        });
                        console.log('Create item result:', result);

                        if (result.success && result.data) {
                          await updateItemAddonGroups(result.data.id, newMenuItem.assignedAddonGroups);
                          const newItem: MenuItemData = {
                            id: result.data.id,
                            name: newMenuItem.name,
                            description: newMenuItem.description,
                            price: Number(newMenuItem.price || 0),
                            pricingType: newMenuItem.pricingType,
                            image: newMenuItem.image ? URL.createObjectURL(newMenuItem.image) : newMenuItem.imageUrl,
                            isActive: newMenuItem.isActive,
                            variants: newMenuItem.variants,
                            assignedAddonGroups: newMenuItem.assignedAddonGroups,
                            dietaryType: newMenuItem.dietaryType,
                            dietaryTags: newMenuItem.dietaryTags,
                            ingredients: newMenuItem.ingredients,
                            allergens: newMenuItem.allergens,
                            additives: newMenuItem.additives,
                            nutritionalInfo: newMenuItem.nutritionalInfo,
                          };

                          setCategories(categories.map(cat =>
                            cat.id === activeCategoryId
                              ? { ...cat, items: [...cat.items, newItem] }
                              : cat
                          ));
                          setIsAddMenuItemModalOpen(false);
                          setNewMenuItem({
                            name: '',
                            description: '',
                            price: '',
                            pricingType: 'per_person',
                            image: null,
                            imageUrl: '',
                            isActive: true,
                            variants: [],
                            assignedAddonGroups: [],
                            isCombo: false,
                            dietaryType: 'veg',
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
                          setActiveCategoryId(null);
                          setEditingMenuItemId(null);
                          setShowItemSettings(false);
                          setShowAddons(false);
                          setShowChoices(false);
                          setPricingMode('price');
                          toast.success('Menu item created successfully');
                        } else {
                          toast.error(result.error || 'Failed to create menu item');
                        }
                      }
                    }}
                    disabled={!activeCategoryId || !newMenuItem.name || (pricingMode === 'price' && !newMenuItem.price) || (pricingMode === 'variants' && newMenuItem.variants.length === 0) || newMenuItem.name.trim() === '' || newMenuItem.name.length > 100 || newMenuItem.description.length > 500 || (newMenuItem.price !== '' && parseFloat(newMenuItem.price) < 0) || newMenuItem.variants.some(v => !v.name?.trim() || v.name.length > 100 || v.price < 0)}
                  >
                    {editingMenuItemId ? 'Save Changes' : 'Add Item'}
                  </Button>
                </>
              }
            >
              <div className="space-y-4">
                {!activeCategoryId && (
                  <div>
                    <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                      Select Category *
                    </label>
                    <select
                      value={activeCategoryId || ''}
                      onChange={(e) => setActiveCategoryId(e.target.value)}
                      className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                      style={{ fontSize: 'var(--text-base)' }}
                    >
                      <option value="">Choose a category...</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    Item Name *
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    value={newMenuItem.name}
                    onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                    placeholder="e.g., Margherita Pizza"
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    style={{ fontSize: 'var(--text-base)' }}
                  />
                </div>

                <div>
                  <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    Description
                  </label>
                  <textarea
                    value={newMenuItem.description}
                    maxLength={500}
                    onChange={(e) => setNewMenuItem({ ...newMenuItem, description: e.target.value })}
                    placeholder="Describe this menu item"
                    rows={3}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    style={{ fontSize: 'var(--text-base)' }}
                  />
                </div>

                <div>
                  <label className="block text-foreground mb-3" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    Pricing Type
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Per Person */}
                    <div
                      onClick={() => setNewMenuItem({ ...newMenuItem, pricingType: 'per_person' })}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${newMenuItem.pricingType === 'per_person' ? 'border-[#9DAE91] bg-[#9DAE91]/5 shadow-sm' : 'border-border bg-card hover:border-primary/30'}`}
                      style={{ borderRadius: 'var(--radius-card)' }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${newMenuItem.pricingType === 'per_person' ? 'border-[#9DAE91] bg-white' : 'border-border bg-white'}`}>
                          {newMenuItem.pricingType === 'per_person' && <div className="w-3 h-3 rounded-full bg-[#9DAE91]" />}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground leading-tight" style={{ fontSize: 'var(--text-base)' }}>Per Person</p>
                          <p className="text-muted-foreground mt-1 leading-snug" style={{ fontSize: '11px' }}>Price multiplies by guest count</p>
                        </div>
                      </div>
                    </div>

                    {/* Flat Rate */}
                    <div
                      onClick={() => setNewMenuItem({ ...newMenuItem, pricingType: 'flat_fee' })}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${newMenuItem.pricingType === 'flat_fee' ? 'border-[#9DAE91] bg-[#9DAE91]/5 shadow-sm' : 'border-border bg-card hover:border-primary/30'}`}
                      style={{ borderRadius: 'var(--radius-card)' }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${newMenuItem.pricingType === 'flat_fee' ? 'border-[#9DAE91] bg-white' : 'border-border bg-white'}`}>
                          {newMenuItem.pricingType === 'flat_fee' && <div className="w-3 h-3 rounded-full bg-[#9DAE91]" />}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground leading-tight" style={{ fontSize: 'var(--text-base)' }}>Flat Rate</p>
                          <p className="text-muted-foreground mt-1 leading-snug" style={{ fontSize: '11px' }}>Fixed price regardless of guests</p>
                        </div>
                      </div>
                    </div>

                    {/* Billed by Consumption */}
                    <div
                      onClick={() => setNewMenuItem({ ...newMenuItem, pricingType: 'billed_by_consumption' })}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${newMenuItem.pricingType === 'billed_by_consumption' ? 'border-[#9DAE91] bg-[#9DAE91]/5 shadow-sm' : 'border-border bg-card hover:border-primary/30'}`}
                      style={{ borderRadius: 'var(--radius-card)' }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${newMenuItem.pricingType === 'billed_by_consumption' ? 'border-[#9DAE91] bg-white' : 'border-border bg-white'}`}>
                          {newMenuItem.pricingType === 'billed_by_consumption' && <div className="w-3 h-3 rounded-full bg-[#9DAE91]" />}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground leading-tight" style={{ fontSize: 'var(--text-base)' }}>Billed by Consumption</p>
                          <p className="text-muted-foreground mt-1 leading-snug" style={{ fontSize: '11px' }}>Based on actual usage</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing Mode Toggle */}
                <div className="flex items-center justify-between">
                  <label className="block text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    Pricing Mode
                  </label>
                  <div className="flex items-center justify-between p-3 rounded-lg gap-2" >
                    <span
                      className={`text-foreground cursor-pointer transition-colors ${pricingMode === 'price' ? 'font-semibold' : 'text-muted-foreground'}`}
                      style={{ fontSize: 'var(--text-base)', fontWeight: pricingMode === 'price' ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)' }}
                      onClick={() => {
                        setPricingMode('price');
                        setNewMenuItem({ ...newMenuItem, variants: [] });
                      }}
                    >
                      Price
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        if (pricingMode === 'price') {
                          setPricingMode('variants');
                          setNewMenuItem({ ...newMenuItem, price: '' });
                        } else {
                          setPricingMode('price');
                          setNewMenuItem({ ...newMenuItem, variants: [] });
                        }
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${pricingMode === 'variants' ? 'bg-primary' : 'bg-muted'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pricingMode === 'variants' ? 'translate-x-6' : 'translate-x-1'}`}
                      />
                    </button>

                    <span
                      className={`text-foreground cursor-pointer transition-colors ${pricingMode === 'variants' ? 'font-semibold' : 'text-muted-foreground'}`}
                      style={{ fontSize: 'var(--text-base)', fontWeight: pricingMode === 'variants' ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)' }}
                      onClick={() => {
                        setPricingMode('variants');
                        setNewMenuItem({ ...newMenuItem, price: '' });
                      }}
                    >
                      Variants
                    </span>
                  </div>
                </div>

                {/* Price Input - Only show when pricingMode is 'price' */}
                {pricingMode === 'price' && (
                  <div>
                    <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                      Price *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>€</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newMenuItem.price}
                        onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                        style={{ fontSize: 'var(--text-base)' }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-lg border border-border">
                  <div
                    className="flex-shrink-0 cursor-pointer"
                    onClick={() => setNewMenuItem({ ...newMenuItem, isCombo: !newMenuItem.isCombo })}
                  >
                    <div className={`w-6 h-6 rounded border-2 transition-colors flex items-center justify-center ${newMenuItem.isCombo ? 'bg-primary border-primary' : 'border-border'}`}>
                      {newMenuItem.isCombo && <Check className="w-4 h-4 text-white" />}
                    </div>
                  </div>
                  <div>
                    <label
                      className="block text-foreground cursor-pointer"
                      style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                      onClick={() => setNewMenuItem({ ...newMenuItem, isCombo: !newMenuItem.isCombo })}
                    >
                      Is this Combo Item
                    </label>
                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                      Mark this as a combo pack to group it separately in the menu
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    Item Image
                  </label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4 bg-muted/20">
                    {(newMenuItem.imageUrl || newMenuItem.image) ? (
                      <div className="space-y-3">
                        <div className="w-full h-48 rounded-lg overflow-hidden bg-muted">
                          <ImageWithFallback
                            src={newMenuItem.image ? URL.createObjectURL(newMenuItem.image) : newMenuItem.imageUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <label className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2">
                          <Upload className="w-4 h-4" />
                          <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                            Change Image
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                setNewMenuItem({ ...newMenuItem, image: file, imageUrl: '' });
                              }
                            }}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center py-8 cursor-pointer group">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                          <Upload className="w-8 h-8 text-primary" />
                        </div>
                        <span className="text-foreground mb-1" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                          Upload Image
                        </span>
                        <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                          Click to browse or drag and drop
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setNewMenuItem({ ...newMenuItem, image: file, imageUrl: '' });
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Variants Section - Only show when pricingMode is 'variants' */}
                {pricingMode === 'variants' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                        Variants *
                      </label>
                      <button
                        type="button"
                        onClick={addVariant}
                        className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>Add Variant</span>
                      </button>
                    </div>

                    {newMenuItem.variants.length > 0 ? (
                      <div className="space-y-2 mt-3">
                        {newMenuItem.variants.map((variant, index) => (
                          <div key={variant.id} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                            <input
                              type="text"
                              maxLength={100}
                              value={variant.name}
                              onChange={(e) => updateVariant(index, 'name', e.target.value)}
                              placeholder="Variant name (e.g., Small, Medium)"
                              className="flex-1 px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                              style={{ fontSize: 'var(--text-base)' }}
                            />
                            <div className="relative w-32">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>€</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={variant.price}
                                onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                                placeholder="0.00"
                                className="w-full pl-8 pr-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                                style={{ fontSize: 'var(--text-base)' }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeVariant(index)}
                              className="p-2 hover:bg-accent rounded-lg transition-colors text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 bg-muted/20 rounded-lg border border-dashed border-border">
                        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
                          No variants added yet. Click "Add Variant" to create pricing options.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Item Settings Section */}
                {showItemSettings ? (
                  <div className="p-4 bg-muted/30 rounded-lg space-y-6">
                    <div className="flex items-center justify-between">
                      <label className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                        Item Settings
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowItemSettings(false)}
                        className="p-1.5 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Dietary Type */}
                    <div>
                      <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                        Dietary Type
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        <button
                          type="button"
                          onClick={() => setNewMenuItem({ ...newMenuItem, dietaryType: 'none' })}
                          className={`relative flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left cursor-pointer ${newMenuItem.dietaryType === 'none'
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-background hover:border-border hover:bg-accent'
                            }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${newMenuItem.dietaryType === 'none'
                            ? 'border-primary'
                            : 'border-border'
                            }`}>
                            {newMenuItem.dietaryType === 'none' && (
                              <div className="w-3 h-3 rounded-full bg-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-foreground mb-0.5" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                              No Type
                            </div>
                            <div className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                              Non-food items
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewMenuItem({ ...newMenuItem, dietaryType: 'veg' })}
                          className={`relative flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left cursor-pointer ${newMenuItem.dietaryType === 'veg'
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-background hover:border-border hover:bg-accent'
                            }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${newMenuItem.dietaryType === 'veg'
                            ? 'border-primary'
                            : 'border-border'
                            }`}>
                            {newMenuItem.dietaryType === 'veg' && (
                              <div className="w-3 h-3 rounded-full bg-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-foreground mb-0.5" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                              Vegetarian
                            </div>
                            <div className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                              No meat or fish
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewMenuItem({ ...newMenuItem, dietaryType: 'non-veg' })}
                          className={`relative flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left cursor-pointer ${newMenuItem.dietaryType === 'non-veg'
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-background hover:border-border hover:bg-accent'
                            }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${newMenuItem.dietaryType === 'non-veg'
                            ? 'border-primary'
                            : 'border-border'
                            }`}>
                            {newMenuItem.dietaryType === 'non-veg' && (
                              <div className="w-3 h-3 rounded-full bg-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-foreground mb-0.5" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                              Non-Vegetarian
                            </div>
                            <div className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                              Contains meat or fish
                            </div>
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewMenuItem({ ...newMenuItem, dietaryType: 'vegan' })}
                          className={`relative flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left cursor-pointer ${newMenuItem.dietaryType === 'vegan'
                            ? 'border-primary bg-primary/5'
                            : 'border-border bg-background hover:border-border hover:bg-accent'
                            }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${newMenuItem.dietaryType === 'vegan'
                            ? 'border-primary'
                            : 'border-border'
                            }`}>
                            {newMenuItem.dietaryType === 'vegan' && (
                              <div className="w-3 h-3 rounded-full bg-primary" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="text-foreground mb-0.5" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                              Vegan
                            </div>
                            <div className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                              No animal products
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Dietary Tags */}
                    <div>
                      <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                        Dietary Tags
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {dietaryTagOptions.map((tag) => (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleToggleTag(tag, 'dietaryTags')}
                            className={`relative flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${newMenuItem.dietaryTags.includes(tag)
                              ? 'border-primary bg-primary/5'
                              : 'border-border bg-background hover:border-border hover:bg-accent'
                              }`}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${newMenuItem.dietaryTags.includes(tag)
                              ? 'border-primary bg-primary'
                              : 'border-border bg-background'
                              }`}>
                              {newMenuItem.dietaryTags.includes(tag) && (
                                <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                                {tag}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Ingredients */}
                    <div>
                      <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                        Ingredients
                      </label>
                      <textarea
                        value={newMenuItem.ingredients}
                        onChange={(e) => setNewMenuItem({ ...newMenuItem, ingredients: e.target.value })}
                        placeholder="List all ingredients..."
                        rows={3}
                        className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        style={{ fontSize: 'var(--text-base)' }}
                      />
                    </div>

                    {/* Allergens */}
                    <div>
                      <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                        Allergens
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {allergenOptions.map((allergen) => (
                          <button
                            key={allergen}
                            type="button"
                            onClick={() => handleToggleTag(allergen, 'allergens')}
                            className={`relative flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${newMenuItem.allergens.includes(allergen)
                              ? 'border-destructive bg-destructive/5'
                              : 'border-border bg-background hover:border-border hover:bg-accent'
                              }`}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${newMenuItem.allergens.includes(allergen)
                              ? 'border-destructive bg-destructive'
                              : 'border-border bg-background'
                              }`}>
                              {newMenuItem.allergens.includes(allergen) && (
                                <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className={newMenuItem.allergens.includes(allergen) ? 'text-destructive' : 'text-foreground'} style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                                {allergen}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Additives */}
                    <div>
                      <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                        Additives
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {additiveOptions.map((additive) => (
                          <button
                            key={additive}
                            type="button"
                            onClick={() => handleToggleTag(additive, 'additives')}
                            className={`relative flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${newMenuItem.additives.includes(additive)
                              ? 'border-primary bg-primary/5'
                              : 'border-border bg-background hover:border-border hover:bg-accent'
                              }`}
                          >
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${newMenuItem.additives.includes(additive)
                              ? 'border-primary bg-primary'
                              : 'border-border bg-background'
                              }`}>
                              {newMenuItem.additives.includes(additive) && (
                                <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1">
                              <div className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                                {additive}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Nutritional Information */}
                    <div>
                      <h4 className="text-foreground mb-3" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                        Nutritional Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 'var(--text-small)' }}>
                            Serving Size
                          </label>
                          <input
                            type="text"
                            value={newMenuItem.nutritionalInfo.servingSize}
                            onChange={(e) => setNewMenuItem({
                              ...newMenuItem,
                              nutritionalInfo: { ...newMenuItem.nutritionalInfo, servingSize: e.target.value }
                            })}
                            placeholder="e.g., 100g"
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            style={{ fontSize: 'var(--text-base)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 'var(--text-small)' }}>
                            Calories
                          </label>
                          <input
                            type="text"
                            value={newMenuItem.nutritionalInfo.calories}
                            onChange={(e) => setNewMenuItem({
                              ...newMenuItem,
                              nutritionalInfo: { ...newMenuItem.nutritionalInfo, calories: e.target.value }
                            })}
                            placeholder="e.g., 250 kcal"
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            style={{ fontSize: 'var(--text-base)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 'var(--text-small)' }}>
                            Protein
                          </label>
                          <input
                            type="text"
                            value={newMenuItem.nutritionalInfo.protein}
                            onChange={(e) => setNewMenuItem({
                              ...newMenuItem,
                              nutritionalInfo: { ...newMenuItem.nutritionalInfo, protein: e.target.value }
                            })}
                            placeholder="e.g., 15g"
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            style={{ fontSize: 'var(--text-base)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 'var(--text-small)' }}>
                            Carbohydrates
                          </label>
                          <input
                            type="text"
                            value={newMenuItem.nutritionalInfo.carbs}
                            onChange={(e) => setNewMenuItem({
                              ...newMenuItem,
                              nutritionalInfo: { ...newMenuItem.nutritionalInfo, carbs: e.target.value }
                            })}
                            placeholder="e.g., 30g"
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            style={{ fontSize: 'var(--text-base)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 'var(--text-small)' }}>
                            Fat
                          </label>
                          <input
                            type="text"
                            value={newMenuItem.nutritionalInfo.fat}
                            onChange={(e) => setNewMenuItem({
                              ...newMenuItem,
                              nutritionalInfo: { ...newMenuItem.nutritionalInfo, fat: e.target.value }
                            })}
                            placeholder="e.g., 10g"
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            style={{ fontSize: 'var(--text-base)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 'var(--text-small)' }}>
                            Fiber
                          </label>
                          <input
                            type="text"
                            value={newMenuItem.nutritionalInfo.fiber}
                            onChange={(e) => setNewMenuItem({
                              ...newMenuItem,
                              nutritionalInfo: { ...newMenuItem.nutritionalInfo, fiber: e.target.value }
                            })}
                            placeholder="e.g., 5g"
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            style={{ fontSize: 'var(--text-base)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 'var(--text-small)' }}>
                            Sugar
                          </label>
                          <input
                            type="text"
                            value={newMenuItem.nutritionalInfo.sugar}
                            onChange={(e) => setNewMenuItem({
                              ...newMenuItem,
                              nutritionalInfo: { ...newMenuItem.nutritionalInfo, sugar: e.target.value }
                            })}
                            placeholder="e.g., 8g"
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            style={{ fontSize: 'var(--text-base)' }}
                          />
                        </div>
                        <div>
                          <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 'var(--text-small)' }}>
                            Sodium
                          </label>
                          <input
                            type="text"
                            value={newMenuItem.nutritionalInfo.sodium}
                            onChange={(e) => setNewMenuItem({
                              ...newMenuItem,
                              nutritionalInfo: { ...newMenuItem.nutritionalInfo, sodium: e.target.value }
                            })}
                            placeholder="e.g., 500mg"
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            style={{ fontSize: 'var(--text-base)' }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <label className="block text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                      Item Settings (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowItemSettings(true)}
                      className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>Add Settings</span>
                    </button>
                  </div>
                )}

                {/* Add-ons Section */}
                {showAddons ? (
                  <div className="p-4 bg-muted/30 rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                        Add-ons {newMenuItem.assignedAddonGroups.length > 0 && `(${newMenuItem.assignedAddonGroups.length})`}
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowAddons(false)}
                        className="p-1.5 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                      Choose which addon groups should be available for this item
                    </p>

                    {/* Addon Groups Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      {addonGroups.filter(group => {
                        // Filter out groups already assigned to the parent category
                        if (activeCategoryId) {
                          const parentCategory = categories.find(c => c.id === activeCategoryId);
                          return !parentCategory?.assignedAddonGroups?.includes(group.id);
                        }
                        return true;
                      }).map((group) => {
                        const isSelected = newMenuItem.assignedAddonGroups.includes(group.id);
                        return (
                          <label
                            key={group.id}
                            className="cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewMenuItem({
                                    ...newMenuItem,
                                    assignedAddonGroups: [...newMenuItem.assignedAddonGroups, group.id]
                                  });
                                } else {
                                  setNewMenuItem({
                                    ...newMenuItem,
                                    assignedAddonGroups: newMenuItem.assignedAddonGroups.filter(id => id !== group.id)
                                  });
                                }
                              }}
                              className="sr-only peer"
                            />
                            <div
                              className="px-4 py-3 bg-card border border-border rounded-lg transition-all hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary/5"
                            >
                              <div className="flex items-center gap-2">
                                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected
                                  ? 'bg-primary border-primary'
                                  : 'bg-background border-border'
                                  }`}>
                                  {isSelected && (
                                    <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />
                                  )}
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                  <span
                                    className="text-foreground truncate"
                                    style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                                  >
                                    {group.name}
                                  </span>
                                  <span className="text-muted-foreground" style={{ fontSize: '10px' }}>
                                    {group.items.length} {group.items.length === 1 ? 'item' : 'items'} • {group.minSelect > 0 || group.maxSelect === 1 ? 'Choice' : 'Addon'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>

                    {newMenuItem.assignedAddonGroups.length > 0 && (
                      <p className="text-muted-foreground mt-3" style={{ fontSize: 'var(--text-small)' }}>
                        {newMenuItem.assignedAddonGroups.length} addon group{newMenuItem.assignedAddonGroups.length !== 1 ? 's' : ''} selected
                      </p>
                    )}

                    {activeCategoryId && addonGroups.filter(group => {
                      const parentCategory = categories.find(c => c.id === activeCategoryId);
                      return !parentCategory?.assignedAddonGroups?.includes(group.id);
                    }).length === 0 && (
                        <p className="text-muted-foreground italic mt-3" style={{ fontSize: 'var(--text-small)' }}>
                          No separate choice groups available.
                        </p>
                      )}

                    {addonGroups.length === 0 && (
                      <p className="text-muted-foreground text-center py-4" style={{ fontSize: 'var(--text-small)' }}>
                        No addon groups available. Create addon groups in the "Choices & Addons" tab first.
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <label className="block text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                      Add-ons (Optional) {newMenuItem.assignedAddonGroups.length > 0 && <span className="text-muted-foreground ml-2">({newMenuItem.assignedAddonGroups.length} selected)</span>}
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowAddons(true)}
                      className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>Add Add-ons</span>
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2 border-t border-border mt-2">
                  <input
                    type="checkbox"
                    id="itemActive"
                    checked={newMenuItem.isActive}
                    onChange={(e) => setNewMenuItem({ ...newMenuItem, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-border"
                  />
                  <label htmlFor="itemActive" className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                    Item is active and visible to customers
                  </label>
                </div>
              </div>
            </Modal>

            {/* Add Group Modal */}
            <Modal
              isOpen={isAddGroupModalOpen}
              onClose={() => {
                setIsAddGroupModalOpen(false);
                setEditingGroupId(null);
                setNewGroup({ name: '', subtitle: '', type: 'optional', minSelect: 0, maxSelect: 1 });
              }}
              icon={ListPlus}
              title={editingGroupId ? 'Edit Group' : 'Add New Group'}
              maxWidth="lg"
              footer={
                <>
                  <Button
                    variant="secondary"
                    icon={X}
                    onClick={() => {
                      setIsAddGroupModalOpen(false);
                      setEditingGroupId(null);
                      setNewGroup({ name: '', subtitle: '', type: 'optional', minSelect: 0, maxSelect: 1 });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    icon={editingGroupId ? Check : Plus}
                    onClick={async () => {
                      if (!newGroup.name) return;

                      if (editingGroupId) {
                        // Edit existing group - update in database
                        const result = await updateAddonGroup(editingGroupId, {
                          name: newGroup.name,
                          nameDe: newGroup.name,
                          subtitle: newGroup.subtitle,
                          subtitleDe: newGroup.subtitle,
                          minSelect: newGroup.type === 'mandatory' ? newGroup.minSelect : 0,
                          maxSelect: newGroup.type === 'mandatory' ? newGroup.maxSelect : 999,
                          isRequired: newGroup.type === 'mandatory',
                        });

                        if (result.success) {
                          setAddonGroups(addonGroups.map(group =>
                            group.id === editingGroupId
                              ? {
                                ...group,
                                name: newGroup.name,
                                subtitle: newGroup.subtitle,
                                minSelect: newGroup.type === 'mandatory' ? newGroup.minSelect : 0,
                                maxSelect: newGroup.type === 'mandatory' ? newGroup.maxSelect : 999,
                                isRequired: newGroup.type === 'mandatory',
                              }
                              : group
                          ));
                          toast.success('Addon group updated successfully');
                        } else {
                          toast.error(result.error || 'Failed to update addon group');
                        }
                      } else {
                        // Add new group - save to database
                        const result = await createAddonGroup({
                          name: newGroup.name,
                          nameDe: newGroup.name,
                          subtitle: newGroup.subtitle,
                          subtitleDe: newGroup.subtitle,
                          minSelect: newGroup.type === 'mandatory' ? newGroup.minSelect : 0,
                          maxSelect: newGroup.type === 'mandatory' ? newGroup.maxSelect : 999,
                          isRequired: newGroup.type === 'mandatory',
                        });

                        if (result.success && result.data) {
                          const newAddonGroup: AddonGroup = {
                            id: result.data.id,
                            name: newGroup.name,
                            subtitle: newGroup.subtitle,
                            minSelect: newGroup.type === 'mandatory' ? newGroup.minSelect : 0,
                            maxSelect: newGroup.type === 'mandatory' ? newGroup.maxSelect : 999,
                            items: [],
                            isExpanded: false,
                            isRequired: newGroup.type === 'mandatory',
                          };

                          setAddonGroups([...addonGroups, newAddonGroup]);
                          toast.success('Addon group created successfully');
                        } else {
                          toast.error(result.error || 'Failed to create addon group');
                        }
                      }

                      setIsAddGroupModalOpen(false);
                      setEditingGroupId(null);
                      setNewGroup({ name: '', subtitle: '', type: 'optional', minSelect: 0, maxSelect: 1 });
                    }}
                    disabled={!newGroup.name || newGroup.name.trim() === '' || newGroup.name.length > 100}
                  >
                    {editingGroupId ? 'Save Changes' : 'Add Group'}
                  </Button>
                </>
              }
            >
              <div className="space-y-5">
                {/* Group Name */}
                <div>
                  <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    Group Name *
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    value={newGroup.name}
                    onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                    placeholder="e.g., Size, Toppings, Extras"
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    style={{ fontSize: 'var(--text-base)' }}
                  />
                </div>

                {/* Type Selection */}
                <div>
                  <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    Type
                  </label>
                  {/* <p className="text-muted-foreground mb-3" style={{ fontSize: 'var(--text-small)' }}>
                    Addons: customers can choose but aren't required.<br />
                    Choices: customers must select.
                  </p> */}
                  <div className="flex gap-3">
                    <label className="flex-1 cursor-pointer">
                      <div className={`px-4 py-3 border-2 rounded-lg transition-all flex flex-col items-start gap-2 hover:border-primary/50 ${newGroup.type === 'optional' ? 'border-primary bg-primary/10' : 'border-border'}`}>
                        <div className="flex items-center justify-between w-full gap-2">
                          <span className={`text-foreground ${newGroup.type === 'optional' ? 'text-primary' : ''}`} style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                            Addons
                          </span>
                          <NativeRadio
                            name="groupType"
                            checked={newGroup.type === 'optional'}
                            onChange={() => setNewGroup({ ...newGroup, type: 'optional' })}
                          />
                        </div>
                        <span className="text-muted-foreground text-xs" style={{ fontSize: 'var(--text-small)' }}>
                          Optional - customers can choose
                        </span>
                      </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                      <div className={`px-4 py-3 border-2 rounded-lg transition-all flex flex-col items-start gap-2 hover:border-primary/50 ${newGroup.type === 'mandatory' ? 'border-primary bg-primary/10' : 'border-border'}`}>
                        <div className="flex items-center justify-between w-full gap-2">
                          <span className={`text-foreground ${newGroup.type === 'mandatory' ? 'text-primary' : ''}`} style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                            Choices
                          </span>
                          <NativeRadio
                            name="groupType"
                            checked={newGroup.type === 'mandatory'}
                            onChange={() => setNewGroup({ ...newGroup, type: 'mandatory' })}
                          />
                        </div>
                        <span className="text-muted-foreground text-xs" style={{ fontSize: 'var(--text-small)' }}>
                          Mandatory - customers must select
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Selection Requirements - Only show when Choices */}
                {newGroup.type === 'mandatory' && (
                  <div className="p-4 bg-muted/30 border border-border rounded-lg space-y-4">
                    <h4 className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                      Selection Requirements
                    </h4>

                    {/* Minimum Selections */}
                    <div>
                      <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                        Minimum Selections
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={newGroup.minSelect}
                        onChange={(e) => setNewGroup({ ...newGroup, minSelect: parseInt(e.target.value) || 0 })}
                        className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                        style={{ fontSize: 'var(--text-base)' }}
                      />
                    </div>

                    {/* Maximum Selections */}
                    <div>
                      <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                        Maximum Selections
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={newGroup.maxSelect}
                        onChange={(e) => setNewGroup({ ...newGroup, maxSelect: parseInt(e.target.value) || 1 })}
                        className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                        style={{ fontSize: 'var(--text-base)' }}
                      />
                    </div>

                    {/* Example Text */}
                    <div className="p-3 bg-card rounded-lg">
                      <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                        <strong>Example:</strong> Min {newGroup.minSelect}, Max {newGroup.maxSelect} = "
                        {newGroup.minSelect === newGroup.maxSelect
                          ? `Choose exactly ${newGroup.minSelect === 1 ? 'one' : newGroup.minSelect}`
                          : newGroup.minSelect === 0
                            ? `Choose up to ${newGroup.maxSelect}`
                            : `Choose ${newGroup.minSelect} to ${newGroup.maxSelect}`
                        }"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Modal>

            {/* Add/Edit Addon Item Modal */}
            <Modal
              isOpen={isAddAddonItemModalOpen}
              onClose={() => {
                setIsAddAddonItemModalOpen(false);
                setEditingAddonItemId(null);
                setCurrentGroupId(null);
                setNewAddonItem({ name: '', price: '', dietaryType: 'veg', isActive: true });
              }}
              icon={Plus}
              title={editingAddonItemId ? 'Edit Addon Item' : 'Add New Addon Item'}
              footer={
                <>
                  <Button
                    variant="secondary"
                    icon={X}
                    onClick={() => {
                      setIsAddAddonItemModalOpen(false);
                      setEditingAddonItemId(null);
                      setCurrentGroupId(null);
                      setNewAddonItem({ name: '', price: '', dietaryType: 'veg', isActive: true });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    icon={editingAddonItemId ? Check : Plus}
                    onClick={async () => {
                      if (!currentGroupId) return;

                      if (editingAddonItemId) {
                        // Edit existing item - update in database
                        const result = await updateAddonItem(editingAddonItemId, {
                          name: newAddonItem.name,
                          nameDe: newAddonItem.name,
                          price: parseFloat(newAddonItem.price) as any,
                          dietaryType: newAddonItem.dietaryType,
                          isActive: newAddonItem.isActive,
                        });

                        if (result.success) {
                          const updatedGroups = addonGroups.map(group => {
                            if (group.id === currentGroupId) {
                              return {
                                ...group,
                                items: group.items.map(item =>
                                  item.id === editingAddonItemId
                                    ? {
                                      ...item,
                                      name: newAddonItem.name,
                                      price: parseFloat(newAddonItem.price),
                                      dietaryType: newAddonItem.dietaryType,
                                      isActive: newAddonItem.isActive,
                                    }
                                    : item
                                ),
                              };
                            }
                            return group;
                          });
                          setAddonGroups(updatedGroups);
                          toast.success('Addon item updated successfully');
                        } else {
                          toast.error(result.error || 'Failed to update addon item');
                        }
                      } else {
                        // Add new item - save to database
                        const result = await createAddonItem({
                          addonGroupId: currentGroupId,
                          name: newAddonItem.name,
                          nameDe: newAddonItem.name,
                          price: parseFloat(newAddonItem.price) as any,
                          dietaryType: newAddonItem.dietaryType,
                          pricingType: 'per_person',
                        });

                        if (result.success && result.data) {
                          const updatedGroups = addonGroups.map(group => {
                            if (group.id === currentGroupId) {
                              const newItem: AddonItem = {
                                id: result.data.id,
                                name: newAddonItem.name,
                                price: parseFloat(newAddonItem.price),
                                dietaryType: newAddonItem.dietaryType,
                                isActive: newAddonItem.isActive,
                              };
                              return {
                                ...group,
                                items: [...group.items, newItem],
                              };
                            }
                            return group;
                          });
                          setAddonGroups(updatedGroups);
                          toast.success('Addon item created successfully');
                        } else {
                          toast.error(result.error || 'Failed to create addon item');
                        }
                      }

                      setIsAddAddonItemModalOpen(false);
                      setEditingAddonItemId(null);
                      setCurrentGroupId(null);
                      setNewAddonItem({ name: '', price: '', dietaryType: 'veg', isActive: true });
                    }}
                    disabled={!newAddonItem.name || !newAddonItem.price || newAddonItem.name.trim() === '' || newAddonItem.name.length > 100 || parseFloat(newAddonItem.price) < 0}
                  >
                    {editingAddonItemId ? 'Save Changes' : 'Add Item'}
                  </Button>
                </>
              }
            >
              <div className="space-y-6">
                {/* Item Name */}
                <div>
                  <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    Item Name *
                  </label>
                  <input
                    type="text"
                    maxLength={100}
                    value={newAddonItem.name}
                    onChange={(e) => setNewAddonItem({ ...newAddonItem, name: e.target.value })}
                    placeholder="e.g., Extra Cheese"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    style={{ fontSize: 'var(--text-base)' }}
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    Price (€) *
                    <span className="text-muted-foreground ml-2" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-normal)' }}>
                      (Can be set to 0)
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newAddonItem.price}
                    onChange={(e) => setNewAddonItem({ ...newAddonItem, price: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    style={{ fontSize: 'var(--text-base)' }}
                  />
                </div>

                {/* Dietary Type */}
                <div>
                  <label className="block text-foreground mb-3" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    Dietary Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setNewAddonItem({ ...newAddonItem, dietaryType: 'veg' })}
                      className={`p-4 rounded-lg border-2 transition-all ${newAddonItem.dietaryType === 'veg'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-border/60 bg-background'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded border-2 border-green-600 flex items-center justify-center flex-shrink-0">
                          <div className="w-3 h-3 rounded-full bg-green-600" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                            Vegetarian
                          </p>
                          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                            No meat or fish
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${newAddonItem.dietaryType === 'veg' ? 'border-primary' : 'border-border'
                          }`}>
                          {newAddonItem.dietaryType === 'veg' && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setNewAddonItem({ ...newAddonItem, dietaryType: 'non-veg' })}
                      className={`p-4 rounded-lg border-2 transition-all ${newAddonItem.dietaryType === 'non-veg'
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-border/60 bg-background'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded border-2 border-red-600 flex items-center justify-center flex-shrink-0">
                          <div className="w-3 h-3 rounded-full bg-red-600" />
                        </div>
                        <div className="text-left flex-1">
                          <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                            Non-Vegetarian
                          </p>
                          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                            Contains meat or fish
                          </p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${newAddonItem.dietaryType === 'non-veg' ? 'border-primary' : 'border-border'
                          }`}>
                          {newAddonItem.dietaryType === 'non-veg' && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Active Status Toggle */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                      Available
                    </p>
                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                      Item is visible to customers
                    </p>
                  </div>
                  <button
                    onClick={() => setNewAddonItem({ ...newAddonItem, isActive: !newAddonItem.isActive })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${newAddonItem.isActive ? 'bg-primary' : 'bg-border'
                      }`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${newAddonItem.isActive ? 'translate-x-6' : 'translate-x-0.5'
                      }`} />
                  </button>
                </div>
              </div>
            </Modal>

            {/* Delete Category Confirmation Modal */}
            <ConfirmationModal
              isOpen={!!deleteCategoryId}
              onClose={() => setDeleteCategoryId(null)}
              onConfirm={async () => {
                // Call server action to delete from database
                if (deleteCategoryId) {
                  console.log('Deleting category:', deleteCategoryId);
                  const result = await deleteMenuCategory(deleteCategoryId);
                  console.log('Delete category result:', result);
                  if (result.success) {
                    setCategories(categories.filter(cat => cat.id !== deleteCategoryId));
                    toast.success('Category deleted successfully');
                  } else {
                    toast.error(result.error || 'Failed to delete category');
                  }
                }
                setDeleteCategoryId(null);
              }}
              title="Delete Category"
              message={`Are you sure you want to delete "${categories.find(c => c.id === deleteCategoryId)?.name}"? This action cannot be undone and will remove all items in this category.`}
            />

            {/* Delete Menu Item Confirmation Modal */}
            <ConfirmationModal
              isOpen={!!deleteMenuItemId && !!activeCategoryId}
              onClose={() => {
                setDeleteMenuItemId(null);
                setActiveCategoryId(null);
              }}
              onConfirm={async () => {
                // Call server action to delete from database
                if (deleteMenuItemId) {
                  console.log('Deleting menu item:', deleteMenuItemId);
                  const result = await deleteMenuItem(deleteMenuItemId);
                  console.log('Delete item result:', result);
                  if (result.success) {
                    setCategories(categories.map(cat => {
                      if (cat.id === activeCategoryId) {
                        return {
                          ...cat,
                          items: cat.items.filter(item => item.id !== deleteMenuItemId),
                        };
                      }
                      return cat;
                    }));
                    toast.success('Menu item deleted successfully');
                  } else {
                    toast.error(result.error || 'Failed to delete menu item');
                  }
                }
                setDeleteMenuItemId(null);
                setActiveCategoryId(null);
              }}
              title="Delete Menu Item"
              message={`Are you sure you want to delete "${categories.find(c => c.id === activeCategoryId)?.items.find(item => item.id === deleteMenuItemId)?.name}"? This action cannot be undone.`}
            />

            {/* Delete Group Confirmation Modal */}
            <ConfirmationModal
              isOpen={!!deleteGroupId}
              onClose={() => setDeleteGroupId(null)}
              onConfirm={async () => {
                if (deleteGroupId) {
                  const result = await deleteAddonGroup(deleteGroupId);
                  if (result.success) {
                    setAddonGroups(addonGroups.filter(group => group.id !== deleteGroupId));
                    toast.success('Group deleted successfully');
                  } else {
                    toast.error(result.error || 'Failed to delete group');
                  }
                }
                setDeleteGroupId(null);
              }}
              title="Delete Group"
              message={`Are you sure you want to delete "${addonGroups.find(g => g.id === deleteGroupId)?.name}"? This action cannot be undone.`}
            />

            {/* Delete Addon Item Confirmation Modal */}
            <ConfirmationModal
              isOpen={!!deleteAddonItemId && !!currentGroupId}
              onClose={() => {
                setDeleteAddonItemId(null);
                setCurrentGroupId(null);
              }}
              onConfirm={async () => {
                if (deleteAddonItemId) {
                  const result = await deleteAddonItem(deleteAddonItemId);
                  if (result.success) {
                    const updatedGroups = addonGroups.map(group => {
                      if (group.id === currentGroupId) {
                        return {
                          ...group,
                          items: group.items.filter(item => item.id !== deleteAddonItemId),
                        };
                      }
                      return group;
                    });
                    setAddonGroups(updatedGroups);
                    toast.success('Item deleted successfully');
                  } else {
                    toast.error(result.error || 'Failed to delete item');
                  }
                }
                setDeleteAddonItemId(null);
                setCurrentGroupId(null);
              }}
              title="Delete Item"
              message={`Are you sure you want to delete "${addonGroups.find(g => g.id === currentGroupId)?.items.find(item => item.id === deleteAddonItemId)?.name}"? This action cannot be undone.`}
            />

            {/* Item Settings Modal */}
            <ItemSettingsModal
              isOpen={isItemSettingsModalOpen}
              onClose={() => {
                setIsItemSettingsModalOpen(false);
                setSettingsMenuItemId(null);
                setActiveCategoryId(null);
              }}
              onSave={handleSaveItemSettings}
              itemSettings={itemSettings}
              setItemSettings={setItemSettings}
              itemName={
                settingsMenuItemId && activeCategoryId
                  ? categories.find(c => c.id === activeCategoryId)?.items.find(i => i.id === settingsMenuItemId)?.name
                  : undefined
              }
            />

            {/* Add Choice Modal */}
            <Modal
              isOpen={isAddChoiceModalOpen}
              onClose={() => {
                setIsAddChoiceModalOpen(false);
                setChoiceCategoryId(null);
                setChoiceItemId(null);
                setSelectedAddonGroups([]);
              }}
              icon={ListPlus}
              title="Add Choice"
              footer={
                <>
                  <Button
                    variant="secondary"
                    icon={X}
                    onClick={() => {
                      setIsAddChoiceModalOpen(false);
                      setChoiceCategoryId(null);
                      setChoiceItemId(null);
                      setSelectedAddonGroups([]);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    icon={Check}
                    onClick={async () => {
                      if (choiceCategoryId) {
                        // Save to database
                        const result = await updateCategoryAddonGroups(choiceCategoryId, selectedAddonGroups);

                        if (result.success) {
                          setCategories(categories.map(cat =>
                            cat.id === choiceCategoryId
                              ? { ...cat, assignedAddonGroups: selectedAddonGroups }
                              : cat
                          ));
                        }
                      } else if (choiceItemId && activeCategoryId) {
                        const result = await updateItemAddonGroups(choiceItemId, selectedAddonGroups);
                        if (result.success) {
                          setCategories(categories.map(cat => {
                            if (cat.id === activeCategoryId) {
                              return {
                                ...cat,
                                items: cat.items.map(item =>
                                  item.id === choiceItemId
                                    ? { ...item, assignedAddonGroups: selectedAddonGroups }
                                    : item
                                )
                              };
                            }
                            return cat;
                          }));
                        }
                      }
                      setIsAddChoiceModalOpen(false);
                      setChoiceCategoryId(null);
                      setChoiceItemId(null);
                      setSelectedAddonGroups([]);
                    }}
                  >
                    Save Changes
                  </Button>
                </>
              }
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-foreground mb-3" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    Select Addon Groups
                  </label>
                  <p className="text-muted-foreground mb-4" style={{ fontSize: 'var(--text-small)' }}>
                    Choose which addon groups should be available for this {choiceItemId ? 'item' : 'category'}
                  </p>

                  {/* Addon Groups Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {addonGroups.filter(group => {
                      if (choiceItemId && activeCategoryId) {
                        const parentCategory = categories.find(c => c.id === activeCategoryId);
                        return !parentCategory?.assignedAddonGroups?.includes(group.id);
                      }
                      return true;
                    }).map((group) => {
                      const isSelected = selectedAddonGroups.includes(group.id);
                      return (
                        <label
                          key={group.id}
                          className="cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAddonGroups([...selectedAddonGroups, group.id]);
                              } else {
                                setSelectedAddonGroups(selectedAddonGroups.filter(id => id !== group.id));
                              }
                            }}
                            className="sr-only peer"
                          />
                          <div
                            className="px-4 py-3 bg-card border border-border rounded-lg transition-all hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary/5"
                          >
                            <div className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected
                                ? 'bg-primary border-primary'
                                : 'bg-background border-border'
                                }`}>
                                {isSelected && (
                                  <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />
                                )}
                              </div>
                              <div className="flex flex-col flex-1 min-w-0">
                                <span
                                  className="text-foreground truncate"
                                  style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                                >
                                  {group.name}
                                </span>
                                <span className="text-muted-foreground" style={{ fontSize: '10px' }}>
                                  {group.items.length} {group.items.length === 1 ? 'item' : 'items'} • {group.minSelect > 0 || group.maxSelect === 1 ? 'Choice' : 'Addon'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {selectedAddonGroups.length > 0 && (
                    <p className="text-muted-foreground mt-3" style={{ fontSize: 'var(--text-small)' }}>
                      {selectedAddonGroups.length} addon group{selectedAddonGroups.length !== 1 ? 's' : ''} selected
                    </p>
                  )}
                  {choiceItemId && activeCategoryId && addonGroups.filter(group => {
                    const parentCategory = categories.find(c => c.id === activeCategoryId);
                    return !parentCategory?.assignedAddonGroups?.includes(group.id);
                  }).length === 0 && (
                      <p className="text-muted-foreground italic mt-3" style={{ fontSize: 'var(--text-small)' }}>
                        No separate choice groups available.
                      </p>
                    )}
                </div>
              </div>
            </Modal>
          </>
        )
        }
      </div >
    </div >
  );
}
