import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/server";
import { KPICard } from "@/components/admin/KPICard";
import { DashboardCharts } from "@/components/admin/DashboardCharts";
import { AdminPageLayout } from "@/components/admin/AdminPageLayout";
import { getDashboardStats, getDailyBookingsData, getDailyRevenueData, getBookingStatusDistribution } from "@/lib/actions/stats";
import { Permission, hasPermission } from "@/lib/auth/rbac";
import { getServerLocale, getTranslation } from "@/lib/i18n/server";

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

  // Fetch locale and translations
  const locale = await getServerLocale();
  const t = await getTranslation('admin.dashboard');

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
          title={t('kpis.bookings')}
          value={stats.totalBookings.toString()}
          iconName="Calendar"
          variant="compact"
          isNumeric={true}
        />
        <KPICard
          title={t('kpis.revenue')}
          value={`CHF ${stats.totalRevenue.toLocaleString()}`}
          iconName="DollarSign"
          variant="compact"
        />
        <KPICard
          title={t('kpis.items')}
          value={stats.totalMenuItems.toString()}
          iconName="Package"
          variant="compact"
          isNumeric={true}
        />
      </div>

      {/* Main Content Grid */}
      <DashboardCharts bookingsData={bookingsData} revenueData={revenueData} statusData={statusData} />

    </AdminPageLayout>
  );
}
