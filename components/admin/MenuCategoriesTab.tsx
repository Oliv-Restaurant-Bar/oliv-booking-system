'use client';

import { Search, Plus, GripVertical, ChevronDown, ChevronRight, Edit2, ListPlus, MoreVertical, Copy, EyeOff, Eye, Trash2, Settings } from 'lucide-react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { Button } from '../user/Button';
import { Tooltip } from '../user/Tooltip';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { DietaryIcon } from '@/components/user/DietaryIcon';
import { Category, MenuItemData } from '@/lib/types';
import { useMenuConfigTranslation, useCommonTranslation } from '@/lib/i18n/client';

interface MenuCategoriesTabProps {
  filteredCategories: Category[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  canCreateCategory: boolean;
  canEditCategory: boolean;
  canDeleteCategory: boolean;
  canCreateItem: boolean;
  canEditItem: boolean;
  canDeleteItem: boolean;
  onAddCategory: () => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
  onToggleCategoryExpanded: (id: string) => void;
  onToggleCategoryActive: (id: string) => void;
  onAddMenuItem: (categoryId: string) => void;
  onEditMenuItem: (categoryId: string, item: MenuItemData) => void;
  onDeleteMenuItem: (categoryId: string, itemId: string) => void;
  onToggleMenuItemActive: (categoryId: string, itemId: string) => void;
  onOpenItemSettings: (categoryId: string, item: MenuItemData) => void;
  onAddChoice: (categoryId: string, itemId?: string) => void;
  SortableCategory: any;
  SortableItem: any;
  sensors: any;
  handleDragEnd: (event: any) => void;
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
}

export function MenuCategoriesTab({
  filteredCategories,
  searchQuery,
  setSearchQuery,
  canCreateCategory,
  canEditCategory,
  canDeleteCategory,
  canCreateItem,
  canEditItem,
  canDeleteItem,
  onAddCategory,
  onEditCategory,
  onDeleteCategory,
  onToggleCategoryExpanded,
  onToggleCategoryActive,
  onAddMenuItem,
  onEditMenuItem,
  onDeleteMenuItem,
  onToggleMenuItemActive,
  onOpenItemSettings,
  onAddChoice,
  SortableCategory,
  SortableItem,
  sensors,
  handleDragEnd,
  openDropdownId,
  setOpenDropdownId,
}: MenuCategoriesTabProps) {
  const t = useMenuConfigTranslation();
  const ct = useCommonTranslation();

  return (
    <div className="bg-card border border-border rounded-xl">
      {/* Search Bar with Add Button */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('placeholders.searchCategories')}
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
              {t('buttons.addCategory')}
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
              {({ attributes, listeners, isDragging }: any) => (
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
                        onClick={() => onToggleCategoryExpanded(category.id)}
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
                            {category.name.slice(0, 25)} {category.name.length > 25 ? '...' : ''}
                          </h4>
                          {category.items && category.items.length > 0 && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full" style={{ fontSize: 'var(--text-small)' }}>
                              {category.items.length} {category.items.length === 1 ? ct('item') : ct('items')}
                            </span>
                          )}
                        </div>
                        <p className="text-muted-foreground line-clamp-1" style={{ fontSize: 'var(--text-small)' }}>
                          {category.description.slice(0, 25)} {category.description.length > 25 ? '...' : ''}
                        </p>
                      </div>
                      {/* Category actions - Desktop buttons + Mobile dropdown */}
                      {(canEditCategory || canCreateItem || canDeleteCategory) && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {/* Desktop: Edit Category Button */}
                          {canEditCategory && (
                            <button
                              onClick={() => onEditCategory(category)}
                              className="hidden md:flex p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                              title={t('tooltips.editCategory')}
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Desktop: Add Item Button */}
                          {canCreateItem && (
                            <button
                              onClick={() => onAddMenuItem(category.id)}
                              className="hidden md:flex p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                              title={t('tooltips.addItem')}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          )}

                          {/* Desktop: Add Choice Button */}
                          {canEditCategory && (
                            <button
                              onClick={() => onAddChoice(category.id)}
                              className="hidden md:flex p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                              title={t('buttons.addChoice')}
                            >
                              <ListPlus className="w-4 h-4" />
                            </button>
                          )}

                          {/* Mobile Dropdown + Desktop Duplicate, Show/Hide & Delete */}
                          <div className="relative">
                            <button
                              onClick={() => setOpenDropdownId(openDropdownId === category.id ? null : category.id)}
                              className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {openDropdownId === category.id && (
                              <>
                                <div
                                  className="fixed inset-0 z-10"
                                  onClick={() => setOpenDropdownId(null)}
                                />
                                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-20">
                                  {/* Mobile: Edit Category */}
                                  {canEditCategory && (
                                    <button
                                      onClick={() => {
                                        onEditCategory(category);
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left border-b border-border md:hidden"
                                    >
                                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                                        {t('tooltips.editCategory')}
                                      </span>
                                    </button>
                                  )}

                                  {/* Mobile: Add Item */}
                                  {canCreateItem && (
                                    <button
                                      onClick={() => {
                                        onAddMenuItem(category.id);
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left border-b border-border md:hidden"
                                    >
                                      <Plus className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                                        {t('tooltips.addItem')}
                                      </span>
                                    </button>
                                  )}

                                  {/* Mobile: Add Choice */}
                                  {canEditCategory && (
                                    <button
                                      onClick={() => {
                                        onAddChoice(category.id);
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left border-b border-border md:hidden"
                                    >
                                      <ListPlus className="w-4 h-4 text-muted-foreground" />
                                      <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                                        {t('buttons.addChoice')}
                                      </span>
                                    </button>
                                  )}

                                  {/* Duplicate (all screens) */}
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
                                        {t('buttons.duplicate')}
                                      </span>
                                    </button>
                                  )}

                                  {/* Show/Hide (all screens) */}
                                  {canEditCategory && (
                                    <button
                                      onClick={() => {
                                        onToggleCategoryActive(category.id);
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left border-b border-border"
                                    >
                                      {category.isActive ? (
                                        <>
                                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                                          <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                                            {t('buttons.hide')}
                                          </span>
                                        </>
                                      ) : (
                                        <>
                                          <Eye className="w-4 h-4 text-muted-foreground" />
                                          <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                                            {t('buttons.show')}
                                          </span>
                                        </>
                                      )}
                                    </button>
                                  )}

                                  {/* Delete (all screens) */}
                                  {canDeleteCategory && (
                                    <button
                                      onClick={() => {
                                        onDeleteCategory(category.id);
                                        setOpenDropdownId(null);
                                      }}
                                      className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left"
                                    >
                                      <Trash2 className="w-4 h-4 text-destructive" />
                                      <span className="text-destructive" style={{ fontSize: 'var(--text-base)' }}>
                                        {t('buttons.remove')}
                                      </span>
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    {/* Menu Items - Nested under category */}
                    {category.isExpanded && category.items && (
                      <div className="bg-muted/30">
                        <SortableContext
                          items={category.items.map(i => i.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {category.items.length > 0 ? (
                            category.items.map((item, index) => (
                              <SortableItem key={item.id} id={item.id}>
                                {({ attributes, listeners, isDragging }: any) => (
                                  <div
                                    className={`pl-20 pr-6 py-3 flex items-center gap-4 hover:bg-accent/30 transition-colors group ${category.items && index !== category.items.length - 1 ? 'border-b border-border/50' : ''
                                      }`}
                                    style={{ opacity: isDragging ? 0.5 : 1 }}
                                  >
                                    {/* Drag Handle */}
                                    {canEditItem && (
                                      <button
                                        {...attributes}
                                        {...listeners}
                                        className="text-muted-foreground hover:text-foreground transition-colors cursor-grab active:cursor-grabbing flex-shrink-0"
                                      >
                                        <GripVertical className="w-4 h-4" />
                                      </button>
                                    )}
                                    {/* Image - Smaller for items */}
                                    <div className="hidden sm:block w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-muted relative">
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
                                        <span className={`text-ellipsis overflow-hidden whitespace-nowrap ${item.name.slice(0, 25)} ${item.name.length > 25 ? '...' : ''}`}>{item.name}</span>
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
                                            {t('labels.comboItem')}
                                          </span>
                                        )}
                                      </h5>
                                      <p className="text-muted-foreground line-clamp-1" style={{ fontSize: 'var(--text-small)' }}>
                                        {item.description}
                                      </p>
                                      {item.variants && item.variants.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                                          {item.variants.map((variant: any) => (
                                            <span
                                              key={variant.id}
                                              className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded"
                                              style={{ fontSize: 'var(--text-small)' }}
                                            >
                                              {variant.name}: {ct('currencySymbol')}{Number(variant.price || 0).toFixed(2)}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                    {/* Price */}
                                    <div className="text-right flex-shrink-0">
                                      <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                                        {ct('currencySymbol')}{Number(item.price || 0).toFixed(2)}
                                      </p>
                                    </div>

                                    {/* Actions - Desktop buttons + Mobile dropdown */}
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                      {canEditItem && (
                                        <>
                                          {/* Desktop: Edit Button */}
                                          <button
                                            onClick={() => onEditMenuItem(category.id, item)}
                                            className="hidden md:flex p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                                            title={t('tooltips.editItem')}
                                          >
                                            <Edit2 className="w-4 h-4" />
                                          </button>

                                          {/* Desktop: Item Settings Button */}
                                          <button
                                            onClick={() => onOpenItemSettings(category.id, item)}
                                            className="hidden md:flex p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                                            title={t('labels.itemSettings')}
                                          >
                                            <Settings className="w-4 h-4" />
                                          </button>

                                          {/* Desktop: Add Choice Button */}
                                          <button
                                            onClick={() => onAddChoice(category.id, item.id)}
                                            className="hidden md:flex p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                                            title={t('buttons.addChoice')}
                                          >
                                            <ListPlus className="w-4 h-4" />
                                          </button>
                                        </>
                                      )}

                                      {/* Mobile Dropdown + Desktop Show/Hide & Delete */}
                                      {(canEditItem || canDeleteItem) && (
                                        <div className="relative">
                                          <button
                                            onClick={() => setOpenDropdownId(openDropdownId === item.id ? null : item.id)}
                                            className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                                          >
                                            <MoreVertical className="w-4 h-4" />
                                          </button>

                                          {openDropdownId === item.id && (
                                            <>
                                              <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setOpenDropdownId(null)}
                                              />
                                              <div className="absolute right-0 top-full mt-1 w-48 bg-card border border-border rounded-lg shadow-xl z-20 py-1 overflow-hidden">
                                                {/* Mobile-only actions */}
                                                <div className="md:hidden border-b border-border">
                                                  <button
                                                    onClick={() => {
                                                      onEditMenuItem(category.id, item);
                                                      setOpenDropdownId(null);
                                                    }}
                                                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left"
                                                  >
                                                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>{t('tooltips.editItem')}</span>
                                                  </button>
                                                  <button
                                                    onClick={() => {
                                                      onOpenItemSettings(category.id, item);
                                                      setOpenDropdownId(null);
                                                    }}
                                                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left"
                                                  >
                                                    <Settings className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>{t('labels.itemSettings')}</span>
                                                  </button>
                                                  <button
                                                    onClick={() => {
                                                      onAddChoice(category.id, item.id);
                                                      setOpenDropdownId(null);
                                                    }}
                                                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left"
                                                  >
                                                    <ListPlus className="w-4 h-4 text-muted-foreground" />
                                                    <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>{t('buttons.addChoice')}</span>
                                                  </button>
                                                </div>

                                                {/* Show/Hide (all screens) */}
                                                {canEditItem && (
                                                  <button
                                                    onClick={() => {
                                                      onToggleMenuItemActive(category.id, item.id);
                                                      setOpenDropdownId(null);
                                                    }}
                                                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left"
                                                  >
                                                    {item.isActive ? (
                                                      <>
                                                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                                                        <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>{t('buttons.hide')}</span>
                                                      </>
                                                    ) : (
                                                      <>
                                                        <Eye className="w-4 h-4 text-muted-foreground" />
                                                        <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>{t('buttons.show')}</span>
                                                      </>
                                                    )}
                                                  </button>
                                                )}

                                                {/* Delete (all screens) */}
                                                {canDeleteItem && (
                                                  <button
                                                    onClick={() => {
                                                      onDeleteMenuItem(category.id, item.id);
                                                      setOpenDropdownId(null);
                                                    }}
                                                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left"
                                                  >
                                                    <Trash2 className="w-4 h-4 text-destructive" />
                                                    <span className="text-destructive" style={{ fontSize: 'var(--text-base)' }}>{t('buttons.remove')}</span>
                                                  </button>
                                                )}
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </SortableItem>
                            ))
                          ) : (
                            <div className="pl-20 pr-6 py-8 text-center border-b border-border/50">
                              <p className="text-muted-foreground italic mb-3" style={{ fontSize: 'var(--text-base)' }}>
                                {t('descriptions.noItemsInCategory')}
                              </p>
                              {canCreateItem && (
                                <button
                                  onClick={() => onAddMenuItem(category.id)}
                                  className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                                >
                                  <Plus className="w-4 h-4" />
                                  <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                                    {t('buttons.addItem')}
                                  </span>
                                </button>
                              )}
                            </div>
                          )}
                        </SortableContext>
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
  );
}
