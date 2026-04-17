import { AdminPageLayout } from '@/components/admin/AdminPageLayout';
import { SkeletonDashboard } from '@/components/ui/skeleton-loaders';

export default function AdminDashboardLoading() {
  return (
    <AdminPageLayout>
      <SkeletonDashboard />
    </AdminPageLayout>
  );
}
