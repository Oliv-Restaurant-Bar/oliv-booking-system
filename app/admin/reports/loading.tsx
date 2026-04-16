import { AdminPageLayout } from '@/components/admin/AdminPageLayout';
import { SkeletonTopCustomers, SkeletonTrendingItems, SkeletonMonthlyReport } from '@/components/ui/skeleton-loaders';

export default function AdminReportsLoading() {
  return (
    <AdminPageLayout className="space-y-6">
      <SkeletonTopCustomers />
      <SkeletonTrendingItems />
      <SkeletonMonthlyReport />
    </AdminPageLayout>
  );
}
