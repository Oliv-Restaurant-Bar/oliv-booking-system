'use client';

import { UtensilsCrossed, X, Plus, Check, Upload } from 'lucide-react';
import { Modal } from '../user/Modal';
import { Button } from '../user/Button';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
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
          >
            {ct('cancel')}
          </Button>
          <Button
            variant="primary"
            icon={editingCategoryId ? Check : Plus}
            onClick={onSave}
            disabled={!newCategory.name || newCategory.name.trim() === '' || newCategory.name.length > 100 || newCategory.description.length > 500}
          >
            {editingCategoryId ? t('buttons.saveChanges') : t('buttons.addCategory')}
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

        <div>
          <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
            {t('labels.categoryImage')}
          </label>
          <div className="border-2 border-dashed border-border rounded-lg p-4 bg-muted/20 hidden md:block">
            {(newCategory.imageUrl || newCategory.image) ? (
              <div className="space-y-3">
                <div className="w-full h-48 rounded-lg overflow-hidden bg-muted">
                  <ImageWithFallback
                    src={newCategory.image ? URL.createObjectURL(newCategory.image) : newCategory.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <label className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    {uploadingImage ? 'Uploading...' : t('buttons.changeImage')}
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
                          setNewCategory({ ...newCategory, image: null, imageUrl });
                        } catch (error) {
                          setNewCategory({ ...newCategory, image: file, imageUrl: URL.createObjectURL(file) });
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
                  {uploadingImage ? 'Uploading...' : t('buttons.uploadImage')}
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
                    if (file) {
                      try {
                        const imageUrl = await handleImageUpload(file);
                        setNewCategory({ ...newCategory, image: null, imageUrl });
                      } catch (error) {
                        setNewCategory({ ...newCategory, image: file, imageUrl: URL.createObjectURL(file) });
                      }
                    }
                  }}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
