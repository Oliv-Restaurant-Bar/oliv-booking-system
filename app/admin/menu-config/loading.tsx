import { AdminPageLayout } from '@/components/admin/AdminPageLayout';
import { SkeletonMenuConfig } from '@/components/ui/skeleton-loaders';

export default function MenuConfigLoading() {
  return (
    <AdminPageLayout>
      <SkeletonMenuConfig />
    </AdminPageLayout>
  );
}
