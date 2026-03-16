'use client';

import { GripVertical, ChevronDown, ChevronRight, Edit2, Plus, Trash2, MoreVertical, Eye, EyeOff, Copy } from 'lucide-react';
import { Button } from '@/components/user/Button';
import { AddonGroup } from '../../lib/types';
import { AddonItemRow } from './AddonItemRow';

interface AddonGroupItemProps {
  group: AddonGroup;
  canManageAddons: boolean;
  onToggleExpanded: () => void;
  onToggleActive: () => void;
  onEdit: () => void;
  onAddItem: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
  // Item actions
  onEditItem: (itemId: string) => void;
  onToggleItemActive: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
  translations: {
    choice: string;
    addon: string;
    item: string;
    items: string;
    select: string;
    noItems: string;
    addFirstItem: string;
  };
}

export function AddonGroupItem({
  group,
  canManageAddons,
  onToggleExpanded,
  onToggleActive,
  onEdit,
  onAddItem,
  onDelete,
  onDuplicate,
  openDropdownId,
  setOpenDropdownId,
  onEditItem,
  onToggleItemActive,
  onDeleteItem,
  translations,
}: AddonGroupItemProps) {
  return (
    <div>
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
          onClick={onToggleExpanded}
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
            <span className={`px-2 py-0.5 rounded-full bg-primary/10 text-primary`} style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>
              {group.isRequired ? translations.choice : translations.addon}
            </span>
            {group.items.length > 0 && (
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full" style={{ fontSize: 'var(--text-small)' }}>
                {group.items.length} {group.items.length === 1 ? translations.item : translations.items}
              </span>
            )}
          </div>
          <p className="text-muted-foreground line-clamp-1" style={{ fontSize: 'var(--text-small)' }}>
            {translations.select} {group.minSelect}-{group.maxSelect}
            {group.subtitle && ` • ${group.subtitle}`}
          </p>
        </div>

        {/* Actions - Desktop buttons + Mobile dropdown */}
        {canManageAddons && (
          <>
            {/* Desktop Actions */}
            <button
              onClick={onEdit}
              className="hidden md:flex p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              title="Edit Group"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onAddItem}
              className="hidden md:flex p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              title="Add Item"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="hidden md:flex p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-destructive"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Mobile Dropdown & Desktop Duplicate/Show/Hide */}
        {canManageAddons && (
          <div className="relative">
            <button
              onClick={() => setOpenDropdownId(openDropdownId === group.id ? null : group.id)}
              className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground relative z-30"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {openDropdownId === group.id && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setOpenDropdownId(null)} />
                <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-xl overflow-hidden z-50">
                  {/* Mobile Mobile Only Actions */}
                  <button
                    onClick={() => { onEdit(); setOpenDropdownId(null); }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left border-b border-border md:hidden"
                  >
                    <Edit2 className="w-4 h-4 text-muted-foreground" /><span style={{ fontSize: 'var(--text-base)' }}>Edit Group</span>
                  </button>
                  <button
                    onClick={() => { onAddItem(); setOpenDropdownId(null); }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left border-b border-border md:hidden"
                  >
                    <Plus className="w-4 h-4 text-muted-foreground" /><span style={{ fontSize: 'var(--text-base)' }}>Add Item</span>
                  </button>

                  {/* All Screens Actions */}
                  <button
                    onClick={() => { onToggleActive(); setOpenDropdownId(null); }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left border-b border-border"
                  >
                    {group.isActive === false ? <Eye className="w-4 h-4 text-muted-foreground" /> : <EyeOff className="w-4 h-4 text-muted-foreground" />}
                    <span style={{ fontSize: 'var(--text-base)' }}>{group.isActive === false ? 'Show' : 'Hide'}</span>
                  </button>
                  <button
                    onClick={() => { onDuplicate(); setOpenDropdownId(null); }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left border-b border-border"
                  >
                    <Copy className="w-4 h-4 text-muted-foreground" /><span style={{ fontSize: 'var(--text-base)' }}>Duplicate</span>
                  </button>
                  <button
                    onClick={() => { onDelete(); setOpenDropdownId(null); }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left text-destructive"
                  >
                    <Trash2 className="w-4 h-4" /><span style={{ fontSize: 'var(--text-base)' }}>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Nested Items */}
      {group.isExpanded && group.items.length > 0 && (
        <div className="bg-muted/30">
          {group.items.map((item, index) => (
            <AddonItemRow
              key={item.id}
              item={item}
              canManageAddons={canManageAddons}
              onEdit={() => onEditItem(item.id)}
              onToggleActive={() => onToggleItemActive(item.id)}
              onDelete={() => onDeleteItem(item.id)}
              isLast={index === group.items.length - 1}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {group.isExpanded && group.items.length === 0 && (
        <div className="bg-muted/30 pl-20 pr-6 py-8 flex flex-col items-center">
          <p className="text-muted-foreground mb-3" style={{ fontSize: 'var(--text-base)' }}>{translations.noItems}</p>
          {canManageAddons && (
            <Button variant="primary" icon={Plus} onClick={onAddItem}>{translations.addFirstItem}</Button>
          )}
        </div>
      )}
    </div>
  );
}
