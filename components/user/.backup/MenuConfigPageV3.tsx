'use client';

import { useState } from 'react';
import { GripVertical, Edit2, MoreVertical, Plus, ChevronDown, ChevronRight, Trash2, Eye, EyeOff, Search, UtensilsCrossed, ListPlus, Upload, X, Copy } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

interface MenuItemData {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  isActive: boolean;
  variants: VariantOption[];
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
}

interface AddonItem {
  id: string;
  name: string;
  price: number;
  isActive: boolean;
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

export function MenuConfigPage() {
  const [categories, setCategories] = useState(mockCategories);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddMenuItemModalOpen, setIsAddMenuItemModalOpen] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingMenuItemId, setEditingMenuItemId] = useState<string | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
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
    <div className="px-8 pt-3 pb-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-foreground" style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-semibold)' }}>
            Menu Configuration
          </h2>
          <p className="text-muted-foreground mt-1" style={{ fontSize: 'var(--text-base)' }}>
            Manage your menu items and choice groups
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-background border border-border text-foreground rounded-lg hover:bg-accent transition-colors flex items-center gap-2">
            <Search className="w-4 h-4" />
            <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>Advanced Search</span>
          </button>
          <button 
            onClick={() => {
              setActiveCategoryId(null);
              setIsAddMenuItemModalOpen(true);
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>Add Item</span>
          </button>
        </div>
      </div>

      {/* Menu Categories Section */}
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
              <button
                onClick={() => {
                  setEditingCategoryId(null);
                  setNewCategory({ name: '', description: '', image: null, imageUrl: '' });
                  setIsAddCategoryModalOpen(true);
                }}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                  Add New Category
                </span>
              </button>
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
                    className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                  >
                    {category.isExpanded ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
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
                      className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <div className="relative">
                      <button 
                        onClick={() => setOpenDropdownId(openDropdownId === category.id ? null : category.id)}
                        className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
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
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left border-b border-border"
                            >
                              <Plus className="w-4 h-4 text-muted-foreground" />
                              <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                                Add menu item
                              </span>
                            </button>
                            
                            <button
                              onClick={() => {
                                console.log('Add choice to', category.name);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left border-b border-border"
                            >
                              <ListPlus className="w-4 h-4 text-muted-foreground" />
                              <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                                Add choice
                              </span>
                            </button>
                            
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
                                console.log('Remove', category.name);
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
                            className="p-1.5 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleMenuItemActive(category.id, item.id)}
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
                              console.log('Delete item', item.id);
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

          {/* Footer */}
          <div className="px-6 py-3 bg-muted border-t border-border">
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
              Showing {filteredCategories.length} of {categories.length} categories
            </p>
          </div>
        </div>

      {/* Copyright Footer */}
      <div className="text-center pt-8 pb-2">
        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
          © 2026 Restaurant Oliv Restaurant & Bar
        </p>
      </div>

      {/* Add Category Modal */}
      {isAddCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <UtensilsCrossed className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {editingCategoryId ? 'Edit Category' : 'Add New Category'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddCategoryModalOpen(false);
                  setEditingCategoryId(null);
                  setNewCategory({ name: '', description: '', image: null, imageUrl: '' });
                }}
                className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Category Name */}
              <div>
                <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                  Category Name
                </label>
                <input
                  type="text"
                  placeholder="Enter category name..."
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                  style={{ fontSize: 'var(--text-base)' }}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                  Description
                </label>
                <textarea
                  placeholder="Enter category description..."
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground resize-none"
                  style={{ fontSize: 'var(--text-base)' }}
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                  Category Image
                </label>
                
                {/* Show existing image preview when editing */}
                {(newCategory.imageUrl || newCategory.image) && (
                  <div className="mb-4 relative">
                    <div className="w-full h-48 rounded-lg overflow-hidden border border-border bg-muted">
                      <ImageWithFallback
                        src={newCategory.image ? URL.createObjectURL(newCategory.image) : newCategory.imageUrl}
                        alt="Category preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => setNewCategory({ ...newCategory, image: null, imageUrl: '' })}
                      className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity shadow-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                {/* Upload area - only show if no image */}
                {!newCategory.imageUrl && !newCategory.image && (
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-accent/20 hover:bg-accent/30 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setNewCategory({ ...newCategory, image: file });
                        }
                      }}
                      className="hidden"
                      id="category-image-upload"
                    />
                    <label htmlFor="category-image-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Upload className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                            Click to upload or drag and drop
                          </p>
                          <p className="text-muted-foreground mt-1" style={{ fontSize: 'var(--text-small)' }}>
                            SVG, PNG, JPG or GIF (max. 800x400px)
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                )}
                
                {/* Change image button - show if image exists */}
                {(newCategory.imageUrl || newCategory.image) && (
                  <div className="mt-3">
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
                      id="category-image-change"
                    />
                    <label 
                      htmlFor="category-image-change" 
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity cursor-pointer mx-auto"
                    >
                      <Upload className="w-4 h-4" />
                      <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                        Change Image
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-border bg-muted/30">
              <button
                onClick={() => {
                  setIsAddCategoryModalOpen(false);
                  setEditingCategoryId(null);
                  setNewCategory({ name: '', description: '', image: null, imageUrl: '' });
                }}
                className="px-6 py-2.5 bg-background border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
                style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (editingCategoryId) {
                    // Update existing category
                    setCategories(categories.map(cat =>
                      cat.id === editingCategoryId
                        ? { ...cat, name: newCategory.name, description: newCategory.description }
                        : cat
                    ));
                    console.log('Updating category:', editingCategoryId, newCategory);
                  } else {
                    // Add new category
                    const newCat: Category = {
                      id: `cat-${Date.now()}`,
                      name: newCategory.name,
                      description: newCategory.description,
                      image: newCategory.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
                      isActive: true,
                      isExpanded: false,
                      items: [],
                    };
                    setCategories([...categories, newCat]);
                    console.log('Adding new category:', newCat);
                  }
                  setIsAddCategoryModalOpen(false);
                  setEditingCategoryId(null);
                  setNewCategory({ name: '', description: '', image: null, imageUrl: '' });
                }}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Menu Item Modal */}
      {isAddMenuItemModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl border border-border w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-card z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Plus className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {editingMenuItemId ? 'Edit Menu Item' : 'Add New Menu Item'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsAddMenuItemModalOpen(false);
                  setEditingMenuItemId(null);
                  setActiveCategoryId(null);
                  setNewMenuItem({
                    name: '',
                    description: '',
                    price: '',
                    image: null,
                    imageUrl: '',
                    isActive: true,
                    variants: [],
                  });
                }}
                className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Category Selection - only show if no active category */}
              {!activeCategoryId && (
                <div>
                  <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    Category
                  </label>
                  <select
                    onChange={(e) => setActiveCategoryId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                    style={{ fontSize: 'var(--text-base)' }}
                  >
                    <option value="">Select a category...</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Item Name */}
              <div>
                <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                  Item Name
                </label>
                <input
                  type="text"
                  placeholder="Enter item name..."
                  value={newMenuItem.name}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                  style={{ fontSize: 'var(--text-base)' }}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                  Description
                </label>
                <textarea
                  placeholder="Enter item description..."
                  value={newMenuItem.description}
                  onChange={(e) => setNewMenuItem({ ...newMenuItem, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground resize-none"
                  style={{ fontSize: 'var(--text-base)' }}
                />
              </div>

              {/* Price */}
              <div>
                <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                  Base Price
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newMenuItem.price}
                    onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                    className="w-full pl-8 pr-4 py-2.5 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                    style={{ fontSize: 'var(--text-base)' }}
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                  Item Image
                </label>
                
                {(newMenuItem.imageUrl || newMenuItem.image) && (
                  <div className="mb-4 relative">
                    <div className="w-full h-48 rounded-lg overflow-hidden border border-border bg-muted">
                      <ImageWithFallback
                        src={newMenuItem.image ? URL.createObjectURL(newMenuItem.image) : newMenuItem.imageUrl}
                        alt="Item preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => setNewMenuItem({ ...newMenuItem, image: null, imageUrl: '' })}
                      className="absolute top-2 right-2 p-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity shadow-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                {!newMenuItem.imageUrl && !newMenuItem.image && (
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-accent/20 hover:bg-accent/30 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setNewMenuItem({ ...newMenuItem, image: file });
                        }
                      }}
                      className="hidden"
                      id="item-image-upload"
                    />
                    <label htmlFor="item-image-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Upload className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                            Click to upload or drag and drop
                          </p>
                          <p className="text-muted-foreground mt-1" style={{ fontSize: 'var(--text-small)' }}>
                            SVG, PNG, JPG or GIF (max. 800x400px)
                          </p>
                        </div>
                      </div>
                    </label>
                  </div>
                )}
                
                {(newMenuItem.imageUrl || newMenuItem.image) && (
                  <div className="mt-3">
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
                      id="item-image-change"
                    />
                    <label 
                      htmlFor="item-image-change" 
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity cursor-pointer mx-auto"
                    >
                      <Upload className="w-4 h-4" />
                      <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                        Change Image
                      </span>
                    </label>
                  </div>
                )}
              </div>

              {/* Variants/Options Section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    Variants / Options
                  </label>
                  <button
                    onClick={addVariant}
                    className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>
                      Add Variant
                    </span>
                  </button>
                </div>
                <p className="text-muted-foreground mb-3" style={{ fontSize: 'var(--text-small)' }}>
                  Add size options, extras, or variations (e.g., Small, Medium, Large)
                </p>

                {newMenuItem.variants.length === 0 ? (
                  <div className="border border-dashed border-border rounded-lg p-6 text-center">
                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
                      No variants added yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {newMenuItem.variants.map((variant, index) => (
                      <div key={variant.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg border border-border">
                        <button className="text-muted-foreground cursor-grab active:cursor-grabbing">
                          <GripVertical className="w-4 h-4" />
                        </button>
                        <input
                          type="text"
                          placeholder="Variant name (e.g., Small)"
                          value={variant.name}
                          onChange={(e) => updateVariant(index, 'name', e.target.value)}
                          className="flex-1 px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                          style={{ fontSize: 'var(--text-base)' }}
                        />
                        <div className="relative w-32">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">€</span>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={variant.price}
                            onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                            className="w-full pl-7 pr-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
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

              {/* Availability Toggle */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                <div>
                  <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    Available for customers
                  </p>
                  <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                    Control if this item is visible to customers
                  </p>
                </div>
                <button
                  onClick={() => setNewMenuItem({ ...newMenuItem, isActive: !newMenuItem.isActive })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    newMenuItem.isActive ? 'bg-primary' : 'bg-muted-foreground'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      newMenuItem.isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-4 border-t border-border bg-muted/30">
              <button
                onClick={() => {
                  setIsAddMenuItemModalOpen(false);
                  setEditingMenuItemId(null);
                  setActiveCategoryId(null);
                  setNewMenuItem({
                    name: '',
                    description: '',
                    price: '',
                    image: null,
                    imageUrl: '',
                    isActive: true,
                    variants: [],
                  });
                }}
                className="px-6 py-2.5 bg-background border border-border text-foreground rounded-lg hover:bg-accent transition-colors"
                style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!activeCategoryId) {
                    alert('Please select a category');
                    return;
                  }

                  if (editingMenuItemId) {
                    // Update existing menu item
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
                                    price: parseFloat(newMenuItem.price) || 0,
                                    isActive: newMenuItem.isActive,
                                    variants: newMenuItem.variants,
                                  }
                                : item
                            ),
                          }
                        : cat
                    ));
                    console.log('Updated menu item:', editingMenuItemId);
                  } else {
                    // Add new menu item
                    const newItem: MenuItemData = {
                      id: `item-${Date.now()}`,
                      name: newMenuItem.name,
                      description: newMenuItem.description,
                      price: parseFloat(newMenuItem.price) || 0,
                      image: newMenuItem.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=400&fit=crop',
                      isActive: newMenuItem.isActive,
                      variants: newMenuItem.variants,
                    };
                    
                    setCategories(categories.map(cat =>
                      cat.id === activeCategoryId
                        ? { ...cat, items: [...cat.items, newItem] }
                        : cat
                    ));
                    console.log('Added new menu item:', newItem);
                  }

                  setIsAddMenuItemModalOpen(false);
                  setEditingMenuItemId(null);
                  setActiveCategoryId(null);
                  setNewMenuItem({
                    name: '',
                    description: '',
                    price: '',
                    image: null,
                    imageUrl: '',
                    isActive: true,
                    variants: [],
                  });
                }}
                className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
                style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
              >
                {editingMenuItemId ? 'Save Changes' : 'Add Item'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}