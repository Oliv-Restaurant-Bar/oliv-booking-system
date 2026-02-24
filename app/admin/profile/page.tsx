import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { ProfilePage } from "@/components/admin/ProfilePage";
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
    <div className="px-4 md:px-8 pt-3 pb-8">
      <ProfilePage session={session} />
    </div>
  );
}
