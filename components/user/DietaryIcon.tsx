'use client';

import React from 'react';
import { Wheat } from 'lucide-react';

interface DietaryIconProps {
  type: 'vegetarian' | 'non-vegetarian' | 'vegan' | 'none' | 'veg' | 'non-veg';
  size?: 'xs' | 'sm' | 'md';
}

export function DietaryIcon({ type, size = 'md' }: DietaryIconProps) {
  // Normalize types from various potential sources
  let normalizedType: string = type;
  if (type === 'veg' || type === 'vegetarian') normalizedType = 'vegetarian';
  if (type === 'non-veg' || type === 'non-vegetarian') normalizedType = 'non-vegetarian';
  if (type === 'vegan') normalizedType = 'vegan';
  if (type === 'none') normalizedType = 'none';

  // Don't show icon if type is none or normalization failed to one of the known types
  if (normalizedType === 'none') {
    return null;
  }

  const sizeClass = size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const dotClass = size === 'xs' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  if (normalizedType === 'vegetarian') {
    return (
      <div className="flex items-center gap-1">
        <div className={`${sizeClass} rounded-sm border-[1.5px] border-green-600 flex items-center justify-center flex-shrink-0`}>
          <div className={`${dotClass} rounded-full bg-green-600`}></div>
        </div>
      </div>
    );
  }

  if (normalizedType === 'non-vegetarian') {
    return (
      <div className="flex items-center gap-1">
        <div className={`${sizeClass} rounded-sm border-[1.5px] border-red-600 flex items-center justify-center flex-shrink-0`}>
          <div className={`${dotClass} rounded-full bg-red-600`}></div>
        </div>
      </div>
    );
  }

  // vegan
  return (
    <div className="flex items-center gap-1">
      <div className={`${sizeClass} rounded-sm border-[1.5px] border-emerald-600 flex items-center justify-center flex-shrink-0`}>
        <div className={`${dotClass} rounded-full bg-emerald-600`}></div>
      </div>
    </div>
  );
}
