'use client';

import React from 'react';
import { Settings, X, Check } from 'lucide-react';
import { DietaryIcon } from '@/components/user/DietaryIcon';
import { useMenuConfigTranslation, useCommonTranslation } from '@/lib/i18n/client';

interface ItemSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  itemSettings: {
    dietaryType: 'none' | 'veg' | 'non-veg' | 'vegan';
    dietaryTags: string[];
    ingredients: string;
    internalCost?: number;
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
  isSaving?: boolean;
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
  isSaving = false,
}: ItemSettingsModalProps) {
  const t = useMenuConfigTranslation();
  const ct = useCommonTranslation();

  if (!isOpen) return null;

  // Helper functions to get translated labels
  const getDietaryTagLabel = (tag: string) => {
    const key = tag.toLowerCase().replace(/\s+/g, '').replace(/[^a-z]/g, '');
    const mappings: Record<string, string> = {
      'glutenfree': 'glutenFree',
      'dairyfree': 'dairyFree',
      'nutfree': 'nutFree',
      'soyfree': 'soyFree',
      'sugarfree': 'sugarFree',
      'lowcarb': 'lowCarb',
      'highprotein': 'highProtein',
    };
    const mappedKey = mappings[key] || key;
    return t(`dietary.tags.${mappedKey}`);
  };

  const getAllergenLabel = (allergen: string) => {
    const key = allergen.toLowerCase().replace(/\s+/g, '');
    const mappings: Record<string, string> = {
      'treenuts': 'treeNuts',
    };
    const mappedKey = mappings[key] || key;
    return t(`dietary.allergens.${mappedKey}`);
  };

  const getAdditiveLabel = (additive: string) => {
    const key = additive.toLowerCase().replace(/\s+/g, '').replace('/', '');
    const mappings: Record<string, string> = {
      'artificialcolors': 'artificialColors',
      'artificialflavors': 'artificialFlavors',
      'bhabht': 'bhaBht',
    };
    const mappedKey = mappings[key] || key;
    return t(`dietary.additives.${mappedKey}`);
  };

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
      <div className="fixed inset-0 bg-black/50 z-40" onClick={isSaving ? undefined : onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border flex-shrink-0">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Settings className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-foreground flex-1" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
              {itemName ? `${itemName} - ${t('labels.itemSettings')}` : t('labels.itemSettings')}
            </h3>
            <button
              onClick={onClose}
              disabled={isSaving}
              className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground cursor-pointer disabled:opacity-50"
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
                  {t('labels.dietaryType')} <span className="text-destructive">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => setItemSettings({ ...itemSettings, dietaryType: 'none' })}
                    className={`relative flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left cursor-pointer ${itemSettings.dietaryType === 'none'
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-background hover:border-border hover:bg-accent'
                      } disabled:opacity-50`}
                  >
                    <div className="flex-shrink-0">
                      <DietaryIcon type="none" size="md" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>{t('dietary.none')}</span>
                      </div>
                      <div className="text-muted-foreground break-words" style={{ fontSize: 'var(--text-small)', hyphens: 'auto' }}>
                        {t('dietary.noneDesc')}
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${itemSettings.dietaryType === 'none'
                        ? 'border-primary'
                        : 'border-border'
                      }`}>
                      {itemSettings.dietaryType === 'none' && (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => setItemSettings({ ...itemSettings, dietaryType: 'veg' })}
                    className={`relative flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left cursor-pointer ${itemSettings.dietaryType === 'veg'
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-background hover:border-border hover:bg-accent'
                      } disabled:opacity-50`}
                  >
                    <div className="flex-shrink-0">
                      <DietaryIcon type="veg" size="md" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>{t('dietary.veg')}</span>
                      </div>
                      <div className="text-muted-foreground break-words" style={{ fontSize: 'var(--text-small)', hyphens: 'auto' }}>
                        {t('dietary.vegDesc')}
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${itemSettings.dietaryType === 'veg'
                        ? 'border-primary'
                        : 'border-border'
                      }`}>
                      {itemSettings.dietaryType === 'veg' && (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </div>
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => setItemSettings({ ...itemSettings, dietaryType: 'non-veg' })}
                    className={`relative flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left cursor-pointer ${itemSettings.dietaryType === 'non-veg'
                        ? 'border-primary bg-primary/5'
                        : 'border-border bg-background hover:border-border hover:bg-accent'
                      } disabled:opacity-50`}
                  >
                    <div className="flex-shrink-0">
                      <DietaryIcon type="non-veg" size="md" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>{t('dietary.nonVeg')}</span>
                      </div>
                      <div className="text-muted-foreground break-words" style={{ fontSize: 'var(--text-small)', hyphens: 'auto' }}>
                        {t('dietary.nonVegDesc')}
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${itemSettings.dietaryType === 'non-veg'
                        ? 'border-primary'
                        : 'border-border'
                      }`}>
                      {itemSettings.dietaryType === 'non-veg' && (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </div>
                  </button>
                </div>
              </div>

              {/* Dietary Tags */}
              <div>
                <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                  {t('labels.dietaryTags')}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {dietaryTagOptions.map((tag) => (
                    <button
                      key={tag}
                      disabled={isSaving}
                      onClick={() => handleToggleTag(tag, 'dietaryTags')}
                      className={`relative flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${itemSettings.dietaryTags.includes(tag)
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-background hover:border-border hover:bg-accent'
                        } disabled:opacity-50`}
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
                      <div className="mt-0.5">
                        <DietaryIcon type={tag} size="sm" />
                      </div>
                      <div className="flex-1">
                        <div className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                          {getDietaryTagLabel(tag)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                  {t('labels.ingredients')}
                </label>
                <textarea
                  disabled={isSaving}
                  value={itemSettings.ingredients}
                  onChange={(e) => setItemSettings({ ...itemSettings, ingredients: e.target.value })}
                  placeholder={t('placeholders.ingredients')}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                  style={{ fontSize: 'var(--text-base)' }}
                />
              </div>

              {/* Allergens */}
              <div>
                <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                  {t('labels.allergens')}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {allergenOptions.map((allergen) => (
                    <button
                      key={allergen}
                      disabled={isSaving}
                      onClick={() => handleToggleTag(allergen, 'allergens')}
                      className={`relative flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${itemSettings.allergens.includes(allergen)
                          ? 'border-destructive bg-destructive/5'
                          : 'border-border bg-background hover:border-border hover:bg-accent'
                        } disabled:opacity-50`}
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
                      <div className="mt-0.5">
                        <DietaryIcon type={allergen} size="sm" />
                      </div>
                      <div className="flex-1">
                        <div className={itemSettings.allergens.includes(allergen) ? 'text-destructive' : 'text-foreground'} style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                          {getAllergenLabel(allergen)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Additives */}
              <div>
                <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                  {t('labels.additives')}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {additiveOptions.map((additive) => (
                    <button
                      key={additive}
                      disabled={isSaving}
                      onClick={() => handleToggleTag(additive, 'additives')}
                      className={`relative flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${itemSettings.additives.includes(additive)
                          ? 'border-primary bg-primary/5'
                          : 'border-border bg-background hover:border-border hover:bg-accent'
                        } disabled:opacity-50`}
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
                      <div className="mt-0.5">
                        <DietaryIcon type={additive} size="sm" />
                      </div>
                      <div className="flex-1">
                        <div className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                          {getAdditiveLabel(additive)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Nutritional Information */}
              <div>
                <h4 className="text-foreground mb-3" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {t('labels.nutritionalInfo')}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 'var(--text-small)' }}>
                      {t('nutrition.servingSize')}
                    </label>
                    <input
                      disabled={isSaving}
                      type="text"
                      value={itemSettings.nutritionalInfo.servingSize}
                      onChange={(e) => setItemSettings({
                        ...itemSettings,
                        nutritionalInfo: { ...itemSettings.nutritionalInfo, servingSize: e.target.value }
                      })}
                      placeholder={t('placeholders.nutrition.servingSize')}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                      style={{ fontSize: 'var(--text-base)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 'var(--text-small)' }}>
                      {t('nutrition.calories')}
                    </label>
                    <input
                      disabled={isSaving}
                      type="text"
                      value={itemSettings.nutritionalInfo.calories}
                      onChange={(e) => setItemSettings({
                        ...itemSettings,
                        nutritionalInfo: { ...itemSettings.nutritionalInfo, calories: e.target.value }
                      })}
                      placeholder={t('placeholders.nutrition.calories')}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                      style={{ fontSize: 'var(--text-base)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 'var(--text-small)' }}>
                      {t('nutrition.protein')}
                    </label>
                    <input
                      disabled={isSaving}
                      type="text"
                      value={itemSettings.nutritionalInfo.protein}
                      onChange={(e) => setItemSettings({
                        ...itemSettings,
                        nutritionalInfo: { ...itemSettings.nutritionalInfo, protein: e.target.value }
                      })}
                      placeholder={t('placeholders.nutrition.protein')}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                      style={{ fontSize: 'var(--text-base)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 'var(--text-small)' }}>
                      {t('nutrition.carbs')}
                    </label>
                    <input
                      disabled={isSaving}
                      type="text"
                      value={itemSettings.nutritionalInfo.carbs}
                      onChange={(e) => setItemSettings({
                        ...itemSettings,
                        nutritionalInfo: { ...itemSettings.nutritionalInfo, carbs: e.target.value }
                      })}
                      placeholder={t('placeholders.nutrition.carbs')}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                      style={{ fontSize: 'var(--text-base)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 'var(--text-small)' }}>
                      {t('nutrition.fat')}
                    </label>
                    <input
                      disabled={isSaving}
                      type="text"
                      value={itemSettings.nutritionalInfo.fat}
                      onChange={(e) => setItemSettings({
                        ...itemSettings,
                        nutritionalInfo: { ...itemSettings.nutritionalInfo, fat: e.target.value }
                      })}
                      placeholder={t('placeholders.nutrition.fat')}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                      style={{ fontSize: 'var(--text-base)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 'var(--text-small)' }}>
                      {t('nutrition.fiber')}
                    </label>
                    <input
                      disabled={isSaving}
                      type="text"
                      value={itemSettings.nutritionalInfo.fiber}
                      onChange={(e) => setItemSettings({
                        ...itemSettings,
                        nutritionalInfo: { ...itemSettings.nutritionalInfo, fiber: e.target.value }
                      })}
                      placeholder={t('placeholders.nutrition.fiber')}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                      style={{ fontSize: 'var(--text-base)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 'var(--text-small)' }}>
                      {t('nutrition.sugar')}
                    </label>
                    <input
                      disabled={isSaving}
                      type="text"
                      value={itemSettings.nutritionalInfo.sugar}
                      onChange={(e) => setItemSettings({
                        ...itemSettings,
                        nutritionalInfo: { ...itemSettings.nutritionalInfo, sugar: e.target.value }
                      })}
                      placeholder={t('placeholders.nutrition.sugar')}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                      style={{ fontSize: 'var(--text-base)' }}
                    />
                  </div>
                  <div>
                    <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 'var(--text-small)' }}>
                      {t('nutrition.sodium')}
                    </label>
                    <input
                      disabled={isSaving}
                      type="text"
                      value={itemSettings.nutritionalInfo.sodium}
                      onChange={(e) => setItemSettings({
                        ...itemSettings,
                        nutritionalInfo: { ...itemSettings.nutritionalInfo, sodium: e.target.value }
                      })}
                      placeholder={t('placeholders.nutrition.sodium')}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                      style={{ fontSize: 'var(--text-base)' }}
                    />
                  </div>
                </div>
              </div>

              {/* Internal Cost */}
              <div>
                <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                  {t('labels.internalCost')}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>{ct('currencySymbol')}</span>
                  <input
                    disabled={isSaving}
                    type="number"
                    step="0.01"
                    min="0"
                    value={itemSettings.internalCost || ''}
                    onChange={(e) => setItemSettings({ ...itemSettings, internalCost: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder={t('placeholders.internalCost')}
                    className="w-full pl-12 pr-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
                    style={{ fontSize: 'var(--text-base)' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-border px-6 py-3 flex items-center justify-end gap-3 flex-shrink-0">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 bg-background border border-border text-foreground rounded-lg hover:bg-accent transition-colors flex items-center gap-2 disabled:opacity-50"
              style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
            >
              <X className="w-4 h-4" />
              {ct('cancel')}
            </button>
            <button
              onClick={onSave}
              disabled={isSaving}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
              style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
            >
              {isSaving ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {t('buttons.saveChanges')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}