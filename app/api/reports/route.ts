import { getTopCustomersByRevenue, getMonthlyReportData, getTrendingItems } from "@/lib/actions/stats";
import { NextResponse } from "next/server";
import { requirePermissionWrapper } from "@/lib/auth/rbac-middleware";
import { Permission } from "@/lib/auth/rbac";

export async function GET(request: Request) {
  try {
    // Require authentication and permission
    await requirePermissionWrapper(Permission.VIEW_REPORTS);

    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const selectedYear = year ? parseInt(year) : new Date().getFullYear();

    const [topCustomers, monthlyReport, trendingItems] = await Promise.all([
      getTopCustomersByRevenue(10),
      getMonthlyReportData(selectedYear),
      getTrendingItems(10),
    ]);

    return NextResponse.json({
      topCustomers,
      monthlyReport,
      trendingItems,
    });
  } catch (error) {
    console.error("Error in reports API:", error);

    // Handle authorization errors
    if (error instanceof Error && error.name === "AuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json(
      { topCustomers: [], monthlyReport: [], trendingItems: [] },
      { status: 500 }
    );
  }
}
