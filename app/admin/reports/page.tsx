import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { ReportsPage } from "@/components/admin/ReportsPage";
import { Permission, hasPermission } from "@/lib/auth/rbac";

export const dynamic = 'force-dynamic';

export default async function AdminReportsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const userRole = session.user.role as any;
  if (!hasPermission(userRole, Permission.VIEW_REPORTS)) {
    redirect("/admin");
  }

  return (
    <div className="px-4 md:px-8 pt-3 pb-8">
      <ReportsPage user={session.user} />
    </div>
  );
}
