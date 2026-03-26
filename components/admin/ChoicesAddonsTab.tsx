'use client';

import { Search, Plus, GripVertical, ChevronDown, ChevronRight, Edit2, Trash2, MoreVertical, Eye, EyeOff, Copy } from 'lucide-react';
import { Button } from '../user/Button';
import { DietaryIcon } from '../user/DietaryIcon';
import { useMenuConfigTranslation, useCommonTranslation } from '@/lib/i18n/client';
import { AddonGroup, AddonItem } from '@/lib/types';

interface ChoicesAddonsTabProps {
  addonGroups: AddonGroup[];
  canManageAddons: boolean;
  onAddGroup: () => void;
  onEditGroup: (group: AddonGroup) => void;
  onDeleteGroup: (id: string) => void;
  onToggleGroupExpanded: (id: string) => void;
  onToggleAddonGroupActive: (id: string) => void;
  onDuplicateAddonGroup: (id: string) => void;
  onAddAddonItem: (groupId: string) => void;
  onEditAddonItem: (groupId: string, item: AddonItem) => void;
  onDeleteAddonItem: (groupId: string, itemId: string) => void;
  onToggleAddonItemActive: (groupId: string, itemId: string) => void;
  openAddonGroupDropdownId: string | null;
  setOpenAddonGroupDropdownId: (id: string | null) => void;
}

export function ChoicesAddonsTab({
  addonGroups,
  canManageAddons,
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
  onToggleGroupExpanded,
  onToggleAddonGroupActive,
  onDuplicateAddonGroup,
  onAddAddonItem,
  onEditAddonItem,
  onDeleteAddonItem,
  onToggleAddonItemActive,
  openAddonGroupDropdownId,
  setOpenAddonGroupDropdownId,
}: ChoicesAddonsTabProps) {
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
              placeholder={t('placeholders.searchGroups')}
              className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              style={{ fontSize: 'var(--text-base)' }}
            />
          </div>
          {canManageAddons && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={onAddGroup}
            >
              {t('buttons.addGroup')}
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
                onClick={() => onToggleGroupExpanded(group.id)}
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
                  <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>
                    {group.isRequired ? ct('choice') : ct('addon')}
                  </span>
                  {group.items && group.items.length > 0 && (
                    <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full" style={{ fontSize: 'var(--text-small)' }}>
                      {group.items?.length || 0} {(group.items?.length || 0) === 1 ? ct('item') : ct('items')}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground line-clamp-1" style={{ fontSize: 'var(--text-small)' }}>
                  {ct('select')} {group.minSelect}-{group.maxSelect}
                  {group.subtitle && ` • ${group.subtitle}`}
                </p>
              </div>

              {/* Actions - Desktop buttons + Mobile dropdown */}
              {canManageAddons && (
                <>
                  {/* Desktop: Edit Group Button */}
                  <button
                    onClick={() => onEditGroup(group)}
                    className="hidden md:flex p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                    title={t('tooltips.editGroup')}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Desktop: Add Item Button */}
                  <button
                    onClick={() => onAddAddonItem(group.id)}
                    className="hidden md:flex p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                    title="Add Item"
                  >
                    <Plus className="w-4 h-4" />
                  </button>

                  {/* Desktop: Delete Button */}
                  <button
                    onClick={() => onDeleteGroup(group.id)}
                    className="hidden md:flex p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                    title={t('buttons.remove')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}

              {/* Mobile Dropdown + Desktop Duplicate & Show/Hide */}
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
                        {/* Mobile: Edit Group */}
                        <button
                          onClick={() => {
                            onEditGroup(group);
                            setOpenAddonGroupDropdownId(null);
                          }}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left border-b border-border md:hidden"
                        >
                          <Edit2 className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                            {t('tooltips.editGroup')}
                          </span>
                        </button>

                        {/* Mobile: Add Item */}
                        <button
                          onClick={() => {
                            onAddAddonItem(group.id);
                            setOpenAddonGroupDropdownId(null);
                          }}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left border-b border-border md:hidden"
                        >
                          <Plus className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                            Add Item
                          </span>
                        </button>

                        {/* Show/Hide (all screens) */}
                        <button
                          onClick={() => {
                            onToggleAddonGroupActive(group.id);
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
                            {group.isActive === false ? t('buttons.show') : t('buttons.hide')}
                          </span>
                        </button>

                        {/* Duplicate (all screens) */}
                        <button
                          onClick={() => {
                            onDuplicateAddonGroup(group.id);
                            setOpenAddonGroupDropdownId(null);
                          }}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left border-b border-border"
                        >
                          <Copy className="w-4 h-4 text-muted-foreground" />
                          <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
                            {t('buttons.duplicate')}
                          </span>
                        </button>

                        {/* Delete (all screens) */}
                        <button
                          onClick={() => {
                            onDeleteGroup(group.id);
                            setOpenAddonGroupDropdownId(null);
                          }}
                          className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span style={{ fontSize: 'var(--text-base)' }}>
                            {t('buttons.remove')}
                          </span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Addon Items - Nested under group */}
            {group.isExpanded && group.items && group.items.length > 0 && (
              <div className="bg-muted/30">
                {group.items.map((item, index) => (
                  <div
                    key={item.id}
                    className={`pl-20 pr-6 py-3 flex items-center gap-4 hover:bg-accent/30 transition-colors group ${group.items && index !== group.items.length - 1 ? 'border-b border-border/50' : ''}`}
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
                        {item.dietaryType && item.dietaryType !== 'none' && (
                          <DietaryIcon type={item.dietaryType} size="sm" />
                        )}
                        <h5 className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                          {item.name}
                        </h5>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                        {ct('currencySymbol')}{Number(item.price || 0).toFixed(2)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {canManageAddons && (
                        <button
                          onClick={() => onEditAddonItem(group.id, item)}
                          className="p-1.5 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {canManageAddons && (
                        <button
                          onClick={() => onToggleAddonItemActive(group.id, item.id)}
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
                          onClick={() => onDeleteAddonItem(group.id, item.id)}
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
            {group.isExpanded && (!group.items || group.items.length === 0) && (
              <div className="bg-muted/30 pl-20 pr-6 py-8 flex flex-col items-center">
                <p className="text-muted-foreground mb-3" style={{ fontSize: 'var(--text-base)' }}>
                  {t('descriptions.noItemsInGroup')}
                </p>
                {canManageAddons && (
                  <Button
                    variant="primary"
                    icon={Plus}
                    onClick={() => onAddAddonItem(group.id)}
                  >
                    {t('buttons.addItem')}
                  </Button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
