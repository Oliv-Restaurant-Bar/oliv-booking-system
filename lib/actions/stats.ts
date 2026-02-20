'use server';

import { db } from "@/lib/db";
import { bookings, menuItems, menuCategories, leads, adminUser } from "@/lib/db/schema";
import { sql, eq, desc, count, and, gte } from "drizzle-orm";

export async function getDashboardStats() {
  try {
    const totalBookings = await db
      .select({ count: count() })
      .from(bookings);

    const totalRevenueResult = await db
      .select({ total: sql<number>`COALESCE(SUM(CAST(${bookings.estimatedTotal} AS NUMERIC)), 0)` })
      .from(bookings);

    const totalMenuItems = await db
      .select({ count: count() })
      .from(menuItems)
      .where(eq(menuItems.isActive, true));

    const totalCategories = await db
      .select({ count: count() })
      .from(menuCategories)
      .where(eq(menuCategories.isActive, true));

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
    // Get bookings for the last 30 days grouped by date
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await db.execute(sql`
      SELECT
        TO_CHAR(event_date, 'MM/DD') as date,
        COUNT(*) as bookings
      FROM bookings
      WHERE event_date >= ${thirtyDaysAgo.toISOString()}
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
    // Get revenue for the last 30 days grouped by date
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await db.execute(sql`
      SELECT
        TO_CHAR(event_date, 'MM/DD') as date,
        COALESCE(SUM(CAST(estimated_total AS NUMERIC)), 0) as revenue
      FROM bookings
      WHERE event_date >= ${thirtyDaysAgo.toISOString()}
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
    // Get bookings grouped by month for the current year
    const currentYear = new Date().getFullYear();

    const monthlyData = await db
      .select({
        month: sql<string>`TO_CHAR(${bookings.eventDate}, 'Mon')`,
        monthNum: sql<number>`EXTRACT(MONTH FROM ${bookings.eventDate})`,
        bookings: count(),
        revenue: sql<number>`COALESCE(SUM(CAST(${bookings.estimatedTotal} AS NUMERIC)), 0)`,
      })
      .from(bookings)
      .where(sql`EXTRACT(YEAR FROM ${bookings.eventDate}) = ${currentYear}`)
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
    const statusCounts = await db
      .select({
        status: bookings.status,
        count: count(),
      })
      .from(bookings)
      .groupBy(bookings.status);

    const statusData = [
      { name: 'Confirmed', value: 0, color: '#9DAE91' },
      { name: 'Pending', value: 0, color: '#F59E0B' },
      { name: 'Completed', value: 0, color: '#10B981' },
      { name: 'Cancelled', value: 0, color: '#EF4444' },
      { name: 'No Show', value: 0, color: '#6B7280' },
    ];

    statusCounts.forEach(({ status, count }) => {
      const item = statusData.find(d => d.name.toLowerCase() === status);
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
    // Group by customer email (unique identifier) to aggregate all bookings per customer
    const result = await db.execute(sql`
      SELECT
        l.contact_email,
        l.contact_name,
        l.contact_phone,
        COUNT(DISTINCT b.id) as booking_count,
        COALESCE(SUM(CAST(b.estimated_total AS NUMERIC)), 0) as total_revenue,
        COALESCE(SUM(b.guest_count), 0) as total_guests
      FROM bookings b
      LEFT JOIN leads l ON b.lead_id = l.id
      WHERE b.lead_id IS NOT NULL AND l.contact_email IS NOT NULL AND l.contact_email != ''
      GROUP BY l.contact_email, l.contact_name, l.contact_phone
      ORDER BY total_revenue DESC
      LIMIT ${limit}
    `);

    const customersData = 'rows' in result ? result.rows : result;

    const customers = (customersData as any[]).map((booking) => {
      const bookingCount = Number(booking.booking_count) || 0;
      const totalRevenue = Number(booking.total_revenue) || 0;
      const totalGuests = Number(booking.total_guests) || 0;

      return {
        name: booking.contact_name || 'Unknown',
        email: booking.contact_email || '',
        phone: booking.contact_phone || '',
        bookings: bookingCount,
        totalRevenue: totalRevenue,
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
    // Get menu items with their sales data from booking_items
    // Use LEFT JOIN to get all active menu items, even those with 0 sales
    const result = await db.execute(sql`
      SELECT
        mi.id,
        mi.name,
        mi.name_de as name_de,
        mc.name as category,
        mc.name_de as category_de,
        mi.price_per_person,
        COUNT(DISTINCT bi.booking_id) as booking_count,
        COALESCE(SUM(bi.quantity), 0) as total_quantity,
        COALESCE(SUM(CAST(bi.unit_price AS NUMERIC) * bi.quantity), 0) as total_revenue
      FROM menu_items mi
      INNER JOIN menu_categories mc ON mi.category_id = mc.id
      LEFT JOIN booking_items bi ON bi.item_id = mi.id AND bi.item_type = 'menu_item'
      LEFT JOIN bookings b ON bi.booking_id = b.id
      WHERE mi.is_active = true
      GROUP BY mi.id, mi.name, mi.name_de, mc.name, mc.name_de, mi.price_per_person
      ORDER BY total_quantity DESC, mi.name ASC
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
      const totalPrice = Number(item.price_per_person) || 0;
      const totalRevenue = Number(item.total_revenue) || 0;

      return {
        rank: index + 1,
        id: item.id,
        name: item.name,
        nameDe: item.name_de,
        category: item.category,
        categoryDe: item.category_de,
        price: `CHF ${totalPrice.toFixed(2)}`,
        categoryColor: categoryColors[item.category] || '#9DAE91',
        sales: totalQuantity,
        totalRevenue: totalRevenue,
        bookingCount: Number(item.booking_count) || 0,
      };
    });
  } catch (error) {
    console.error("Error fetching trending items:", error);
    return [];
  }
}

export async function getMonthlyReportData(year: number = new Date().getFullYear()) {
  try {
    // Use raw SQL to get all status counts in one query
    const result = await db.execute(sql`
      SELECT
        EXTRACT(MONTH FROM event_date) as month_num,
        TO_CHAR(event_date, 'Month') as month_name,
        COUNT(*) as total_bookings,
        COALESCE(SUM(CAST(estimated_total AS NUMERIC)), 0) as total_revenue,
        COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed_count,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
        COUNT(*) FILTER (WHERE status = 'declined') as declined_count,
        COUNT(*) FILTER (WHERE status = 'no_show') as noshow_count,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled_count,
        COALESCE(SUM(CAST(estimated_total AS NUMERIC)) FILTER (WHERE status = 'pending'), 0) as pending_revenue,
        COALESCE(SUM(CAST(estimated_total AS NUMERIC)) FILTER (WHERE status = 'confirmed'), 0) as confirmed_revenue,
        COALESCE(SUM(CAST(estimated_total AS NUMERIC)) FILTER (WHERE status = 'completed'), 0) as completed_revenue,
        COALESCE(SUM(CAST(estimated_total AS NUMERIC)) FILTER (WHERE status = 'declined'), 0) as declined_revenue,
        COALESCE(SUM(CAST(estimated_total AS NUMERIC)) FILTER (WHERE status = 'no_show'), 0) as noshow_revenue
      FROM bookings
      WHERE EXTRACT(YEAR FROM event_date) = ${year}
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
          avgRevenue: Number(d.total_bookings) > 0 ? Number(d.total_revenue) / Number(d.total_bookings) : 0,
          // Map pending to "new" and split between new/touchbase
          new: Math.ceil((Number(d.pending_count) || 0) / 2),
          touchbase: Math.floor((Number(d.pending_count) || 0) / 2),
          confirmed: Math.floor(Number(d.confirmed_count) || 0),
          declined: Math.floor(Number(d.declined_count) || 0),
          completed: Math.floor(Number(d.completed_count) || 0),
          // Map cancelled + noshow to "unresponsive" and "noShow"
          unresponsive: Math.floor(Number(d.cancelled_count) || 0),
          noShow: Math.floor(Number(d.noshow_count) || 0),
          // Revenue breakdown
          newRevenue: Number(d.pending_revenue) / 2 || 0,
          touchbaseRevenue: Number(d.pending_revenue) / 2 || 0,
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
        new: 0,
        touchbase: 0,
        confirmed: 0,
        declined: 0,
        unresponsive: 0,
        completed: 0,
        noShow: 0,
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
