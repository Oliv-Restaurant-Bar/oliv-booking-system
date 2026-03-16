'use client';

import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/user/Button';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  restrictToVerticalAxis,
} from '@dnd-kit/modifiers';
import { CategoryItem } from './CategoryItem';
import { Category, MenuItemData } from '../../lib/types';

interface CategoryTabContentProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categories: Category[];
  filteredCategories: Category[];
  canCreateCategory: boolean;
  canEditCategory: boolean;
  canDeleteCategory: boolean;
  canCreateItem: boolean;
  canEditItem: boolean;
  canDeleteItem: boolean;
  onAddCategory: () => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
  onToggleCategoryActive: (id: string) => void;
  onToggleCategoryExpanded: (id: string) => void;
  onAddItem: (categoryId: string) => void;
  onAddChoice: (categoryId: string) => void;
  onDragEnd: (event: DragEndEvent) => void;
  // Item actions
  onEditItem: (categoryId: string, item: MenuItemData) => void;
  onToggleItemActive: (categoryId: string, itemId: string) => void;
  onDeleteItem: (categoryId: string, itemId: string) => void;
  onDuplicateItem: (categoryId: string, item: MenuItemData) => void;
  onItemSettings: (item: MenuItemData) => void;
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
  translations: {
    searchPlaceholder: string;
    addCategory: string;
    item: string;
    items: string;
  };
}

export function CategoryTabContent({
  searchQuery,
  setSearchQuery,
  filteredCategories,
  canCreateCategory,
  canEditCategory,
  canDeleteCategory,
  canCreateItem,
  canEditItem,
  canDeleteItem,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onToggleCategoryActive,
  onToggleCategoryExpanded,
  onAddItem,
  onAddChoice,
  onDragEnd,
  onEditItem,
  onToggleItemActive,
  onDeleteItem,
  onDuplicateItem,
  onItemSettings,
  openDropdownId,
  setOpenDropdownId,
  translations,
}: CategoryTabContentProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div className="bg-card border border-border rounded-xl">
      {/* Search Bar with Add Button */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={translations.searchPlaceholder}
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
              onClick={onAddCategory}
            >
              {translations.addCategory}
            </Button>
          )}
        </div>
      </div>

      {/* Categories List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext
          items={filteredCategories.map(cat => cat.id)}
          strategy={verticalListSortingStrategy}
        >
          {filteredCategories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              canEditCategory={canEditCategory}
              canCreateItem={canCreateItem}
              canCreateCategory={canCreateCategory}
              canDeleteCategory={canDeleteCategory}
              canEditItem={canEditItem}
              canDeleteItem={canDeleteItem}
              onToggleExpanded={() => onToggleCategoryExpanded(category.id)}
              onToggleActive={() => onToggleCategoryActive(category.id)}
              onEdit={() => onEditCategory(category)}
              onAddItem={() => onAddItem(category.id)}
              onAddChoice={() => onAddChoice(category.id)}
              onDelete={() => onDeleteCategory(category.id)}
              onDuplicate={() => { }} // Placeholder
              onToggleGuestCount={() => { }} // Placeholder
              openDropdownId={openDropdownId}
              setOpenDropdownId={setOpenDropdownId}
              onEditItem={(item) => onEditItem(category.id, item)}
              onToggleItemActive={(itemId) => onToggleItemActive(category.id, itemId)}
              onDeleteItem={(itemId) => onDeleteItem(category.id, itemId)}
              onSettingsItem={onItemSettings}
              onAddChoiceItem={(item) => { }} // Placeholder
              translations={{
                item: translations.item,
                items: translations.items,
                editCategory: 'Edit Category',
                addItem: 'Add Item',
                addChoice: 'Add Choice',
                duplicate: 'Duplicate',
                hide: 'Hide',
                show: 'Show',
                delete: 'Delete',
                noItems: 'No items in this category',
                addFirstItem: 'Add first item',
              }}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
