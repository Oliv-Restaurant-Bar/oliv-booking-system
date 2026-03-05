import { NextRequest, NextResponse } from "next/server";
import { updateBooking } from "@/lib/actions/bookings";
import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { requireAuth } from "@/lib/auth/server";
import type { AuditContext } from "@/lib/booking-audit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch booking with lead information using raw SQL
    const bookingResult = await db.execute(sql`
      SELECT
        b.id,
        b.lead_id,
        b.event_date,
        b.event_time,
        b.guest_count,
        b.allergy_details,
        b.special_requests,
        b.internal_notes,
        b.estimated_total,
        b.status,
        b.location,
        b.created_at,
        b.edit_secret,
        b.is_locked,
        b.assigned_to,
        b.kitchen_notes,
        l.contact_name,
        l.contact_email,
        l.contact_phone,
        a.name as assigned_to_name,
        a.email as assigned_to_email
      FROM bookings b
      LEFT JOIN leads l ON b.lead_id = l.id
      LEFT JOIN admin_user a ON b.assigned_to = a.id
      WHERE b.id = ${id}
      LIMIT 1
    `);

    const rows = 'rows' in bookingResult ? bookingResult.rows : bookingResult;

    if (!rows || (rows as any[]).length === 0) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    const booking = (rows as any[])[0];

    // Fetch booking items from booking_items table
    let menuItems: any[] = [];
    try {
      const bookingItemsResult = await db.execute(sql`
        SELECT
          bi.booking_id,
          bi.item_id,
          bi.quantity,
          bi.unit_price,
          mi.name as item_name,
          mc.name as category_name
        FROM booking_items bi
        LEFT JOIN menu_items mi ON bi.item_id = mi.id
        LEFT JOIN menu_categories mc ON mi.category_id = mc.id
        WHERE bi.item_type = 'menu_item' AND bi.booking_id = ${id}
      `);

      const itemsRows = 'rows' in bookingItemsResult ? bookingItemsResult.rows : bookingItemsResult;
      menuItems = (itemsRows as any[]).map((item: any) => ({
        item: item.item_name || 'Unknown Item',
        category: item.category_name || 'Unknown',
        quantity: `${item.quantity} x ${Math.round(Number(item.unit_price))} CHF`,
        price: `CHF ${(Number(item.unit_price) * item.quantity).toFixed(2)}`,
      }));
    } catch (e) {
      console.error('Error fetching booking items:', e);
      // Continue without menu items
    }

    // Format booking data
    const contactName = booking.contact_name || 'Unknown';
    const firstName = contactName.split(' ')[0] || 'Guest';
    const lastName = contactName.split(' ').slice(1).join(' ') || '';
    const daysAgo = booking.created_at
      ? Math.floor((Date.now() - new Date(booking.created_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    // Parse allergy details
    const allergies = booking.allergy_details
      ? Array.isArray(booking.allergy_details)
        ? booking.allergy_details.join(', ')
        : booking.allergy_details
      : '';

    // Extract address from internal notes
    const addressMatch = booking.internal_notes?.match(/Address: ([^\n]+)/);
    const address = addressMatch ? addressMatch[1] : '';

    // Extract menu selection from internal notes for display in notes
    const menuMatch = booking.internal_notes?.match(/Menu Selection: ([^\n]+)/);
    const menuSelectionStr = menuMatch ? menuMatch[1] : '';

    // Combine notes with menu selection for display
    const displayNotes = [booking.special_requests || '', menuSelectionStr].filter(Boolean).join('\n');

    return NextResponse.json({
      id: booking.id,
      assignedTo: booking.assigned_to ? {
        id: booking.assigned_to,
        name: booking.assigned_to_name || 'Unknown',
        email: booking.assigned_to_email || '',
      } : null,
      customer: {
        name: contactName,
        firstName,
        lastName,
        email: booking.contact_email || '',
        phone: booking.contact_phone || '',
        avatar: contactName.charAt(0).toUpperCase() || 'G',
        avatarColor: '#9DAE91',
        address: address,
      },
      event: {
        date: booking.event_date
          ? new Date(booking.event_date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })
          : '',
        time: booking.event_time ? booking.event_time.substring(0, 5) : '',
        occasion: 'Event',
        location: booking.location || undefined,
      },
      location: booking.location || '',
      guests: booking.guest_count || 0,
      amount: booking.estimated_total
        ? `CHF ${Number(booking.estimated_total).toLocaleString()}`
        : 'CHF 0',
      status: booking.status || 'pending',
      contacted: {
        by: 'Admin',
        when: `${daysAgo}d ago`,
      },
      booking: `${daysAgo}d ago`,
      allergies: allergies || '',
      notes: displayNotes || '',
      kitchenNotes: booking.kitchen_notes || '',
      menuItems: menuItems,
      contactHistory: [],
    });
  } catch (error) {
    console.error("Error in GET /api/bookings/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify admin authentication
    const session = await requireAuth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    // Create audit context for admin edit
    const auditContext: AuditContext = {
      actorType: "admin",
      adminUserId: session.user.id,
      actorLabel: `Admin: ${session.user.name || "Unknown"}`,
      ipAddress: request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip") ||
        undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    };

    const result = await updateBooking(id, body, auditContext);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Error in PUT /api/bookings/[id]:", error);

    // Handle authentication errors
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
