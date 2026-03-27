'use client';

import { useState, useEffect } from 'react';
import { TrendingItems } from './TrendingItems';
import { MonthlyReportLayout2 } from './MonthlyReportLayout2';
import { SkeletonList, SkeletonTrendingItems, SkeletonMonthlyReport } from '@/components/ui/skeleton-loaders';
import { useTranslations } from 'next-intl';
import { SettingsService } from '@/services/settings.service';

export function ReportsPage({ user }: { user?: any }) {
  const t = useTranslations('admin.reports');
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [bookingsByContacts, setBookingsByContacts] = useState<any[]>([]);
  const [monthlyReport, setMonthlyReport] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currencySymbol, setCurrencySymbol] = useState('CHF');

  // Fetch reports data on component mount
  useEffect(() => {
    const fetchReportsData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/reports?year=${selectedYear}`);
        if (response.ok) {
          const data = await response.json();
          setBookingsByContacts(data.topCustomers || []);
          setMonthlyReport(data.monthlyReport || []);
        } else {
          setBookingsByContacts([]);
          setMonthlyReport([]);
        }
      } catch (error) {
        console.error('Error fetching reports data:', error);
        setBookingsByContacts([]);
        setMonthlyReport([]);
      } finally {
        setLoading(false);
      }
    };

    // Load currency symbol
    SettingsService.getCurrencySymbol().then(symbol => {
      if (symbol) {
        setCurrencySymbol(symbol);
      }
    });

    fetchReportsData();
  }, [selectedYear]);

  return (
    <div className="min-h-full bg-background flex flex-col">
      <div className="w-full space-y-6 flex-1">
        {/* Loading State - Aligned with loading.tsx */}
        {loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <SkeletonList items={5} />
              <SkeletonTrendingItems />
            </div>
            <SkeletonMonthlyReport />
          </div>
        )}

        {!loading && (
          <>
            {/* Top Customers and Trending Items - 2 Column Grid on Desktop */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Top Customers */}
              <div className="bg-card border border-border rounded-xl p-4 md:p-6">
                <h3 className="text-foreground mb-4 md:mb-6" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {t('topCustomers')}
                </h3>
                <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
                  {bookingsByContacts.slice(0, 5).map((contact, index) => (
                    <div
                      key={index}
                      className={`flex items-center gap-3 md:gap-4 py-3 hover:bg-accent/50 transition-colors ${index < 4 ? 'border-b border-border' : ''
                        }`}
                    >
                      {/* Rank */}
                      <div className="text-muted-foreground w-5 md:w-6 flex-shrink-0" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                        {index + 1}
                      </div>

                      {/* Avatar */}
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                          {contact.name.charAt(0)}
                        </span>
                      </div>

                      {/* Customer Details */}
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground truncate" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }} title={contact.name}>
                          {contact.name}
                        </p>
                        <p className="text-muted-foreground hidden sm:block" style={{ fontSize: 'var(--text-small)' }}>
                          {contact.phone}
                        </p>
                      </div>

                      {/* Revenue Stats */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                          {currencySymbol} {contact.totalRevenue.toLocaleString()}
                        </p>
                        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                          {t('bookings', { count: Math.floor(contact.bookings) })}
                        </p>
                      </div>

                      {/* Additional Stats - Hide on small screens/laptops */}
                      <div className="text-right hidden xl:block flex-shrink-0">
                        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                          {t('avgRevenue', { amount: contact.avgRevenue.toLocaleString() })}
                        </p>
                        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                          {t('guests', { count: contact.totalPersons })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trending Items */}
              <TrendingItems />
            </div>

            {/* Monthly Booking Report */}
            <MonthlyReportLayout2 data={monthlyReport} user={user} selectedYear={selectedYear} onYearChange={setSelectedYear} currencySymbol={currencySymbol} />
          </>
        )}

      </div>
    </div>
  );
}