'use client';

import React from 'react';
import { Settings, X, Check } from 'lucide-react';
import { DietaryIcon } from '@/components/user/DietaryIcon';

interface ItemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  itemSettings: {
    dietaryType: 'none' | 'veg' | 'non-veg' | 'vegan';
    dietaryTags: string[];
    ingredients: string;
    allergens: string[];
    additives: string[];
    nutritionalInfo: {
      servingSize: string;
      calories: string;
      protein: string;
      carbs: string;
      fat: string;
      fiber: string;
      sugar: string;
      sodium: string;
    };
  };
  setItemSettings: React.Dispatch<React.SetStateAction<any>>;
  itemName?: string;
}

const dietaryTagOptions = [
  'Gluten Free',
  'Dairy Free',
  'Nut Free',
  'Soy Free',
  'Sugar Free',
  'Low Carb',
  'High Protein',
  'Organic',
  'Local',
  'Seasonal'
];

const allergenOptions = [
  'Peanuts',
  'Tree Nuts',
  'Milk',
  'Eggs',
  'Fish',
  'Shellfish',
  'Soy',
  'Wheat',
  'Sesame',
  'Mustard'
];

const additiveOptions = [
  'Preservatives',
  'Artificial Colors',
  'Artificial Flavors',
  'MSG',
  'Nitrates',
  'Sulfites',
  'BHA/BHT'
];

export function ItemSettingsModal({
  isOpen,
  onClose,
  onSave,
  itemSettings,
  setItemSettings,
  itemName,
}: ItemSettingsModalProps) {
  if (!isOpen) return null;

  const handleToggleTag = (tag: string, field: 'dietaryTags' | 'allergens' | 'additives') => {
    const currentArray = itemSettings[field];
    if (currentArray.includes(tag)) {
      setItemSettings({
        ...itemSettings,
        [field]: currentArray.filter(t => t !== tag),
      });
    } else {
      setItemSettings({
        ...itemSettings,
        [field]: [...currentArray, tag],
      });
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-foreground flex-1" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
              {itemName ? `${itemName} - Settings` : 'Item Settings'}
            </h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
              style={{ fontSize: 'var(--text-base)' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* Dietary Type */}
              <div>
                <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                  Dietary Type <span className="text-destructive">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setItemSettings({ ...itemSettings, dietaryType: 'none' })}
                    className={`relative flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left cursor-pointer ${itemSettings.dietaryType === 'none'
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-background hover:border-border hover:bg-accent'
                      }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${itemSettings.dietaryType === 'none'
                        ? 'border-primary'
                        : 'border-border'
                      }`}>
                      {itemSettings.dietaryType === 'none' && (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>No Type</span>
                      </div>
                      <div className="text-muted-foreground break-words" style={{ fontSize: 'var(--text-small)', hyphens: 'auto' }}>
                        Non-food items
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setItemSettings({ ...itemSettings, dietaryType: 'veg' })}
                    className={`relative flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left cursor-pointer ${itemSettings.dietaryType === 'veg'
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-background hover:border-border hover:bg-accent'
                      }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${itemSettings.dietaryType === 'veg'
                        ? 'border-primary'
                        : 'border-border'
                      }`}>
                      {itemSettings.dietaryType === 'veg' && (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>Vegetarian</span>
                        <DietaryIcon type="veg" size="sm" />
                      </div>
                      <div className="text-muted-foreground break-words" style={{ fontSize: 'var(--text-small)', hyphens: 'auto' }}>
                        No meat or fish
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setItemSettings({ ...itemSettings, dietaryType: 'non-veg' })}
                    className={`relative flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left cursor-pointer ${itemSettings.dietaryType === 'non-veg'
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-background hover:border-border hover:bg-accent'
                      }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${itemSettings.dietaryType === 'non-veg'
                        ? 'border-primary'
                        : 'border-border'
                      }`}>
                      {itemSettings.dietaryType === 'non-veg' && (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>Non-Vegetarian</span>
                        <DietaryIcon type="non-veg" size="sm" />
                      </div>
                      <div className="text-muted-foreground break-words" style={{ fontSize: 'var(--text-small)', hyphens: 'auto' }}>
                        Contains meat or fish
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setItemSettings({ ...itemSettings, dietaryType: 'vegan' })}
                    className={`relative flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left ${itemSettings.dietaryType === 'vegan'
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-background hover:border-border hover:bg-accent'
                      }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${itemSettings.dietaryType === 'vegan'
                        ? 'border-primary'
                        : 'border-border'
                      }`}>
                      {itemSettings.dietaryType === 'vegan' && (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>Vegan</span>
                        <DietaryIcon type="vegan" size="sm" />
                      </div>
                      <div className="text-muted-foreground break-words" style={{ fontSize: 'var(--text-small)', hyphens: 'auto' }}>
                        No animal products
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Dietary Tags */}
              <div>
                <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                  Dietary Tags
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {dietaryTagOptions.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleToggleTag(tag, 'dietaryTags')}
                      className={`relative flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${itemSettings.dietaryTags.includes(tag)
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-background hover:border-border hover:bg-accent'
                        }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${itemSettings.dietaryTags.includes(tag)
                          ? 'border-primary bg-primary'
                          : 'border-border bg-background'
                        }`}>
                        {itemSettings.dietaryTags.includes(tag) && (
                          <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                          {tag}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                  Ingredients
                </label>
                <textarea
                  value={itemSettings.ingredients}
                  onChange={(e) => setItemSettings({ ...itemSettings, ingredients: e.target.value })}
                  placeholder="List all ingredients..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  style={{ fontSize: 'var(--text-base)' }}
                />
              </div>

              {/* Allergens */}
              <div>
                <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                  Allergens
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {allergenOptions.map((allergen) => (
                    <button
                      key={allergen}
                      onClick={() => handleToggleTag(allergen, 'allergens')}
                      className={`relative flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${itemSettings.allergens.includes(allergen)
                          ? 'border-destructive bg-destructive/5'
                          : 'border-border bg-background hover:border-border hover:bg-accent'
                        }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${itemSettings.allergens.includes(allergen)
                          ? 'border-destructive bg-destructive'
                          : 'border-border bg-background'
                        }`}>
                        {itemSettings.allergens.includes(allergen) && (
                          <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={itemSettings.allergens.includes(allergen) ? 'text-destructive' : 'text-foreground'} style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                          {allergen}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Additives */}
              <div>
                <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                  Additives
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {additiveOptions.map((additive) => (
                    <button
                      key={additive}
                      onClick={() => handleToggleTag(additive, 'additives')}
                      className={`relative flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${itemSettings.additives.includes(additive)
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-background hover:border-border hover:bg-accent'
                        }`}
                    >
                      <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${itemSettings.additives.includes(additive)
                          ? 'border-primary bg-primary'
                          : 'border-border bg-background'
                        }`}>
                        {itemSettings.additives.includes(additive) && (
                          <svg className="w-3 h-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                          {additive}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nutritional Information */}
              <div>
                <h4 className="text-foreground mb-3" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                  Nutritional Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 'var(--text-small)' }}>
                      Serving Size
                    </label>
                    <input
                      type="text"
                      value={itemSettings.nutritionalInfo.servingSize}
                      onChange={(e) => setItemSettings({
                        ...itemSettings,
                        nutritionalInfo: { ...itemSettings.nutritionalInfo, servingSize: e.target.value }
                      })}
                      placeholder="e.g., 100g"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      style={{ fontSize: 'var(--text-base)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 'var(--text-small)' }}>
                      Calories
                    </label>
                    <input
                      type="text"
                      value={itemSettings.nutritionalInfo.calories}
                      onChange={(e) => setItemSettings({
                        ...itemSettings,
                        nutritionalInfo: { ...itemSettings.nutritionalInfo, calories: e.target.value }
                      })}
                      placeholder="e.g., 250 kcal"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      style={{ fontSize: 'var(--text-base)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 'var(--text-small)' }}>
                      Protein
                    </label>
                    <input
                      type="text"
                      value={itemSettings.nutritionalInfo.protein}
                      onChange={(e) => setItemSettings({
                        ...itemSettings,
                        nutritionalInfo: { ...itemSettings.nutritionalInfo, protein: e.target.value }
                      })}
                      placeholder="e.g., 15g"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      style={{ fontSize: 'var(--text-base)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 'var(--text-small)' }}>
                      Carbohydrates
                    </label>
                    <input
                      type="text"
                      value={itemSettings.nutritionalInfo.carbs}
                      onChange={(e) => setItemSettings({
                        ...itemSettings,
                        nutritionalInfo: { ...itemSettings.nutritionalInfo, carbs: e.target.value }
                      })}
                      placeholder="e.g., 30g"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      style={{ fontSize: 'var(--text-base)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 'var(--text-small)' }}>
                      Fat
                    </label>
                    <input
                      type="text"
                      value={itemSettings.nutritionalInfo.fat}
                      onChange={(e) => setItemSettings({
                        ...itemSettings,
                        nutritionalInfo: { ...itemSettings.nutritionalInfo, fat: e.target.value }
                      })}
                      placeholder="e.g., 10g"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      style={{ fontSize: 'var(--text-base)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 'var(--text-small)' }}>
                      Fiber
                    </label>
                    <input
                      type="text"
                      value={itemSettings.nutritionalInfo.fiber}
                      onChange={(e) => setItemSettings({
                        ...itemSettings,
                        nutritionalInfo: { ...itemSettings.nutritionalInfo, fiber: e.target.value }
                      })}
                      placeholder="e.g., 5g"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      style={{ fontSize: 'var(--text-base)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 'var(--text-small)' }}>
                      Sugar
                    </label>
                    <input
                      type="text"
                      value={itemSettings.nutritionalInfo.sugar}
                      onChange={(e) => setItemSettings({
                        ...itemSettings,
                        nutritionalInfo: { ...itemSettings.nutritionalInfo, sugar: e.target.value }
                      })}
                      placeholder="e.g., 8g"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      style={{ fontSize: 'var(--text-base)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 'var(--text-small)' }}>
                      Sodium
                    </label>
                    <input
                      type="text"
                      value={itemSettings.nutritionalInfo.sodium}
                      onChange={(e) => setItemSettings({
                        ...itemSettings,
                        nutritionalInfo: { ...itemSettings.nutritionalInfo, sodium: e.target.value }
                      })}
                      placeholder="e.g., 500mg"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      style={{ fontSize: 'var(--text-base)' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border px-6 py-3 flex items-center justify-end gap-3 flex-shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-background border border-border text-foreground rounded-lg hover:bg-accent transition-colors flex items-center gap-2"
              style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              onClick={onSave}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
              style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
            >
              <Check className="w-4 h-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
}