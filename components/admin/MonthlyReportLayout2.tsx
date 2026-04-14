'use client';

// Layout 2: Grid Card Style
// Mobile: Collapsible cards
// Tablet: 2 columns
// Desktop: 3 columns

import { useState } from 'react';
import { ChevronDown, ChevronUp, Download } from 'lucide-react';
import { YearDropdown } from './YearDropdown';
import * as XLSX from 'xlsx';
import { Permission, hasPermission } from '@/lib/auth/rbac';
import { useTranslations } from 'next-intl';
import { useCommonTranslation } from '@/lib/i18n/client';

interface MonthData {
  month: string;
  totalBookings: number;
  totalRevenue: number;
  totalProfit: number;
  avgRevenue: number;
  pending: number;
  new: number;
  touchbase: number;
  confirmed: number;
  declined: number;
  unresponsive: number;
  completed: number;
  noShow: number;
}

export function MonthlyReportLayout2({ data, user, selectedYear, onYearChange, currencySymbol = 'CHF' }: { data: MonthData[]; user?: any; selectedYear: string; onYearChange: (year: string) => void; currencySymbol?: string }) {
  const t = useTranslations('admin.reports');
  const commonT = useCommonTranslation();
  const statusT = useTranslations('bookingStatus');
  const monthT = useTranslations('admin.bookings.months');

  const userRole = user?.role;
  const canExport = hasPermission(userRole, Permission.EXPORT_REPORTS);

  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set());

  const toggleMonth = (index: number) => {
    const newExpanded = new Set(expandedMonths);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedMonths(newExpanded);
  };

  const handleExport = () => {
    // Export monthly report to XLSX
    const excelData = data.map(month => ({
      [commonT('month')]: monthT(month.month.toLowerCase()),
      [t('bookingsLabel')]: month.totalBookings,
      [t('revenue')]: `${currencySymbol} ${month.totalRevenue.toLocaleString('en-US')}`,
      [t('profit')]: `${currencySymbol} ${month.totalProfit.toLocaleString('en-US')}`,
      [t('profitMargin')]: `${month.totalRevenue > 0 ? Math.round((month.totalProfit / month.totalRevenue) * 100) : 0}%`,
      [t('avgRevenueLabel')]: `${currencySymbol} ${month.avgRevenue.toLocaleString('en-US')}`,
      [statusT('pending')]: month.pending,
      [statusT('new')]: month.new,
      [statusT('touchbase')]: month.touchbase,
      [statusT('confirmed')]: month.confirmed,
      [statusT('declined')]: month.declined,
      [statusT('unresponsive')]: month.unresponsive,
      [statusT('completed')]: month.completed,
      [statusT('noShow')]: month.noShow,
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Monthly Report ${selectedYear}`);

    // Generate and download file
    XLSX.writeFile(workbook, `monthly_report_${selectedYear}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-6">
      {/* Header with Title, Year Dropdown, and Export Button */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <h3 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
          {t('monthlyBookingReport')}
        </h3>
        <div className="flex items-center gap-3">
          {/* Year Dropdown - Using consistent dropdown styling */}
          <YearDropdown
            value={selectedYear}
            onChange={onYearChange}
            years={['2024', '2025', '2026', '2027']}
          />

          {/* Export Button - Using consistent button styling */}
          {canExport && (
            <button
              onClick={handleExport}
              className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-primary hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
              style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
            >
              <Download className="w-4 h-4" />
              {t('export')}
            </button>
          )}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((month, index) => {
          const isExpanded = expandedMonths.has(index);

          return (
            <div key={index} className="border border-border rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
              {/* Card Header - Always Visible */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-foreground" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                    {monthT(month.month.toLowerCase())}
                  </h4>
                  <p className="text-primary" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                    {currencySymbol} {month.totalProfit.toLocaleString('en-US')}
                  </p>
                  {/* Toggle button - Only visible on mobile */}
                  <button
                    onClick={() => toggleMonth(index)}
                    className="md:hidden p-1 hover:bg-accent/50 rounded transition-colors cursor-pointer"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </button>
                </div>

                {/* Bookings & Revenue - Always Visible */}
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-border">
                  <div>
                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>{commonT('bookings')}</p>
                    <p className="text-foreground" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-bold)' }}>
                      {Math.floor(month.totalBookings)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>{t('revenue')}</p>
                    <p className="text-foreground mb-1" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {currencySymbol} {month.totalRevenue.toLocaleString('en-US')}
                    </p>
                  </div>
                </div>

                {/* Collapsible Content - Hidden on mobile unless expanded, always visible on tablet+ */}
                <div className={`space-y-2 ${isExpanded ? 'block' : 'hidden md:block'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>{t('avgRevenueLabel')}</span>
                    <span className="text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {currencySymbol} {month.avgRevenue.toLocaleString('en-US')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>{statusT('pending')}</span>
                    <span className="text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {month.pending}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>{statusT('new')}</span>
                    <span className="text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {month.new}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>{statusT('touchbase')}</span>
                    <span className="text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {month.touchbase}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>{statusT('confirmed')}</span>
                    <span className="text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {month.confirmed}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>{statusT('declined')}</span>
                    <span className="text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {month.declined}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>{statusT('unresponsive')}</span>
                    <span className="text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {month.unresponsive}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>{statusT('completed')}</span>
                    <span className="text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {month.completed}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>{statusT('noShow')}</span>
                    <span className="text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {month.noShow}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}