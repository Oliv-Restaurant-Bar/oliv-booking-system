'use client';

import { GripVertical, Edit2, Eye, EyeOff, Trash2 } from 'lucide-react';
import { AddonItem } from '../../lib/types';

interface AddonItemRowProps {
  item: AddonItem;
  canManageAddons: boolean;
  onEdit: () => void;
  onToggleActive: () => void;
  onDelete: () => void;
  isLast: boolean;
}

export function AddonItemRow({
  item,
  canManageAddons,
  onEdit,
  onToggleActive,
  onDelete,
  isLast,
}: AddonItemRowProps) {
  return (
    <div
      className={`pl-20 pr-6 py-3 flex items-center gap-4 hover:bg-accent/30 transition-colors group ${!isLast ? 'border-b border-border/50' : ''}`}
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
            onClick={onEdit}
            className="p-1.5 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
        {canManageAddons && (
          <button
            onClick={onToggleActive}
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
            onClick={onDelete}
            className="p-1.5 hover:bg-accent rounded-lg transition-colors text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
