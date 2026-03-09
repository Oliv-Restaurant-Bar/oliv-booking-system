import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { UserManagementPage } from "@/components/admin/UserManagementPage";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Permission, hasPermission } from "@/lib/auth/rbac";

export const dynamic = 'force-dynamic';

export default async function AdminUserManagementPage() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const userRole = session.user.role as any;
  if (!hasPermission(userRole, Permission.VIEW_USERS)) {
    redirect("/admin");
  }

  return (
    <AdminPageLayout>
      <UserManagementPage currentUser={session.user} />
    </AdminPageLayout>
  );
}
