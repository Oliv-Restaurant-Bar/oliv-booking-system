import React from 'react';

interface DietaryIconProps {
  type: 'vegetarian' | 'non-vegetarian' | 'vegan' | 'none';
  size?: 'sm' | 'md';
}

export function DietaryIcon({ type, size = 'md' }: DietaryIconProps) {
  // Don't show icon for non-food items
  if (type === 'none') {
    return null;
  }

  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  if (type === 'vegetarian') {
    return (
      <div className={`${sizeClass} rounded-sm border-2 border-green-600 flex items-center justify-center flex-shrink-0`}>
        <div className="w-2 h-2 rounded-full bg-green-600"></div>
      </div>
    );
  }

  if (type === 'non-vegetarian') {
    return (
      <div className={`${sizeClass} rounded-sm border-2 border-red-600 flex items-center justify-center flex-shrink-0`}>
        <div className="w-2 h-2 rounded-full bg-red-600"></div>
      </div>
    );
  }

  // vegan
  return (
    <div className={`${sizeClass} rounded-sm border-2 border-emerald-600 flex items-center justify-center flex-shrink-0`}>
      <div className="w-2 h-2 rounded-full bg-emerald-600"></div>
    </div>
  );
}
