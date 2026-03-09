import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { ProfilePage } from "@/components/admin/ProfilePage";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Permission, hasPermission } from "@/lib/auth/rbac";

export const dynamic = 'force-dynamic';

export default async function AdminProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const userRole = session.user.role as any;
  if (!hasPermission(userRole, Permission.VIEW_PROFILE)) {
    redirect("/admin");
  }

  return (
    <AdminPageLayout>
      <ProfilePage session={session} />
    </AdminPageLayout>
  );
}
