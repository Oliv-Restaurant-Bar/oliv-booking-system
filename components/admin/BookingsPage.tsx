'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Download, Search, RefreshCw, ChevronLeft, ChevronRight, X, Filter } from 'lucide-react';
import { StatusDropdown } from './StatusDropdown';
import { Button } from '../user/Button';
import { SkeletonTable, SkeletonCalendar, SkeletonGrid } from '@/components/ui/skeleton-loaders';
import { ViewSwitcher, ViewMode } from './ViewSwitcher';
import { GridView } from './GridView';
import { CalendarView } from './CalendarView';
import { BookingDetailPage, type Booking } from './BookingDetailPage';
import * as XLSX from 'xlsx';
import { useBookingTranslation, useCommonTranslation } from '@/lib/i18n/client';

const allStatuses = [
  { label: 'All Status', value: 'All Status', dotColor: '' },
  { label: 'New', value: 'new', dotColor: '#8b5cf6' },
  { label: 'Pending', value: 'pending', dotColor: '#eab308' },
  { label: 'Confirmed', value: 'confirmed', dotColor: '#10b981' },
  { label: 'Touchbase', value: 'touchbase', dotColor: '#9DAE91' },
  { label: 'Declined', value: 'declined', dotColor: '#ef4444' },
  { label: 'Completed', value: 'completed', dotColor: '#3b82f6' },
];

export function BookingsPage({ user }: { user?: any }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useBookingTranslation();
  const commonT = useCommonTranslation();
  const [allBookingsData, setAllBookingsData] = useState<Booking[]>([]); // Store all fetched data
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<'list' | 'detail'>('list');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All Status');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const isFiltered = searchQuery !== '' || selectedStatus !== 'All Status';

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('All Status');
    setPage(1);
  };

  // Client-side filtering using useMemo for performance
  const filteredBookings = useMemo(() => {
    let filtered = [...allBookingsData];

    // Filter by search query (search in name, email, phone)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.customer.name.toLowerCase().includes(query) ||
        booking.customer.email.toLowerCase().includes(query) ||
        booking.customer.phone.toLowerCase().includes(query)
      );
    }

    // Filter by status
    if (selectedStatus !== 'All Status') {
      filtered = filtered.filter(booking => booking.status === selectedStatus);
    }

    return filtered;
  }, [allBookingsData, searchQuery, selectedStatus]);

  // Client-side pagination
  const totalCount = filteredBookings.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const paginatedBookings = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredBookings.slice(startIndex, endIndex);
  }, [filteredBookings, page, pageSize]);

  // Reset to first page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedStatus]);

  // Fetch all bookings once on mount and when refresh is clicked
  const fetchBookings = async () => {
    setLoading(true);
    try {
      // Fetch all bookings without server-side filters
      // Use the larger limit (1000) for both views to support calendar view
      // Sort by created_at by default, client-side will handle display
      const response = await fetch(`/api/bookings?page=1&limit=1000&sort=created_at`);
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setAllBookingsData(data.bookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setAllBookingsData([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount (only once)
  useEffect(() => {
    fetchBookings();
  }, []); // Empty dependency array = only run on mount

  // Handle deep linking from URL search params (?id=...)
  useEffect(() => {
    const bookingId = searchParams.get('id');
    if (bookingId && (!selectedBooking || selectedBooking.id !== bookingId)) {
      const fetchSingleBooking = async () => {
        try {
          const res = await fetch(`/api/bookings/${bookingId}`);
          if (res.ok) {
            const data = await res.json();
            setSelectedBooking(data);
            setCurrentPage('detail');
          } else {
            // If booking not found, clear the ID from URL
            router.replace('/admin/bookings');
          }
        } catch (err) {
          console.error('Error fetching deep-linked booking:', err);
          router.replace('/admin/bookings');
        }
      };
      fetchSingleBooking();
    } else if (!bookingId && currentPage === 'detail') {
      // Sync state if URL is cleared manually
      setCurrentPage('list');
      setSelectedBooking(null);
    }
  }, [searchParams]);

  // Status options for dropdown
  const statusOptions = allStatuses;

  const handleExport = () => {
    const excelData = filteredBookings.map((booking: Booking) => ({
      [t('exportColumns.customerName')]: booking.customer.name,
      [t('exportColumns.email')]: booking.customer.email,
      [t('exportColumns.phone')]: booking.customer.phone,
      [t('exportColumns.eventDate')]: booking.event.date,
      [t('exportColumns.time')]: booking.event.time,
      [t('exportColumns.guests')]: booking.guests,
      [t('exportColumns.occasion')]: booking.event.occasion,
      [t('exportColumns.amount')]: booking.amount,
      [t('exportColumns.status')]: booking.status,
      [t('exportColumns.contactedBy')]: booking.contactHistory?.[0]?.by || '',
      [t('exportColumns.contactedWhen')]: booking.contactHistory?.[0]?.date || '',
    }));
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings');
    XLSX.writeFile(workbook, `bookings_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="min-h-full bg-background flex flex-col">
      {/* List View */}
      {currentPage === 'list' && (
        <div className="w-full flex-1">
          {/* Search & Filter Bar */}
          <div className="bg-card border border-border rounded-xl p-4 mb-6 flex flex-col items-stretch gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-full sm:max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder={t('search')}
                  className="w-full pl-10 pr-10 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                  style={{ fontSize: 'var(--text-base)' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  ref={searchInputRef}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-accent rounded-full transition-colors"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <ViewSwitcher currentView={viewMode} onViewChange={setViewMode} />
                <div className="flex-1 sm:flex-none min-w-[140px]">
                  <StatusDropdown
                    options={statusOptions}
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                    className="w-full"
                  />
                </div>
                <div className="flex-1 sm:flex-none">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Download}
                    onClick={handleExport}
                    className="whitespace-nowrap w-full"
                  >
                    {t('export')}
                  </Button>
                </div>
                <button
                  onClick={fetchBookings}
                  disabled={loading}
                  className="p-2.5 border border-border bg-background hover:bg-accent rounded-lg transition-colors cursor-pointer flex-shrink-0"
                  title="Refresh"
                >
                  <RefreshCw className={`w-5 h-5 text-muted-foreground ${loading ? 'animate-spin' : ''}`} />
                </button>
                {/* {isFiltered && (
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2.5 border border-border bg-background hover:bg-accent rounded-lg transition-colors cursor-pointer flex-shrink-0 text-sm font-medium text-foreground"
                    title="Reset all filters"
                  >
                    Reset
                  </button>
                )} */}
              </div>
            </div>

            {/* Filter Indicator & Reset */}
            {isFiltered && (
              <div className="flex items-center justify-between pt-2 border-t border-border/50 animate-in fade-in slide-in-from-top-1 duration-200">
                <div className="flex items-center gap-2">
                  <div className="px-2 py-1 bg-primary/10 text-primary rounded-md flex items-center gap-1.5" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>
                    <Filter className="w-3.5 h-3.5" />
                    {t('filtersApplied')}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {searchQuery && (
                      <span className="px-2 py-1 bg-accent rounded-md text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                        Search: <span className="text-foreground font-medium">{searchQuery}</span>
                      </span>
                    )}
                    {selectedStatus !== 'All Status' && (
                      <span className="px-2 py-1 bg-accent rounded-md text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                        Status: <span className="text-foreground font-medium">{selectedStatus}</span>
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={resetFilters}
                  className="text-primary hover:text-secondary transition-colors underline underline-offset-4"
                  style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}
                >
                  Reset all filters
                </button>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex-1">
              {viewMode === 'grid' ? (
                <SkeletonGrid items={pageSize} cols={2} />
              ) : (
                <SkeletonCalendar />
              )}
            </div>
          )}

          {/* Empty State
          {!loading && bookingsData.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>{t('noBookings')}</p>
            </div>
          )} */}

          {!loading && (
            <div className="flex-1 flex flex-col">
              {viewMode === 'grid' && (
                <GridView
                  onOpenModal={(booking: Booking) => {
                    router.push(`/admin/bookings?id=${booking.id}`);
                  }}
                  bookings={paginatedBookings}
                />
              )}

              {viewMode === 'calendar' && (
                <CalendarView
                  onOpenModal={(booking: Booking) => {
                    router.push(`/admin/bookings?id=${booking.id}`);
                  }}
                  bookings={filteredBookings}
                />
              )}

              {/* Pagination Controls - Only show for grid view */}
              {viewMode === 'grid' && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-8 mt-4 border-t border-border">
                  <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                    {t('showing', {
                      from: (page - 1) * pageSize + 1,
                      to: Math.min(page * pageSize, totalCount),
                      total: totalCount
                    })}
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
            router.push('/admin/bookings');
          }}
        />
      )}
    </div>
  );
}
