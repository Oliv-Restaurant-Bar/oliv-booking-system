'use client';

import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { BarChart3, PieChart, TrendingUp } from 'lucide-react';
import { useAdminTranslation, useTranslation } from '@/lib/i18n/client';

interface DailyData {
  date: string;
  bookings: number;
}

interface DailyRevenueData {
  date: string;
  revenue: number;
}

interface StatusData {
  name: string;
  value: number;
  color: string;
}

interface DashboardChartsProps {
  bookingsData: DailyData[];
  revenueData: DailyRevenueData[];
  statusData: StatusData[];
}

// Status color gradients matching adminUI
const statusGradients: Record<string, { start: string; end: string }> = {
  'Confirmed': { start: '#34D399', end: '#10B981' },
  'Completed': { start: '#60A5FA', end: '#3B82F6' },
  'Touchbase': { start: '#B8C9AE', end: '#9DAE91' },
  'New': { start: '#A78BFA', end: '#8B5CF6' },
  'No show': { start: '#FCD34D', end: '#F59E0B' },
  'Declined': { start: '#F87171', end: '#EF4444' },
  'Unresponsive': { start: '#9CA3AF', end: '#6B7280' },
};

export function DashboardCharts({ bookingsData, revenueData, statusData }: DashboardChartsProps) {
  const t = useAdminTranslation();
  const tStatus = useTranslation('bookingStatus');

  const getStatusLabel = (status: string) => {
    // Map database status names to i18n keys
    const keyMap: Record<string, string> = {
      'Confirmed': 'confirmed',
      'Completed': 'completed',
      'Touchbase': 'touchbase',
      'New': 'new',
      'No show': 'noShow',
      'Declined': 'declined',
      'Unresponsive': 'unresponsive',
      'Pending': 'pending',
      'Cancelled': 'cancelled'
    };

    // Normalize: try exact match, then case-insensitive match, then camelCase if it has spaces
    let key = keyMap[status];

    if (!key) {
      // Try a case-insensitive lookup in the map
      const lowerStatus = status.toLowerCase();
      const entry = Object.entries(keyMap).find(([k]) => k.toLowerCase() === lowerStatus);
      if (entry) {
        key = entry[1];
      } else {
        // Fallback: convert "No show" to "noShow" manually if it's not in the map
        key = lowerStatus.replace(/\s+(.)/g, (_, char) => char.toUpperCase());
      }
    }

    try {
      return tStatus(key);
    } catch {
      return status;
    }
  };

  return (
    <>
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Large Chart - Takes 2 columns on desktop, full width on mobile */}
        <div className="lg:col-span-2 bg-card rounded-2xl p-4 md:p-6 shadow-sm border border-border flex flex-col">
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <h3 style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
              {t('dashboard.charts.bookingsLast30Days')}
            </h3>
          </div>
          <div className="flex-1 min-h-0">
            <HighchartsReact
              highcharts={Highcharts}
              options={{
                chart: {
                  type: 'column',
                  backgroundColor: 'transparent',
                  marginBottom: 80,
                  marginTop: 30,
                  marginLeft: 60,
                  marginRight: 20,
                  height: 350,
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
                  tickPositioner: function (this: any) {
                    const step = Math.ceil(this.dataMax / 15);
                    const positions = [];
                    for (let i = 0; i <= this.dataMax; i += step) {
                      positions.push(i);
                    }
                    if (positions.length > 0 && positions[positions.length - 1] !== this.dataMax) {
                      positions[positions.length - 1] = this.dataMax;
                    }
                    return positions;
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
                  softMax: 10,
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
                    return '<b>' + this.key + '</b><br/>' + t('bookings.title') + ': <b>' + Math.round(this.y) + '</b>';
                  },
                },
                plotOptions: {
                  column: {
                    pointPadding: 0,
                    groupPadding: 0.1,
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
                    name: t('bookings.title'),
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
              {t('dashboard.charts.statusSummary')}
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
              credits: {
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
                  name: t('dashboard.charts.statusSummary'),
                  colorByPoint: true,
                  data: statusData.map((item) => ({
                    name: getStatusLabel(item.name),
                    y: item.value,
                    color: {
                      linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
                      stops: [
                        [0, statusGradients[item.name]?.start || item.color],
                        [1, statusGradients[item.name]?.end || item.color],
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
                  <span style={{ fontSize: 'var(--text-base)' }} className="text-foreground">{getStatusLabel(item.name)}</span>
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
            {t('dashboard.charts.revenueTrend')}
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
              tickPositioner: function (this: any) {
                const step = Math.ceil(this.dataMax / 15);
                const positions = [];
                for (let i = 0; i <= this.dataMax; i += step) {
                  positions.push(i);
                }
                if (positions.length > 0 && positions[positions.length - 1] !== this.dataMax) {
                  positions[positions.length - 1] = this.dataMax;
                }
                return positions;
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
                  return 'CHF ' + (this.value / 1000).toFixed(1) + 'k';
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
                return `
                  <b>${this.key}</b><br/>
                  ${t('dashboard.kpis.revenue')}: 
                  <b>CHF ${this.y.toLocaleString()}</b>
                `;
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
                name: t('dashboard.kpis.revenue'),
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
    </>
  );
}
