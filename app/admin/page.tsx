import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { KPICard } from "@/components/admin/KPICard";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { getDashboardStats, getDailyBookingsData, getDailyRevenueData, getBookingStatusDistribution } from "@/lib/actions/stats";
import { Permission, hasPermission } from "@/lib/auth/rbac";

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect("/admin/login");
  }

  const userRole = session.user.role as any;
  if (!hasPermission(userRole, Permission.VIEW_DASHBOARD)) {
    redirect("/admin/login");
  }

  // Fetch real data from database
  const [stats, bookingsData, revenueData, statusData] = await Promise.all([
    getDashboardStats(),
    getDailyBookingsData(),
    getDailyRevenueData(),
    getBookingStatusDistribution(),
  ]);

  return (
    <AdminPageLayout className="space-y-4 md:space-y-6">
      {/* KPI Cards - Compact Version */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <KPICard
          title="No. of Bookings"
          value={stats.totalBookings.toString()}
          iconName="Calendar"
          variant="compact"
        />
        <KPICard
          title="Total Revenue"
          value={`CHF ${stats.totalRevenue.toLocaleString()}`}
          iconName="DollarSign"
          variant="compact"
        />
        <KPICard
          title="Total Items"
          value={stats.totalMenuItems.toString()}
          iconName="Package"
          variant="compact"
        />
      </div>

      {/* Main Content Grid */}
      <DashboardCharts bookingsData={bookingsData} revenueData={revenueData} statusData={statusData} />

    </AdminPageLayout>
  );
}
