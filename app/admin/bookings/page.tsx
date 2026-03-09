import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { BookingsPage } from "@/components/admin/BookingsPage";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Permission, hasPermission } from "@/lib/auth/rbac";

export const dynamic = 'force-dynamic';

export default async function AdminBookingsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const userRole = session.user.role as any;
  if (!hasPermission(userRole, Permission.VIEW_BOOKINGS)) {
    redirect("/admin");
  }

  return (
    <AdminPageLayout>
      <BookingsPage user={session.user} />
    </AdminPageLayout>
  );
}
