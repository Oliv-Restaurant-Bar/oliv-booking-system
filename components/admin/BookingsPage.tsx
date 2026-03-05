'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, Search, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { StatusDropdown } from './StatusDropdown';
import { Button } from '../user/Button';
import { ViewSwitcher, ViewMode } from './ViewSwitcher';
import { GridView } from './GridView';
import { CalendarView } from './CalendarView';
import { BookingDetailPage, type Booking } from './BookingDetailPage';
import * as XLSX from 'xlsx';

const allStatuses = [
  { label: 'All Status', value: 'All Status', dotColor: '' },
  { label: 'New', value: 'New', dotColor: '#8b5cf6' },
  { label: 'Pending', value: 'Pending', dotColor: '#eab308' },
  { label: 'Confirmed', value: 'Confirmed', dotColor: '#10b981' },
  { label: 'Touchbase', value: 'Touchbase', dotColor: '#9DAE91' },
  { label: 'Declined', value: 'Declined', dotColor: '#ef4444' },
  { label: 'Completed', value: 'Completed', dotColor: '#3b82f6' },
];

export function BookingsPage({ user }: { user?: any }) {
  const [bookingsData, setBookingsData] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<'list' | 'detail'>('list');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to first page on status change
  useEffect(() => {
    setPage(1);
  }, [selectedStatus]);

  // Fetch bookings whenever page, status, or search changes
  const fetchBookings = async () => {
    setLoading(true);
    try {
      // For calendar view, we want to fetch all relevant bookings without pagination
      // and potentially focus on upcoming ones
      const limit = viewMode === 'calendar' ? 1000 : pageSize;
      const p = viewMode === 'calendar' ? 1 : page;
      const sort = viewMode === 'calendar' ? 'event_date' : 'created_at';

      const response = await fetch(`/api/bookings?page=${p}&limit=${limit}&search=${debouncedSearch}&status=${selectedStatus}&sort=${sort}`);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookingsData(data.bookings);
      setTotalCount(data.totalCount);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setBookingsData([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, debouncedSearch, selectedStatus, viewMode]);

  // Status options for dropdown
  const statusOptions = allStatuses;

  const handleExport = () => {
    const excelData = bookingsData.map(booking => ({
      'Customer Name': booking.customer.name,
      'Email': booking.customer.email,
      'Phone': booking.customer.phone,
      'Event Date': booking.event.date,
      'Time': booking.event.time,
      'Guests': booking.guests,
      'Occasion': booking.event.occasion,
      'Amount': booking.amount,
      'Status': booking.status,
      'Contacted By': booking.contactHistory?.[0]?.by || '',
      'Contacted When': booking.contactHistory?.[0]?.date || '',
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');
    XLSX.writeFile(workbook, `bookings_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="min-h-full bg-background px-4 md:px-8 pt-6 pb-1 flex flex-col">
      {/* List View */}
      {currentPage === 'list' && (
        <div className="w-full flex-1">
          {/* Search & Filter Bar */}
          <div className="bg-card border border-border rounded-xl p-4 mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-full sm:max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                style={{ fontSize: 'var(--text-base)' }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                ref={searchInputRef}
              />
            </div>
            <div className="flex items-center gap-3">
              <ViewSwitcher currentView={viewMode} onViewChange={setViewMode} />
              <StatusDropdown options={statusOptions} value={selectedStatus} onChange={setSelectedStatus} />
              <Button variant="primary" icon={Download} onClick={handleExport}>
                Export
              </Button>
              <button
                onClick={fetchBookings}
                disabled={loading}
                className="p-2 hover:bg-accent rounded-lg transition-colors cursor-pointer"
                title="Refresh"
              >
                <RefreshCw className={`w-5 h-5 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-16">
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>Loading bookings...</p>
            </div>
          )}

          {/* Empty State
          {!loading && bookingsData.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>No bookings found</p>
            </div>
          )} */}

          {!loading && (
            <div className="flex-1 flex flex-col">
              {viewMode === 'grid' && (
                <GridView
                  onOpenModal={(booking: Booking) => {
                    setSelectedBooking(booking);
                    setCurrentPage('detail');
                  }}
                  bookings={bookingsData}
                />
              )}

              {viewMode === 'calendar' && (
                <CalendarView
                  onOpenModal={(booking: Booking) => {
                    setSelectedBooking(booking);
                    setCurrentPage('detail');
                  }}
                  bookings={bookingsData}
                />
              )}

              {/* Pagination Controls - Only show for grid view */}
              {viewMode === 'grid' && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 mt-4 border-t border-border">
                  <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                    Showing <span className="text-foreground font-medium">{(page - 1) * pageSize + 1}</span> to <span className="text-foreground font-medium">{Math.min(page * pageSize, totalCount)}</span> of <span className="text-foreground font-medium">{totalCount}</span> bookings
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-5 h-5" /></button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(p => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
                      .map((p, i, arr) => (
                        <div key={p} className="flex items-center gap-1.5">
                          {i > 0 && arr[i - 1] !== p - 1 && <span className="text-muted-foreground px-1">...</span>}
                          <button onClick={() => setPage(p)} className={`w-10 h-10 rounded-lg border transition-all ${page === p ? 'bg-primary border-primary text-primary-foreground' : 'border-border hover:bg-accent text-foreground'}`} style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>{p}</button>
                        </div>
                      ))}
                    <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg border border-border hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-5 h-5" /></button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Detail View */}
      {currentPage === 'detail' && selectedBooking && (
        <BookingDetailPage
          bookingId={selectedBooking.id}
          booking={selectedBooking}
          user={user}
          onBack={() => {
            setCurrentPage('list');
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
}
