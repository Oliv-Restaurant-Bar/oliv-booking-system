'use client';

import { Users, Clock, MapPin, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import { BookingStatusBadge } from './BookingStatusBadge';
import { Tooltip } from '@/components/user/Tooltip';
import { useTranslations } from 'next-intl';

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
    };
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

  return (
    <div
      className="p-3 bg-background border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground truncate">
            {booking.customer.name}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <BookingStatusBadge status={booking.status} />
          {booking.kitchenPdf?.sentStatus === 'sent' && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium">
              <CheckCircle2 className="w-2.5 h-2.5" />
              PDF
            </span>
          )}
        </div>
      </div>

      <div className="space-y-1">
        <div className="space-y-1.5 pt-1">
          {booking.event.location && (
            <div className="flex items-center gap-1.5 text-primary font-bold" style={{ fontSize: 'var(--text-small)' }}>
              <MapPin className="w-3.5 h-3.5" />
              <span>{booking.event.location}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
            {showDate && (
              <>
                <CalendarIcon className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{booking.event.date}</span>
                <span className="w-1 h-1 rounded-full bg-border" />
              </>
            )}
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span>{booking.event.time}</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
          <div className="flex items-center gap-2">
            <Users className="w-3 h-3 flex-shrink-0" />
            <span>{t('calendar.guests', { count: booking.guests })}</span>
            <span>•</span>
            <Tooltip title={t('tooltips.amount')} position="top">
              <span className="font-medium text-foreground">{booking.amount}</span>
            </Tooltip>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="px-2 py-1 border-2 border-border bg-transparent text-foreground hover:bg-secondary hover:text-secondary-foreground hover:border-secondary rounded-md transition-colors text-xs font-medium min-h-[24px] h-6 cursor-pointer"
          >
            {t('calendar.view')}
          </button>
        </div>
      </div>
    </div>
  );
}
