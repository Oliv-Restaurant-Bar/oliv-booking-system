'use client';

import * as LucideIcons from 'lucide-react';

type IconName = keyof typeof LucideIcons;

interface KPICardProps {
  title: string;
  value: string | number;
  iconName: IconName;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'default' | 'compact' | 'detailed';
}

export function KPICard({ title, value, iconName, trend, variant = 'default' }: KPICardProps) {
  // Get the icon component by name
  const Icon = (LucideIcons as any)[iconName];

  if (!Icon) {
    console.warn(`Icon "${iconName}" not found`);
    return null;
  }

  if (variant === 'compact') {
    return (
      <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-muted-foreground mb-2" style={{ fontSize: 'var(--text-base)' }}>
              {title}
            </p>
            <p style={{ fontSize: 'var(--text-h2)', fontWeight: 'var(--font-weight-semibold)' }}>
              {value}
            </p>
          </div>
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
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
          {value}
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
        {value}
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