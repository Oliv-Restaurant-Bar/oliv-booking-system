import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { UserManagementPage } from "@/components/admin/UserManagementPage";
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
    <div className="px-4 md:px-8 pt-3 pb-8">
      <UserManagementPage currentUser={session.user} />
    </div>
  );
}
