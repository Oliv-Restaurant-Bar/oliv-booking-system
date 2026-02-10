'use client';

import * as Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

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
  return (
    <>
      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Large Chart - Takes 2 columns - Bookings in Last 30 Days */}
        <div className="col-span-2 bg-card rounded-2xl p-6 shadow-sm border border-border flex flex-col">
          <div className="flex items-center justify-between mb-6">
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
                  height: 280,
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
                    style: {
                      fontSize: '12px',
                      color: '#6B7280',
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
                  },
                  formatter: function (this: any) {
                    return '<b>' + this.x + '</b><br/>' + 'Bookings: <b>' + this.y + '</b>';
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
          <h3 className="mb-4" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
            Status Summary
          </h3>
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
                  data: statusData.filter(d => d.value > 0).map((item) => ({
                    name: item.name,
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
            {statusData.filter(d => d.value > 0).map((item) => (
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
        <h3 className="mb-6" style={{ fontSize: 'var(--text-h3)', fontWeight: 'var(--font-weight-semibold)' }}>
          Revenue Trend
        </h3>
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
                  return 'CHF ' + (this.value / 1000).toFixed(1) + 'k';
                },
                style: {
                  fontSize: '12px',
                  color: '#6B7280',
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
              },
              formatter: function (this: any) {
                return '<b>' + this.x + '</b><br/>' + 'Revenue: <b>CHF ' + this.y.toLocaleString() + '</b>';
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
    </>
  );
}
