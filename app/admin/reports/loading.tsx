import { AdminPageLayout } from '@/components/admin/AdminPageLayout';
import { SkeletonList, SkeletonChart } from '@/components/ui/skeleton-loaders';

export default function AdminReportsLoading() {
  return (
    <AdminPageLayout className="space-y-6">
      {/* Top Customers and Trending Items Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="h-5 w-48 bg-muted rounded mb-6 animate-pulse" />
          <SkeletonList items={5} />
        </div>
        <SkeletonChart type="pie" />
      </div>

      {/* Monthly Report Skeleton */}
      <SkeletonChart type="bar" />
    </AdminPageLayout>
  );
}
