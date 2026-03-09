'use client';

import { Clock, MapPin, Users, Calendar as CalendarIcon, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { BookingStatusBadge } from './BookingStatusBadge';
import { KitchenPdfStatusBadge } from './KitchenPdfStatusBadge';

export interface BookingCardData {
  id: string;
  customer: {
    name: string;
    avatar: string;
    avatarColor: string;
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
    lastSentAt?: string;
  };
}

interface BookingCardProps {
  booking: BookingCardData;
  onClick: () => void;
  compact?: boolean;
  showViewButton?: boolean;
}

export function BookingCard({ booking, onClick, compact = false, showViewButton = true }: BookingCardProps) {
  return (
    <div
      className={cn(
        "border border-border rounded-xl hover:border-primary/50 hover:bg-accent/30 transition-all cursor-pointer group",
        compact ? "p-3 bg-background" : "p-4 bg-background"
      )}
      onClick={onClick}
    >
      {/* Header - Customer Info & Status */}
      <div className={cn(
        "flex items-center justify-between mb-2",
        compact ? "mb-2" : "mb-3"
      )}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className={cn(
              "rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0",
              compact ? "w-6 h-6 text-xs" : "w-10 h-10 text-sm"
            )}
            style={{ backgroundColor: booking.customer.avatarColor || '#9DAE91' }}
          >
            {booking.customer.avatar || booking.customer.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h3 className={cn(
              "font-semibold text-foreground truncate",
              compact ? "text-sm" : "text-base"
            )}>
              {booking.customer.name}
            </h3>
            {!compact && (
              <p className="text-xs text-muted-foreground truncate">
                {booking.event.occasion}
              </p>
            )}
          </div>
        </div>
        <div className={cn(
          "flex items-center gap-1.5",
          compact ? "flex-col items-end gap-1" : "flex flex-col items-end gap-1.5"
        )}>
          <div className="flex items-center gap-2">
            {booking.kitchenPdf?.sentStatus === 'sent' && (
              <KitchenPdfStatusBadge
                status={booking.kitchenPdf.sentStatus}
                compact
              />
            )}
            <BookingStatusBadge status={booking.status} />
          </div>
        </div>
      </div>

      {/* Details - Location, Time, Guests, Amount */}
      <div className={cn(
        "space-y-1",
        !compact && "pt-3 border-t border-border/10"
      )}>
        <div className={cn(
          "flex items-center gap-4 text-muted-foreground",
          compact ? "text-xs" : "text-xs"
        )}>
          {booking.event.location && (
            <div className="flex items-center gap-1.5 text-primary font-bold">
              <MapPin className={cn("flex-shrink-0", compact ? "w-3 h-3" : "w-3.5 h-3.5")} />
              <span>{booking.event.location}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <CalendarIcon className={cn("flex-shrink-0 text-muted-foreground", compact ? "w-3 h-3" : "w-3 h-3")} />
            <span className="truncate">{booking.event.date}</span>
            <span className="w-1 h-1 rounded-full bg-border" />
            <Clock className={cn("flex-shrink-0 text-muted-foreground", compact ? "w-3 h-3" : "w-3 h-3")} />
            <span>{booking.event.time}</span>
          </div>

          <span className="w-1 h-1 rounded-full bg-border" />

          <div className="flex items-center gap-1.5">
            <Users className={cn("flex-shrink-0", compact ? "w-3 h-3" : "w-3.5 h-3.5")} />
            <span>{booking.guests} guests</span>
          </div>

          <span className="w-1 h-1 rounded-full bg-border" />

          <span className="font-medium text-foreground">{booking.amount}</span>
        </div>

        {showViewButton && (
          <div className="flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
              className={cn(
                "border-2 border-border bg-transparent text-foreground hover:bg-secondary hover:text-secondary-foreground hover:border-secondary rounded-lg transition-colors font-bold flex items-center gap-1.5 whitespace-nowrap",
                compact ? "px-2 py-1 text-xs min-h-[24px] h-6" : "px-3 py-1.5 text-xs opacity-0 group-hover:opacity-100"
              )}
            >
              View <ExternalLink className={cn(compact ? "w-3 h-3" : "w-3 h-3")} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
