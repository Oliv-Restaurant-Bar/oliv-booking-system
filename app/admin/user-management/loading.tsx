import { AdminPageLayout } from '@/components/admin/AdminPageLayout';
import { SkeletonTable } from '@/components/ui/skeleton-loaders';

export default function AdminUserManagementLoading() {
  return (
    <AdminPageLayout>
      {/* Search Bar Skeleton */}
      <div className="bg-card border border-border rounded-xl p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 h-10 bg-muted rounded-lg animate-pulse" />
          <div className="flex gap-2">
            <div className="w-24 h-10 bg-muted rounded-lg animate-pulse" />
            <div className="w-24 h-10 bg-muted rounded-lg animate-pulse" />
            <div className="w-20 h-10 bg-muted rounded-lg animate-pulse" />
          </div>
        </div>
      </div>

      {/* Users Table Skeleton */}
      <SkeletonTable rows={10} columns={5} hasActions />
    </AdminPageLayout>
  );
}
