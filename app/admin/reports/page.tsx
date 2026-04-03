import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { ReportsPage } from "@/components/admin/ReportsPage";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { Permission, hasPermission } from "@/lib/auth/rbac";
import { getTopCustomersByRevenue, getMonthlyReportData, getTrendingItems } from "@/lib/actions/stats";

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

  const currentYear = new Date().getFullYear();
  const [topCustomers, monthlyReport, trendingItems] = await Promise.all([
    getTopCustomersByRevenue(10),
    getMonthlyReportData(currentYear),
    getTrendingItems(10),
  ]);

  const initialData = {
    topCustomers,
    monthlyReport,
    trendingItems,
  };

  return (
    <AdminPageLayout>
      <ReportsPage user={session.user} initialData={initialData} />
    </AdminPageLayout>
  );
}
