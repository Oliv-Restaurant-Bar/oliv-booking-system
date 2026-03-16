'use client';

import { GripVertical, EyeOff, Edit2, Settings, ListPlus, MoreVertical, Eye, Trash2 } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { DietaryIcon } from '@/components/user/DietaryIcon';
import { MenuItemData } from '../../lib/types';

interface MenuItemRowProps {
  item: MenuItemData;
  index: number;
  isLast: boolean;
  canEditItem: boolean;
  canDeleteItem: boolean;
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
  onEdit: () => void;
  onSettings: () => void;
  onAddChoice: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
}

export function MenuItemRow({
  item,
  isLast,
  canEditItem,
  canDeleteItem,
  openDropdownId,
  setOpenDropdownId,
  onEdit,
  onSettings,
  onAddChoice,
  onToggleActive,
  onDelete,
}: MenuItemRowProps) {
  return (
    <div
      className={`pl-20 pr-6 py-3 flex items-center gap-4 hover:bg-accent/30 transition-colors group ${!isLast ? 'border-b border-border/50' : ''}`}
    >
      {/* Drag Handle */}
      {canEditItem && (
        <button className="text-muted-foreground hover:text-foreground transition-colors cursor-grab active:cursor-grabbing flex-shrink-0">
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
          <span className="text-ellipsis overflow-hidden whitespace-nowrap">
            {item.name.length > 25 ? `${item.name.slice(0, 25)}...` : item.name}
          </span>
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

      {/* Actions - Desktop buttons + Mobile dropdown */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {canEditItem && (
          <>
            {/* Desktop: Edit Button */}
            <button
              onClick={onEdit}
              className="hidden md:flex p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
              title="Edit Item"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            {/* Desktop: Item Settings Button */}
            <button
              onClick={onSettings}
              className="hidden md:flex p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
              title="Item Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Desktop: Add Choice Button */}
            <button
              onClick={onAddChoice}
              className="hidden md:flex p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
              title="Add Choice"
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
                <div className="fixed inset-0 z-10" onClick={() => setOpenDropdownId(null)} />
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-30">
                  {canEditItem && (
                    <>
                      {/* Mobile: Edit Item */}
                      <button
                        onClick={() => {
                          onEdit();
                          setOpenDropdownId(null);
                        }}
                        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left border-b border-border md:hidden"
                      >
                        <Edit2 className="w-4 h-4 text-muted-foreground" />
                        <span style={{ fontSize: 'var(--text-base)' }}>Edit Item</span>
                      </button>

                      {/* Mobile: Item Settings */}
                      <button
                        onClick={() => {
                          onSettings();
                          setOpenDropdownId(null);
                        }}
                        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left border-b border-border md:hidden"
                      >
                        <Settings className="w-4 h-4 text-muted-foreground" />
                        <span style={{ fontSize: 'var(--text-base)' }}>Item Settings</span>
                      </button>

                      {/* Mobile: Add Choice */}
                      <button
                        onClick={() => {
                          onAddChoice();
                          setOpenDropdownId(null);
                        }}
                        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left border-b border-border md:hidden"
                      >
                        <ListPlus className="w-4 h-4 text-muted-foreground" />
                        <span style={{ fontSize: 'var(--text-base)' }}>Add Choice</span>
                      </button>

                      {/* Show/Hide Item (all screens) */}
                      <button
                        onClick={() => {
                          onToggleActive();
                          setOpenDropdownId(null);
                        }}
                        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left border-b border-border"
                      >
                        {item.isActive ? (
                          <>
                            <EyeOff className="w-4 h-4 text-muted-foreground" />
                            <span style={{ fontSize: 'var(--text-base)' }}>Hide Item</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 text-muted-foreground" />
                            <span style={{ fontSize: 'var(--text-base)' }}>Show Item</span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                  {canDeleteItem && (
                    <button
                      onClick={() => {
                        onDelete();
                        setOpenDropdownId(null);
                      }}
                      className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-accent transition-colors text-left text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span style={{ fontSize: 'var(--text-base)' }}>Delete Item</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
