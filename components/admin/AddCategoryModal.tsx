'use client';

import { UtensilsCrossed, X, Plus, Check } from 'lucide-react';
import { Modal } from '../user/Modal';
import { Button } from '../user/Button';
import { useMenuConfigTranslation, useCommonTranslation } from '@/lib/i18n/client';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingCategoryId: string | null;
  newCategory: {
    name: string;
    description: string;
    image: File | null;
    imageUrl: string;
  };
  setNewCategory: (category: any) => void;
  uploadingImage: boolean;
  handleImageUpload: (file: File) => Promise<string>;
  onSave: () => Promise<void>;
  displayCategoryErrors: {
    name?: string;
    description?: string;
  };
  categoryTouched: {
    name?: boolean;
    description?: boolean;
  };
  setCategoryTouched: (touched: any) => void;
  isSaving?: boolean;
}

export function AddCategoryModal({
  isOpen,
  onClose,
  editingCategoryId,
  newCategory,
  setNewCategory,
  uploadingImage,
  handleImageUpload,
  onSave,
  displayCategoryErrors,
  categoryTouched,
  setCategoryTouched,
  isSaving = false,
}: AddCategoryModalProps) {
  const t = useMenuConfigTranslation();
  const ct = useCommonTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={UtensilsCrossed}
      title={editingCategoryId ? t('titles.editCategory') : t('titles.addCategory')}
      footer={
        <>
          <Button
            variant="secondary"
            icon={X}
            onClick={onClose}
            disabled={isSaving}
          >
            {ct('cancel')}
          </Button>
          <Button
            variant="primary"
            icon={isSaving ? undefined : (editingCategoryId ? Check : Plus)}
            onClick={onSave}
            disabled={isSaving || !newCategory.name || newCategory.name.trim() === '' || newCategory.name.length > 100 || newCategory.description.length > 500}
          >
            {isSaving ? 'Saving...' : (editingCategoryId ? t('buttons.saveChanges') : t('buttons.addCategory'))}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
            {t('labels.categoryName')} *
          </label>
          <input
            type="text"
            maxLength={100}
            value={newCategory.name}
            onChange={(e) => {
              setNewCategory({ ...newCategory, name: e.target.value });
            }}
            onBlur={() => {
              if (!categoryTouched.name) setCategoryTouched({ ...categoryTouched, name: true });
            }}
            placeholder={t('placeholders.categoryName')}
            className={`w-full px-4 py-2 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${displayCategoryErrors.name ? 'border-destructive' : 'border-border'}`}
            style={{ fontSize: 'var(--text-base)' }}
          />
          <div className="flex items-center justify-between mt-1">
            <p className="text-destructive text-xs">{displayCategoryErrors.name}</p>
            <p className="text-muted-foreground text-xs text-right">{newCategory.name.length}/100</p>
          </div>
        </div>

        <div>
          <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
            {t('labels.description')}
          </label>
          <textarea
            value={newCategory.description}
            maxLength={500}
            onChange={(e) => {
              setNewCategory({ ...newCategory, description: e.target.value });
            }}
            onBlur={() => {
              if (!categoryTouched.description) setCategoryTouched({ ...categoryTouched, description: true });
            }}
            placeholder={t('placeholders.categoryDesc')}
            rows={3}
            className={`w-full px-4 py-2 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none ${displayCategoryErrors.description ? 'border-destructive' : 'border-border'}`}
            style={{ fontSize: 'var(--text-base)' }}
          />
          <div className="flex items-center justify-between mt-1">
            <p className="text-destructive text-xs">{displayCategoryErrors.description}</p>
            <p className="text-muted-foreground text-xs text-right">{newCategory.description.length}/500</p>
          </div>
        </div>


      </div>
    </Modal>

  );
}
