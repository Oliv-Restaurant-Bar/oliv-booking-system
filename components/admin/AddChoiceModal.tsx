'use client';

import { ListPlus, X, Check } from 'lucide-react';
import { Modal } from '../user/Modal';
import { Button } from '../user/Button';
import { useMenuConfigTranslation, useCommonTranslation } from '@/lib/i18n/client';
import { Category, AddonGroup } from '@/lib/types';

interface AddChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  choiceCategoryId: string | null;
  choiceItemId: string | null;
  activeCategoryId: string | null;
  categories: Category[];
  addonGroups: AddonGroup[];
  selectedAddonGroups: string[];
  setSelectedAddonGroups: (groups: string[]) => void;
  onSave: () => Promise<void>;
}

export function AddChoiceModal({
  isOpen,
  onClose,
  choiceCategoryId,
  choiceItemId,
  activeCategoryId,
  categories,
  addonGroups,
  selectedAddonGroups,
  setSelectedAddonGroups,
  onSave,
}: AddChoiceModalProps) {
  const t = useMenuConfigTranslation();
  const ct = useCommonTranslation();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={ListPlus}
      title={t('titles.addChoice')}
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
            icon={Check}
            onClick={onSave}
          >
            {t('buttons.saveChanges')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-foreground mb-3" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
            {t('labels.selectAddonGroups')}
          </label>
          <p className="text-muted-foreground mb-4" style={{ fontSize: 'var(--text-small)' }}>
            {t('descriptions.selectAddonGroups', { type: choiceItemId ? t('labels.item') : t('labels.category') })}
          </p>

          <div className="grid grid-cols-3 gap-3">
            {addonGroups.filter(group => {
              if (choiceItemId && activeCategoryId) {
                const parentCategory = categories.find(c => c.id === activeCategoryId);
                return !parentCategory?.assignedAddonGroups?.includes(group.id);
              }
              return true;
            }).map((group) => {
              const isSelected = selectedAddonGroups.includes(group.id);
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
                        setSelectedAddonGroups([...selectedAddonGroups, group.id]);
                      } else {
                        setSelectedAddonGroups(selectedAddonGroups.filter(id => id !== group.id));
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
                          title={group.name}
                        >
                          {group.name}
                        </span>
                        <span className="text-muted-foreground" style={{ fontSize: '10px' }}>
                          {group.items?.length || 0} {(group.items?.length || 0) === 1 ? t('labels.item') : t('labels.items')} • {group.minSelect > 0 || group.maxSelect === 1 ? t('labels.choice') : t('labels.addon')}
                        </span>
                      </div>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          {selectedAddonGroups.length > 0 && (
            <p className="text-muted-foreground mt-3" style={{ fontSize: 'var(--text-small)' }}>
              {selectedAddonGroups.length} {t('labels.selectedGroups')}
            </p>
          )}
          {choiceItemId && activeCategoryId && addonGroups.filter(group => {
            const parentCategory = categories.find(c => c.id === activeCategoryId);
            return !parentCategory?.assignedAddonGroups?.includes(group.id);
          }).length === 0 && (
              <p className="text-muted-foreground italic mt-3" style={{ fontSize: 'var(--text-small)' }}>
                {t('descriptions.noGroupsAvailable')}
              </p>
            )}
        </div>
      </div>
    </Modal>
  );
}
