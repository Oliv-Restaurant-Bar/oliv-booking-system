import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { MenuConfigPage } from "@/components/admin/MenuConfigPageV3Complete";
import { Permission, hasPermission } from "@/lib/auth/rbac";

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

  return (
    <div className="px-4 md:px-8 pt-3 pb-8">
      <MenuConfigPage user={session.user} />
    </div>
  );
}
