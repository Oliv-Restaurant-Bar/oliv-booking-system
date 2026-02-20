'use client';

import React from 'react';
import { Wheat } from 'lucide-react';

interface DietaryIconProps {
  type: 'vegetarian' | 'non-vegetarian' | 'vegan' | 'none';
  size?: 'sm' | 'md';
  isGlutenFree?: boolean;
}

export function DietaryIcon({ type, size = 'md', isGlutenFree = false }: DietaryIconProps) {
  // Don't show icon for non-food items
  if (type === 'none') {
    return null;
  }

  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const iconSize = size === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3';

  if (type === 'vegetarian') {
    return (
      <div className="flex items-center gap-1">
        <div className={`${sizeClass} rounded-sm border-2 border-green-600 flex items-center justify-center flex-shrink-0`}>
          <div className="w-2 h-2 rounded-full bg-green-600"></div>
        </div>
        {isGlutenFree && (
          <Wheat className={`${iconSize} text-amber-600 flex-shrink-0`} strokeWidth={2.5} />
        )}
      </div>
    );
  }

  if (type === 'non-vegetarian') {
    return (
      <div className="flex items-center gap-1">
        <div className={`${sizeClass} rounded-sm border-2 border-red-600 flex items-center justify-center flex-shrink-0`}>
          <div className="w-2 h-2 rounded-full bg-red-600"></div>
        </div>
        {isGlutenFree && (
          <Wheat className={`${iconSize} text-amber-600 flex-shrink-0`} strokeWidth={2.5} />
        )}
      </div>
    );
  }

  // vegan
  return (
    <div className="flex items-center gap-1">
      <div className={`${sizeClass} rounded-sm border-2 border-emerald-600 flex items-center justify-center flex-shrink-0`}>
        <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
      </div>
      {isGlutenFree && (
        <Wheat className={`${iconSize} text-amber-600 flex-shrink-0`} strokeWidth={2.5} />
      )}
    </div>
  );
}
