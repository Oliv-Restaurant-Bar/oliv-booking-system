'use client';

import { Plus, X, Check } from 'lucide-react';
import { Modal } from '@/components/user/Modal';
import { Button } from '@/components/user/Button';

interface AddonItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAddonItemId: string | null;
  currentGroupId: string | null;
  newAddonItem: {
    name: string;
    price: string;
    dietaryType: 'none' | 'veg' | 'non-veg' | 'vegan';
    isActive: boolean;
  };
  setNewAddonItem: (item: any) => void;
  onSubmit: () => Promise<void>;
  translations: {
    titleAdd: string;
    titleEdit: string;
    cancel: string;
    saveChanges: string;
    addItem: string;
    nameLabel: string;
    namePlaceholder: string;
    priceLabel: string;
    priceHint: string;
    dietaryLabel: string;
    vegLabel: string;
    vegDesc: string;
    nonVegLabel: string;
    nonVegDesc: string;
    veganLabel: string;
    veganDesc: string;
    noneLabel: string;
    noneDesc: string;
    availableLabel: string;
    availableDesc: string;
  };
}

export function AddonItemModal({
  isOpen,
  onClose,
  editingAddonItemId,
  currentGroupId,
  newAddonItem,
  setNewAddonItem,
  onSubmit,
  translations,
}: AddonItemModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={Plus}
      title={editingAddonItemId ? translations.titleEdit : translations.titleAdd}
      footer={
        <>
          <Button
            variant="secondary"
            icon={X}
            onClick={onClose}
          >
            {translations.cancel}
          </Button>
          <Button
            variant="primary"
            icon={editingAddonItemId ? Check : Plus}
            onClick={onSubmit}
            disabled={!currentGroupId || !newAddonItem.name || !newAddonItem.price || newAddonItem.name.trim() === '' || newAddonItem.name.length > 100 || parseFloat(newAddonItem.price) < 0}
          >
            {editingAddonItemId ? translations.saveChanges : translations.addItem}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div>
          <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
            {translations.nameLabel} *
          </label>
          <input
            type="text"
            maxLength={100}
            value={newAddonItem.name}
            onChange={(e) => setNewAddonItem({ ...newAddonItem, name: e.target.value })}
            placeholder={translations.namePlaceholder}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            style={{ fontSize: 'var(--text-base)' }}
          />
          <p className="text-muted-foreground text-xs mt-1 text-right">{newAddonItem.name.length}/100</p>
        </div>

        <div>
          <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
            {translations.priceLabel} *
            <span className="text-muted-foreground ml-2" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-normal)' }}>
              {translations.priceHint}
            </span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={newAddonItem.price}
              onChange={(e) => setNewAddonItem({ ...newAddonItem, price: e.target.value })}
              placeholder="0.00"
              className="w-full pl-8 pr-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              style={{ fontSize: 'var(--text-base)' }}
            />
          </div>
        </div>

        <div>
          <label className="block text-foreground mb-3" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
            {translations.dietaryLabel}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setNewAddonItem({ ...newAddonItem, dietaryType: 'none' })}
              className={`p-4 rounded-lg border-2 transition-all ${newAddonItem.dietaryType === 'none' ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded border-2 border-muted flex items-center justify-center flex-shrink-0">
                  <div className="w-3 h-3 rounded-full bg-muted" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>{translations.noneLabel}</p>
                  <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>{translations.noneDesc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${newAddonItem.dietaryType === 'none' ? 'border-primary' : 'border-border'}`}>
                  {newAddonItem.dietaryType === 'none' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setNewAddonItem({ ...newAddonItem, dietaryType: 'veg' })}
              className={`p-4 rounded-lg border-2 transition-all ${newAddonItem.dietaryType === 'veg' ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded border-2 border-green-600 flex items-center justify-center flex-shrink-0">
                  <div className="w-3 h-3 rounded-full bg-green-600" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>{translations.vegLabel}</p>
                  <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>{translations.vegDesc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${newAddonItem.dietaryType === 'veg' ? 'border-primary' : 'border-border'}`}>
                  {newAddonItem.dietaryType === 'veg' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setNewAddonItem({ ...newAddonItem, dietaryType: 'non-veg' })}
              className={`p-4 rounded-lg border-2 transition-all ${newAddonItem.dietaryType === 'non-veg' ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded border-2 border-red-600 flex items-center justify-center flex-shrink-0">
                  <div className="w-3 h-3 rounded-full bg-red-600" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>{translations.nonVegLabel}</p>
                  <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>{translations.nonVegDesc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${newAddonItem.dietaryType === 'non-veg' ? 'border-primary' : 'border-border'}`}>
                  {newAddonItem.dietaryType === 'non-veg' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setNewAddonItem({ ...newAddonItem, dietaryType: 'vegan' })}
              className={`p-4 rounded-lg border-2 transition-all ${newAddonItem.dietaryType === 'vegan' ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded border-2 border-emerald-600 flex items-center justify-center flex-shrink-0">
                  <div className="w-3 h-3 rounded-full bg-emerald-600" />
                </div>
                <div className="text-left flex-1">
                  <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>{translations.veganLabel}</p>
                  <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>{translations.veganDesc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${newAddonItem.dietaryType === 'vegan' ? 'border-primary' : 'border-border'}`}>
                  {newAddonItem.dietaryType === 'vegan' && <div className="w-2.5 h-2.5 rounded-full bg-primary" />}
                </div>
              </div>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div>
            <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>{translations.availableLabel}</p>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>{translations.availableDesc}</p>
          </div>
          <button
            type="button"
            onClick={() => setNewAddonItem({ ...newAddonItem, isActive: !newAddonItem.isActive })}
            className={`relative w-12 h-6 rounded-full transition-colors ${newAddonItem.isActive ? 'bg-primary' : 'bg-border'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${newAddonItem.isActive ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </div>
    </Modal>
  );
}
