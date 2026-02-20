// Layout 2: Grid Card Style
// Mobile: Collapsible cards
// Tablet: 2 columns
// Desktop: 3 columns

import { useState } from 'react';
import { ChevronDown, ChevronUp, Download, CalendarDays } from 'lucide-react';
import { YearDropdown } from './YearDropdown';
import * as XLSX from 'xlsx';

interface MonthData {
  month: string;
  totalBookings: number;
  totalRevenue: number;
  avgRevenue: number;
  new: number;
  touchbase: number;
  confirmed: number;
  declined: number;
  unresponsive: number;
  completed: number;
  noShow: number;
}

export function MonthlyReportLayout2({ data }: { data: MonthData[] }) {
  const [expandedMonths, setExpandedMonths] = useState<Set<number>>(new Set());
  const [selectedYear, setSelectedYear] = useState('2026');

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
      'Month': month.month,
      'Total Bookings': Math.floor(month.totalBookings),
      'Total Revenue': month.totalRevenue,
      'Average Revenue': month.avgRevenue,
      'New': Math.floor(month.new),
      'Touchbase': Math.floor(month.touchbase),
      'Confirmed': Math.floor(month.confirmed),
      'Declined': Math.floor(month.declined),
      'Unresponsive': Math.floor(month.unresponsive),
      'Completed': Math.floor(month.completed),
      'No Show': Math.floor(month.noShow),
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
    <div className="bg-card border border-border rounded-xl p-4 md:p-6">
      {/* Header with Title, Year Dropdown, and Export Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-6 gap-3 md:gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <CalendarDays className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
            Monthly Booking Report
          </h3>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Year Dropdown - Using consistent dropdown styling */}
          <div className="flex-1 sm:flex-none">
            <YearDropdown
              value={selectedYear}
              onChange={setSelectedYear}
              years={['2024', '2025', '2026', '2027']}
            />
          </div>

          {/* Export Button - Using consistent button styling */}
          <button
            onClick={handleExport}
            className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-primary hover:text-white transition-colors flex items-center gap-2 cursor-pointer min-h-[44px]"
            style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        {data.map((month, index) => {
          const isExpanded = expandedMonths.has(index);
          
          return (
            <div key={index} className="border border-border rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
              {/* Card Header - Always Visible */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-foreground" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-semibold)' }}>
                    {month.month}
                  </h4>
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
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                  <div>
                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>Bookings</p>
                    <p className="text-foreground" style={{ fontSize: 'var(--text-h4)', fontWeight: 'var(--font-weight-bold)' }}>
                      {Math.floor(month.totalBookings)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>Revenue</p>
                    <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                      CHF {month.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Collapsible Content - Hidden on mobile unless expanded, always visible on tablet+ */}
                <div className={`space-y-2 ${isExpanded ? 'block' : 'hidden md:block'}`}>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>Avg Revenue</span>
                    <span className="text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                      CHF {month.avgRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>New</span>
                    <span className="text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {Math.floor(month.new)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>Touchbase</span>
                    <span className="text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {Math.floor(month.touchbase)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>Confirmed</span>
                    <span className="text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {Math.floor(month.confirmed)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>Declined</span>
                    <span className="text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {Math.floor(month.declined)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>Unresponsive</span>
                    <span className="text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {Math.floor(month.unresponsive)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>Completed</span>
                    <span className="text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {Math.floor(month.completed)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>No show</span>
                    <span className="text-foreground" style={{ fontSize: 'var(--text-small)', fontWeight: 'var(--font-weight-semibold)' }}>
                      {Math.floor(month.noShow)}
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