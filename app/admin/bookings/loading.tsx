import { AdminPageLayout } from '@/components/admin/AdminPageLayout';
import { SkeletonGrid } from '@/components/ui/skeleton-loaders';

export default function AdminBookingsLoading() {
  return (
    <AdminPageLayout>
      {/* Search & Filter Bar Skeleton */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-10 bg-muted rounded-lg animate-pulse" />
          <div className="flex gap-2">
            <div className="w-32 h-10 bg-muted rounded-lg animate-pulse" />
            <div className="w-24 h-10 bg-muted rounded-lg animate-pulse" />
            <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      {/* Bookings Grid Skeleton */}
      <SkeletonGrid items={10} cols={2} />

      {/* Pagination Skeleton */}
      <div className="flex items-center justify-between py-8 mt-4 border-t border-border">
        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
          <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
          <div className="w-10 h-10 bg-muted rounded-lg animate-pulse" />
        </div>
      </div>
    </AdminPageLayout>
  );
}
