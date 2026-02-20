'use client';

import { useState, useEffect } from 'react';
import { Download, Calendar, TrendingUp, Users, DollarSign, ShoppingBag } from 'lucide-react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { TrendingItems } from './TrendingItems';
import { MonthlyReportLayout2 } from './MonthlyReportLayout2';

export function ReportsPage() {
  const [selectedYear] = useState(String(new Date().getFullYear()));
  const [bookingsByContacts, setBookingsByContacts] = useState<any[]>([]);
  const [monthlyReport, setMonthlyReport] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

    fetchReportsData();
  }, [selectedYear]);

  // Calculate summary KPIs with safe defaults for empty arrays
  const totalBookings = Math.floor(monthlyReport.reduce((sum, month) => sum + (month.totalBookings || 0), 0));
  const totalRevenue = monthlyReport.reduce((sum, month) => sum + (month.totalRevenue || 0), 0);
  const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;
  const topContact = bookingsByContacts.length > 0
    ? bookingsByContacts.reduce((max, contact) =>
        (contact.totalRevenue || 0) > (max.totalRevenue || 0) ? contact : max
      )
    : null;

  return (
    <div className="min-h-full bg-background flex flex-col">
      <div className="w-full space-y-6 flex-1">
        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
              Loading reports data...
            </p>
          </div>
        )}

        {!loading && (
        <>
        {/* Top Customers and Trending Items - 2 Column Grid on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Customers */}
          <div className="bg-card border border-border rounded-xl p-4 md:p-6">
            <h3 className="text-foreground mb-4 md:mb-6" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
              Top Customers by Revenue
            </h3>
            <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
              {bookingsByContacts.slice(0, 5).map((contact, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 md:gap-4 py-3 hover:bg-accent/50 transition-colors ${
                    index < 4 ? 'border-b border-border' : ''
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
                    <p className="text-foreground truncate" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-medium)' }}>
                      {contact.name}
                    </p>
                    <p className="text-muted-foreground hidden sm:block" style={{ fontSize: 'var(--text-small)' }}>
                      {contact.phone}
                    </p>
                  </div>

                  {/* Revenue Stats */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                      CHF {contact.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                      {Math.floor(contact.bookings)} bookings
                    </p>
                  </div>

                  {/* Additional Stats - Hide on mobile/tablet */}
                  <div className="text-right hidden lg:block flex-shrink-0">
                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                      Avg: CHF {contact.avgRevenue.toLocaleString()}
                    </p>
                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                      {contact.totalPersons} persons
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
        <MonthlyReportLayout2 data={monthlyReport} />
        </>
        )}

        {/* Copyright Footer */}
        <div className="text-center pt-4 pb-1 mt-auto">
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
            © 2026 Restaurant Oliv Restaurant & Bar
          </p>
        </div>
      </div>
    </div>
  );
}