'use client';

import { UtensilsCrossed, X, Plus, Check, Upload, Trash2, Settings, ListPlus } from 'lucide-react';
import { Modal } from '@/components/user/Modal';
import { Button } from '@/components/user/Button';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Category, AddonGroup, VariantOption } from '../../lib/types';
import { dietaryTagOptions, allergenOptions, additiveOptions } from '../../lib/constants';

interface MenuItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingMenuItemId: string | null;
  activeCategoryId: string | null;
  setActiveCategoryId: (id: string | null) => void;
  categories: Category[];
  addonGroups: AddonGroup[];
  newMenuItem: any;
  setNewMenuItem: (item: any) => void;
  pricingMode: 'price' | 'variants';
  setPricingMode: (mode: 'price' | 'variants') => void;
  showItemSettings: boolean;
  setShowItemSettings: (show: boolean) => void;
  showAddons: boolean;
  setShowAddons: (show: boolean) => void;
  showChoices: boolean;
  setShowChoices: (show: boolean) => void;
  uploadingImage: boolean;
  onImageUpload: (file: File) => Promise<void>;
  onSubmit: () => Promise<void>;
  onAddVariant: () => void;
  onUpdateVariant: (index: number, field: string, value: any) => void;
  onRemoveVariant: (index: number) => void;
  onToggleTag: (tag: string, field: string) => void;
  displayErrors: any;
  menuItemTouched: any;
  setMenuItemTouched: (touched: any) => void;
}

export function MenuItemModal({
  isOpen,
  onClose,
  editingMenuItemId,
  activeCategoryId,
  setActiveCategoryId,
  categories,
  addonGroups,
  newMenuItem,
  setNewMenuItem,
  pricingMode,
  setPricingMode,
  showItemSettings,
  setShowItemSettings,
  showAddons,
  setShowAddons,
  showChoices,
  setShowChoices,
  uploadingImage,
  onImageUpload,
  onSubmit,
  onAddVariant,
  onUpdateVariant,
  onRemoveVariant,
  onToggleTag,
  displayErrors,
  menuItemTouched,
  setMenuItemTouched,
}: MenuItemModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={UtensilsCrossed}
      title={editingMenuItemId ? 'Edit Menu Item' : 'Add New Menu Item'}
      footer={
        <>
          <Button
            variant="secondary"
            icon={X}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={editingMenuItemId ? Check : Plus}
            onClick={onSubmit}
            disabled={!activeCategoryId || !newMenuItem.name || (pricingMode === 'price' && !newMenuItem.price) || (pricingMode === 'variants' && newMenuItem.variants.length === 0) || newMenuItem.name.trim() === '' || newMenuItem.name.length > 100 || newMenuItem.description.length > 500 || newMenuItem.ingredients.length > 1000}
          >
            {editingMenuItemId ? 'Save Changes' : 'Add Item'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {!activeCategoryId && (
          <div>
            <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
              Select Category *
            </label>
            <select
              value={activeCategoryId || ''}
              onChange={(e) => setActiveCategoryId(e.target.value)}
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              style={{ fontSize: 'var(--text-base)' }}
            >
              <option value="">Choose a category...</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
            Item Name *
          </label>
          <input
            type="text"
            maxLength={100}
            value={newMenuItem.name}
            onChange={(e) => setNewMenuItem({ ...newMenuItem, name: e.target.value })}
            onBlur={() => {
              if (!menuItemTouched.name) setMenuItemTouched({ ...menuItemTouched, name: true });
            }}
            placeholder="e.g., Margherita Pizza"
            className={`w-full px-4 py-2 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${displayErrors.name ? 'border-destructive' : 'border-border'}`}
            style={{ fontSize: 'var(--text-base)' }}
          />
          <div className="flex items-center justify-between mt-1">
            <p className="text-destructive text-xs">{displayErrors.name}</p>
            <p className="text-muted-foreground text-xs text-right">{newMenuItem.name.length}/100</p>
          </div>
        </div>

        <div>
          <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
            Description
          </label>
          <textarea
            value={newMenuItem.description}
            maxLength={500}
            onChange={(e) => setNewMenuItem({ ...newMenuItem, description: e.target.value })}
            onBlur={() => {
              if (!menuItemTouched.description) setMenuItemTouched({ ...menuItemTouched, description: true });
            }}
            placeholder="Describe this menu item"
            rows={3}
            className={`w-full px-4 py-2 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none ${displayErrors.description ? 'border-destructive' : 'border-border'}`}
            style={{ fontSize: 'var(--text-base)' }}
          />
          <div className="flex items-center justify-between mt-1">
            <p className="text-destructive text-xs">{displayErrors.description}</p>
            <p className="text-muted-foreground text-xs text-right">{newMenuItem.description.length}/500</p>
          </div>
        </div>

        <div>
          <label className="block text-foreground mb-3" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
            Pricing Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(['per_person', 'flat_fee', 'billed_by_consumption'] as const).map((type) => (
              <div
                key={type}
                onClick={() => setNewMenuItem({ ...newMenuItem, pricingType: type })}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between ${newMenuItem.pricingType === type ? 'border-[#9DAE91] bg-[#9DAE91]/5 shadow-sm' : 'border-border bg-card hover:border-primary/30'}`}
                style={{ borderRadius: 'var(--radius-card)' }}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center mt-0.5 transition-colors ${newMenuItem.pricingType === type ? 'border-[#9DAE91] bg-white' : 'border-border bg-white'}`}>
                    {newMenuItem.pricingType === type && <div className="w-3 h-3 rounded-full bg-[#9DAE91]" />}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground leading-tight" style={{ fontSize: 'var(--text-base)' }}>
                      {type === 'per_person' ? 'Per Person' : type === 'flat_fee' ? 'Flat Rate' : 'Billed by Consumption'}
                    </p>
                    <p className="text-muted-foreground mt-1 leading-snug" style={{ fontSize: '11px' }}>
                      {type === 'per_person' ? 'Price multiplies by guest count' : type === 'flat_fee' ? 'Fixed price regardless of guests' : 'Based on actual usage'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {newMenuItem.pricingType === 'billed_by_consumption' && pricingMode === 'price' && (
          <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
              Average Consumption *
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                max="100"
                step="1"
                value={newMenuItem.averageConsumption}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, averageConsumption: e.target.value })}
                placeholder="e.g., 3"
                className="flex-1 px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                style={{ fontSize: 'var(--text-base)' }}
              />
              <span className="text-muted-foreground text-sm">people per unit</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              How many people does one unit (bottle, etc.) serve? Used to calculate recommended quantities for customers.
            </p>
          </div>
        )}

        {/* Pricing Mode Toggle */}
        <div className="flex items-center justify-between">
          <label className="block text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
            Pricing Mode
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
              Price
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
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${pricingMode === 'variants' ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span
              className={`text-foreground cursor-pointer transition-colors ${pricingMode === 'variants' ? 'font-semibold' : 'text-muted-foreground'}`}
              style={{ fontSize: 'var(--text-base)', fontWeight: pricingMode === 'variants' ? 'var(--font-weight-semibold)' : 'var(--font-weight-medium)' }}
              onClick={() => {
                setPricingMode('variants');
                setNewMenuItem({ ...newMenuItem, price: '' });
              }}
            >
              Variants
            </span>
          </div>
        </div>

        {pricingMode === 'price' && (
          <div>
            <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
              Price *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>€</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newMenuItem.price}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, price: e.target.value })}
                placeholder="0.00"
                className={`w-full pl-8 pr-4 py-2 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${displayErrors.price ? 'border-destructive' : 'border-border'}`}
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
              Is this Combo Item
            </label>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
              Mark this as a combo pack to group it separately in the menu
            </p>
          </div>
        </div>

        <div>
          <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
            Item Image
          </label>
          <div className="border-2 border-dashed border-border rounded-lg p-4 bg-muted/20">
            {(newMenuItem.imageUrl || newMenuItem.image) ? (
              <div className="space-y-3">
                <div className="w-full h-48 rounded-lg overflow-hidden bg-muted">
                  <ImageWithFallback
                    src={newMenuItem.image ? URL.createObjectURL(newMenuItem.image) : newMenuItem.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <label className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    {uploadingImage ? 'Uploading...' : 'Change Image'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingImage}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) await onImageUpload(file);
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
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                </span>
                <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                  Click to browse or drag and drop
                </span>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingImage}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) await onImageUpload(file);
                  }}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Variants Section */}
        {pricingMode === 'variants' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="block text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                  Variants *
                </label>
                {newMenuItem.pricingType === 'billed_by_consumption' && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Set "People per unit" for each variant to calculate recommended quantities
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onAddVariant}
                className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>Add Variant</span>
              </button>
            </div>

            {newMenuItem.variants.length > 0 ? (
              <div className="space-y-2 mt-3">
                {newMenuItem.variants.map((variant: any, index: number) => (
                  <div key={variant.id} className="space-y-1">
                    <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <input
                          type="text"
                          maxLength={100}
                          value={variant.name}
                          onChange={(e) => onUpdateVariant(index, 'name', e.target.value)}
                          placeholder="Variant name"
                          className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                          style={{ fontSize: 'var(--text-base)' }}
                        />
                      </div>
                      <div className="relative w-32 flex-shrink-0">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={variant.price}
                          onChange={(e) => onUpdateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="w-full pl-8 pr-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                          style={{ fontSize: 'var(--text-base)' }}
                        />
                      </div>
                      {newMenuItem.pricingType === 'billed_by_consumption' && (
                        <div className="relative w-40 flex-shrink-0">
                          <input
                            type="number"
                            min="0"
                            value={variant.averageConsumption || ''}
                            onChange={(e) => onUpdateVariant(index, 'averageConsumption', e.target.value ? parseInt(e.target.value) : undefined)}
                            placeholder="People/unit"
                            className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                            style={{ fontSize: 'var(--text-base)' }}
                          />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => onRemoveVariant(index)}
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
                <p className="text-muted-foreground">No variants added yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Expandable Sections */}
        {/* Item Settings */}
        {showItemSettings ? (
          <div className="p-4 bg-muted/30 rounded-lg space-y-6">
            <div className="flex items-center justify-between">
              <label className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>Item Settings</label>
              <button type="button" onClick={() => setShowItemSettings(false)} className="p-1.5 hover:bg-accent rounded-lg"><X className="w-4 h-4" /></button>
            </div>

            {/* Dietary Type Selection */}
            <div>
              <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>Dietary Type</label>
              <div className="grid grid-cols-4 gap-3">
                {(['none', 'veg', 'non-veg', 'vegan'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setNewMenuItem({ ...newMenuItem, dietaryType: type })}
                    className={`relative flex items-start gap-3 p-4 rounded-lg border-2 transition-all text-left cursor-pointer ${newMenuItem.dietaryType === type ? 'border-primary bg-primary/5' : 'border-border bg-background hover:bg-accent'}`}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 ${newMenuItem.dietaryType === type ? 'border-primary' : 'border-border'}`}>
                      {newMenuItem.dietaryType === type && <div className="w-3 h-3 rounded-full bg-primary" />}
                    </div>
                    <div>
                      <div className="text-foreground font-medium" style={{ fontSize: 'var(--text-base)' }}>{type === 'none' ? 'No Type' : type === 'veg' ? 'Vegetarian' : type === 'non-veg' ? 'Non-Veg' : 'Vegan'}</div>
                      <div className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>{type === 'none' ? 'Non-food' : type === 'veg' ? 'No meat/fish' : type === 'non-veg' ? 'Contains meat' : 'No animal products'}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags Checkboxes */}
            <div>
              <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>Dietary Tags</label>
              <div className="grid grid-cols-3 gap-3">
                {dietaryTagOptions.map((tag) => (
                  <button key={tag} type="button" onClick={() => onToggleTag(tag, 'dietaryTags')} className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all text-left ${newMenuItem.dietaryTags.includes(tag) ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}>
                    <div className={`w-5 h-5 rounded border-2 transition-colors ${newMenuItem.dietaryTags.includes(tag) ? 'bg-primary border-primary' : 'border-border'}`} />
                    <span className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>{tag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Ingredients */}
            <div>
              <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>Ingredients</label>
              <textarea
                value={newMenuItem.ingredients}
                onChange={(e) => setNewMenuItem({ ...newMenuItem, ingredients: e.target.value })}
                placeholder="List ingredients..."
                rows={3}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                style={{ fontSize: 'var(--text-base)' }}
              />
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <label className="block text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>Item Settings (Optional)</label>
            <button type="button" onClick={() => setShowItemSettings(true)} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg flex items-center gap-2">
              <Plus className="w-4 h-4" /><span>Add Settings</span>
            </button>
          </div>
        )}

        {/* Addons Section */}
        {showAddons ? (
          <div className="p-4 bg-muted/30 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>Add-ons</label>
              <button type="button" onClick={() => setShowAddons(false)} className="p-1.5 hover:bg-accent rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {addonGroups.map((group) => {
                const isSelected = newMenuItem.assignedAddonGroups.includes(group.id);
                return (
                  <label key={group.id} className="cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={isSelected}
                      onChange={(e) => {
                        const newGroups = e.target.checked
                          ? [...newMenuItem.assignedAddonGroups, group.id]
                          : newMenuItem.assignedAddonGroups.filter((id: string) => id !== group.id);
                        setNewMenuItem({ ...newMenuItem, assignedAddonGroups: newGroups });
                      }}
                    />
                    <div className="px-4 py-3 border border-border rounded-lg transition-all peer-checked:border-primary peer-checked:bg-primary/5">
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded border-2 transition-all ${isSelected ? 'bg-primary border-primary' : 'border-border'}`}>
                          {isSelected && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
                        </div>
                        <span className="text-foreground font-medium truncate" style={{ fontSize: 'var(--text-base)' }}>{group.name}</span>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <label className="block text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>Add-ons (Optional)</label>
            <button type="button" onClick={() => setShowAddons(true)} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg flex items-center gap-2">
              <Plus className="w-4 h-4" /><span>Add Add-ons</span>
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 pt-2 border-t border-border mt-2">
          <input
            type="checkbox"
            id="itemActive"
            checked={newMenuItem.isActive}
            onChange={(e) => setNewMenuItem({ ...newMenuItem, isActive: e.target.checked })}
            className="w-4 h-4 rounded"
          />
          <label htmlFor="itemActive" className="text-foreground" style={{ fontSize: 'var(--text-base)' }}>Item is active and visible</label>
        </div>
      </div>
    </Modal>
  );
}
