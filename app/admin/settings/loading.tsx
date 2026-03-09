import { AdminPageLayout } from '@/components/admin/AdminPageLayout';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminSettingsLoading() {
  return (
    <AdminPageLayout className="space-y-6">
      {/* Settings Header Skeleton */}
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Application Settings Skeleton */}
      <div className="bg-card border border-border rounded-xl p-6">
        <Skeleton className="h-5 w-40 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-border">
              <div className="flex-1">
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-3 w-64" />
              </div>
              <Skeleton className="w-20 h-10 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Venues Section Skeleton */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="w-32 h-10 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-background border border-border rounded-xl p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Skeleton className="w-6 h-6" />
                </div>
                <Skeleton className="w-8 h-8 rounded" />
              </div>
              <Skeleton className="h-5 w-32 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-3/4 mb-3" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-4 w-20 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminPageLayout>
  );
}
