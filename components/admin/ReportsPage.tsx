'use client';

import { useState, useEffect } from 'react';
import { TrendingItems } from './TrendingItems';
import { MonthlyReportLayout2 } from './MonthlyReportLayout2';
import { SkeletonList, SkeletonTrendingItems, SkeletonMonthlyReport } from '@/components/ui/skeleton-loaders';
import { useTranslations } from 'next-intl';
import { SettingsService } from '@/services/settings.service';

interface ReportsPageProps {
  user?: any;
  initialData?: any;
}

export function ReportsPage({ user, initialData }: ReportsPageProps) {
  const t = useTranslations('admin.reports');
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear()));
  const [bookingsByContacts, setBookingsByContacts] = useState<any[]>(initialData?.topCustomers || []);
  const [monthlyReport, setMonthlyReport] = useState<any[]>(initialData?.monthlyReport || []);
  const [loading, setLoading] = useState(!initialData);
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

    // Fetch reports data only if not provided by SSR or if year changed
    if (!initialData || selectedYear !== String(new Date().getFullYear())) {
      fetchReportsData();
    }
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

                      {/* Profit Stats */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20 inline-block" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                          {currencySymbol} {contact.totalProfit.toLocaleString('en-US')}
                        </p>
                        <div className="flex items-center justify-end gap-1 mt-1 text-emerald-600 dark:text-emerald-400" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-medium)' }}>
                          <span className="opacity-70">{(contact.profitMargin || 0)}%</span>
                          <span>{t('profitMargin', { defaultValue: 'Margin' }) || 'Margin'}</span>
                        </div>
                      </div>

                      {/* Revenue & Bookings - Hide on small screens/laptops */}
                      <div className="text-right hidden xl:block flex-shrink-0 min-w-[120px]">
                        <p className="text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                          {t('totalRevenueAmount', { amount: contact.totalRevenue.toLocaleString('en-US') })}
                        </p>
                        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                          {t('bookings', { count: Math.floor(contact.bookings) })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Calculation Logic Footer */}
                <div className="mt-6 pt-4 border-t border-border">
                  <p className="text-muted-foreground flex items-center gap-1.5" style={{ fontSize: '11px', lineHeight: '1.4' }}>
                    <span className="font-semibold text-foreground/70">{t('marginCalcLabel', { defaultValue: 'Margin Logic:' })}</span>
                    <span>{currencySymbol} (Total Revenue - Internal Cost) / Total Revenue  * 100%</span>
                  </p>
                </div>
              </div>

              {/* Trending Items */}
              <TrendingItems trendingData={initialData?.trendingItems} currencySymbol={currencySymbol} />
            </div>

            {/* Monthly Booking Report */}
            <MonthlyReportLayout2 data={monthlyReport} user={user} selectedYear={selectedYear} onYearChange={setSelectedYear} currencySymbol={currencySymbol} />
          </>
        )}

      </div>
    </div>
  );
}