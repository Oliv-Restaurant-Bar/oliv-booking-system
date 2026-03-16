'use client';

import { UtensilsCrossed, X, Plus, Check, Upload } from 'lucide-react';
import { Modal } from '@/components/user/Modal';
import { Button } from '@/components/user/Button';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

interface CategoryModalProps {
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
  categoryErrors: any;
  categoryTouched: any;
  setCategoryTouched: (touched: any) => void;
  displayErrors: any;
  uploadingImage: boolean;
  onImageUpload: (file: File) => Promise<void>;
  onSubmit: () => Promise<void>;
  translations: {
    titleAdd: string;
    titleEdit: string;
    cancel: string;
    saveChanges: string;
    addCategory: string;
    nameLabel: string;
    namePlaceholder: string;
    descLabel: string;
    descPlaceholder: string;
    imageLabel: string;
    uploadImage: string;
    changeImage: string;
  };
}

export function CategoryModal({
  isOpen,
  onClose,
  editingCategoryId,
  newCategory,
  setNewCategory,
  categoryTouched,
  setCategoryTouched,
  displayErrors,
  uploadingImage,
  onImageUpload,
  onSubmit,
  translations,
}: CategoryModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={UtensilsCrossed}
      title={editingCategoryId ? translations.titleEdit : translations.titleAdd}
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
            icon={editingCategoryId ? Check : Plus}
            onClick={onSubmit}
            disabled={!newCategory.name || newCategory.name.trim() === '' || newCategory.name.length > 100 || newCategory.description.length > 500}
          >
            {editingCategoryId ? translations.saveChanges : translations.addCategory}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
            {translations.nameLabel} *
          </label>
          <input
            type="text"
            maxLength={100}
            value={newCategory.name}
            onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
            onBlur={() => {
              if (!categoryTouched.name) setCategoryTouched({ ...categoryTouched, name: true });
            }}
            placeholder={translations.namePlaceholder}
            className={`w-full px-4 py-2 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring ${displayErrors.name ? 'border-destructive' : 'border-border'}`}
            style={{ fontSize: 'var(--text-base)' }}
          />
          <div className="flex items-center justify-between mt-1">
            <p className="text-destructive text-xs">{displayErrors.name}</p>
            <p className="text-muted-foreground text-xs text-right">{newCategory.name.length}/100</p>
          </div>
        </div>

        <div>
          <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
            {translations.descLabel}
          </label>
          <textarea
            value={newCategory.description}
            maxLength={500}
            onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
            onBlur={() => {
              if (!categoryTouched.description) setCategoryTouched({ ...categoryTouched, description: true });
            }}
            placeholder={translations.descPlaceholder}
            rows={3}
            className={`w-full px-4 py-2 bg-input-background border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none ${displayErrors.description ? 'border-destructive' : 'border-border'}`}
            style={{ fontSize: 'var(--text-base)' }}
          />
          <div className="flex items-center justify-between mt-1">
            <p className="text-destructive text-xs">{displayErrors.description}</p>
            <p className="text-muted-foreground text-xs text-right">{newCategory.description.length}/500</p>
          </div>
        </div>

        <div>
          <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
            {translations.imageLabel}
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
                    {uploadingImage ? 'Uploading...' : translations.changeImage}
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
                  {uploadingImage ? 'Uploading...' : translations.uploadImage}
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
      </div>
    </Modal>
  );
}
