import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings, leads, menuItems, addons } from "@/lib/db/schema";
import { sql, eq, and, gte, count } from "drizzle-orm";
import { requirePermissionWrapper } from "@/lib/auth/rbac-middleware";
import { Permission } from "@/lib/auth/rbac";

export async function GET() {
  try {
    // Require authentication and permission
    await requirePermissionWrapper(Permission.VIEW_DASHBOARD);

    // Get total bookings count
    const [bookingsCount] = await db
      .select({ count: count() })
      .from(bookings);

    // Get new leads count
    const [newLeadsCount] = await db
      .select({ count: count() })
      .from(leads)
      .where(eq(leads.status, "new"));

    // Get total menu items
    const [menuItemsCount] = await db
      .select({ count: count() })
      .from(menuItems);

    // Get total addons
    const [addonsCount] = await db
      .select({ count: count() })
      .from(addons);

    // Calculate total revenue (sum of estimated_total where status is 'completed')
    const [revenueResult] = await db
      .select({
        total: sql<string>`COALESCE(SUM(CAST(${bookings.estimatedTotal} AS NUMERIC)), 0)`,
      })
      .from(bookings)
      .where(eq(bookings.status, "completed"));

    // Get bookings by status
    const statusCounts = await db
      .select({
        status: bookings.status,
        count: count(),
      })
      .from(bookings)
      .groupBy(bookings.status);

    return NextResponse.json({
      stats: {
        totalBookings: bookingsCount?.count || 0,
        newLeads: newLeadsCount?.count || 0,
        totalItems: (menuItemsCount?.count || 0) + (addonsCount?.count || 0),
        totalRevenue: revenueResult?.total || "0",
        statusDistribution: statusCounts,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);

    // Handle authorization errors
    if (error instanceof Error && error.name === "AuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
