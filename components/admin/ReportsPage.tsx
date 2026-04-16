'use client';

import { useState, useEffect } from 'react';
import { TrendingItems } from './TrendingItems';
import { MonthlyReportLayout2 } from './MonthlyReportLayout2';
import { SkeletonList, SkeletonTrendingItems, SkeletonMonthlyReport } from '@/components/ui/skeleton-loaders';
import { useTranslations } from 'next-intl';
import { SettingsService } from '@/services/settings.service';
import { Tooltip } from '@/components/user/Tooltip';

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
            {/* Top Customers and Trending Items - Stacked vertically */}
            <div className="space-y-6">
              {/* Top Customers - Full Width Table View */}
              <div className="bg-card border border-border rounded-xl p-4 md:p-6 shadow-sm">
                <h3 className="text-foreground mb-6" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                  {t('topCustomers')}
                </h3>
                
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 bg-muted/30 rounded-lg mb-2 text-muted-foreground font-semibold uppercase tracking-wider" style={{ fontSize: '11px' }}>
                  <div className="col-span-1">#</div>
                  <div className="col-span-2">{t('customerName')}</div>
                  <div className="col-span-1">{t('phoneNumber')}</div>
                  <div className="col-span-1 text-center">{t('bookingsLabel')}</div>
                  <div className="col-span-1 text-center">{t('guestsLabel')}</div>
                  <div className="col-span-2 text-right">{t('salesPrice')}</div>
                  <div className="col-span-2 text-right">{t('internalCost')}</div>
                  <div className="col-span-2 text-right">{t('profit')}</div>
                </div>

                <div className="space-y-1">
                  {bookingsByContacts.slice(0, 5).map((contact, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center px-4 py-4 hover:bg-accent/50 transition-all duration-200 rounded-xl group border border-transparent hover:border-border"
                    >
                      {/* Rank & Customer (Mobile Header style on small screens) */}
                      <div className="col-span-12 md:col-span-3 flex items-center gap-3">
                        <div className="text-muted-foreground w-6 font-bold" style={{ fontSize: 'var(--text-base)' }}>
                          {index + 1}
                        </div>
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                          <span className="text-primary font-bold" style={{ fontSize: 'var(--text-base)' }}>
                            {contact.name.charAt(0)}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground font-semibold truncate" style={{ fontSize: 'var(--text-base)' }} title={contact.name}>
                            {contact.name}
                          </p>
                          <p className="text-muted-foreground md:hidden" style={{ fontSize: 'var(--text-small)' }}>
                            {contact.phone}
                          </p>
                        </div>
                      </div>

                      {/* Phone Number (Hidden on mobile as it's under Name) */}
                      <div className="hidden md:block col-span-1 text-muted-foreground truncate" style={{ fontSize: 'var(--text-small)' }}>
                        {contact.phone}
                      </div>

                      {/* Bookings Count */}
                      <div className="hidden md:block col-span-1 text-center text-foreground font-medium" style={{ fontSize: 'var(--text-small)' }}>
                        {contact.bookings}
                      </div>

                      {/* Total Guests */}
                      <div className="hidden md:block col-span-1 text-center text-foreground font-medium" style={{ fontSize: 'var(--text-small)' }}>
                        {contact.totalPersons}
                      </div>

                      {/* Sales Price */}
                      <div className="col-span-6 md:col-span-2 md:text-right flex md:block justify-between items-center">
                        <span className="md:hidden text-xs text-muted-foreground uppercase font-bold">{t('salesPrice')}</span>
                        <p className="text-foreground font-semibold" style={{ fontSize: 'var(--text-small)' }}>
                          {currencySymbol} {contact.totalRevenue.toLocaleString('en-US')}
                        </p>
                      </div>

                      {/* Internal Cost */}
                      <div className="col-span-6 md:col-span-2 md:text-right flex md:block justify-between items-center">
                        <span className="md:hidden text-xs text-muted-foreground uppercase font-bold">{t('internalCost')}</span>
                        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                          {currencySymbol} {(contact as any).totalInternalCost?.toLocaleString('en-US') || '0'}
                        </p>
                      </div>

                      {/* Profit & Margin */}
                      <div className="col-span-12 md:col-span-2 md:text-right flex md:block justify-between items-center pt-2 md:pt-0 border-t md:border-t-0 border-border/50">
                        <span className="md:hidden text-xs text-muted-foreground uppercase font-bold">{t('profit')}</span>
                        <div>
                          <Tooltip title={t('profit')} position='bottom'>
                            <p className="text-primary font-bold inline-block" style={{ fontSize: 'var(--text-small)' }}>
                              {currencySymbol} {contact.totalProfit.toLocaleString('en-US')}
                            </p>
                          </Tooltip>
                          <div className="flex items-center justify-end gap-1 mt-0.5 text-emerald-600 dark:text-emerald-400 font-medium" style={{ fontSize: '11px' }}>
                            <span>{(contact.profitMargin || 0)}%</span>
                            <span className="opacity-80">{t('profitMargin', { defaultValue: 'Margin' })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Calculation Logic Footer */}
                <div className="mt-8 pt-4 border-t border-border/60">
                  <p className="text-muted-foreground flex items-center gap-2" style={{ fontSize: '11px', lineHeight: '1.4' }}>
                    <span className="font-semibold text-foreground/70">
                      {t('marginCalcLabel', { defaultValue: 'Margin Logic:' })}
                    </span>
                    <span>{currencySymbol} ({t('salesPrice')} - {t('internalCost')}) / {t('salesPrice')} * 100%</span>
                  </p>
                </div>
              </div>

              {/* Trending Items - Now full width below Top Customers */}
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