import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'compact' | 'detailed';
}

export function KPICard({ title, value, icon: Icon, trend, variant = 'default' }: KPICardProps) {
  // Format value: ensure integers for booking counts, keep original for other values
  const formatValue = (val: string | number) => {
    // If value is a string, check if it's a number that should be integer
    if (typeof val === 'string') {
      // Check if it's a numeric string (for counts)
      if (/^\d+\.?\d*$/.test(val) && title.toLowerCase().includes('booking')) {
        return Math.floor(Number(val)).toLocaleString();
      }
      return val;
    }
    // If value is a number
    if (typeof val === 'number') {
      // Booking counts should be integers
      if (title.toLowerCase().includes('booking') || title.toLowerCase().includes('items') || title.toLowerCase().includes('categories')) {
        return Math.floor(val).toLocaleString();
      }
      return val.toLocaleString();
    }
    return val;
  };

  const displayValue = formatValue(value);

  if (variant === 'compact') {
    return (
      <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-muted-foreground mb-2" style={{ fontSize: 'var(--text-base)' }}>
              {title}
            </p>
            <p style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-semibold)' }}>
              {displayValue}
            </p>
          </div>
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Icon className="w-5 h-5 text-secondary" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
            {title}
          </p>
        </div>
        <p style={{ fontSize: 'var(--text-h1)', fontWeight: 'var(--font-weight-semibold)' }} className="mb-2">
          {displayValue}
        </p>
        {trend && (
          <div className="flex items-center gap-1">
            <span
              className={trend.isPositive ? 'text-green-600' : 'text-destructive'}
              style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}
            >
              {trend.isPositive ? '↑' : '↓'} {trend.value}
            </span>
            <span className="text-muted-foreground" style={{ fontSize: 'var(--text-label)' }}>
              vs last month
            </span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
      <div className="flex items-start justify-between mb-4">
        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-base)' }}>
          {title}
        </p>
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
      <p style={{ fontSize: 'var(--text-h1)', fontWeight: 'var(--font-weight-semibold)' }} className="mb-2">
        {displayValue}
      </p>
      {trend && (
        <div className="flex items-center gap-1">
          <span
            className={trend.isPositive ? 'text-green-600' : 'text-destructive'}
            style={{ fontSize: 'var(--text-label)', fontWeight: 'var(--font-weight-medium)' }}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-muted-foreground" style={{ fontSize: 'var(--text-label)' }}>
            vs last month
          </span>
        </div>
      )}
    </div>
  );
}