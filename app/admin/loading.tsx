import { SkeletonDashboard } from '@/components/ui/skeleton-loaders';
import { AdminPageLayout } from '@/components/admin/AdminPageLayout';

export default function AdminDashboardLoading() {
  return (
    <AdminPageLayout className="space-y-4 md:space-y-6">
      <SkeletonDashboard />

      {/* Copyright Footer */}
      <div className="text-center pt-4 pb-1">
        <p className="text-muted-foreground" style={{ fontSize: 'var(--text-small)' }}>
          © 2026 Restaurant Oliv Restaurant & Bar
        </p>
      </div>
    </AdminPageLayout>
  );
}
