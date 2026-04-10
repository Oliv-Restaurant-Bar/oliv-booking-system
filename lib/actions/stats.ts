'use server';

import { db } from "@/lib/db";
import { bookings, menuItems, menuCategories, leads, adminUser } from "@/lib/db/schema";
import { sql, eq, desc, count, and, gte, notInArray, isNull } from "drizzle-orm";
import { requirePermissionWrapper } from "@/lib/auth/rbac-middleware";
import { Permission } from "@/lib/auth/rbac";

// Centralized list of statuses that SHOULD NOT be included in revenue calculations
const EXCLUDED_REVENUE_STATUSES = ['declined', 'cancelled', 'no_show'] as any[];

export async function getDashboardStats() {
  try {
    // Require VIEW_DASHBOARD permission
    await requirePermissionWrapper(Permission.VIEW_DASHBOARD);

    const totalBookings = await db
      .select({ count: count() })
      .from(bookings)
      .where(isNull(bookings.deletedAt));

    const totalRevenueResult = await db
      .select({ total: sql<number>`COALESCE(SUM(CAST(${bookings.estimatedTotal} AS NUMERIC)), 0)` })
      .from(bookings)

    const totalMenuItems = await db
      .select({ count: count() })
      .from(menuItems)
      .where(sql`${menuItems.deletedAt} IS NULL`);

    const totalCategories = await db
      .select({ count: count() })
      .from(menuCategories)
      .where(sql`${menuCategories.deletedAt} IS NULL`);

    return {
      totalBookings: Math.floor(Number(totalBookings[0]?.count) || 0),
      totalRevenue: Number(totalRevenueResult[0]?.total) || 0,
      totalMenuItems: Math.floor(Number(totalMenuItems[0]?.count) || 0),
      totalCategories: Math.floor(Number(totalCategories[0]?.count) || 0),
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalBookings: 0,
      totalRevenue: 0,
      totalMenuItems: 0,
      totalCategories: 0,
    };
  }
}


export async function getDailyBookingsData() {
  try {
    // Require VIEW_DASHBOARD permission
    await requirePermissionWrapper(Permission.VIEW_DASHBOARD);

    // Get bookings for the last 30 days grouped by date
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await db.execute(sql`
      SELECT
        TO_CHAR(event_date, 'MM/DD') as date,
        COUNT(*) as bookings
      FROM bookings
      WHERE event_date >= ${thirtyDaysAgo.toISOString()}
        AND deleted_at IS NULL
      GROUP BY TO_CHAR(event_date, 'MM/DD'), event_date
      ORDER BY event_date ASC
    `);

    const dailyData = 'rows' in result ? result.rows : result;

    // Create a map for quick lookup
    const dataMap = new Map(
      (dailyData as any[]).map((d) => [
        d.date,
        Math.floor(Number(d.bookings))
      ])
    );

    // Generate all dates for the last 30 days
    const allDates = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = (date.getMonth() + 1).toString().padStart(2, '0') + '/' +
        date.getDate().toString().padStart(2, '0');
      allDates.push({
        date: dateStr,
        bookings: dataMap.get(dateStr) || 0,
      });
    }

    return allDates;
  } catch (error) {
    console.error("Error fetching daily bookings:", error);
    return [];
  }
}

export async function getDailyRevenueData() {
  try {
    // Require VIEW_DASHBOARD permission
    await requirePermissionWrapper(Permission.VIEW_DASHBOARD);

    // Get revenue for the last 30 days grouped by date
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await db.execute(sql`
      SELECT
        TO_CHAR(event_date, 'MM/DD') as date,
        COALESCE(SUM(CAST(estimated_total AS NUMERIC)), 0) as revenue
      FROM bookings
      WHERE event_date >= ${thirtyDaysAgo.toISOString()}
        AND status NOT IN ('declined', 'cancelled', 'no_show')
        AND deleted_at IS NULL
      GROUP BY TO_CHAR(event_date, 'MM/DD'), event_date
      ORDER BY event_date ASC
    `);

    const dailyData = 'rows' in result ? result.rows : result;

    // Create a map for quick lookup
    const dataMap = new Map(
      (dailyData as any[]).map((d) => [
        d.date,
        Number(d.revenue)
      ])
    );

    // Generate all dates for the last 30 days
    const allDates = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = (date.getMonth() + 1).toString().padStart(2, '0') + '/' +
        date.getDate().toString().padStart(2, '0');
      allDates.push({
        date: dateStr,
        revenue: dataMap.get(dateStr) || 0,
      });
    }

    return allDates;
  } catch (error) {
    console.error("Error fetching daily revenue:", error);
    return [];
  }
}

export async function getMonthlyBookingsData() {
  try {
    // Require VIEW_DASHBOARD permission
    await requirePermissionWrapper(Permission.VIEW_DASHBOARD);

    // Get bookings grouped by month for the current year
    const currentYear = new Date().getFullYear();

    const monthlyData = await db
      .select({
        month: sql<string>`TO_CHAR(${bookings.eventDate}, 'Mon')`,
        monthNum: sql<number>`EXTRACT(MONTH FROM ${bookings.eventDate})`,
        bookings: count(),
        revenue: sql<number>`COALESCE(SUM(CAST(${bookings.estimatedTotal} AS NUMERIC)) FILTER (WHERE ${bookings.status} NOT IN ('declined', 'cancelled', 'no_show')), 0)`,
      })
      .from(bookings)
      .where(
        and(
          sql`EXTRACT(YEAR FROM ${bookings.eventDate}) = ${currentYear}`,
          isNull(bookings.deletedAt)
        )
      )
      .groupBy(sql`TO_CHAR(${bookings.eventDate}, 'Mon')`, sql`EXTRACT(MONTH FROM ${bookings.eventDate})`)
      .orderBy(sql`EXTRACT(MONTH FROM ${bookings.eventDate})`);

    // Fill in missing months with zero values
    const allMonths = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const dataMap = new Map(monthlyData.map(d => [d.month, d]));

    return allMonths.map(month => ({
      month,
      bookings: Math.floor(Number(dataMap.get(month)?.bookings) || 0),
      revenue: Number(dataMap.get(month)?.revenue || 0),
    }));
  } catch (error) {
    console.error("Error fetching monthly bookings:", error);
    return [];
  }
}

export async function getBookingStatusDistribution() {
  try {
    // Require VIEW_DASHBOARD permission
    await requirePermissionWrapper(Permission.VIEW_DASHBOARD);

    const statusCounts = await db
      .select({
        status: bookings.status,
        count: count(),
      })
      .from(bookings)
      .where(isNull(bookings.deletedAt))
      .groupBy(bookings.status);

    const statusData = [
      { name: 'Pending', value: 0, color: '#F59E0B' },
      { name: 'New', value: 0, color: '#A78BFA' },
      { name: 'Touchbase', value: 0, color: '#B8C9AE' },
      { name: 'Confirmed', value: 0, color: '#34D399' },
      { name: 'Completed', value: 0, color: '#60A5FA' },
      { name: 'Declined', value: 0, color: '#F87171' },
      { name: 'Cancelled', value: 0, color: '#A78BFA' },
      { name: 'No Show', value: 0, color: '#9CA3AF' },
    ];

    statusCounts.forEach(({ status, count }) => {
      const normalizedStatus = status.replace('_', ' ');
      const item = statusData.find(d => d.name.toLowerCase() === normalizedStatus);
      if (item) {
        item.value = Math.floor(Number(count));
      }
    });

    return statusData;
  } catch (error) {
    console.error("Error fetching status distribution:", error);
    return [];
  }
}

export async function getRecentBookings(limit: number = 10) {
  try {
    // Require VIEW_DASHBOARD permission
    await requirePermissionWrapper(Permission.VIEW_DASHBOARD);

    const recentBookings = await db
      .select({
        id: bookings.id,
        eventDate: bookings.eventDate,
        eventTime: bookings.eventTime,
        guestCount: bookings.guestCount,
        status: bookings.status,
        estimatedTotal: bookings.estimatedTotal,
        specialRequests: bookings.specialRequests,
        leadId: bookings.leadId,
        createdAt: bookings.createdAt,
      })
      .from(bookings)
      .where(isNull(bookings.deletedAt))
      .orderBy(desc(bookings.createdAt))
      .limit(limit);

    // Join with leads to get contact info
    const bookingsWithContact = await Promise.all(
      recentBookings.map(async (booking) => {
        if (booking.leadId) {
          const leadData = await db
            .select({
              contactName: leads.contactName,
              contactEmail: leads.contactEmail,
              contactPhone: leads.contactPhone,
            })
            .from(leads)
            .where(eq(leads.id, booking.leadId))
            .limit(1);

          return {
            ...booking,
            contactName: leadData[0]?.contactName || null,
            contactEmail: leadData[0]?.contactEmail || null,
            contactPhone: leadData[0]?.contactPhone || null,
          };
        }
        return {
          ...booking,
          contactName: null,
          contactEmail: null,
          contactPhone: null,
        };
      })
    );

    return bookingsWithContact;
  } catch (error) {
    console.error("Error fetching recent bookings:", error);
    return [];
  }
}

export async function getTopMenuItems(limit: number = 10) {
  try {
    // Require VIEW_DASHBOARD permission
    await requirePermissionWrapper(Permission.VIEW_DASHBOARD);

    // This would require joining with booking_items table
    // For now, return all active menu items
    const menuItemsData = await db
      .select({
        id: menuItems.id,
        name: menuItems.name,
        nameDe: menuItems.nameDe,
        categoryId: menuItems.categoryId,
        pricePerPerson: menuItems.pricePerPerson,
        isActive: menuItems.isActive,
      })
      .from(menuItems)
      .where(eq(menuItems.isActive, true))
      .limit(limit);

    return menuItemsData;
  } catch (error) {
    console.error("Error fetching top menu items:", error);
    return [];
  }
}

export async function getLeadsStats() {
  try {
    // Require VIEW_DASHBOARD permission
    await requirePermissionWrapper(Permission.VIEW_DASHBOARD);

    const totalLeads = await db
      .select({ count: count() })
      .from(leads);

    const leadsByStatus = await db
      .select({
        status: leads.status,
        count: count(),
      })
      .from(leads)
      .groupBy(leads.status);

    return {
      total: totalLeads[0]?.count || 0,
      byStatus: leadsByStatus,
    };
  } catch (error) {
    console.error("Error fetching leads stats:", error);
    return {
      total: 0,
      byStatus: [],
    };
  }
}

// Report-specific functions

export async function getTopCustomersByRevenue(limit: number = 10) {
  try {
    // Require VIEW_REPORTS permission
    await requirePermissionWrapper(Permission.VIEW_REPORTS);

    // Group by customer email (unique identifier) to aggregate all bookings per customer
    // IMPORTANT: Only count revenue from non-cancelled/non-declined bookings
    const result = await db.execute(sql`
      WITH booking_costs AS (
        SELECT 
          bi.booking_id,
          SUM(bi.quantity * COALESCE(mi.internal_cost, ai.internal_cost, 0)) as booking_cost
        FROM booking_items bi
        LEFT JOIN menu_items mi ON bi.item_id = mi.id AND bi.item_type = 'menu_item'
        LEFT JOIN addon_items ai ON bi.item_id = ai.id AND bi.item_type = 'addon'
        GROUP BY bi.booking_id
      )
      SELECT
        l.contact_email,
        MAX(l.contact_name) as contact_name,
        MAX(l.contact_phone) as contact_phone,
        COUNT(DISTINCT b.id) as booking_count,
        COUNT(DISTINCT b.id) FILTER (WHERE b.status NOT IN ('declined', 'cancelled', 'no_show')) as active_booking_count,
        COALESCE(SUM(CAST(b.estimated_total AS NUMERIC)) FILTER (WHERE b.status IN ('confirmed', 'completed')), 0) as realized_revenue,
        COALESCE(SUM(CAST(b.estimated_total AS NUMERIC)) FILTER (WHERE b.status NOT IN ('declined', 'cancelled', 'no_show')), 0) as total_revenue,
        COALESCE(SUM(bc.booking_cost) FILTER (WHERE b.status NOT IN ('declined', 'cancelled', 'no_show')), 0) as total_cost,
        COALESCE(SUM(b.guest_count) FILTER (WHERE b.status NOT IN ('declined', 'cancelled', 'no_show')), 0) as total_guests
      FROM bookings b
      LEFT JOIN leads l ON b.lead_id = l.id
      LEFT JOIN booking_costs bc ON b.id = bc.booking_id
      WHERE b.lead_id IS NOT NULL 
        AND l.contact_email IS NOT NULL 
        AND l.contact_email != ''
        AND b.deleted_at IS NULL
      GROUP BY l.contact_email
      ORDER BY total_revenue DESC
      LIMIT ${limit}
    `);

    const customersData = 'rows' in result ? result.rows : result;

    const customers = (customersData as any[]).map((booking) => {
      const bookingCount = Number(booking.booking_count) || 0;
      const activeBookingCount = Number(booking.active_booking_count) || 0;
      const totalRevenue = Number(booking.total_revenue) || 0;
      const realizedRevenue = Number(booking.realized_revenue) || 0;
      const totalCost = Number(booking.total_cost) || 0;
      const totalGuests = Number(booking.total_guests) || 0;

      return {
        name: booking.contact_name || 'Unknown',
        email: booking.contact_email || '',
        phone: booking.contact_phone || '',
        bookings: bookingCount,
        totalRevenue: totalRevenue,
        realizedRevenue: realizedRevenue,
        totalProfit: totalRevenue - totalCost,
        profitMargin: totalRevenue > 0 ? Math.round(((totalRevenue - totalCost) / totalRevenue) * 100) : 0,
        avgRevenue: bookingCount > 0 ? Math.round(totalRevenue / bookingCount) : 0,
        totalPersons: totalGuests,
        avgPersons: bookingCount > 0 ? Math.round(totalGuests / bookingCount) : 0,
      };
    });

    return customers;
  } catch (error) {
    console.error("Error fetching top customers:", error);
    return [];
  }
}

export async function getTrendingItems(limit: number = 10) {
  try {
    // Require VIEW_REPORTS permission
    await requirePermissionWrapper(Permission.VIEW_REPORTS);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const result = await db.execute(sql`
      WITH periods AS (
        SELECT 
          bi.item_id,
          -- Current Period (Last 30 days)
          SUM(CASE WHEN b.event_date >= ${thirtyDaysAgo.toISOString()} THEN bi.quantity ELSE 0 END) as current_qty,
          SUM(CASE WHEN b.event_date >= ${thirtyDaysAgo.toISOString()} THEN (CAST(bi.unit_price AS NUMERIC) - COALESCE(mi.internal_cost, 0)) * bi.quantity ELSE 0 END) as current_profit,
          SUM(CASE WHEN b.event_date >= ${thirtyDaysAgo.toISOString()} THEN CAST(bi.unit_price AS NUMERIC) * bi.quantity ELSE 0 END) as current_revenue,
          -- Previous Period (30-60 days ago)
          SUM(CASE WHEN b.event_date >= ${sixtyDaysAgo.toISOString()} AND b.event_date < ${thirtyDaysAgo.toISOString()} THEN bi.quantity ELSE 0 END) as previous_qty
        FROM booking_items bi
        JOIN bookings b ON bi.booking_id = b.id
        LEFT JOIN menu_items mi ON bi.item_id = mi.id
        WHERE bi.item_type = 'menu_item'
          AND b.status NOT IN ('declined', 'cancelled', 'no_show')
          AND b.deleted_at IS NULL
        GROUP BY bi.item_id
      )
      SELECT 
        mi.id, 
        mi.name, 
        mi.name_de as name_de, 
        mi.price_per_person, 
        mi.image_url,
        mc.name as category, 
        mc.name_de as category_de,
        p.current_qty as total_quantity,
        p.current_profit as total_profit,
        p.current_revenue as total_revenue,
        CASE 
          WHEN p.previous_qty > 0 THEN ROUND(((p.current_qty::float - p.previous_qty::float) / p.previous_qty::float) * 100)
          WHEN p.current_qty > 0 AND (p.previous_qty IS NULL OR p.previous_qty = 0) THEN 100
          ELSE 0 
        END as trend_percentage
      FROM menu_items mi
      INNER JOIN menu_categories mc ON mi.category_id = mc.id
      INNER JOIN periods p ON mi.id = p.item_id
      WHERE mi.is_active = true
        AND p.current_qty > 0
      ORDER BY total_profit DESC, total_quantity DESC
      LIMIT ${limit}
    `);

    const itemsData = 'rows' in result ? result.rows : result;

    const categoryColors: Record<string, string> = {
      'Appetizers': '#9DAE91',
      'Vorspeisen': '#9DAE91',
      'Main Courses': '#10B981',
      'Hauptgerichte': '#10B981',
      'Desserts': '#F59E0B',
      'Nachspeisen': '#F59E0B',
      'Pizza': '#8B5CF6',
      'Drink': '#3B82F6',
      'Getränke': '#3B82F6',
    };

    return (itemsData as any[]).map((item, index) => {
      const totalQuantity = Number(item.total_quantity) || 0;
      const totalProfit = Number(item.total_profit) || 0;
      const totalRevenue = Number(item.total_revenue) || 0;
      const trendPercentage = Number(item.trend_percentage) || 0;

      return {
        rank: index + 1,
        id: item.id,
        name: item.name,
        nameDe: item.name_de,
        category: item.category,
        categoryDe: item.category_de,
        price: `CHF ${Number(item.price_per_person).toFixed(2)}`,
        categoryColor: categoryColors[item.category] || '#9DAE91',
        sales: totalQuantity,
        totalRevenue: totalRevenue,
        totalProfit: totalProfit,
        profitMargin: totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0,
        trendPercentage: trendPercentage,
        image: item.image_url || null,
      };
    });
  } catch (error) {
    console.error("Error fetching trending items:", error);
    return [];
  }
}

export async function getMonthlyReportData(year: number = new Date().getFullYear()) {
  try {
    // Require VIEW_REPORTS permission
    await requirePermissionWrapper(Permission.VIEW_REPORTS);

    // Use raw SQL to get all status counts in one query
    // IMPORTANT: Exclude declined/cancelled/no_show from total_revenue and avg_revenue
    const result = await db.execute(sql`
      SELECT
        EXTRACT(MONTH FROM event_date) as month_num,
        TO_CHAR(event_date, 'Month') as month_name,
        COUNT(*) as total_bookings,
        COUNT(*) FILTER (WHERE status NOT IN ('declined', 'cancelled', 'no_show')) as active_bookings,
        COALESCE(SUM(CAST(estimated_total AS NUMERIC)) FILTER (WHERE status NOT IN ('declined', 'cancelled', 'no_show')), 0) as total_revenue,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'new') as new_count,
        COUNT(*) FILTER (WHERE status = 'touchbase') as touchbase_count,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_count,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
        COUNT(*) FILTER (WHERE status = 'declined') as declined_count,
        COUNT(*) FILTER (WHERE status = 'no_show') as noshow_count,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_count,
        COALESCE(SUM(CAST(estimated_total AS NUMERIC)) FILTER (WHERE status = 'pending'), 0) as pending_revenue,
        COALESCE(SUM(CAST(estimated_total AS NUMERIC)) FILTER (WHERE status = 'new'), 0) as new_revenue,
        COALESCE(SUM(CAST(estimated_total AS NUMERIC)) FILTER (WHERE status = 'touchbase'), 0) as touchbase_revenue,
        COALESCE(SUM(CAST(estimated_total AS NUMERIC)) FILTER (WHERE status = 'confirmed'), 0) as confirmed_revenue,
        COALESCE(SUM(CAST(estimated_total AS NUMERIC)) FILTER (WHERE status = 'completed'), 0) as completed_revenue,
        COALESCE(SUM(CAST(estimated_total AS NUMERIC)) FILTER (WHERE status = 'declined'), 0) as declined_revenue,
        COALESCE(SUM(CAST(estimated_total AS NUMERIC)) FILTER (WHERE status = 'no_show'), 0) as noshow_revenue
      FROM bookings
      WHERE EXTRACT(YEAR FROM event_date) = ${year}
        AND deleted_at IS NULL
      GROUP BY EXTRACT(MONTH FROM event_date), TO_CHAR(event_date, 'Month')
      ORDER BY EXTRACT(MONTH FROM event_date)
    `);

    const monthlyData = 'rows' in result ? result.rows : result;

    // Fill in missing months
    const allMonths = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const dataMap = new Map(
      (monthlyData as any[]).map(d => [
        Number(d.month_num),
        {
          month: (d.month_name as string).trim(),
          totalBookings: Math.floor(Number(d.total_bookings) || 0),
          totalRevenue: Number(d.total_revenue) || 0,
          avgRevenue: Number(d.active_bookings) > 0 ? Math.round(Number(d.total_revenue) / Number(d.active_bookings)) : 0,
          // All status counts
          pending: Math.floor(Number(d.pending_count) || 0),
          new: Math.floor(Number(d.new_count) || 0),
          touchbase: Math.floor(Number(d.touchbase_count) || 0),
          confirmed: Math.floor(Number(d.confirmed_count) || 0),
          declined: Math.floor(Number(d.declined_count) || 0),
          completed: Math.floor(Number(d.completed_count) || 0),
          // Map cancelled + noshow to "unresponsive" and "noShow"
          unresponsive: Math.floor(Number(d.cancelled_count) || 0),
          noShow: Math.floor(Number(d.noshow_count) || 0),
          // Revenue breakdown
          pendingRevenue: Number(d.pending_revenue) || 0,
          newRevenue: Number(d.new_revenue) || 0,
          touchbaseRevenue: Number(d.touchbase_revenue) || 0,
          confirmedRevenue: Number(d.confirmed_revenue) || 0,
          declinedRevenue: Number(d.declined_revenue) || 0,
          completedRevenue: Number(d.completed_revenue) || 0,
        }
      ])
    );

    return allMonths.map((month, index) => {
      const monthNum = index + 1;
      const data = dataMap.get(monthNum);
      return data || {
        month,
        totalBookings: 0,
        totalRevenue: 0,
        avgRevenue: 0,
        pending: 0,
        new: 0,
        touchbase: 0,
        confirmed: 0,
        declined: 0,
        unresponsive: 0,
        completed: 0,
        noShow: 0,
        pendingRevenue: 0,
        newRevenue: 0,
        touchbaseRevenue: 0,
        confirmedRevenue: 0,
        declinedRevenue: 0,
        completedRevenue: 0,
      };
    });
  } catch (error) {
    console.error("Error fetching monthly report:", error);
    return [];
  }
}
