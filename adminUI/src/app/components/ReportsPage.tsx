import { useState } from 'react';
import { Download, Calendar, TrendingUp, Users, DollarSign, ShoppingBag } from 'lucide-react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { TrendingItems } from './TrendingItems';
import { MonthlyReportLayout2 } from './MonthlyReportLayout2';

// Mock data based on the screenshot
const bookingsByContacts = [
  { name: 'Maria Schmidt', phone: '+41 79 123 45 67', bookings: 5, totalRevenue: 28500, avgRevenue: 5700, totalPersons: 420, avgPersons: 84 },
  { name: 'Thomas Müller', phone: '+41 79 234 56 78', bookings: 3, totalRevenue: 15600, avgRevenue: 5200, totalPersons: 180, avgPersons: 60 },
  { name: 'Sophie Weber', phone: '+41 79 345 67 89', bookings: 4, totalRevenue: 18200, avgRevenue: 4550, totalPersons: 240, avgPersons: 60 },
  { name: 'Lars Hoffmann', phone: '+41 79 456 78 90', bookings: 2, totalRevenue: 9800, avgRevenue: 4900, totalPersons: 120, avgPersons: 60 },
  { name: 'Anna Keller', phone: '+41 79 567 89 01', bookings: 6, totalRevenue: 32400, avgRevenue: 5400, totalPersons: 510, avgPersons: 85 },
];

const monthlyReport = [
  { month: 'January', totalBookings: 34, totalRevenue: 45000, avgRevenue: 1324, new: 8, touchbase: 6, confirmed: 12, declined: 3, unresponsive: 2, completed: 3, noShow: 0, newRevenue: 10200, touchbaseRevenue: 7800, confirmedRevenue: 15600, declinedRevenue: 3900, unresponsiveRevenue: 2600, completedRevenue: 3900, noShowRevenue: 0 },
  { month: 'February', totalBookings: 45, totalRevenue: 52000, avgRevenue: 1156, new: 10, touchbase: 8, confirmed: 18, declined: 4, unresponsive: 3, completed: 4, noShow: 0, newRevenue: 11700, touchbaseRevenue: 9100, confirmedRevenue: 20800, declinedRevenue: 4680, unresponsiveRevenue: 3510, completedRevenue: 4680, noShowRevenue: 0 },
  { month: 'March', totalBookings: 38, totalRevenue: 48000, avgRevenue: 1263, new: 7, touchbase: 7, confirmed: 14, declined: 4, unresponsive: 3, completed: 3, noShow: 0, newRevenue: 8400, touchbaseRevenue: 8800, confirmedRevenue: 19500, declinedRevenue: 5200, unresponsiveRevenue: 3900, completedRevenue: 3900, noShowRevenue: 0 },
  { month: 'April', totalBookings: 52, totalRevenue: 61000, avgRevenue: 1173, new: 12, touchbase: 9, confirmed: 18, declined: 5, unresponsive: 4, completed: 4, noShow: 0, newRevenue: 14040, touchbaseRevenue: 10530, confirmedRevenue: 21060, declinedRevenue: 5850, unresponsiveRevenue: 4680, completedRevenue: 4680, noShowRevenue: 0 },
  { month: 'May', totalBookings: 48, totalRevenue: 55000, avgRevenue: 1146, new: 10, touchbase: 8, confirmed: 17, declined: 5, unresponsive: 4, completed: 4, noShow: 0, newRevenue: 11700, touchbaseRevenue: 9100, confirmedRevenue: 19890, declinedRevenue: 6500, unresponsiveRevenue: 5200, completedRevenue: 5200, noShowRevenue: 0 },
  { month: 'June', totalBookings: 61, totalRevenue: 67000, avgRevenue: 1098, new: 14, touchbase: 11, confirmed: 21, declined: 6, unresponsive: 5, completed: 4, noShow: 0, newRevenue: 16380, touchbaseRevenue: 12870, confirmedRevenue: 24570, declinedRevenue: 7020, unresponsiveRevenue: 5850, completedRevenue: 4680, noShowRevenue: 0 },
  { month: 'July', totalBookings: 68, totalRevenue: 73000, avgRevenue: 1059, new: 16, touchbase: 12, confirmed: 23, declined: 7, unresponsive: 6, completed: 4, noShow: 0, newRevenue: 17600, touchbaseRevenue: 14300, confirmedRevenue: 29000, declinedRevenue: 8030, unresponsiveRevenue: 6500, completedRevenue: 5200, noShowRevenue: 0 },
  { month: 'August', totalBookings: 64, totalRevenue: 68000, avgRevenue: 1063, new: 14, touchbase: 11, confirmed: 22, declined: 7, unresponsive: 5, completed: 5, noShow: 0, newRevenue: 16380, touchbaseRevenue: 12870, confirmedRevenue: 25740, declinedRevenue: 8030, unresponsiveRevenue: 6500, completedRevenue: 6500, noShowRevenue: 0 },
  { month: 'September', totalBookings: 72, totalRevenue: 74000, avgRevenue: 1028, new: 16, touchbase: 13, confirmed: 25, declined: 7, unresponsive: 6, completed: 5, noShow: 0, newRevenue: 18720, touchbaseRevenue: 15210, confirmedRevenue: 29250, declinedRevenue: 8190, unresponsiveRevenue: 7020, completedRevenue: 6500, noShowRevenue: 0 },
  { month: 'October', totalBookings: 67, totalRevenue: 69000, avgRevenue: 1030, new: 15, touchbase: 12, confirmed: 23, declined: 7, unresponsive: 5, completed: 5, noShow: 0, newRevenue: 17550, touchbaseRevenue: 14040, confirmedRevenue: 26910, declinedRevenue: 8190, unresponsiveRevenue: 5850, completedRevenue: 6500, noShowRevenue: 0 },
  { month: 'November', totalBookings: 76, totalRevenue: 76000, avgRevenue: 1000, new: 17, touchbase: 14, confirmed: 27, declined: 8, unresponsive: 6, completed: 4, noShow: 0, newRevenue: 19890, touchbaseRevenue: 16380, confirmedRevenue: 31590, declinedRevenue: 9360, unresponsiveRevenue: 7020, completedRevenue: 5200, noShowRevenue: 0 },
  { month: 'December', totalBookings: 85, totalRevenue: 82000, avgRevenue: 965, new: 19, touchbase: 15, confirmed: 29, declined: 9, unresponsive: 7, completed: 7, noShow: 0, newRevenue: 22230, touchbaseRevenue: 17550, confirmedRevenue: 33930, declinedRevenue: 10530, unresponsiveRevenue: 8190, completedRevenue: 9100, noShowRevenue: 0 },
];

export function ReportsPage() {
  const [selectedYear] = useState('2026');

  // Calculate summary KPIs
  const totalBookings = monthlyReport.reduce((sum, month) => sum + month.totalBookings, 0);
  const totalRevenue = monthlyReport.reduce((sum, month) => sum + month.totalRevenue, 0);
  const avgBookingValue = totalRevenue / totalBookings;
  const topContact = bookingsByContacts.reduce((max, contact) => 
    contact.totalRevenue > max.totalRevenue ? contact : max
  );

  return (
    <div className="min-h-full bg-background px-4 md:px-8 pt-4 md:pt-6 pb-1 flex flex-col">
      <div className="w-full space-y-4 md:space-y-6 flex-1">
        {/* Top Customers and Trending Items - 2 Column Grid on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Top Customers Card */}
          <div className="bg-card border border-border rounded-xl p-4 md:p-6">
            <div className="flex items-center gap-3 mb-4 md:mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-foreground" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
                Top Customers by Revenue
              </h3>
            </div>
            <div>
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

                  {/* Revenue Stats - Stack on mobile */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-foreground" style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }}>
                      CHF {contact.totalRevenue.toLocaleString()}
                    </p>
                    <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
                      {contact.bookings} bookings
                    </p>
                  </div>

                  {/* Additional Stats - Hide on mobile */}
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