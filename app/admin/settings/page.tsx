import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { SettingsPage } from "@/components/admin/SettingsPage";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Permission, hasPermission } from "@/lib/auth/rbac";

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const userRole = session.user.role as any;
  if (!hasPermission(userRole, Permission.VIEW_SETTINGS)) {
    redirect("/admin");
  }

  return (
    <AdminPageLayout>
      <SettingsPage user={session.user} />
    </AdminPageLayout>
  );
}
