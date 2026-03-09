import { AdminPageLayout } from '@/components/admin/AdminPageLayout';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminProfileLoading() {
  return (
    <AdminPageLayout className="max-w-4xl">
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>

        {/* Profile Card Skeleton */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-start gap-6">
            {/* Avatar Skeleton */}
            <div className="flex-shrink-0">
              <Skeleton className="w-24 h-24 rounded-full" />
            </div>

            {/* Info Skeleton */}
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <div className="h-10 bg-muted rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Section Skeleton */}
        <div className="bg-card border border-border rounded-xl p-6">
          <Skeleton className="h-5 w-40 mb-6" />
          <div className="max-w-md space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </AdminPageLayout>
  );
}
