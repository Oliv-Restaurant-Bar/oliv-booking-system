'use client';

import { Plus, X, Check } from 'lucide-react';
import { Modal } from '../user/Modal';
import { Button } from '../user/Button';
import { useMenuConfigTranslation, useCommonTranslation } from '@/lib/i18n/client';

interface AddAddonItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingAddonItemId: string | null;
  currentGroupId: string | null;
  newAddonItem: {
    name: string;
    price: string;
    dietaryType: 'veg' | 'non-veg' | 'vegan' | 'none';
    isActive: boolean;
  };
  setNewAddonItem: (item: any) => void;
  onSave: () => Promise<void>;
}

export function AddAddonItemModal({
  isOpen,
  onClose,
  editingAddonItemId,
  currentGroupId,
  newAddonItem,
  setNewAddonItem,
  onSave,
}: AddAddonItemModalProps) {
  const t = useMenuConfigTranslation();
  const ct = useCommonTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={Plus}
      title={editingAddonItemId ? t('titles.editAddonItem') : t('titles.addAddonItem')}
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
            icon={editingAddonItemId ? Check : Plus}
            onClick={onSave}
            disabled={!newAddonItem.name || !newAddonItem.price || newAddonItem.name.trim() === '' || newAddonItem.name.length > 100 || parseFloat(newAddonItem.price) < 0}
          >
            {editingAddonItemId ? t('buttons.saveChanges') : t('buttons.addItem')}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div>
          <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
            {t('labels.itemName')} *
          </label>
          <input
            type="text"
            maxLength={100}
            value={newAddonItem.name}
            onChange={(e) => setNewAddonItem({ ...newAddonItem, name: e.target.value })}
            placeholder={t('placeholders.addonItemName')}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            style={{ fontSize: 'var(--text-base)' }}
          />
          <p className="text-muted-foreground text-xs mt-1 text-right">{newAddonItem.name.length}/100</p>
        </div>

        <div>
          <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
            {t('labels.price')} ({ct('currencySymbol')}) *
            <span className="text-muted-foreground ml-2" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-normal)' }}>
              ({t('labels.priceHint')})
            </span>
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={newAddonItem.price}
            onChange={(e) => setNewAddonItem({ ...newAddonItem, price: e.target.value })}
            placeholder="0.00"
            className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            style={{ fontSize: 'var(--text-base)' }}
          />
        </div>

        <div>
          <label className="block text-foreground mb-3" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
            {t('labels.dietaryType')}
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { id: 'none', label: t('dietary.none'), desc: t('dietary.noneDesc'), color: 'slate' },
              { id: 'veg', label: t('dietary.veg'), desc: t('dietary.vegDesc'), color: 'green' },
              { id: 'non-veg', label: t('dietary.nonVeg'), desc: t('dietary.nonVegDesc'), color: 'red' },
              { id: 'vegan', label: t('dietary.vegan'), desc: t('dietary.veganDesc'), color: 'green' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setNewAddonItem({ ...newAddonItem, dietaryType: type.id as any })}
                className={`p-4 rounded-lg border-2 transition-all text-left ${newAddonItem.dietaryType === type.id
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-border/60 bg-background'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded border-2 border-${type.color}-600 flex items-center justify-center flex-shrink-0`}>
                    <div className={`w-3 h-3 rounded-full bg-${type.color}-600`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground truncate" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                      {type.label}
                    </p>
                    <p className="text-muted-foreground line-clamp-2" style={{ fontSize: 'var(--text-small)' }}>
                      {type.desc}
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${newAddonItem.dietaryType === type.id ? 'border-primary' : 'border-border'
                    }`}>
                    {newAddonItem.dietaryType === type.id && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
          <div>
            <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
              {t('labels.available')}
            </p>
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
              {t('descriptions.itemVisible')}
            </p>
          </div>
          <button
            onClick={() => setNewAddonItem({ ...newAddonItem, isActive: !newAddonItem.isActive })}
            className={`relative w-12 h-6 rounded-full transition-colors ${newAddonItem.isActive ? 'bg-primary' : 'bg-border'
              }`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${newAddonItem.isActive ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
          </button>
        </div>
      </div>
    </Modal>
  );
}
