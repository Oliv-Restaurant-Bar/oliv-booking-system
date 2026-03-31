'use client';

import { ListPlus, X, Check, Plus } from 'lucide-react';
import { Modal } from '../user/Modal';
import { Button } from '../user/Button';
import { NativeRadio } from '../ui/NativeRadio';
import { useMenuConfigTranslation, useCommonTranslation } from '@/lib/i18n/client';

interface AddGroupModalProps {
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
  onSave: () => Promise<void>;
  isSaving?: boolean;
}

export function AddGroupModal({
  isOpen,
  onClose,
  editingGroupId,
  newGroup,
  setNewGroup,
  onSave,
  isSaving,
}: AddGroupModalProps) {
  const t = useMenuConfigTranslation();
  const ct = useCommonTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={ListPlus}
      title={editingGroupId ? t('titles.editGroup') : t('titles.addGroup')}
      maxWidth="lg"
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
            icon={editingGroupId ? Check : Plus}
            onClick={onSave}
            isLoading={isSaving}
            disabled={!newGroup.name || newGroup.name.trim() === '' || newGroup.name.length > 100}
          >
            {isSaving ? ct('saving') : (editingGroupId ? t('buttons.saveChanges') : t('buttons.addGroup'))}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        <div>
          <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
            {t('labels.groupName')} *
          </label>
          <input
            type="text"
            maxLength={100}
            value={newGroup.name}
            onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
            placeholder={t('placeholders.groupName')}
            className="w-full px-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            style={{ fontSize: 'var(--text-base)' }}
          />
          <p className="text-muted-foreground text-xs mt-1 text-right">{newGroup.name.length}/100</p>
        </div>

        <div>
          <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
            {t('labels.type')}
          </label>
          <div className="flex gap-3">
            <label className="flex-1 cursor-pointer">
              <div className={`px-4 py-3 border-2 rounded-lg transition-all flex flex-col items-start gap-2 hover:border-primary/50 ${newGroup.type === 'optional' ? 'border-primary bg-primary/10' : 'border-border'}`}>
                <div className="flex items-center justify-between w-full gap-2">
                  <span className={`text-foreground ${newGroup.type === 'optional' ? 'text-primary' : ''}`} style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    {t('labels.addons')}
                  </span>
                  <NativeRadio
                    name="groupType"
                    checked={newGroup.type === 'optional'}
                    onChange={() => setNewGroup({ ...newGroup, type: 'optional' })}
                  />
                </div>
                <span className="text-muted-foreground text-xs" style={{ fontSize: 'var(--text-small)' }}>
                  {t('descriptions.optionalGroup')}
                </span>
              </div>
            </label>
            <label className="flex-1 cursor-pointer">
              <div className={`px-4 py-3 border-2 rounded-lg transition-all flex flex-col items-start gap-2 hover:border-primary/50 ${newGroup.type === 'mandatory' ? 'border-primary bg-primary/10' : 'border-border'}`}>
                <div className="flex items-center justify-between w-full gap-2">
                  <span className={`text-foreground ${newGroup.type === 'mandatory' ? 'text-primary' : ''}`} style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                    {t('labels.choices')}
                  </span>
                  <NativeRadio
                    name="groupType"
                    checked={newGroup.type === 'mandatory'}
                    onChange={() => setNewGroup({ ...newGroup, type: 'mandatory' })}
                  />
                </div>
                <span className="text-muted-foreground text-xs" style={{ fontSize: 'var(--text-small)' }}>
                  {t('descriptions.mandatoryGroup')}
                </span>
              </div>
            </label>
          </div>
        </div>

        {newGroup.type === 'mandatory' && (
          <div className="p-4 bg-muted/30 border border-border rounded-lg space-y-4">
            <h4 className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
              {t('labels.selectionRequirements')}
            </h4>

            <div>
              <label className="block text-foreground mb-2" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                {t('labels.minSelections')}
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
                {t('labels.maxSelections')}
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

            <div className="p-3 bg-card rounded-lg">
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                <strong>{t('labels.example')}:</strong> Min {newGroup.minSelect}, Max {newGroup.maxSelect} = "
                {newGroup.minSelect === newGroup.maxSelect
                  ? t('descriptions.selectionFixed', { count: newGroup.minSelect })
                  : newGroup.minSelect === 0
                    ? t('descriptions.selectionMax', { count: newGroup.maxSelect })
                    : t('descriptions.selectionRange', { min: newGroup.minSelect, max: newGroup.maxSelect })
                }"
              </p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
