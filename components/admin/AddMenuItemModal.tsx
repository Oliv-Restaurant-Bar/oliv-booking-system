'use client';

import { UtensilsCrossed, X, Plus, Check, Upload, Trash2 } from 'lucide-react';
import { Modal } from '../user/Modal';
import { Button } from '../user/Button';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { useMenuConfigTranslation, useCommonTranslation } from '@/lib/i18n/client';
import { Category, AddonGroup } from '@/lib/types';
import { dietaryTagOptions, allergenOptions, additiveOptions } from '@/lib/constants';

interface AddMenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingMenuItemId: string | null;
  activeCategoryId: string | null;
  setActiveCategoryId: (id: string | null) => void;
  categories: Category[];
  newMenuItem: {
    name: string;
    description: string;
    price: string;
    pricingType: 'per_person' | 'flat_fee' | 'billed_by_consumption';
    averageConsumption: string;
    image: File | null;
    imageUrl: string;
    isActive: boolean;
    isCombo: boolean;
    variants: any[];
    dietaryType: 'veg' | 'non-veg' | 'vegan' | 'none';
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
    assignedAddonGroups: string[];
  };
  setNewMenuItem: (item: any) => void;
  pricingMode: 'price' | 'variants';
  setPricingMode: (mode: 'price' | 'variants') => void;
  uploadingImage: boolean;
  handleImageUpload: (file: File) => Promise<string>;
  onSave: () => Promise<void>;
  displayMenuItemErrors: {
    name?: string;
    description?: string;
  };
  menuItemTouched: {
    name?: boolean;
    description?: boolean;
  };
  setMenuItemTouched: (touched: any) => void;
  showItemSettings: boolean;
  setShowItemSettings: (show: boolean) => void;
  showAddons: boolean;
  setShowAddons: (show: boolean) => void;
  addonGroups: AddonGroup[];
  addVariant: () => void;
  updateVariant: (index: number, field: string, value: any) => void;
  removeVariant: (index: number) => void;
  handleToggleTag: (tag: string, field: 'dietaryTags' | 'allergens' | 'additives') => void;
}

export function AddMenuItemModal({
  isOpen,
  onClose,
  editingMenuItemId,
  activeCategoryId,
  setActiveCategoryId,
  categories,
  newMenuItem,
  setNewMenuItem,
  pricingMode,
  setPricingMode,
  uploadingImage,
  handleImageUpload,
  onSave,
  displayMenuItemErrors,
  menuItemTouched,
  setMenuItemTouched,
  showItemSettings,
  setShowItemSettings,
  showAddons,
  setShowAddons,
  addonGroups,
  addVariant,
  updateVariant,
  removeVariant,
  handleToggleTag,
}: AddMenuItemModalProps) {
  const t = useMenuConfigTranslation();
  const ct = useCommonTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={UtensilsCrossed}
      title={editingMenuItemId ? t('titles.editMenuItem') : t('titles.addMenuItem')}
      maxWidth="2xl"
      footer={
        <>
          <Button
            variant="secondary"
            icon={X}
            onClick={onClose}
          >
            {ct('cancel')}
          </Button>
          <Button
            variant="primary"
            icon={editingMenuItemId ? Check : Plus}
            onClick={onSave}
            disabled={
              !activeCategoryId ||
              !newMenuItem.name?.trim() ||
              (pricingMode === 'price' && !newMenuItem.price) ||
              (pricingMode === 'variants' && (!newMenuItem.variants || newMenuItem.variants.length === 0)) ||
              newMenuItem.name.length > 100 ||
              (newMenuItem.description?.length || 0) > 500 ||
              (newMenuItem.ingredients?.length || 0) > 1000 ||
              (newMenuItem.price !== '' && parseFloat(newMenuItem.price) < 0) ||
              (newMenuItem.variants || []).some(v => !v.name?.trim() || v.name.length > 100 || v.price < 0) ||
              (newMenuItem.nutritionalInfo?.servingSize?.length || 0) > 50 ||
              (newMenuItem.nutritionalInfo?.calories?.length || 0) > 50 ||
              (newMenuItem.nutritionalInfo?.protein?.length || 0) > 50 ||
              (newMenuItem.nutritionalInfo?.carbs?.length || 0) > 50 ||
              (newMenuItem.nutritionalInfo?.fat?.length || 0) > 50 ||
              (newMenuItem.nutritionalInfo?.fiber?.length || 0) > 50 ||
              (newMenuItem.nutritionalInfo?.sugar?.length || 0) > 50 ||
              (newMenuItem.nutritionalInfo?.sodium?.length || 0) > 50
            }
          >
            {editingMenuItemId ? t('buttons.saveChanges') : t('buttons.addItem')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {!activeCategoryId && (
          <div>
            <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
              {t('labels.selectCategory')} *
            </label>
            <select
              value={activeCategoryId || ''}
              onChange={(e) => setActiveCategoryId(e.target.value)}
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              style={{ fontSize: 'var(--text-base)' }}
            >
              <option value="">{t('labels.chooseCategory')}</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
            {t('labels.itemName')} *
          </label>
          <input
            type="text"
            maxLength={100}
            value={newMenuItem.name}
            onChange={(e) => {
              setNewMenuItem({ ...newMenuItem, name: e.target.value });
            }}
            onBlur={() => {
              if (!menuItemTouched.name) setMenuItemTouched({ ...menuItemTouched, name: true });
            }}
            placeholder={t('placeholders.itemName')}
            className={`w-full px-4 py-2 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${displayMenuItemErrors.name ? 'border-destructive' : 'border-border'}`}
            style={{ fontSize: 'var(--text-base)' }}
          />
          <div className="flex items-center justify-between mt-1">
            <p className="text-destructive text-xs">{displayMenuItemErrors.name}</p>
            <p className="text-muted-foreground text-xs text-right">{newMenuItem.name.length}/100</p>
          </div>
        </div>

        <div>
          <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
            {t('labels.description')}
          </label>
          <textarea
            value={newMenuItem.description}
            maxLength={500}
            onChange={(e) => {
              setNewMenuItem({ ...newMenuItem, description: e.target.value });
            }}
            onBlur={() => {
              if (!menuItemTouched.description) setMenuItemTouched({ ...menuItemTouched, description: true });
            }}
            placeholder={t('placeholders.itemDesc')}
            rows={3}
            className={`w-full px-4 py-2 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none ${displayMenuItemErrors.description ? 'border-destructive' : 'border-border'}`}
            style={{ fontSize: 'var(--text-base)' }}
          />
          <div className="flex items-center justify-between mt-1">
            <p className="text-destructive text-xs">{displayMenuItemErrors.description}</p>
            <p className="text-muted-foreground text-xs text-right">{newMenuItem.description.length}/500</p>
          </div>
        </div>

        <div>
          <label className="block text-foreground mb-3" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
            {t('labels.pricingType')}
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: 'per_person', label: t('pricing.perPerson'), desc: t('pricing.perPersonDesc') },
              { id: 'flat_fee', label: t('pricing.flatRate'), desc: t('pricing.flatRateDesc') },
              { id: 'billed_by_consumption', label: t('pricing.consumption'), desc: t('pricing.consumptionDesc') },
            ].map((type) => (
              <div
                key={type.id}
                onClick={() => setNewMenuItem({ ...newMenuItem, pricingType: type.id as any })}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${newMenuItem.pricingType === type.id ? 'border-[#9DAE91] bg-[#9DAE91]/5 shadow-sm' : 'border-border bg-card hover:border-primary/30'}`}
                style={{ borderRadius: 'var(--radius-card)' }}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${newMenuItem.pricingType === type.id ? 'border-[#9DAE91] bg-white' : 'border-border bg-white'}`}>
                    {newMenuItem.pricingType === type.id && <div className="w-3 h-3 rounded-full bg-[#9DAE91]" />}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground leading-tight" style={{ fontSize: 'var(--text-base)' }}>{type.label}</p>
                    <p className="text-muted-foreground mt-1 leading-snug" style={{ fontSize: '11px' }}>{type.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {newMenuItem.pricingType === 'billed_by_consumption' && pricingMode === 'price' && (
          <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
              {t('labels.averageConsumption')} *
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="100"
                step="1"
                value={newMenuItem.averageConsumption}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, averageConsumption: e.target.value })}
                placeholder={t('placeholders.averageConsumptionShort')}
                className="flex-1 px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                style={{ fontSize: 'var(--text-base)' }}
              />
              <span className="text-muted-foreground text-sm">{t('labels.peoplePerUnit')}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t('descriptions.averageConsumption')}
            </p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <label className="block text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
            {t('labels.pricingMode')}
          </label>
          <div className="flex items-center justify-between p-3 rounded-lg gap-2" >
            <span
              className={`text-foreground cursor-pointer transition-colors ${pricingMode === 'price' ? 'font-semibold' : 'text-muted-foreground'}`}
              style={{ fontSize: 'var(--text-base)', fontWeight: pricingMode === 'price' ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)' }}
              onClick={() => {
                setPricingMode('price');
                setNewMenuItem({ ...newMenuItem, variants: [] });
              }}
            >
              {t('labels.pricingModePrice')}
            </span>

            <button
              type="button"
              onClick={() => {
                if (pricingMode === 'price') {
                  setPricingMode('variants');
                  setNewMenuItem({ ...newMenuItem, price: '' });
                } else {
                  setPricingMode('price');
                  setNewMenuItem({ ...newMenuItem, variants: [] });
                }
              }}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${pricingMode === 'variants' ? 'bg-primary' : 'bg-muted'}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pricingMode === 'variants' ? 'translate-x-6' : 'translate-x-1'}`}
              />
            </button>

            <span
              className={`text-foreground cursor-pointer transition-colors ${pricingMode === 'variants' ? 'font-semibold' : 'text-muted-foreground'}`}
              style={{ fontSize: 'var(--text-base)', fontWeight: pricingMode === 'variants' ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)' }}
              onClick={() => {
                setPricingMode('variants');
                setNewMenuItem({ ...newMenuItem, price: '' });
              }}
            >
              {t('labels.pricingModeVariants')}
            </span>
          </div>
        </div>

        {pricingMode === 'price' && (
          <div>
            <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
              {t('labels.price')} *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>{ct('currencySymbol')}</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newMenuItem.price}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                placeholder={t('placeholders.price')}
                className="w-full pl-12 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                style={{ fontSize: 'var(--text-base)' }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-3 p-4 bg-muted/20 rounded-lg border border-border">
          <div
            className="flex-shrink-0 cursor-pointer"
            onClick={() => setNewMenuItem({ ...newMenuItem, isCombo: !newMenuItem.isCombo })}
          >
            <div className={`w-6 h-6 rounded border-2 transition-colors flex items-center justify-center ${newMenuItem.isCombo ? 'bg-primary border-primary' : 'border-border'}`}>
              {newMenuItem.isCombo && <Check className="w-4 h-4 text-white" />}
            </div>
          </div>
          <div>
            <label
              className="block text-foreground cursor-pointer"
              style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
              onClick={() => setNewMenuItem({ ...newMenuItem, isCombo: !newMenuItem.isCombo })}
            >
              {t('labels.isCombo')}
            </label>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
              {t('descriptions.isCombo')}
            </p>
          </div>
        </div>

        <div>
          <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
            {t('labels.itemImage')}
          </label>
          <div className="border-2 border-dashed border-border rounded-lg p-4 bg-muted/20">
            {(newMenuItem.imageUrl || newMenuItem.image) ? (
              <div className="space-y-3">
                <div className="w-full h-48 rounded-lg overflow-hidden bg-muted">
                  <ImageWithFallback
                    src={newMenuItem.image ? URL.createObjectURL(newMenuItem.image) : newMenuItem.imageUrl}
                    alt={t('labels.imagePreview')}
                    className="w-full h-full object-cover"
                  />
                </div>
                <label className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    {uploadingImage ? t('buttons.uploading') : t('buttons.changeImage')}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingImage}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const imageUrl = await handleImageUpload(file);
                          setNewMenuItem({ ...newMenuItem, image: null, imageUrl });
                        } catch (error) {
                          setNewMenuItem({ ...newMenuItem, image: file, imageUrl: URL.createObjectURL(file) });
                        }
                      }
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center py-8 cursor-pointer group">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                  <Upload className="w-8 h-8 text-primary" />
                </div>
                <span className="text-foreground mb-1" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                  {uploadingImage ? t('buttons.uploading') : t('buttons.uploadImage')}
                </span>
                <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                  {t('buttons.uploadImageDesc')}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingImage}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      try {
                        const imageUrl = await handleImageUpload(file);
                        setNewMenuItem({ ...newMenuItem, image: null, imageUrl });
                      } catch (error) {
                        setNewMenuItem({ ...newMenuItem, image: file, imageUrl: URL.createObjectURL(file) });
                      }
                    }
                  }}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {pricingMode === 'variants' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="block text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                  {t('labels.variants')} *
                </label>
                {newMenuItem.pricingType === 'billed_by_consumption' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('descriptions.variantConsumption')}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>{t('buttons.addVariant')}</span>
              </button>
            </div>

            {newMenuItem.variants.length > 0 ? (
              <div className="space-y-2 mt-3">
                {newMenuItem.variants.map((variant, index) => (
                  <div key={variant.id} className="space-y-1">
                    <div className="flex gap-2 p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <input
                          type="text"
                          maxLength={100}
                          value={variant.name}
                          onChange={(e) => updateVariant(index, 'name', e.target.value)}
                          placeholder={t('placeholders.variantName')}
                          className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                          style={{ fontSize: 'var(--text-base)' }}
                        />
                        <p className="text-muted-foreground text-[10px] mt-0.5 text-right">{variant.name.length}/100</p>
                      </div>
                      <div className="w-32 flex-shrink-0">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>{ct('currencySymbol')}</span>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={variant.price}
                            onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                            placeholder={t('placeholders.price')}
                            className="w-full pl-8 pr-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                            style={{ fontSize: 'var(--text-base)' }}
                          />
                        </div>
                      </div>
                      {newMenuItem.pricingType === 'billed_by_consumption' && (
                        <div className="relative w-40 flex-shrink-0">
                          <input
                            type="number"
                            min="0"
                            value={variant.averageConsumption || ''}
                            onChange={(e) => updateVariant(index, 'averageConsumption', e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder={t('labels.peoplePerUnitAbbr')}
                            className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                            style={{ fontSize: 'var(--text-base)' }}
                          />
                          <p className="text-muted-foreground text-[10px] mt-0.5 text-right">{t('labels.peoplePerUnit')}</p>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="p-2 hover:bg-accent rounded-lg transition-colors text-destructive flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 bg-muted/20 rounded-lg border border-dashed border-border">
                <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
                  {t('descriptions.noVariants')}
                </p>
              </div>
            )}
          </div>
        )}

        {showItemSettings ? (
          <div className="p-4 bg-muted/30 rounded-lg space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {t('labels.itemSettings')}
              </label>
              <button
                type="button"
                onClick={() => setShowItemSettings(false)}
                className="p-1.5 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {t('labels.dietaryType')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'none', label: t('dietary.none'), desc: t('dietary.noneDesc') },
                  { id: 'veg', label: t('dietary.veg'), desc: t('dietary.vegDesc') },
                  { id: 'non-veg', label: t('dietary.nonVeg'), desc: t('dietary.nonVegDesc') },
                  { id: 'vegan', label: t('dietary.vegan'), desc: t('dietary.veganDesc') },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setNewMenuItem({ ...newMenuItem, dietaryType: type.id as any })}
                    className={`relative flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left cursor-pointer ${newMenuItem.dietaryType === type.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-background hover:border-border hover:bg-accent'
                      }`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${newMenuItem.dietaryType === type.id
                      ? 'border-primary'
                      : 'border-border'
                      }`}>
                      {newMenuItem.dietaryType === type.id && (
                        <div className="w-3 h-3 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-foreground mb-0.5" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                        {type.label}
                      </div>
                      <div className="text-muted-foreground break-words" style={{ fontSize: 'var(--text-small)', hyphens: 'auto' }}>
                        {type.desc}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {t('labels.dietaryTags')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {dietaryTagOptions.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleTag(tag, 'dietaryTags')}
                    className={`relative flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${newMenuItem.dietaryTags.includes(tag)
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-background hover:border-border hover:bg-accent'
                      }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${newMenuItem.dietaryTags.includes(tag)
                      ? 'border-primary bg-primary'
                      : 'border-border bg-background'
                      }`}>
                      {newMenuItem.dietaryTags.includes(tag) && (
                        <Check className="w-3 h-3 text-primary-foreground" />
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

            <div>
              <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {t('labels.ingredients')}
              </label>
              <textarea
                value={newMenuItem.ingredients}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, ingredients: e.target.value })}
                placeholder={t('placeholders.ingredients')}
                rows={3}
                maxLength={1000}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                style={{ fontSize: 'var(--text-base)' }}
              />
              <p className="text-muted-foreground text-xs mt-1 text-right">{newMenuItem.ingredients.length}/1000</p>
            </div>

            <div>
              <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {t('labels.allergens')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {allergenOptions.map((allergen) => (
                  <button
                    key={allergen}
                    type="button"
                    onClick={() => handleToggleTag(allergen, 'allergens')}
                    className={`relative flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${newMenuItem.allergens.includes(allergen)
                      ? 'border-destructive bg-destructive/5'
                      : 'border-border bg-background hover:border-border hover:bg-accent'
                      }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${newMenuItem.allergens.includes(allergen)
                      ? 'border-destructive bg-destructive'
                      : 'border-border bg-background'
                      }`}>
                      {newMenuItem.allergens.includes(allergen) && (
                        <Check className="w-3 h-3 text-primary-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className={newMenuItem.allergens.includes(allergen) ? 'text-destructive' : 'text-foreground'} style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                        {allergen}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {t('labels.additives')}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {additiveOptions.map((additive) => (
                  <button
                    key={additive}
                    type="button"
                    onClick={() => handleToggleTag(additive, 'additives')}
                    className={`relative flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${newMenuItem.additives.includes(additive)
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-background hover:border-border hover:bg-accent'
                      }`}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${newMenuItem.additives.includes(additive)
                      ? 'border-primary bg-primary'
                      : 'border-border bg-background'
                      }`}>
                      {newMenuItem.additives.includes(additive) && (
                        <Check className="w-3 h-3 text-primary-foreground" />
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

            <div>
              <h4 className="text-foreground mb-3" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                {t('labels.nutritionalInfo')}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { id: 'servingSize', label: t('nutrition.servingSize') },
                  { id: 'calories', label: t('nutrition.calories') },
                  { id: 'protein', label: t('nutrition.protein') },
                  { id: 'carbs', label: t('nutrition.carbs') },
                  { id: 'fat', label: t('nutrition.fat') },
                  { id: 'fiber', label: t('nutrition.fiber') },
                  { id: 'sugar', label: t('nutrition.sugar') },
                  { id: 'sodium', label: t('nutrition.sodium') },
                ].map((info) => (
                  <div key={info.id}>
                    <label className="block text-muted-foreground mb-1.5" style={{ fontSize: 'var(--text-small)' }}>
                      {info.label}
                    </label>
                    <input
                      type="text"
                      maxLength={50}
                      value={(newMenuItem.nutritionalInfo as any)[info.id]}
                      onChange={(e) => setNewMenuItem({
                        ...newMenuItem,
                        nutritionalInfo: { ...newMenuItem.nutritionalInfo, [info.id]: e.target.value }
                      })}
                      placeholder={t(`placeholders.nutrition.${info.id}`)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                      style={{ fontSize: 'var(--text-base)' }}
                    />
                    <p className="text-muted-foreground text-[10px] mt-0.5 text-right">{(newMenuItem.nutritionalInfo as any)[info.id].length}/50</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <label className="block text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
              {t('labels.itemSettingsOpt')}
            </label>
            <button
              type="button"
              onClick={() => setShowItemSettings(true)}
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>{t('buttons.addSettings')}</span>
            </button>
          </div>
        )}

        {showAddons ? (
          <div className="p-4 bg-muted/30 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {t('labels.addons')} {newMenuItem.assignedAddonGroups.length > 0 && `(${newMenuItem.assignedAddonGroups.length})`}
              </label>
              <button
                type="button"
                onClick={() => setShowAddons(false)}
                className="p-1.5 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
              {t('descriptions.addons')}
            </p>

            <div className="grid grid-cols-3 gap-3">
              {addonGroups.filter(group => {
                if (activeCategoryId) {
                  const parentCategory = categories.find(c => c.id === activeCategoryId);
                  return !parentCategory?.assignedAddonGroups?.includes(group.id);
                }
                return true;
              }).map((group) => {
                const isSelected = newMenuItem.assignedAddonGroups.includes(group.id);
                return (
                  <label
                    key={group.id}
                    className="cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewMenuItem({
                            ...newMenuItem,
                            assignedAddonGroups: [...newMenuItem.assignedAddonGroups, group.id]
                          });
                        } else {
                          setNewMenuItem({
                            ...newMenuItem,
                            assignedAddonGroups: newMenuItem.assignedAddonGroups.filter(id => id !== group.id)
                          });
                        }
                      }}
                      className="sr-only peer"
                    />
                    <div
                      className="px-4 py-3 bg-card border border-border rounded-lg transition-all hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary/5"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${isSelected
                          ? 'bg-primary border-primary'
                          : 'bg-background border-border'
                          }`}>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={3} />
                          )}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span
                            className="text-foreground truncate"
                            style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
                          >
                            {group.name}
                          </span>
                          <span className="text-muted-foreground" style={{ fontSize: '10px' }}>
                            {group.items.length} {group.items.length === 1 ? t('labels.item') : t('labels.items')} • {group.minSelect > 0 || group.maxSelect === 1 ? t('labels.choice') : t('labels.addon')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>

            {newMenuItem.assignedAddonGroups.length > 0 && (
              <p className="text-muted-foreground mt-3" style={{ fontSize: 'var(--text-small)' }}>
                {newMenuItem.assignedAddonGroups.length} {t('labels.selectedGroups')}
              </p>
            )}

            {activeCategoryId && addonGroups.filter(group => {
              const parentCategory = categories.find(c => c.id === activeCategoryId);
              return !parentCategory?.assignedAddonGroups?.includes(group.id);
            }).length === 0 && (
                <p className="text-muted-foreground italic mt-3" style={{ fontSize: 'var(--text-small)' }}>
                  {t('descriptions.noGroupsAvailable')}
                </p>
              )}

            {(!addonGroups || addonGroups.length === 0) && (
              <p className="text-muted-foreground text-center py-4" style={{ fontSize: 'var(--text-small)' }}>
                {t('descriptions.noGroupsCreated')}
              </p>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <label className="block text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
              {t('labels.addonsOpt')} {newMenuItem.assignedAddonGroups.length > 0 && <span className="text-muted-foreground ml-2">({newMenuItem.assignedAddonGroups.length} {t('labels.selected')})</span>}
            </label>
            <button
              type="button"
              onClick={() => setShowAddons(true)}
              className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>{t('buttons.addAddons')}</span>
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2 border-t border-border mt-2">
          <input
            type="checkbox"
            id="itemActive"
            checked={newMenuItem.isActive}
            onChange={(e) => setNewMenuItem({ ...newMenuItem, isActive: e.target.checked })}
            className="w-4 h-4 rounded border-border"
          />
          <label htmlFor="itemActive" className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>
            {t('labels.itemIsActive')}
          </label>
        </div>
      </div>
    </Modal>
  );
}
