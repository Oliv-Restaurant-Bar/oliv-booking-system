import { Mail, Calendar, Users, Phone, Clock, User } from 'lucide-react';
import { KitchenPdfStatusBadge } from './KitchenPdfStatusBadge';
import type { KitchenPdfStatus } from '@/services/kitchen-pdf.service';

// Status color configuration (matching BookingsPage)
const statusColors: Record<string, { bg: string; text: string; border: string; dotColor: string }> = {
  'confirmed': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dotColor: '#10b981' },
  'touchbase': { bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20', dotColor: '#9DAE91' },
  'new': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', dotColor: '#8b5cf6' },
  'pending': { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', dotColor: '#eab308' },
  'declined': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', dotColor: '#ef4444' },
  'completed': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', dotColor: '#3b82f6' },
};

// Normalize status key for lookup
const getStatusKey = (status: string) => status.toLowerCase();

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
  }>;
  onOpenModal: (booking: any) => void;
}

export function GridView({ onOpenModal, bookings }: GridViewProps) {
  if (bookings.length === 0) {
    return (
      <div className="bg-card border border-border rounded-xl p-12 text-center">
        <div className="text-muted-foreground mb-2">No bookings found</div>
        <div className="text-sm text-muted-foreground">Try adjusting your filters or search query</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-4">
      {bookings.map((booking) => (
        <div
          key={booking.id}
          className="bg-card border border-border rounded-xl p-4 md:p-5 hover:shadow-md transition-all"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white flex-shrink-0"
                style={{
                  backgroundColor: booking.customer.avatarColor,
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-semibold)'
                }}
              >
                {booking.customer.avatar}
              </div>
              <div>
                <h4
                  className="text-foreground"
                  style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}
                >
                  {booking.customer.name}
                </h4>
                <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                  {booking.event.occasion}
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 flex-wrap justify-end">
                {booking.kitchenPdf && (
                  <KitchenPdfStatusBadge
                    status={booking.kitchenPdf.sentStatus}
                    lastSentAt={booking.kitchenPdf.lastSentAt}
                  />
                )}
                <span
                  className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${statusColors[getStatusKey(booking.status)]?.bg
                    } ${statusColors[getStatusKey(booking.status)]?.text} ${statusColors[getStatusKey(booking.status)]?.border
                    }`}
                  style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                >
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: statusColors[getStatusKey(booking.status)]?.dotColor }}
                  />
                  {booking.status}
                </span>
              </div>
            </div>
          </div>

          {/* Refined Information Rows */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Mail className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground truncate" style={{ fontSize: 'var(--text-small)' }}>
                  {booking.customer.email}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-foreground" style={{ fontSize: 'var(--text-small)' }}>
                  {booking.event.date}
                </span>
              </div>
            </div>

            {/* Row 2: Phone + Guests */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                  {booking.customer.phone}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-foreground" style={{ fontSize: 'var(--text-small)' }}>
                  {booking.guests} guests
                </span>
              </div>
            </div>

            {/* Row 3: Contacted + Amount */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <User className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground truncate" style={{ fontSize: 'var(--text-small)' }}>
                  {booking.assignedTo ? booking.assignedTo.name : 'Unassigned'}
                </span>
              </div>
              {booking.event.location && (
                <div className="flex items-center gap-1.5 text-primary font-medium" style={{ fontSize: 'var(--text-small)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {booking.event.location}
                </div>
              )}
              <div className="flex items-center gap-2 flex-shrink-0">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span
                  className="text-foreground"
                  style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}
                >
                  {booking.amount}
                </span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => onOpenModal(booking)}
            className="w-full px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-secondary hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
            style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
          >
            View Details
          </button>
        </div>
      ))}
    </div>
  );
}
