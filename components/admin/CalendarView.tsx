'use client';

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Users, Clock, Check, MapPin, Calendar as CalendarIcon, CheckCircle2, XCircle, X, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

// Date utilities
const parseEventDate = (dateStr: string): Date => {
  // Try to parse various date formats
  const date = new Date(dateStr);
  if (!isNaN(date.getTime())) {
    return date;
  }

  // Parse dates like "Jun 15, 2026" or "Mar 20, 2026"
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11
  };

  const parts = dateStr.split(' ');
  if (parts.length >= 3) {
    const month = months[parts[0]] ?? 0;
    const day = parseInt(parts[1].replace(',', ''), 10);
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
  }
  return new Date();
};

const formatDateKey = (date: Date): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

const formatMonthYear = (date: Date): string => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return `${months[date.getMonth()]} ${date.getFullYear()}`;
};

// Status colors (matching other views)
const statusColors: Record<string, { color: string; bg: string; text: string; border: string }> = {
  'confirmed': { color: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'touchbase': { color: '#9DAE91', bg: 'bg-primary/10', text: 'text-primary', border: 'border-primary/20' },
  'new': { color: '#8b5cf6', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'declined': { color: '#ef4444', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  'completed': { color: '#3b82f6', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'pending': { color: '#eab308', bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200' },
};

const getStatusStyle = (status: string = 'pending') => {
  const s = status.toLowerCase();
  return statusColors[s] || statusColors.pending;
};

interface CalendarViewProps {
  bookings: Array<{
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
  }>;
  onOpenModal: (booking: any) => void;
}

interface DayBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date | null;
  bookings: any[];
  onOpenBooking: (booking: any) => void;
}

function DayBookingsModal({ isOpen, onClose, date, bookings, onOpenBooking }: DayBookingsModalProps) {
  if (!isOpen || !date) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border bg-muted/30">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {bookings.length} {bookings.length === 1 ? 'Booking' : 'Bookings'}
            </h2>
            <p className="text-sm text-muted-foreground">
              {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:bg-accent hover:text-foreground rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="group relative p-4 bg-background border border-border rounded-xl hover:border-primary/50 hover:bg-accent/30 transition-all cursor-pointer"
              onClick={() => onOpenBooking(booking)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                    style={{ backgroundColor: booking.customer.avatarColor || '#9DAE91' }}
                  >
                    {booking.customer.avatar || booking.customer.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{booking.customer.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{booking.event.occasion}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span
                    className={cn(
                      "px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border",
                      getStatusStyle(booking.status).bg,
                      getStatusStyle(booking.status).text,
                      getStatusStyle(booking.status).border
                    )}
                  >
                    {booking.status}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    {booking.event.time}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground border-t border-border/50 pt-3">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>{booking.guests} Guests</span>
                </div>
                {booking.event.location && (
                  <div className="flex items-center gap-1.5 text-primary/80">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[150px]">{booking.event.location}</span>
                  </div>
                )}
                <div className="ml-auto flex items-center gap-1 text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                  View <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border bg-muted/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-secondary text-secondary-foreground font-semibold rounded-xl hover:bg-secondary/80 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export function CalendarView({ bookings, onOpenModal }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDayModalOpen, setIsDayModalOpen] = useState(false);

  // Group bookings by date
  const bookingsByDate = useMemo(() => {
    const grouped = new Map<string, typeof bookings>();
    bookings.forEach(booking => {
      const bookingDate = parseEventDate(booking.event.date);
      const dateKey = formatDateKey(bookingDate);
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(booking);
    });
    return grouped;
  }, [bookings]);

  // Get upcoming bookings (next 5, sorted by date)
  const upcomingBookings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return bookings
      .map(b => ({ ...b, parsedDate: parseEventDate(b.event.date) }))
      .filter(b => b.parsedDate >= today)
      .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime())
      .slice(0, 5)
      .map(({ parsedDate, ...rest }) => rest);
  }, [bookings]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDay = firstDayOfMonth.getDay(); // 0 = Sunday
    const totalDays = lastDayOfMonth.getDate();

    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

    // Add days from previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const day = prevMonthLastDay - i;
      days.push({
        date: new Date(year, month - 1, day),
        isCurrentMonth: false
      });
    }

    // Add days from current month
    for (let day = 1; day <= totalDays; day++) {
      days.push({
        date: new Date(year, month, day),
        isCurrentMonth: true
      });
    }

    // Add days from next month to complete the grid (42 cells = 6 rows x 7 days)
    const remainingCells = 42 - days.length;
    for (let day = 1; day <= remainingCells; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false
      });
    }

    return days;
  }, [currentMonth]);

  // Get bookings for a specific date
  const getBookingsForDate = (date: Date): typeof bookings => {
    const dateKey = formatDateKey(date);
    return bookingsByDate.get(dateKey) || [];
  };

  // Navigate months
  const navigateMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* Calendar - 3 columns */}
      <div className="lg:col-span-3 bg-card border border-border rounded-xl p-4">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            {formatMonthYear(currentMonth)}
          </h3>
          <div className="flex gap-2">
            <button
              onClick={() => navigateMonth(-1)}
              className="px-2 py-1.5 border-2 border-border bg-transparent text-foreground hover:bg-secondary hover:text-secondary-foreground hover:border-secondary rounded-lg transition-colors text-xs font-medium min-h-[32px] h-8"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigateMonth(1)}
              className="px-2 py-1.5 border-2 border-border bg-transparent text-foreground hover:bg-secondary hover:text-secondary-foreground hover:border-secondary rounded-lg transition-colors text-xs font-medium min-h-[32px] h-8"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div
              key={day}
              className="text-center text-sm font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map(({ date, isCurrentMonth }, index) => {
            const dayBookings = getBookingsForDate(date);
            const isToday = date.toDateString() === new Date().toDateString();

            return (
              <div
                key={index}
                className={cn(
                  "min-h-24 p-1 border border-border rounded hover:bg-accent/50 transition-colors cursor-pointer",
                  !isCurrentMonth && "bg-muted/30 opacity-60",
                  isToday && "ring-2 ring-primary/20"
                )}
                onClick={() => {
                  if (dayBookings.length > 1) {
                    setSelectedDate(date);
                    setIsDayModalOpen(true);
                  } else if (dayBookings.length === 1) {
                    onOpenModal(dayBookings[0]);
                  }
                }}
              >
                <div className={cn(
                  "text-sm font-medium mb-1",
                  isToday ? "text-primary" : "text-foreground"
                )}>
                  {date.getDate()}
                </div>

                {/* Booking chips */}
                <div className="space-y-0.5">
                  {dayBookings.slice(0, 2).map(booking => (
                    <div
                      key={booking.id}
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded truncate flex items-center gap-1.5 border",
                        "cursor-pointer hover:opacity-80 transition-opacity"
                      )}
                      style={{
                        backgroundColor: `${getStatusStyle(booking.status).color}20`,
                        borderColor: getStatusStyle(booking.status).color,
                        color: getStatusStyle(booking.status).color
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (dayBookings.length > 1) {
                          setSelectedDate(date);
                          setIsDayModalOpen(true);
                        } else {
                          onOpenModal(booking);
                        }
                      }}
                      title={`${booking.customer.name} - ${booking.event.occasion}`}
                    >
                      <div className="flex flex-col flex-1 min-w-0 py-0.5">
                        {booking.event.location && (
                          <div className="flex items-center gap-1 opacity-80" style={{ fontSize: '9px' }}>
                            <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                            <span className="truncate">{booking.event.location}</span>
                          </div>
                        )}
                        <span className="truncate font-semibold">{booking.customer.name}</span>
                      </div>
                    </div>
                  ))}
                  {dayBookings.length > 2 && (
                    <div className="text-xs text-muted-foreground px-1.5 py-0.5">
                      +{dayBookings.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Bookings Sidebar - 1 column */}
      <div className="lg:col-span-1">
        <div className="bg-card border border-border rounded-xl p-4 sticky top-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Upcoming Bookings
          </h3>

          {upcomingBookings.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground text-sm">No upcoming bookings</div>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map(booking => (
                <div
                  key={booking.id}
                  className="p-3 bg-background border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => onOpenModal(booking)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0"
                        style={{ backgroundColor: booking.customer.avatarColor || '#9DAE91' }}
                      >
                        {booking.customer.avatar}
                      </div>
                      <div className="text-sm font-medium text-foreground truncate">
                        {booking.customer.name}
                      </div>
                    </div>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-md border flex items-center gap-1 text-xs font-medium",
                        getStatusStyle(booking.status).bg,
                        getStatusStyle(booking.status).text,
                        getStatusStyle(booking.status).border
                      )}
                    >
                      <div
                        className="w-1 h-1 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: getStatusStyle(booking.status).color
                        }}
                      />
                      {booking.status}
                    </span>
                    {booking.kitchenPdf?.sentStatus === 'sent' && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        PDF
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="space-y-1.5 pt-1">
                      {booking.event.location && (
                        <div className="flex items-center gap-1.5 text-primary font-bold" style={{ fontSize: 'var(--text-small)' }}>
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{booking.event.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
                        <span className="truncate">{booking.event.date}</span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <Clock className="w-3 h-3 flex-shrink-0 text-muted-foreground" />
                        <span>{booking.event.time}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                      <div className="flex items-center gap-2">
                        <Users className="w-3 h-3 flex-shrink-0" />
                        <span>{booking.guests} guests</span>
                        <span>•</span>
                        <span className="font-medium text-foreground">{booking.amount}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenModal(booking);
                        }}
                        className="px-2 py-1 border-2 border-border bg-transparent text-foreground hover:bg-secondary hover:text-secondary-foreground hover:border-secondary rounded-md transition-colors text-xs font-medium min-h-[24px] h-6"
                      >
                        View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Day Bookings Modal */}
      <DayBookingsModal
        isOpen={isDayModalOpen}
        onClose={() => setIsDayModalOpen(false)}
        date={selectedDate}
        bookings={selectedDate ? getBookingsForDate(selectedDate) : []}
        onOpenBooking={(booking) => {
          setIsDayModalOpen(false);
          onOpenModal(booking);
        }}
      />
    </div>
  );
}
