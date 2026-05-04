'use client';

import { Calendar, X, Check } from 'lucide-react';
import { Modal } from '../user/Modal';
import { Button } from '../user/Button';
import { useMenuConfigTranslation, useCommonTranslation } from '@/lib/i18n/client';
import { useDateFormat } from '@/lib/contexts/SystemSettingsContext';
import { Category, VisibilitySchedule } from '@/lib/types';

interface AssignVisibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignCategoryId: string | null;
  assignItemId: string | null;
  activeCategoryId: string | null;
  categories: Category[];
  visibilitySchedules: VisibilitySchedule[];
  selectedSchedules: string[];
  setSelectedSchedules: (ids: string[]) => void;
  onSave: () => Promise<void>;
  isSaving?: boolean;
}

export function AssignVisibilityModal({
  isOpen,
  onClose,
  assignCategoryId,
  assignItemId,
  activeCategoryId,
  categories,
  visibilitySchedules,
  selectedSchedules,
  setSelectedSchedules,
  onSave,
  isSaving = false,
}: AssignVisibilityModalProps) {
  const t = useMenuConfigTranslation();
  const ct = useCommonTranslation();
  const { formatDate } = useDateFormat();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      icon={Calendar}
      title={assignCategoryId ? 'Assign Visibility to Category' : 'Assign Visibility to Item'}
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
            icon={isSaving ? undefined : Check}
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : t('buttons.saveChanges')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-foreground mb-3" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
            Select Visibility Schedules
          </label>
          <p className="text-muted-foreground mb-4" style={{ fontSize: 'var(--text-small)' }}>
            Choose seasons or specific timeframes when this {assignItemId ? 'item' : 'category'} should be visible on the menu. 
            If no schedule is selected, it will be visible at all times.
          </p>

          <div className="grid grid-cols-2 gap-3">
            {visibilitySchedules.map((schedule) => {
              const isSelected = selectedSchedules.includes(schedule.id);
              return (
                <label
                  key={schedule.id}
                  className="cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedSchedules([...selectedSchedules, schedule.id]);
                      } else {
                        setSelectedSchedules(selectedSchedules.filter(id => id !== schedule.id));
                      }
                    }}
                    className="sr-only peer"
                  />
                  <div
                    className="px-4 py-3 bg-card border border-border rounded-lg transition-all hover:border-primary/50 peer-checked:border-primary peer-checked:bg-primary/5 h-full"
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
                          title={schedule.name}
                        >
                          {schedule.name}
                        </span>
                        <span className="text-muted-foreground truncate" style={{ fontSize: '10px' }}>
                          {formatDate(schedule.startDate)} - {formatDate(schedule.endDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          {selectedSchedules.length > 0 && (
            <p className="text-muted-foreground mt-3" style={{ fontSize: 'var(--text-small)' }}>
              {selectedSchedules.length} schedules selected
            </p>
          )}
          
          {visibilitySchedules.length === 0 && (
            <div className="p-6 text-center border-2 border-dashed border-border rounded-lg bg-muted/20">
               <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
               <p className="text-muted-foreground text-sm">No visibility schedules available.</p>
               <p className="text-muted-foreground text-xs mt-1">Go to the Visibilities tab to create one.</p>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
