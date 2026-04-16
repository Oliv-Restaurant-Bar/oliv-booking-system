'use client';

import { Search, Plus, Edit2, Trash2, Calendar } from 'lucide-react';
import { Button } from '../user/Button';
import { useMenuConfigTranslation, useCommonTranslation } from '@/lib/i18n/client';
import { useDateFormat } from '@/lib/contexts/SystemSettingsContext';
import { VisibilitySchedule } from '@/lib/types';

interface VisibilitiesTabProps {
  visibilitySchedules: VisibilitySchedule[];
  canManageSchedules: boolean;
  onAddSchedule: () => void;
  onEditSchedule: (schedule: VisibilitySchedule) => void;
  onDeleteSchedule: (id: string) => void;
}

export function VisibilitiesTab({
  visibilitySchedules,
  canManageSchedules,
  onAddSchedule,
  onEditSchedule,
  onDeleteSchedule,
}: VisibilitiesTabProps) {
  const t = useMenuConfigTranslation();
  const ct = useCommonTranslation();
  const { formatDate } = useDateFormat();

  return (
    <div className="bg-card border border-border rounded-xl">
      {/* Search Bar with Add Button */}
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3 w-full max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('placeholders.searchSchedules')}
              className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              style={{ fontSize: 'var(--text-base)' }}
            />
          </div>
        </div>
        {canManageSchedules && (
          <Button
            variant="primary"
            icon={Plus}
            onClick={onAddSchedule}
          >
            {t('buttons.addSchedule')}
          </Button>
        )}
      </div>

      {/* List of Schedules */}
      <div>
        {visibilitySchedules.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground flex flex-col items-center">
             <Calendar className="w-10 h-10 mb-3 opacity-50" />
             <p style={{ fontSize: 'var(--text-base)' }}>{t('messages.noSchedulesFound')}</p>
             <p className="mt-1 opacity-70" style={{ fontSize: 'var(--text-small)' }}>{t('messages.createScheduleDesc')}</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {visibilitySchedules.map((schedule) => (
              <div key={schedule.id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                <div>
                  <h4 className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                    {schedule.name}
                  </h4>
                  {schedule.description && (
                    <p className="text-muted-foreground mt-1" style={{ fontSize: 'var(--text-small)' }}>
                      {schedule.description}
                    </p>
                  )}
                  <p className="text-muted-foreground mt-1 flex items-center gap-1.5" style={{ fontSize: 'var(--text-small)' }}>
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDate(schedule.startDate)} {ct('to')} {formatDate(schedule.endDate)}
                  </p>
                </div>
                
                {canManageSchedules && (
                  <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                    <button
                      onClick={() => onEditSchedule(schedule)}
                      className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                      title={ct('edit')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteSchedule(schedule.id)}
                      className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                      title={ct('delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
