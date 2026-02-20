'use client';

import { useState } from 'react';
import { GripVertical, Edit2, MoreVertical, Plus, ChevronDown, ChevronRight, Trash2, Eye, EyeOff, Search, UtensilsCrossed, ListPlus, Upload, X, Copy, Settings, Check } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Modal } from './Modal';
import { ConfirmationModal } from './ConfirmationModal';
import { ItemSettingsModal } from './ItemSettingsModal';
import { Button } from './Button';
import { Tooltip } from './Tooltip';

interface MenuItemData {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  isActive: boolean;
  variants: VariantOption[];
  dietaryType?: 'veg' | 'non-veg' | 'vegan';
  dietaryTags?: string[];
  ingredients?: string;
  allergens?: string[];
  additives?: string[];
  nutritionalInfo?: {
    servingSize?: string;
    calories?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
    fiber?: string;
    sugar?: string;
    sodium?: string;
  };
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
  items: MenuItemData[];
  assignedAddonGroups?: string[]; // IDs of assigned addon groups
}

interface AddonItem {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
  dietaryType: 'veg' | 'non-veg';
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

const mockCategories: Category[] = [
  {
    id: '1',
    name: 'Bom Wraps',
    description: '32cm All dishes are served with homemade wheat tortillas.',
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=400&fit=crop',
    isActive: true,
    isExpanded: false,
    items: [
      {
        id: '1-1',
        name: 'Chicken Wrap',
        description: 'Grilled chicken with fresh vegetables',
        image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=400&fit=crop',
        price: 12.50,
        isActive: true,
        variants: [
          { id: 'v1', name: 'Regular', price: 12.50 },
          { id: 'v2', name: 'Large', price: 15.00 },
        ],
      },
      {
        id: '1-2',
        name: 'Beef Wrap',
        description: 'Tender beef strips with special sauce',
        image: 'https://images.unsplash.com/photo-1624726175512-19b9baf9fbd1?w=400&h=400&fit=crop',
        price: 14.00,
        isActive: true,
        variants: [],
      },
    ],
  },
  {
    id: '2',
    name: 'Pizzas',
    description: 'Authentic Italian pizzas',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop',
    isActive: true,
    isExpanded: false,
    items: [
      {
        id: '2-1',
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce and mozzarella',
        image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=400&fit=crop',
        price: 15.00,
        isActive: true,
        variants: [
          { id: 'v3', name: 'Small', price: 12.00 },
          { id: 'v4', name: 'Medium', price: 15.00 },
          { id: 'v5', name: 'Large', price: 18.00 },
        ],
      },
    ],
  },
  {
    id: '3',
    name: 'Starters',
    description: 'Perfect to begin your meal',
    image: 'https://images.unsplash.com/photo-1758384077555-36242d3f2b4d?w=400&h=400&fit=crop',
    isActive: true,
    isExpanded: false,
    items: [],
  },
  {
    id: '4',
    name: 'Desserts',
    description: 'Sweet endings',
    image: 'https://images.unsplash.com/photo-1705948731485-6e4c6c180d0d?w=400&h=400&fit=crop',
    isActive: false,
    isExpanded: false,
    items: [
      {
        id: '4-1',
        name: 'Tiramisu',
        description: 'Classic Italian dessert',
        image: 'https://images.unsplash.com/photo-1705948731485-6e4c6c180d0d?w=400&h=400&fit=crop',
        price: 6.50,
        isActive: true,
        variants: [],
      },
    ],
  },
];

const mockAddonGroups: AddonGroup[] = [
  {
    id: '1',
    name: 'Deine Toppings',
    minSelect: 0,
    maxSelect: 3,
    items: [],
    isExpanded: false,
    isRequired: false,
  },
  {
    id: '2',
    name: 'Deine Extras',
    subtitle: 'Popular sides',
    minSelect: 1,
    maxSelect: 2,
    items: [
      { id: 'e1', name: 'French Fries', price: 3.50, isActive: true, dietaryType: 'veg' as const },
      { id: 'e2', name: 'Sweet Potato Fries', price: 4.20, isActive: true, dietaryType: 'veg' as const },
      { id: 'e3', name: 'Side Salad', price: 3.00, isActive: true, dietaryType: 'veg' as const },
      { id: 'e4', name: 'Coleslaw', price: 2.80, isActive: true, dietaryType: 'veg' as const },
    ],
    isExpanded: false,
    isRequired: true,
  },
  {
    id: '3',
    name: 'Dein 2. Topping',
    minSelect: 0,
    maxSelect: 1,
    items: [
      { id: 't1', name: 'Grilled Onions', price: 1.20, isActive: true, dietaryType: 'veg' as const },
      { id: 't2', name: 'Mushrooms', price: 1.50, isActive: true, dietaryType: 'veg' as const },
      { id: 't3', name: 'Pickles', price: 0.80, isActive: true, dietaryType: 'veg' as const },
    ],
    isExpanded: false,
    isRequired: false,
  },
  {
    id: '4',
    name: 'Deine Beilage',
    minSelect: 0,
    maxSelect: 1,
    items: [
      { id: 'b1', name: 'Rice', price: 2.50, isActive: true, dietaryType: 'veg' as const },
      { id: 'b2', name: 'Pasta', price: 3.00, isActive: true, dietaryType: 'veg' as const },
      { id: 'b3', name: 'Roasted Vegetables', price: 3.50, isActive: true, dietaryType: 'veg' as const },
    ],
    isExpanded: false,
    isRequired: false,
  },
];

export function MenuConfigPage() {
  const [categories, setCategories] = useState(mockCategories);
  const [addonGroups, setAddonGroups] = useState(mockAddonGroups);
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
  const [selectedAddonGroups, setSelectedAddonGroups] = useState<string[]>([]);
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
    image: null as File | null,
    imageUrl: '' as string,
    isActive: true,
    variants: [] as VariantOption[],
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
    dietaryType: 'veg' as 'veg' | 'non-veg',
    isActive: true,
  });
  const [itemSettings, setItemSettings] = useState({
    dietaryType: 'veg' as 'veg' | 'non-veg' | 'vegan',
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

  const toggleCategoryActive = (categoryId: string) => {
    setCategories(categories.map(cat =>
      cat.id === categoryId ? { ...cat, isActive: !cat.isActive } : cat
    ));
  };

  const toggleMenuItemActive = (categoryId: string, itemId: string) => {
    setCategories(categories.map(cat =>
      cat.id === categoryId
        ? {
            ...cat,
            items: cat.items.map(item =>
              item.id === itemId ? { ...item, isActive: !item.isActive } : item
            ),
          }
        : cat
    ));
  };

  const handleSaveItemSettings = () => {
    if (!settingsMenuItemId || !activeCategoryId) return;

    setCategories(categories.map(cat =>
      cat.id === activeCategoryId
        ? {
            ...cat,
            items: cat.items.map(item =>
              item.id === settingsMenuItemId
                ? {
                    ...item,
                    dietaryType: itemSettings.dietaryType,
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

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.items.some(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="px-8 pt-6 pb-1 flex flex-col min-h-full">
      <div className="flex-1">
      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6">
        <div className="inline-flex items-center gap-1 p-1 bg-card border border-border rounded-lg">
          <button
            onClick={() => setActiveTab('items')}
            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
              activeTab === 'items'
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
            className={`px-4 py-2 rounded-md flex items-center gap-2 transition-colors ${
              activeTab === 'addons'
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
        <div className="bg-card border border-border rounded-xl overflow-hidden">
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
            </div>
          </div>

          {/* Categories List */}
          <div>
            {filteredCategories.map((category) => (
              <div key={category.id}>
                {/* Category Row */}
                <div className="px-6 py-4 border-b border-border hover:bg-accent/30 transition-colors flex items-center gap-4 group">
                  {/* Drag Handle */}
                  <button className="text-muted-foreground hover:text-foreground transition-colors cursor-grab active:cursor-grabbing flex-shrink-0">
                    <GripVertical className="w-5 h-5" />
                  </button>

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
                    </div>
                    <p className="text-muted-foreground line-clamp-1" style={{ fontSize: 'var(--text-small)' }}>
                      {category.description}
                    </p>
                  </div>

                  {/* Actions - Right side */}
                  <div className="flex items-center gap-2 flex-shrink-0">
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

                    <Tooltip title="Add menu item" position="top">
                      <button 
                        onClick={() => {
                          setActiveCategoryId(category.id);
                          setEditingMenuItemId(null);
                          setNewMenuItem({
                            name: '',
                            description: '',
                            price: '',
                            image: null,
                            imageUrl: '',
                            isActive: true,
                            variants: [],
                          });
                          setIsAddMenuItemModalOpen(true);
                        }}
                        className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </Tooltip>

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
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Menu Items - Nested under category */}
                {category.isExpanded && category.items.length > 0 && (
                  <div className="bg-muted/30">
                    {category.items.map((item, index) => (
                      <div
                        key={item.id}
                        className={`pl-20 pr-6 py-3 flex items-center gap-4 hover:bg-accent/30 transition-colors group ${
                          index !== category.items.length - 1 ? 'border-b border-border/50' : ''
                        }`}
                      >
                        {/* Drag Handle */}
                        <button className="text-muted-foreground hover:text-foreground transition-colors cursor-grab active:cursor-grabbing flex-shrink-0">
                          <GripVertical className="w-4 h-4" />
                        </button>

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
                          <h5 className="text-foreground mb-0.5" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                            {item.name}
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
                          <Tooltip title="Edit item" position="top">
                            <button 
                              onClick={() => {
                                setActiveCategoryId(category.id);
                                setEditingMenuItemId(item.id);
                                setNewMenuItem({
                                  name: item.name,
                                  description: item.description,
                                  price: item.price.toString(),
                                  image: null,
                                  imageUrl: item.image,
                                  isActive: item.isActive,
                                  variants: item.variants,
                                });
                                setIsAddMenuItemModalOpen(true);
                              }}
                              className="p-1.5 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </Tooltip>
                          <Tooltip title="Item settings" position="top">
                            <button
                              onClick={() => {
                                setActiveCategoryId(category.id);
                                setSettingsMenuItemId(item.id);
                                setItemSettings({
                                  dietaryType: item.dietaryType || 'veg',
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
                    <button
                      onClick={() => {
                        setActiveCategoryId(category.id);
                        setEditingMenuItemId(null);
                        setNewMenuItem({
                          name: '',
                          description: '',
                          price: '',
                          image: null,
                          imageUrl: '',
                          isActive: true,
                          variants: [],
                        });
                        setIsAddMenuItemModalOpen(true);
                      }}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                        Add First Item
                      </span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Addons Tab */}
      {activeTab === 'addons' && (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
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
            </div>
          </div>

          {/* Choice Groups List */}
          <div>
            {addonGroups.map((group) => (
              <div key={group.id}>
                {/* Group Row */}
                <div className="px-6 py-4 border-b border-border hover:bg-accent/30 transition-colors flex items-center gap-4 group">
                  {/* Drag Handle */}
                  <button className="text-muted-foreground hover:text-foreground transition-colors cursor-grab active:cursor-grabbing flex-shrink-0">
                    <GripVertical className="w-5 h-5" />
                  </button>

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
                  <div className="flex items-center gap-2 flex-shrink-0">
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
                    <button 
                      onClick={() => setDeleteGroupId(group.id)}
                      className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="relative">
                      <button 
                        onClick={() => setOpenAddonGroupDropdownId(openAddonGroupDropdownId === group.id ? null : group.id)}
                        className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      
                      {/* Dropdown Menu */}
                      {openAddonGroupDropdownId === group.id && (
                        <>
                          {/* Backdrop to close dropdown */}
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setOpenAddonGroupDropdownId(null)}
                          />
                          
                          {/* Dropdown */}
                          <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-20">
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
                  </div>
                </div>

                {/* Addon Items - Nested under group */}
                {group.isExpanded && group.items.length > 0 && (
                  <div className="bg-muted/30">
                    {group.items.map((item, index) => (
                      <div
                        key={item.id}
                        className={`pl-20 pr-6 py-3 flex items-center gap-4 hover:bg-accent/30 transition-colors group ${
                          index !== group.items.length - 1 ? 'border-b border-border/50' : ''
                        }`}
                      >
                        {/* Drag Handle */}
                        <button className="text-muted-foreground hover:text-foreground transition-colors cursor-grab active:cursor-grabbing flex-shrink-0">
                          <GripVertical className="w-4 h-4" />
                        </button>

                        {/* Active Status Indicator */}
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`} />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h5 className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                              {item.name}
                            </h5>
                            {/* Veg/Non-Veg Indicator */}
                            <span className={`inline-flex items-center justify-center w-5 h-5 rounded border-2 flex-shrink-0 ${
                              item.dietaryType === 'veg' ? 'border-green-600' : 'border-red-600'
                            }`}>
                              <span className={`w-2 h-2 rounded-full ${
                                item.dietaryType === 'veg' ? 'bg-green-600' : 'bg-red-600'
                              }`} />
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
                          <button 
                            onClick={() => {
                              setCurrentGroupId(group.id);
                              setDeleteAddonItemId(item.id);
                            }}
                            className="p-1.5 hover:bg-accent rounded-lg transition-colors text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      </div>

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
              onClick={() => {
                if (editingCategoryId) {
                  setCategories(categories.map(cat =>
                    cat.id === editingCategoryId
                      ? { ...cat, name: newCategory.name, description: newCategory.description, image: newCategory.image ? URL.createObjectURL(newCategory.image) : newCategory.imageUrl }
                      : cat
                  ));
                } else {
                  const newCat: Category = {
                    id: `cat-${Date.now()}`,
                    name: newCategory.name,
                    description: newCategory.description,
                    image: newCategory.image ? URL.createObjectURL(newCategory.image) : newCategory.imageUrl,
                    isActive: true,
                    isExpanded: false,
                    items: [],
                  };
                  setCategories([...categories, newCat]);
                }
                setIsAddCategoryModalOpen(false);
                setNewCategory({ name: '', description: '', image: null, imageUrl: '' });
                setEditingCategoryId(null);
              }}
              disabled={!newCategory.name}
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
        onClose={() => setIsAddMenuItemModalOpen(false)}
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
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={editingMenuItemId ? Check : Plus}
              onClick={() => {
                if (!activeCategoryId || !newMenuItem.name || !newMenuItem.price) return;

                if (editingMenuItemId) {
                  // Edit existing item
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
                                  price: parseFloat(newMenuItem.price),
                                  image: newMenuItem.image ? URL.createObjectURL(newMenuItem.image) : newMenuItem.imageUrl,
                                  isActive: newMenuItem.isActive,
                                  variants: newMenuItem.variants,
                                }
                              : item
                          ),
                        }
                      : cat
                  ));
                } else {
                  // Add new item
                  const newItem: MenuItemData = {
                    id: `item-${Date.now()}`,
                    name: newMenuItem.name,
                    description: newMenuItem.description,
                    price: parseFloat(newMenuItem.price),
                    image: newMenuItem.image ? URL.createObjectURL(newMenuItem.image) : newMenuItem.imageUrl,
                    isActive: newMenuItem.isActive,
                    variants: newMenuItem.variants,
                  };

                  setCategories(categories.map(cat =>
                    cat.id === activeCategoryId
                      ? { ...cat, items: [...cat.items, newItem] }
                      : cat
                  ));
                }

                setIsAddMenuItemModalOpen(false);
                setNewMenuItem({
                  name: '',
                  description: '',
                  price: '',
                  image: null,
                  imageUrl: '',
                  isActive: true,
                  variants: [],
                });
                setActiveCategoryId(null);
                setEditingMenuItemId(null);
              }}
              disabled={!activeCategoryId || !newMenuItem.name || !newMenuItem.price}
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
                    onChange={(e) => setNewMenuItem({ ...newMenuItem, description: e.target.value })}
                    placeholder="Describe this menu item"
                    rows={3}
                    className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    style={{ fontSize: 'var(--text-base)' }}
                  />
                </div>

                <div>
                  <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>€</span>
                    <input
                      type="number"
                      step="0.01"
                      value={newMenuItem.price}
                      onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                      style={{ fontSize: 'var(--text-base)' }}
                    />
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

                {/* Variants Section */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                      Variants (Optional)
                    </label>
                    <button
                      onClick={addVariant}
                      className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>Add Variant</span>
                    </button>
                  </div>
                  
                  {newMenuItem.variants.length > 0 && (
                    <div className="space-y-2 mt-3">
                      {newMenuItem.variants.map((variant, index) => (
                        <div key={variant.id} className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                          <input
                            type="text"
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
                              value={variant.price}
                              onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                              placeholder="0.00"
                              className="w-full pl-8 pr-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                              style={{ fontSize: 'var(--text-base)' }}
                            />
                          </div>
                          <button
                            onClick={() => removeVariant(index)}
                            className="p-2 hover:bg-accent rounded-lg transition-colors text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
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
              onClick={() => {
                if (!newGroup.name) return;

                if (editingGroupId) {
                  // Edit existing group
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
                } else {
                  // Add new group
                  const newAddonGroup: AddonGroup = {
                    id: `group-${Date.now()}`,
                    name: newGroup.name,
                    subtitle: newGroup.subtitle,
                    minSelect: newGroup.type === 'mandatory' ? newGroup.minSelect : 0,
                    maxSelect: newGroup.type === 'mandatory' ? newGroup.maxSelect : 999,
                    items: [],
                    isExpanded: false,
                    isRequired: newGroup.type === 'mandatory',
                  };

                  setAddonGroups([...addonGroups, newAddonGroup]);
                }

                setIsAddGroupModalOpen(false);
                setEditingGroupId(null);
                setNewGroup({ name: '', subtitle: '', type: 'optional', minSelect: 0, maxSelect: 1 });
              }}
              disabled={!newGroup.name}
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
                  <p className="text-muted-foreground mb-3" style={{ fontSize: 'var(--text-small)' }}>
                    Optional: customers can choose but aren't required.<br />
                    Mandatory: customers must select.
                  </p>
                  <div className="flex gap-3">
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="radio"
                        name="groupType"
                        checked={newGroup.type === 'optional'}
                        onChange={() => setNewGroup({ ...newGroup, type: 'optional' })}
                        className="sr-only peer"
                      />
                      <div className="px-4 py-3 border-2 border-border rounded-lg transition-all peer-checked:border-primary peer-checked:bg-primary/10 hover:border-primary/50">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-foreground peer-checked:text-primary" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                            Optional
                          </span>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            newGroup.type === 'optional' 
                              ? 'border-primary bg-primary' 
                              : 'border-border bg-background'
                          }`}>
                            {newGroup.type === 'optional' && (
                              <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                            )}
                          </div>
                        </div>
                      </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="radio"
                        name="groupType"
                        checked={newGroup.type === 'mandatory'}
                        onChange={() => setNewGroup({ ...newGroup, type: 'mandatory' })}
                        className="sr-only peer"
                      />
                      <div className="px-4 py-3 border-2 border-border rounded-lg transition-all peer-checked:border-primary peer-checked:bg-primary/10 hover:border-primary/50">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-foreground peer-checked:text-primary" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                            Mandatory
                          </span>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            newGroup.type === 'mandatory' 
                              ? 'border-primary bg-primary' 
                              : 'border-border bg-background'
                          }`}>
                            {newGroup.type === 'mandatory' && (
                              <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                            )}
                          </div>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Selection Requirements - Only show when Mandatory */}
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
              onClick={() => {
                if (!currentGroupId) return;

                const updatedGroups = addonGroups.map(group => {
                  if (group.id === currentGroupId) {
                    if (editingAddonItemId) {
                      // Edit existing item
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
                    } else {
                      // Add new item
                      const newItem: AddonItem = {
                        id: `item-${Date.now()}`,
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
                  }
                  return group;
                });

                setAddonGroups(updatedGroups);
                setIsAddAddonItemModalOpen(false);
                setEditingAddonItemId(null);
                setCurrentGroupId(null);
                setNewAddonItem({ name: '', price: '', dietaryType: 'veg', isActive: true });
              }}
              disabled={!newAddonItem.name || !newAddonItem.price}
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
                  </label>
                  <input
                    type="number"
                    step="0.01"
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
                    Dietary Type *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setNewAddonItem({ ...newAddonItem, dietaryType: 'veg' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        newAddonItem.dietaryType === 'veg'
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
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          newAddonItem.dietaryType === 'veg' ? 'border-primary' : 'border-border'
                        }`}>
                          {newAddonItem.dietaryType === 'veg' && (
                            <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                    </button>

                    <button
                      onClick={() => setNewAddonItem({ ...newAddonItem, dietaryType: 'non-veg' })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        newAddonItem.dietaryType === 'non-veg'
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
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                          newAddonItem.dietaryType === 'non-veg' ? 'border-primary' : 'border-border'
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
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      newAddonItem.isActive ? 'bg-primary' : 'bg-border'
                    }`}
                  >
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      newAddonItem.isActive ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
        </div>
      </Modal>

      {/* Delete Category Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteCategoryId}
        onClose={() => setDeleteCategoryId(null)}
        onConfirm={() => {
          setCategories(categories.filter(cat => cat.id !== deleteCategoryId));
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
        onConfirm={() => {
          setCategories(categories.map(cat => {
            if (cat.id === activeCategoryId) {
              return {
                ...cat,
                items: cat.items.filter(item => item.id !== deleteMenuItemId),
              };
            }
            return cat;
          }));
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
        onConfirm={() => {
          setAddonGroups(addonGroups.filter(group => group.id !== deleteGroupId));
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
        onConfirm={() => {
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
                setSelectedAddonGroups([]);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              icon={Check}
              onClick={() => {
                if (choiceCategoryId) {
                  setCategories(categories.map(cat =>
                    cat.id === choiceCategoryId
                      ? { ...cat, assignedAddonGroups: selectedAddonGroups }
                      : cat
                  ));
                }
                setIsAddChoiceModalOpen(false);
                setChoiceCategoryId(null);
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
              Choose which addon groups should be available for this category
            </p>
            
            {/* Addon Groups Grid */}
            <div className="grid grid-cols-3 gap-3">
              {addonGroups.map((group) => {
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
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                          isSelected 
                            ? 'bg-primary border-primary' 
                            : 'bg-background border-border'
                        }`}>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />
                          )}
                        </div>
                        <span 
                          className="text-foreground"
                          style={{ fontSize: 'var(--text-base)' }}
                        >
                          {group.name}
                        </span>
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
          </div>
        </div>
      </Modal>
    </div>
  );
}