'use client';

import { ListPlus, X, Plus, Check } from 'lucide-react';
import { Modal } from '@/components/user/Modal';
import { Button } from '@/components/user/Button';
import { NativeRadio } from '@/components/ui/NativeRadio';

interface AddonGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingGroupId: string | null;
  newGroup: {
    name: string;
    subtitle: string;
    type: 'optional' | 'mandatory';
    minSelect: number;
    maxSelect: number;
  };
  setNewGroup: (group: any) => void;
  onSubmit: () => Promise<void>;
  translations: {
    titleAdd: string;
    titleEdit: string;
    cancel: string;
    saveChanges: string;
    addGroup: string;
    nameLabel: string;
    namePlaceholder: string;
    typeLabel: string;
    optionalLabel: string;
    optionalDesc: string;
    mandatoryLabel: string;
    mandatoryDesc: string;
    requirementsTitle: string;
    minLabel: string;
    maxLabel: string;
  };
}

export function AddonGroupModal({
  isOpen,
  onClose,
  editingGroupId,
  newGroup,
  setNewGroup,
  onSubmit,
  translations,
}: AddonGroupModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={ListPlus}
      title={editingGroupId ? translations.titleEdit : translations.titleAdd}
      maxWidth="lg"
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
            icon={editingGroupId ? Check : Plus}
            onClick={onSubmit}
            disabled={!newGroup.name || newGroup.name.trim() === '' || newGroup.name.length > 100}
          >
            {editingGroupId ? translations.saveChanges : translations.addGroup}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
            {translations.nameLabel} *
          </label>
          <input
            type="text"
            maxLength={100}
            value={newGroup.name}
            onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
            placeholder={translations.namePlaceholder}
            className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            style={{ fontSize: 'var(--text-base)' }}
          />
          <p className="text-muted-foreground text-xs mt-1 text-right">{newGroup.name.length}/100</p>
        </div>

        <div>
          <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
            {translations.typeLabel}
          </label>
          <div className="flex gap-3">
            <label className="flex-1 cursor-pointer">
              <div className={`px-4 py-3 border-2 rounded-lg transition-all flex flex-col items-start gap-2 hover:border-primary/50 ${newGroup.type === 'optional' ? 'border-primary bg-primary/10' : 'border-border'}`}>
                <div className="flex items-center justify-between w-full gap-2">
                  <span className={`text-foreground ${newGroup.type === 'optional' ? 'text-primary' : ''}`} style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    {translations.optionalLabel}
                  </span>
                  <NativeRadio
                    name="groupType"
                    checked={newGroup.type === 'optional'}
                    onChange={() => setNewGroup({ ...newGroup, type: 'optional' })}
                  />
                </div>
                <span className="text-muted-foreground text-xs" style={{ fontSize: 'var(--text-small)' }}>
                  {translations.optionalDesc}
                </span>
              </div>
            </label>
            <label className="flex-1 cursor-pointer">
              <div className={`px-4 py-3 border-2 rounded-lg transition-all flex flex-col items-start gap-2 hover:border-primary/50 ${newGroup.type === 'mandatory' ? 'border-primary bg-primary/10' : 'border-border'}`}>
                <div className="flex items-center justify-between w-full gap-2">
                  <span className={`text-foreground ${newGroup.type === 'mandatory' ? 'text-primary' : ''}`} style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    {translations.mandatoryLabel}
                  </span>
                  <NativeRadio
                    name="groupType"
                    checked={newGroup.type === 'mandatory'}
                    onChange={() => setNewGroup({ ...newGroup, type: 'mandatory' })}
                  />
                </div>
                <span className="text-muted-foreground text-xs" style={{ fontSize: 'var(--text-small)' }}>
                  {translations.mandatoryDesc}
                </span>
              </div>
            </label>
          </div>
        </div>

        {newGroup.type === 'mandatory' && (
          <div className="p-4 bg-muted/30 border border-border rounded-lg space-y-4">
            <h4 className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
              {translations.requirementsTitle}
            </h4>
            <div>
              <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {translations.minLabel}
              </label>
              <input
                type="number"
                min="0"
                value={newGroup.minSelect}
                onChange={(e) => setNewGroup({ ...newGroup, minSelect: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                style={{ fontSize: 'var(--text-base)' }}
              />
            </div>
            <div>
              <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {translations.maxLabel}
              </label>
              <input
                type="number"
                min="1"
                value={newGroup.maxSelect}
                onChange={(e) => setNewGroup({ ...newGroup, maxSelect: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                style={{ fontSize: 'var(--text-base)' }}
              />
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
