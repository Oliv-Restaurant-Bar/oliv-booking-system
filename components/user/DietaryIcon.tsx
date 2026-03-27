import { 
  Leaf, 
  Wheat, 
  Milk, 
  MilkOff, 
  Bean, 
  Droplets, 
  Zap, 
  MapPin, 
  Calendar,
  Waves,
  Beef,
  Egg,
  Fish,
  Shell,
  ChefHat,
  Palette,
  FlaskConical,
  Pipette,
  Sparkles,
  ShieldCheck,
  Wine,
  TestTube
} from 'lucide-react';

interface DietaryIconProps {
  type: string;
  size?: 'xs' | 'sm' | 'md';
}

export function DietaryIcon({ type, size = 'md' }: DietaryIconProps) {
  // Normalize types from various potential sources
  const normalizedType = type.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '');

  const sizeClass = size === 'xs' ? 'w-3 h-3' : size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  const dotClass = size === 'xs' ? 'w-1.5 h-1.5' : 'w-2 h-2';

  // Neutral type for "None"
  if (normalizedType === 'none') {
    return (
      <div className="flex items-center gap-1">
        <div className={`${sizeClass} rounded-sm border-[1.5px] border-slate-300 flex items-center justify-center flex-shrink-0`}>
          <div className={`${dotClass} rounded-full bg-slate-100`}></div>
        </div>
      </div>
    );
  }

  // Primary types with circular shapes (Standard food labels)
  if (normalizedType === 'vegetarian' || normalizedType === 'veg') {
    return (
      <div className="flex items-center gap-1">
        <div className={`${sizeClass} rounded-sm border-[1.5px] border-green-600 flex items-center justify-center flex-shrink-0`}>
          <div className={`${dotClass} rounded-full bg-green-600`}></div>
        </div>
      </div>
    );
  }

  if (normalizedType === 'nonvegetarian' || normalizedType === 'nonveg') {
    return (
      <div className="flex items-center gap-1">
        <div className={`${sizeClass} rounded-sm border-[1.5px] border-red-600 flex items-center justify-center flex-shrink-0`}>
          <div className={`${dotClass} rounded-full bg-red-600`}></div>
        </div>
      </div>
    );
  }

  // Icons for tags, allergens, and additives
  const iconMap: Record<string, any> = {
    // Main types
    'vegan': { icon: Leaf, color: 'text-emerald-600' },
    
    // Tags
    'glutenfree': { icon: Wheat, color: 'text-amber-600' },
    'dairyfree': { icon: MilkOff, color: 'text-blue-500' },
    'nutfree': { icon: Bean, color: 'text-amber-700' },
    'soyfree': { icon: Droplets, color: 'text-yellow-600' },
    'sugarfree': { icon: Zap, color: 'text-purple-500' },
    'lowcarb': { icon: Waves, color: 'text-cyan-500' },
    'highprotein': { icon: Beef, color: 'text-red-700' },
    'organic': { icon: Leaf, color: 'text-green-600' },
    'local': { icon: MapPin, color: 'text-rose-500' },
    'seasonal': { icon: Calendar, color: 'text-orange-500' },

    // Allergens
    'peanuts': { icon: Bean, color: 'text-amber-800' },
    'treenuts': { icon: Bean, color: 'text-amber-900' },
    'milk': { icon: Milk, color: 'text-blue-400' },
    'eggs': { icon: Egg, color: 'text-yellow-500' },
    'fish': { icon: Fish, color: 'text-blue-600' },
    'shellfish': { icon: Shell, color: 'text-slate-500' },
    'soy': { icon: Droplets, color: 'text-yellow-700' },
    'wheat': { icon: Wheat, color: 'text-amber-500' },
    'sesame': { icon: Droplets, color: 'text-orange-400' },
    'mustard': { icon: ChefHat, color: 'text-yellow-600' },

    // Additives
    'preservatives': { icon: ShieldCheck, color: 'text-slate-600' },
    'artificialcolors': { icon: Palette, color: 'text-pink-500' },
    'artificialflavors': { icon: Pipette, color: 'text-indigo-500' },
    'msg': { icon: Sparkles, color: 'text-yellow-500' },
    'nitrates': { icon: FlaskConical, color: 'text-red-400' },
    'sulfites': { icon: Wine, color: 'text-purple-600' },
    'bhabht': { icon: TestTube, color: 'text-teal-600' },
  };

  const IconConfig = iconMap[normalizedType];

  if (!IconConfig) {
    return null;
  }

  const Icon = IconConfig.icon;
  return (
    <div className="flex items-center gap-1">
      <Icon className={`${sizeClass} ${IconConfig.color} flex-shrink-0`} />
    </div>
  );
}
