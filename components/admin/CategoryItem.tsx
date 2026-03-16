'use client';

import { GripVertical, ChevronDown, ChevronRight, Edit2, Plus, ListPlus, MoreVertical, Copy, Eye, EyeOff, Trash2, Users } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Tooltip } from '@/components/user/Tooltip';
import { Category, MenuItemData } from '../../lib/types';
import { MenuItemRow } from './MenuItemRow';
import { SortableCategory } from './SortableCategory';

interface CategoryItemProps {
  category: Category;
  canEditCategory: boolean;
  canCreateItem: boolean;
  canCreateCategory: boolean;
  canDeleteItem: boolean;
  canEditItem: boolean;
  canDeleteCategory: boolean;
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
  onToggleExpanded: () => void;
  onToggleActive: () => void;
  onEdit: () => void;
  onAddItem: () => void;
  onAddChoice: () => void;
  onDuplicate: () => void;
  onToggleGuestCount: () => void;
  onDelete: () => void;
  // Item actions
  onEditItem: (item: MenuItemData) => void;
  onSettingsItem: (item: MenuItemData) => void;
  onAddChoiceItem: (item: MenuItemData) => void;
  onToggleItemActive: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  translations: {
    item: string;
    items: string;
    editCategory: string;
    addItem: string;
    addChoice: string;
    duplicate: string;
    hide: string;
    show: string;
    delete: string;
    noItems: string;
    addFirstItem: string;
  };
}

export function CategoryItem({
  category,
  canEditCategory,
  canCreateItem,
  canCreateCategory,
  canDeleteItem,
  canEditItem,
  canDeleteCategory,
  openDropdownId,
  setOpenDropdownId,
  onToggleExpanded,
  onToggleActive,
  onEdit,
  onAddItem,
  onAddChoice,
  onDuplicate,
  onToggleGuestCount,
  onDelete,
  onEditItem,
  onSettingsItem,
  onAddChoiceItem,
  onToggleItemActive,
  onDeleteItem,
  translations,
}: CategoryItemProps) {
  return (
    <SortableCategory id={category.id}>
      {({ attributes, listeners, isDragging }) => (
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
              onClick={onToggleExpanded}
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
            <div className="hidden sm:block w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted relative">
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
                  {category.name.length > 25 ? `${category.name.slice(0, 25)}...` : category.name}
                </h4>
                {category.items.length > 0 && (
                  <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full" style={{ fontSize: 'var(--text-small)' }}>
                    {category.items.length} {category.items.length === 1 ? translations.item : translations.items}
                  </span>
                )}
                {category.guestCount && (
                  <Tooltip title="Manual guest count enabled" position="top">
                    <span className="px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded-full flex items-center gap-1" style={{ fontSize: 'var(--text-small)' }}>
                      <Users className="w-3 h-3" />
                      Manual
                    </span>
                  </Tooltip>
                )}
              </div>
              <p className="text-muted-foreground line-clamp-1" style={{ fontSize: 'var(--text-small)' }}>
                {category.description.length > 25 ? `${category.description.slice(0, 25)}...` : category.description}
              </p>
            </div>

            {/* Category actions - Desktop buttons + Mobile dropdown */}
            {(canEditCategory || canCreateItem || canDeleteCategory) && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Desktop Actions */}
                {canEditCategory && (
                  <button
                    onClick={onEdit}
                    className="hidden md:flex p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                    title={translations.editCategory}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                {canCreateItem && (
                  <button
                    onClick={onAddItem}
                    className="hidden md:flex p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                    title={translations.addItem}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
                {canEditCategory && (
                  <button
                    onClick={onAddChoice}
                    className="hidden md:flex p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                    title={translations.addChoice}
                  >
                    <ListPlus className="w-4 h-4" />
                  </button>
                )}

                {/* Dropdown for common and mobile actions */}
                <div className="relative">
                  <button
                    onClick={() => setOpenDropdownId(openDropdownId === category.id ? null : category.id)}
                    className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {openDropdownId === category.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownId(null)} />
                      <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-20">
                        {/* Mobile: Edit Category */}
                        {canEditCategory && (
                          <button
                            onClick={() => { onEdit(); setOpenDropdownId(null); }}
                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left border-b border-border md:hidden"
                          >
                            <Edit2 className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>{translations.editCategory}</span>
                          </button>
                        )}
                        {/* Mobile: Add Item */}
                        {canCreateItem && (
                          <button
                            onClick={() => { onAddItem(); setOpenDropdownId(null); }}
                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left border-b border-border md:hidden"
                          >
                            <Plus className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>{translations.addItem}</span>
                          </button>
                        )}
                        {/* Mobile: Add Choice */}
                        {canEditCategory && (
                          <button
                            onClick={() => { onAddChoice(); setOpenDropdownId(null); }}
                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left border-b border-border md:hidden"
                          >
                            <ListPlus className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>{translations.addChoice}</span>
                          </button>
                        )}
                        {/* Manual Guest Count Toggle */}
                        {canEditCategory && (
                          <button
                            onClick={() => { onToggleGuestCount(); setOpenDropdownId(null); }}
                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left border-b border-border"
                          >
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                              {category.guestCount ? 'Disable Manual' : 'Enable Manual'}
                            </span>
                          </button>
                        )}
                        {/* Duplicate */}
                        {canCreateCategory && (
                          <button
                            onClick={() => { onDuplicate(); setOpenDropdownId(null); }}
                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left border-b border-border"
                          >
                            <Copy className="w-4 h-4 text-muted-foreground" />
                            <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>{translations.duplicate}</span>
                          </button>
                        )}
                        {/* Show/Hide */}
                        {canEditCategory && (
                          <button
                            onClick={() => { onToggleActive(); setOpenDropdownId(null); }}
                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left border-b border-border"
                          >
                            {category.isActive ? (
                              <><EyeOff className="w-4 h-4 text-muted-foreground" /><span>{translations.hide}</span></>
                            ) : (
                              <><Eye className="w-4 h-4 text-muted-foreground" /><span>{translations.show}</span></>
                            )}
                          </button>
                        )}
                        {/* Delete */}
                        {canDeleteCategory && (
                          <button
                            onClick={() => { onDelete(); setOpenDropdownId(null); }}
                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>{translations.delete}</span>
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Nested Menu Items */}
          {category.isExpanded && category.items.length > 0 && (
            <div className="bg-muted/30">
              {category.items.map((item, index) => (
                <MenuItemRow
                  key={item.id}
                  item={item}
                  index={index}
                  isLast={index === category.items.length - 1}
                  canEditItem={canEditItem}
                  canDeleteItem={canDeleteItem}
                  openDropdownId={openDropdownId}
                  setOpenDropdownId={setOpenDropdownId}
                  onEdit={() => onEditItem(item)}
                  onSettings={() => onSettingsItem(item)}
                  onAddChoice={() => onAddChoiceItem(item)}
                  onToggleActive={() => onToggleItemActive(item.id)}
                  onDelete={() => onDeleteItem(item.id)}
                />
              ))}
            </div>
          )}

          {/* Empty state for expanded category */}
          {category.isExpanded && category.items.length === 0 && (
            <div className="bg-muted/30 pl-20 pr-6 py-8 text-center">
              <p className="text-muted-foreground mb-3" style={{ fontSize: 'var(--text-base)' }}>
                {translations.noItems}
              </p>
              {canCreateItem && (
                <button
                  onClick={onAddItem}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    {translations.addFirstItem}
                  </span>
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </SortableCategory>
  );
}
