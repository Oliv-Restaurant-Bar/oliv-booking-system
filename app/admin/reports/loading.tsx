import { AdminPageLayout } from '@/components/admin/AdminPageLayout';
import { SkeletonList, SkeletonTrendingItems, SkeletonMonthlyReport } from '@/components/ui/skeleton-loaders';

export default function AdminReportsLoading() {
  return (
    <AdminPageLayout className="space-y-6">
      {/* Top Customers and Trending Items Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonList items={5} />
        <SkeletonTrendingItems />
      </div>

      {/* Monthly Report Skeleton */}
      <SkeletonMonthlyReport />
    </AdminPageLayout>
  );
}
