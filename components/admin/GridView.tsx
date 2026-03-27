import { Mail, Calendar, Users, Phone, Banknote, User } from 'lucide-react';
import { KitchenPdfStatusBadge } from './KitchenPdfStatusBadge';
import { BookingStatusBadge } from './BookingStatusBadge';
import { Tooltip } from '@/components/user/Tooltip';
import type { KitchenPdfStatus } from '@/services/kitchen-pdf.service';
import { formatRelativeTime } from '@/lib/utils/date';
import { useAdminTranslation, useCommonTranslation, useBookingTranslation } from '@/lib/i18n/client';
import { useTranslations } from 'next-intl';
import { useSystemTimezone } from '@/lib/hooks/useSystemTimezone';

interface GridViewProps {
  bookings: Array<{
    id: number | string;
    customer: {
      name: string;
      email: string;
      phone: string;
      avatar: string;
      avatarColor: string;
    };
    event: {
      date: string;
      occasion: string;
      location?: string;
    };
    guests: number;
    amount: string;
    status: string;
    contacted?: {
      by: string;
      when: string;
    };
    kitchenPdf?: KitchenPdfStatus;
    assignedTo?: {
      id: string;
      name: string;
      email: string;
    } | null;
    createdAt?: string;
  }>;
  onOpenModal: (booking: any) => void;
}

export function GridView({ onOpenModal, bookings }: GridViewProps) {
  const t = useAdminTranslation();
  const commonT = useCommonTranslation();
  const bookingT = useBookingTranslation();
  const calendarT = useTranslations('admin.bookings.calendar');
  const { timezone } = useSystemTimezone();

  if (bookings.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <div className="text-muted-foreground mb-2">{t('gridView.noBookings')}</div>
        <div className="text-sm text-muted-foreground">{t('gridView.tryAdjustFilters')}</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 md:gap-4">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="bg-card border border-border rounded-xl p-4 md:p-5 hover:shadow-md transition-all h-full flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3 min-h-[44px]">
            <div className="flex items-center gap-3 min-w-0">
              <div className="min-w-0">
                <h4
                  className="text-foreground truncate"
                  style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
                  title={booking.customer?.name}
                >
                  {booking.customer?.name || 'Unknown'}
                </h4>
                <p className="text-muted-foreground truncate" style={{ fontSize: 'var(--text-small)' }} title={booking.event?.occasion}>
                  {booking.event?.occasion || ''}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {booking.kitchenPdf && (
                  <KitchenPdfStatusBadge
                    status={booking.kitchenPdf.sentStatus}
                    lastSentAt={booking.kitchenPdf.lastSentAt}
                  />
                )}
                <BookingStatusBadge status={booking.status} />
              </div>
            </div>
          </div>

          {/* Refined Information Rows */}
          <div className="space-y-2 mb-4 flex-1">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground truncate" style={{ fontSize: 'var(--text-small)' }} title={booking.customer?.email || ''}>
                  {booking.customer?.email || ''}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-foreground" style={{ fontSize: 'var(--text-small)' }}>
                  {booking.event?.date || ''}
                </span>
              </div>
            </div>

            {/* Row 2: Phone + Guests */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground truncate" style={{ fontSize: 'var(--text-small)' }} title={booking.customer?.phone || ''}>
                  {booking.customer?.phone || ''}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-foreground" style={{ fontSize: 'var(--text-small)' }}>
                  {calendarT('guests', { count: booking.guests || 0 })}
                </span>
              </div>
            </div>

            {/* Row 3: Assigned + Time + Venue + Amount */}
            <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-4 pt-1">
              {/* Assigned section - can take up whole line or wrap venue to next line */}
              <div className="flex items-center gap-2 flex-1 min-w-[150px]">
                <User className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <div className="flex items-baseline gap-1 min-w-0 flex-1 overflow-hidden h-5">
                  {booking.assignedTo ? (
                    <span 
                      className="text-muted-foreground truncate" 
                      style={{ fontSize: 'var(--text-small)' }}
                      title={booking.assignedTo.name}
                    >
                      {booking.assignedTo.name}
                    </span>
                  ) : (
                    <Tooltip title={bookingT('tooltips.notAssignedYet')} position="top">
                      <span className="text-muted-foreground truncate" style={{ fontSize: 'var(--text-small)' }} title={bookingT('notAssignedYet')}>
                        {bookingT('notAssignedYet')}
                      </span>
                    </Tooltip>
                  )}
                  {booking.createdAt && (
                    <span className="opacity-60 font-normal flex-shrink-0" style={{ fontSize: 'var(--text-small)' }}>
                      • {formatRelativeTime(booking.createdAt, timezone)}
                    </span>
                  )}
                </div>
              </div>

              {/* Venue + Amount - often grouped together at the end */}
              <div className="flex items-center gap-4 flex-shrink-0 ml-auto md:ml-0">
                {booking.event?.location && (
                  <div className="flex items-center gap-1.5 text-primary font-medium" style={{ fontSize: 'var(--text-small)' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                    <span className="truncate max-w-[120px]" title={booking.event.location}>
                      {booking.event.location}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Banknote className="w-3.5 h-3.5 text-muted-foreground" />
                  <Tooltip title={t('bookings.tooltips.amount')} position="top">
                    <span
                      className="text-foreground"
                      style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}
                    >
                      {booking.amount}
                    </span>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => onOpenModal(booking)}
            className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-secondary hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
            style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
          >
            {commonT('viewDetails')}
          </button>
        </div>
      ))}
    </div>
  );
}
