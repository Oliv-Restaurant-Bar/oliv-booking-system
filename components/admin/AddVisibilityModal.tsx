'use client';

import { Calendar, X, Check, Plus } from 'lucide-react';
import { Modal } from '../user/Modal';
import { Button } from '../user/Button';
import { useMenuConfigTranslation, useCommonTranslation } from '@/lib/i18n/client';
import { useState } from 'react';

// Using native date inputs as the prompt mentions Date/Time selection simply.

interface AddVisibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingVisibilityId: string | null;
  newVisibility: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
  };
  setNewVisibility: (visibility: any) => void;
  onSave: () => Promise<void>;
  isSaving?: boolean;
}

export function AddVisibilityModal({
  isOpen,
  onClose,
  editingVisibilityId,
  newVisibility,
  setNewVisibility,
  onSave,
  isSaving = false,
}: AddVisibilityModalProps) {
  const t = useMenuConfigTranslation();
  const ct = useCommonTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={Calendar}
      title={editingVisibilityId ? 'Edit Visibility Schedule' : 'Add Visibility Schedule'}
      maxWidth="lg"
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
            icon={isSaving ? undefined : (editingVisibilityId ? Check : Plus)}
            onClick={onSave}
            disabled={isSaving || !newVisibility.name || newVisibility.name.trim() === '' || !newVisibility.startDate || !newVisibility.endDate}
          >
            {isSaving ? 'Saving...' : (editingVisibilityId ? t('buttons.saveChanges') : 'Add Schedule')}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
            Schedule Name *
          </label>
          <input
            type="text"
            maxLength={100}
            value={newVisibility.name || ''}
            onChange={(e) => setNewVisibility({ ...newVisibility, name: e.target.value })}
            placeholder="e.g. Summer Season, Weekend Only"
            className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            style={{ fontSize: 'var(--text-base)' }}
          />
        </div>

        <div>
           <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
            Description
          </label>
          <textarea
            maxLength={250}
            value={newVisibility.description || ''}
            onChange={(e) => setNewVisibility({ ...newVisibility, description: e.target.value })}
            placeholder="Optional description"
            className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring min-h-[80px]"
            style={{ fontSize: 'var(--text-base)' }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
              Start Date *
            </label>
            <input
              type="date"
              value={newVisibility.startDate || ''}
              onChange={(e) => setNewVisibility({ ...newVisibility, startDate: e.target.value })}
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              style={{ fontSize: 'var(--text-base)' }}
            />
          </div>
          <div>
            <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
              End Date *
            </label>
            <input
              type="date"
              value={newVisibility.endDate || ''}
              onChange={(e) => setNewVisibility({ ...newVisibility, endDate: e.target.value })}
              className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              style={{ fontSize: 'var(--text-base)' }}
              min={newVisibility.startDate || ''}
            />
          </div>
        </div>
      </div>
    </Modal>
  );
}
