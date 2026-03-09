'use client';

import { Skeleton } from './skeleton';

/**
 * KPI Card Skeleton - For dashboard metric cards
 */
export function SkeletonKPI({ variant = 'default' }: { variant?: 'default' | 'compact' | 'detailed' }) {
  if (variant === 'compact') {
    return (
      <div className="bg-card rounded-2xl p-4 shadow-sm border border-border">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="w-10 h-10 rounded-lg" />
        </div>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="w-12 h-12 rounded-xl" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-12 w-40 mb-2" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
      <div className="flex items-start justify-between mb-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="w-10 h-10 rounded-lg" />
      </div>
      <Skeleton className="h-10 w-40 mb-2" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

/**
 * Booking Card Skeleton - For booking grid items
 */
export function SkeletonBookingCard() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 md:p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Skeleton className="h-6 w-20" />
        </div>
      </div>

      {/* Info rows */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Skeleton className="w-3.5 h-3.5 flex-shrink-0" />
            <Skeleton className="h-3.5 flex-1" />
          </div>
          <div className="flex items-center gap-2 flex-1 justify-end">
            <Skeleton className="w-3.5 h-3.5 flex-shrink-0" />
            <Skeleton className="h-3.5 w-20" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Skeleton className="w-3.5 h-3.5 flex-shrink-0" />
            <Skeleton className="h-3.5 flex-1" />
          </div>
          <div className="flex items-center gap-2 flex-1 justify-end">
            <Skeleton className="w-3.5 h-3.5 flex-shrink-0" />
            <Skeleton className="h-3.5 w-20" />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Skeleton className="w-3.5 h-3.5 flex-shrink-0" />
            <Skeleton className="h-3.5 w-24" />
          </div>
          <div className="flex items-center gap-2 flex-1 justify-end">
            <Skeleton className="w-3.5 h-3.5 flex-shrink-0" />
            <Skeleton className="h-3.5 w-16" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="h-3.5 w-24" />
        </div>
        <Skeleton className="h-3.5 w-16" />
      </div>
    </div>
  );
}

/**
 * Table Skeleton - For data tables
 */
export function SkeletonTable({
  rows = 5,
  columns = 5,
  hasActions = true,
}: {
  rows?: number;
  columns?: number;
  hasActions?: boolean;
}) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={`header-${i}`} className="h-4 flex-1" />
          ))}
          {hasActions && <Skeleton className="h-4 w-16" />}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-border">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="px-4 py-3">
            <div className="flex items-center gap-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <Skeleton key={`cell-${rowIndex}-${colIndex}`} className="h-4 flex-1" />
              ))}
              {hasActions && <Skeleton className="h-8 w-8 rounded" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Chart Skeleton - For chart placeholders
 */
export function SkeletonChart({ type = 'bar' }: { type?: 'bar' | 'pie' | 'line' }) {
  if (type === 'pie') {
    return (
      <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
        <div className="flex items-center gap-3 mb-4">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="flex flex-col items-center justify-center py-8">
          <Skeleton className="w-48 h-48 rounded-full" />
        </div>
        <div className="mt-4 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Skeleton className="w-3 h-3 rounded-full" />
                <Skeleton className="h-4 w-24" />
              </div>
              <Skeleton className="h-4 w-8" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
      <div className="flex items-center gap-3 mb-6">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <Skeleton className="h-5 w-40" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-end gap-2 h-32">
            <Skeleton className="flex-1 h-full rounded-t" style={{ height: `${40 + Math.random() * 60}%` }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Grid Skeleton - For grid layouts with multiple items
 */
export function SkeletonGrid({
  items = 6,
  cols = 2,
  skeleton: SkeletonComponent = SkeletonBookingCard,
}: {
  items?: number;
  cols?: 1 | 2 | 3;
  skeleton?: React.ComponentType<any>;
}) {
  return (
    <div className={`grid grid-cols-1 ${cols === 2 ? 'lg:grid-cols-2' : cols === 3 ? 'lg:grid-cols-3' : ''} gap-3 md:gap-4`}>
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
}

/**
 * List Skeleton - For list items
 */
export function SkeletonList({ items = 5 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-60" />
            </div>
            <Skeleton className="w-20 h-6 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Menu Category Skeleton - For menu configuration page
 */
export function SkeletonMenuCategory() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 mb-4">
      {/* Category Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-3.5 w-48" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-16 h-8 rounded" />
          <Skeleton className="w-8 h-8 rounded" />
        </div>
      </div>

      {/* Menu Items */}
      <div className="space-y-3 pl-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="border border-border rounded-lg p-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-16 h-16 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-60" />
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
              <Skeleton className="w-24 h-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Form Skeleton - For forms and modals
 */
export function SkeletonForm({ fields = 4 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-2 pt-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-24" />
      </div>
    </div>
  );
}

/**
 * Page Skeleton - For full page loading
 */
export function SkeletonPage({
  hasHeader = true,
  hasKPI = true,
  content,
}: {
  hasHeader?: boolean;
  hasKPI?: boolean;
  content?: 'grid' | 'table' | 'list' | 'custom';
}) {
  return (
    <div className="space-y-6">
      {/* Header */}
      {hasHeader && (
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
      )}

      {/* KPI Cards */}
      {hasKPI && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonKPI variant="compact" />
          <SkeletonKPI variant="compact" />
          <SkeletonKPI variant="compact" />
          <SkeletonKPI variant="compact" />
        </div>
      )}

      {/* Content */}
      {content === 'grid' && <SkeletonGrid items={6} cols={2} />}
      {content === 'table' && <SkeletonTable rows={8} columns={6} hasActions />}
      {content === 'list' && <SkeletonList items={8} />}
      {content === 'custom' && (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      )}
    </div>
  );
}

/**
 * Avatar Group Skeleton - For user/avatar groups
 */
export function SkeletonAvatarGroup({ count = 3 }: { count?: number }) {
  return (
    <div className="flex items-center -space-x-2">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="w-8 h-8 rounded-full border-2 border-card" />
      ))}
      <Skeleton className="w-8 h-8 rounded-full border-2 border-card" />
    </div>
  );
}

/**
 * Status Badge Skeleton - For status badges
 */
export function SkeletonBadge() {
  return <Skeleton className="h-6 w-20 rounded-full" />;
}

/**
 * Calendar Skeleton - For calendar view
 */
export function SkeletonCalendar() {
  const weeks = 4;
  const days = 7;

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-5 w-32" />
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded" />
          <Skeleton className="w-8 h-8 rounded" />
        </div>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {Array.from({ length: days }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: weeks * days }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}

/**
 * Dashboard Skeleton - Complete dashboard loading state
 */
export function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SkeletonKPI variant="compact" />
        <SkeletonKPI variant="compact" />
        <SkeletonKPI variant="compact" />
        <SkeletonKPI variant="compact" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <SkeletonChart type="bar" />
        </div>
        <SkeletonChart type="pie" />
      </div>

      {/* Revenue Chart */}
      <SkeletonChart type="line" />
    </div>
  );
}
