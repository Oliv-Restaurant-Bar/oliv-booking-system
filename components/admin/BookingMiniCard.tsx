'use client';

import { Users, Clock, MapPin, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { BookingStatusBadge } from './BookingStatusBadge';
import { Tooltip } from '@/components/user/Tooltip';
import { useTranslations } from 'next-intl';
import { useDateFormat } from '@/lib/contexts/SystemSettingsContext';

interface BookingMiniCardProps {
  booking: {
    id: string;
    customer: {
      name: string;
    };
    event: {
      date: string;
      time: string;
      occasion: string;
      location?: string;
      room?: string;
    };
    room?: string;
    guests: number;
    amount: string;
    status: string;
    kitchenPdf?: {
      sentStatus: 'sent' | 'failed' | 'not_sent';
    };
  };
  onClick: () => void;
  showDate?: boolean;
}

export function BookingMiniCard({ booking, onClick, showDate = true }: BookingMiniCardProps) {
  const t = useTranslations('admin.bookings');
  const { formatDate } = useDateFormat();

  return (
    <div
      className="group p-4 bg-card border border-border rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 cursor-pointer overflow-hidden relative"
      onClick={onClick}
    >
      {/* Header Row: Name & Amount */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-[15px] font-bold text-foreground truncate leading-tight group-hover:text-primary transition-colors" title={booking.customer?.name || 'Unknown'}>
            {booking.customer?.name || 'Unknown'}
          </h4>
          <div className="flex items-center gap-1.5 mt-1.5 min-w-0">
            <BookingStatusBadge status={booking.status} className="h-5 text-[10px] px-2 py-0 shrink-0" />
            {booking.kitchenPdf?.sentStatus === 'sent' && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase tracking-wider shrink-0">
                <CheckCircle2 className="w-2.5 h-2.5" />
                PDF
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <Tooltip title={t('tooltips.amount')} position="top">
            <span className="text-sm font-bold text-primary block">
              {booking.amount}
            </span>
          </Tooltip>
        </div>
      </div>

      {/* Details Row */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-3 border-y border-border/50">
        {/* Date (Only if showDate is true) */}
        {showDate && (
          <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
            <CalendarIcon className="w-3.5 h-3.5 shrink-0 text-primary/70" />
            <span className="text-[11px] font-medium truncate" title={booking.event?.date || ''}>
              {booking.event?.date ? formatDate(booking.event.date) : ''}
            </span>
          </div>
        )}

        {/* Time */}
        <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
          <Clock className="w-3.5 h-3.5 shrink-0 text-primary/70" />
          <span className="text-[11px] font-medium truncate" title={booking.event?.time || ''}>{booking.event?.time || ''}</span>
        </div>
        
        {/* Guests */}
        <div className="flex items-center gap-1.5 text-muted-foreground min-w-0">
          <Users className="w-3.5 h-3.5 shrink-0 text-primary/70" />
          <span className="text-[11px] font-medium truncate" title={t('calendar.guests', { count: booking.guests || 0 })}>
            {t('calendar.guests', { count: booking.guests || 0 })}
          </span>
        </div>

        {/* Location (prioritize room over city) */}
        {(booking.room || booking.event?.location) && (
          <div className="flex items-center gap-1.5 text-primary min-w-0">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] font-bold truncate" title={booking.room || booking.event.location}>
              {booking.room || booking.event.location}
            </span>
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="mt-3 flex items-center justify-end">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="group/btn inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/5 text-primary-foreground hover:bg-secondary hover:text-white rounded-lg transition-all text-[11px] font-bold shrink-0 border border-secondary/10 hover:border-secondary"
        >
          {t('calendar.view')}
          <span className="transition-transform group-hover/btn:translate-x-0.5">→</span>
        </button>
      </div>
    </div>
  );
}
