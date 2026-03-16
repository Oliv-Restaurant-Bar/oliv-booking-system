'use client';

import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/user/Button';
import { AddonGroupItem } from './AddonGroupItem';
import { AddonGroup } from '../../lib/types';

interface AddonsTabContentProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addonGroups: AddonGroup[];
  canManageAddons: boolean;
  onAddGroup: () => void;
  onToggleGroupExpanded: (id: string) => void;
  onToggleGroupActive: (id: string) => void;
  onEditGroup: (group: AddonGroup) => void;
  onDeleteGroup: (id: string) => void;
  onDuplicateGroup: (group: AddonGroup) => void;
  onAddItem: (groupId: string) => void;
  // Item actions
  onEditItem: (groupId: string, itemId: string) => void;
  onToggleItemActive: (groupId: string, itemId: string) => void;
  onDeleteItem: (groupId: string, itemId: string) => void;
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
  translations: {
    searchPlaceholder: string;
    addGroup: string;
    choice: string;
    addon: string;
    item: string;
    items: string;
    select: string;
    noItems: string;
    addFirstItem: string;
  };
}

export function AddonsTabContent({
  searchQuery,
  setSearchQuery,
  addonGroups,
  canManageAddons,
  onAddGroup,
  onToggleGroupExpanded,
  onToggleGroupActive,
  onEditGroup,
  onDeleteGroup,
  onDuplicateGroup,
  onAddItem,
  onEditItem,
  onToggleItemActive,
  onDeleteItem,
  openDropdownId,
  setOpenDropdownId,
  translations,
}: AddonsTabContentProps) {
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
          {canManageAddons && (
            <Button
              variant="primary"
              icon={Plus}
              onClick={onAddGroup}
            >
              {translations.addGroup}
            </Button>
          )}
        </div>
      </div>

      {/* Choice Groups List */}
      <div className="divide-y divide-border">
        {addonGroups.map((group) => (
          <AddonGroupItem
            key={group.id}
            group={group}
            canManageAddons={canManageAddons}
            onToggleExpanded={() => onToggleGroupExpanded(group.id)}
            onToggleActive={() => onToggleGroupActive(group.id)}
            onEdit={() => onEditGroup(group)}
            onAddItem={() => onAddItem(group.id)}
            onDelete={() => onDeleteGroup(group.id)}
            onDuplicate={() => onDuplicateGroup(group)}
            openDropdownId={openDropdownId}
            setOpenDropdownId={setOpenDropdownId}
            onEditItem={(itemId) => onEditItem(group.id, itemId)}
            onToggleItemActive={(itemId) => onToggleItemActive(group.id, itemId)}
            onDeleteItem={(itemId) => onDeleteItem(group.id, itemId)}
            translations={{
              choice: translations.choice,
              addon: translations.addon,
              item: translations.item,
              items: translations.items,
              select: translations.select,
              noItems: translations.noItems,
              addFirstItem: translations.addFirstItem,
            }}
          />
        ))}
        {addonGroups.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            No addon groups found.
          </div>
        )}
      </div>
    </div>
  );
}
