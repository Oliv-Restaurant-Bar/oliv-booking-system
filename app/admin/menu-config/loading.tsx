import { AdminPageLayout } from '@/components/admin/AdminPageLayout';
import { SkeletonMenuCategory } from '@/components/ui/skeleton-loaders';

export default function AdminMenuConfigLoading() {
  return (
    <AdminPageLayout>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <SkeletonMenuCategory key={i} />
        ))}
      </div>
    </AdminPageLayout>
  );
}
