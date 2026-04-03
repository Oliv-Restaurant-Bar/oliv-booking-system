import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { SettingsPage } from "@/components/admin/SettingsPage";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Permission, hasPermission } from "@/lib/auth/rbac";
import { getSystemSettings, getFullVenuesAction } from "@/lib/actions/settings";

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

  // Pre-fetch settings and venues
  const [initialSettings, initialVenues] = await Promise.all([
    getSystemSettings(),
    getFullVenuesAction(),
  ]);

  return (
    <AdminPageLayout>
      <SettingsPage 
        user={session.user} 
        initialSettings={initialSettings}
        initialVenues={initialVenues}
      />
    </AdminPageLayout>
  );
}
