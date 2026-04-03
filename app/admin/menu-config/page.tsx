import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { MenuConfigPage } from "@/components/admin/MenuConfigPageV3Complete";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Permission, hasPermission } from "@/lib/auth/rbac";
import { getAllMenuData } from "@/lib/actions/menu";

export const dynamic = 'force-dynamic';

export default async function AdminMenuConfigPage() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const userRole = session.user.role as any;
  if (!hasPermission(userRole, Permission.VIEW_MENU)) {
    redirect("/admin");
  }

  // Fetch initial menu data for SSR
  const initialData = await getAllMenuData();

  return (
    <AdminPageLayout>
      <MenuConfigPage user={session.user} initialData={initialData} />
    </AdminPageLayout>
  );
}
