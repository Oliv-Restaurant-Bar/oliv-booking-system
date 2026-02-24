import { useState, useRef, useEffect } from 'react';
import { DashboardSidebar } from './components/DashboardSidebar';
import { DashboardHeader } from './components/DashboardHeader';
import { KPICard } from './components/KPICard';
import { BookingsPage } from './components/BookingsPage';
import { BookingDetailPage } from './components/BookingDetailPage';
import { ReportsPage } from './components/ReportsPage';
import { MenuConfigPage } from './components/MenuConfigPageV3Complete';
import { UserManagementPage } from './components/UserManagementPage';
import { SettingsPage } from './components/SettingsPage';
import { ProfilePage } from './components/ProfilePage';
import { Calendar, DollarSign, Package, BarChart3, PieChart, TrendingUp } from 'lucide-react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

// Mock data
const bookingsData = [
  { date: '2/1', bookings: 10 },
  { date: '2/3', bookings: 15 },
  { date: '2/5', bookings: 12 },
  { date: '2/7', bookings: 18 },
  { date: '2/9', bookings: 14 },
  { date: '2/11', bookings: 20 },
  { date: '2/13', bookings: 16 },
  { date: '2/15', bookings: 22 },
  { date: '2/17', bookings: 19 },
  { date: '2/19', bookings: 15 },
  { date: '2/21', bookings: 17 },
  { date: '2/23', bookings: 21 },
  { date: '2/25', bookings: 18 },
  { date: '2/27', bookings: 16 },
  { date: '2/29', bookings: 19 },
  { date: '3/2', bookings: 14 },
];

const revenueData = [
  { date: '2/1', revenue: 2100 },
  { date: '2/3', revenue: 3200 },
  { date: '2/5', revenue: 2800 },
  { date: '2/7', revenue: 3800 },
  { date: '2/9', revenue: 3100 },
  { date: '2/11', revenue: 4200 },
  { date: '2/13', revenue: 3600 },
  { date: '2/15', revenue: 4500 },
  { date: '2/17', revenue: 4100 },
  { date: '2/19', revenue: 3400 },
  { date: '2/21', revenue: 3700 },
  { date: '2/23', revenue: 4300 },
  { date: '2/25', revenue: 3900 },
  { date: '2/27', revenue: 3500 },
  { date: '2/29', revenue: 4000 },
  { date: '3/2', revenue: 3300 },
];

const statusData = [
  { name: 'Confirmed', value: 37, color: '#10B981', gradientStart: '#34D399', gradientEnd: '#10B981' },
  { name: 'Completed', value: 24, color: '#3B82F6', gradientStart: '#60A5FA', gradientEnd: '#3B82F6' },
  { name: 'Touchbase', value: 10, color: '#9DAE91', gradientStart: '#B8C9AE', gradientEnd: '#9DAE91' },
  { name: 'New', value: 14, color: '#8B5CF6', gradientStart: '#A78BFA', gradientEnd: '#8B5CF6' },
  { name: 'No show', value: 3, color: '#F59E0B', gradientStart: '#FCD34D', gradientEnd: '#F59E0B' },
  { name: 'Declined', value: 5, color: '#EF4444', gradientStart: '#F87171', gradientEnd: '#EF4444' },
  { name: 'Unresponsive', value: 7, color: '#6B7280', gradientStart: '#9CA3AF', gradientEnd: '#6B7280' },
];

// Modern Layout - Asymmetric grid with emphasis
function ModernLayout() {
  return (
    <div className="px-4 md:px-8 pt-3 pb-8 space-y-4 md:space-y-6">
      {/* KPI Cards - Compact Version */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <KPICard title="No. of Bookings" value="362" icon={Calendar} variant="compact" />
        <KPICard title="Total Revenue" value="$79,928" icon={DollarSign} variant="compact" />
        <KPICard title="Total Items" value="234" icon={Package} variant="compact" />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Large Chart - Takes 2 columns on desktop, full width on mobile */}
        <div className="lg:col-span-2 bg-card rounded-2xl p-4 md:p-6 shadow-sm border border-border flex flex-col">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <h3 style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
              Bookings in Last 30 Days
            </h3>
          </div>
          <div className="flex-1 min-h-0">
            <HighchartsReact
              highcharts={Highcharts}
              options={{
                chart: {
                  type: 'column',
                  backgroundColor: 'transparent',
                  marginBottom: 40,
                  marginTop: 10,
                  marginLeft: 50,
                  marginRight: 20,
                },
                title: {
                  text: '',
                },
                accessibility: {
                  enabled: false,
                },
                credits: {
                  enabled: false,
                },
                xAxis: {
                  categories: bookingsData.map((data) => data.date),
                  labels: {
                    style: {
                      fontSize: '12px',
                      color: '#6B7280',
                      fontFamily: 'var(--font-sans)',
                    },
                  },
                  lineWidth: 0,
                  tickWidth: 0,
                },
                yAxis: {
                  title: {
                    text: '',
                  },
                  labels: {
                    formatter: function (this: any) {
                      return Math.round(this.value).toString();
                    },
                    style: {
                      fontSize: '12px',
                      color: '#6B7280',
                      fontFamily: 'var(--font-sans)',
                    },
                  },
                  gridLineColor: '#F3F4F6',
                  gridLineWidth: 1,
                  allowDecimals: false,
                },
                tooltip: {
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E5E7EB',
                  borderRadius: 8,
                  style: {
                    fontSize: '12px',
                    fontFamily: 'var(--font-sans)',
                  },
                  formatter: function (this: any) {
                    return '<b>' + this.x + '</b><br/>' + 'Bookings: <b>' + Math.round(this.y) + '</b>';
                  },
                },
                plotOptions: {
                  column: {
                    pointPadding: 0.1,
                    borderWidth: 0,
                    borderRadius: 4,
                    states: {
                      hover: {
                        brightness: 0.1,
                      },
                    },
                  },
                },
                legend: {
                  enabled: false,
                },
                series: [
                  {
                    name: 'Bookings',
                    data: bookingsData.map((data) => data.bookings),
                    color: {
                      linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                      stops: [
                        [0, '#B8C9AE'],
                        [1, '#9DAE91'],
                      ],
                    },
                  },
                ],
              }}
              containerProps={{ style: { height: '100%', width: '100%' } }}
            />
          </div>
        </div>

        {/* Status Summary - 1 column */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <PieChart className="w-5 h-5 text-primary" />
            </div>
            <h3 style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
              Status Summary
            </h3>
          </div>
          <HighchartsReact
            highcharts={Highcharts}
            options={{
              chart: {
                type: 'pie',
                height: 220,
              },
              title: {
                text: '',
              },
              accessibility: {
                enabled: false,
              },
              tooltip: {
                pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>',
              },
              plotOptions: {
                pie: {
                  innerSize: '60%',
                  dataLabels: {
                    enabled: false,
                  },
                  showInLegend: false,
                },
              },
              series: [
                {
                  name: 'Status',
                  colorByPoint: true,
                  data: statusData.map((item) => ({
                    name: item.name,
                    y: item.value,
                    color: {
                      linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                      stops: [
                        [0, item.gradientStart],
                        [1, item.gradientEnd],
                      ],
                    },
                  })),
                },
              ],
            }}
          />
          <div className="mt-4 space-y-2">
            {statusData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span style={{ fontSize: 'var(--text-base)' }} className="text-foreground">{item.name}</span>
                </div>
                <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-weight-semibold)' }} className="text-foreground">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Chart - Full Width */}
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <h3 style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
            Revenue Trend
          </h3>
        </div>
        <HighchartsReact
          highcharts={Highcharts}
          options={{
            chart: {
              type: 'area',
              height: 280,
              backgroundColor: 'transparent',
            },
            title: {
              text: '',
            },
            accessibility: {
              enabled: false,
            },
            credits: {
              enabled: false,
            },
            xAxis: {
              categories: revenueData.map((data) => data.date),
              labels: {
                style: {
                  fontSize: '12px',
                  color: '#6B7280',
                  fontFamily: 'var(--font-sans)',
                },
              },
              lineWidth: 0,
              tickWidth: 0,
            },
            yAxis: {
              title: {
                text: '',
              },
              labels: {
                formatter: function (this: any) {
                  return '$' + (this.value / 1000).toFixed(1) + 'k';
                },
                style: {
                  fontSize: '12px',
                  color: '#6B7280',
                  fontFamily: 'var(--font-sans)',
                },
              },
              gridLineColor: '#F3F4F6',
              gridLineWidth: 1,
            },
            tooltip: {
              backgroundColor: '#FFFFFF',
              borderColor: '#E5E7EB',
              borderRadius: 8,
              style: {
                fontSize: '12px',
                fontFamily: 'var(--font-sans)',
              },
              formatter: function (this: any) {
                return '<b>' + this.x + '</b><br/>' + 'Revenue: <b>$' + this.y.toLocaleString() + '</b>';
              },
            },
            plotOptions: {
              area: {
                fillColor: {
                  linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                  stops: [
                    [0, 'rgba(157, 174, 145, 0.3)'],
                    [1, 'rgba(157, 174, 145, 0.05)'],
                  ],
                },
                marker: {
                  enabled: true,
                  radius: 4,
                  fillColor: '#9DAE91',
                  lineWidth: 2,
                  lineColor: '#FFFFFF',
                },
                lineWidth: 3,
                states: {
                  hover: {
                    lineWidth: 3,
                  },
                },
                threshold: null,
              },
            },
            series: [
              {
                name: 'Revenue',
                data: revenueData.map((data) => data.revenue),
                color: '#9DAE91',
              },
            ],
            legend: {
              enabled: false,
            },
          }}
        />
      </div>

      {/* Copyright Footer */}
      <div className="text-center pt-4 pb-1">
        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
          © 2026 Restaurant Oliv Restaurant & Bar
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden lg:block sticky top-0 h-screen self-start">
        <DashboardSidebar activeItem={currentPage} onNavigate={setCurrentPage} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <DashboardSidebar 
              activeItem={currentPage} 
              onNavigate={(page) => {
                setCurrentPage(page);
                setSidebarOpen(false);
              }} 
            />
          </div>
        </>
      )}
      
      {/* Main Content Area - Centered */}
      <div className="flex-1 flex flex-col items-center overflow-x-hidden min-h-screen">
        <div className="w-full max-w-[1440px] flex flex-col flex-1">
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 bg-background">
            <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} isScrolled={isScrolled} currentPage={currentPage} onNavigate={setCurrentPage} />
          </div>
          
          {/* Main Content */}
          <main ref={mainRef} className="flex-1 flex flex-col">
            {currentPage === 'dashboard' && <ModernLayout />}
            {currentPage === 'bookings' && (
              <BookingsPage 
                onViewDetails={(booking) => {
                  setSelectedBooking(booking);
                  setCurrentPage('booking-detail');
                }}
              />
            )}
            {currentPage === 'booking-detail' && selectedBooking && (
              <BookingDetailPage 
                booking={selectedBooking}
                onBack={() => {
                  setCurrentPage('bookings');
                  setSelectedBooking(null);
                }}
              />
            )}
            {currentPage === 'reports' && <ReportsPage />}
            {currentPage === 'menu-config' && <MenuConfigPage />}
            {currentPage === 'user-management' && <UserManagementPage />}
            {currentPage === 'settings' && <SettingsPage />}
            {currentPage === 'profile' && <ProfilePage />}
          </main>
        </div>
      </div>
    </div>
  );
}