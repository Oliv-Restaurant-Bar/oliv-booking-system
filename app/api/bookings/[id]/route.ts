import { NextRequest, NextResponse } from "next/server";
import { updateBooking, deleteBooking } from "@/lib/actions/bookings";
import { db } from "@/lib/db";
import { sql, eq, desc } from "drizzle-orm";
import { bookingCheckins } from "@/lib/db/schema";
import { requireAuth } from "@/lib/auth/server";
import type { AuditContext } from "@/lib/booking-audit";
import { z } from "zod";

export const dynamic = 'force-dynamic';

// UUID validation schema
const uuidSchema = z.string().uuid("Invalid booking ID format");

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate UUID format to prevent injection
    const validatedId = uuidSchema.parse(id);

    // Fetch booking with lead information using parameterized SQL
    // The ${id} syntax is automatically parameterized by Drizzle - safe from SQL injection
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
        b.street,
        b.plz,
        b.business,
        b.occasion,
        b.reference,
        b.payment_method,
        b.use_same_address_for_billing,
        b.billing_street,
        b.billing_plz,
        b.billing_location,
        b.billing_reference,
        b.created_at,
        b.is_locked,
        b.assigned_to,
        b.kitchen_notes,
        b.edit_secret,
        b.room,
        l.contact_name,
        l.contact_email,
        l.contact_phone,
        a.name as assigned_to_name,
        a.email as assigned_to_email
      FROM bookings b
      LEFT JOIN leads l ON b.lead_id = l.id
      LEFT JOIN admin_user a ON b.assigned_to = a.id
      WHERE b.id = ${validatedId}
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
          bi.notes,
          mi.name as item_name,
          mi.pricing_type,
          mi.dietary_type,
          mc.name as category_name,
          mc.guest_count as category_guest_count
        FROM booking_items bi
        LEFT JOIN menu_items mi ON bi.item_id = mi.id
        LEFT JOIN menu_categories mc ON mi.category_id = mc.id
        WHERE bi.item_type = 'menu_item' AND bi.booking_id = ${validatedId}
      `);

      const itemsRows = 'rows' in bookingItemsResult ? bookingItemsResult.rows : bookingItemsResult;
      menuItems = (itemsRows as any[]).map((item: any) => {
        const isPerPerson = item.pricing_type === 'per_person' || item.category_guest_count === true;
        const unitPrice = Number(item.unit_price);
        const totalPrice = unitPrice * item.quantity;

        // Parse notes to extract variant, choices, and customer comment
        let variant = '';
        let choices = '';
        let customerComment = '';
        if (item.notes) {
          const variantMatch = item.notes.match(/Variant: ([^|]+)/);
          const selectionsMatch = item.notes.match(/((?:Add-ons|Choices): [^|]+)/);
          const commentMatch = item.notes.match(/Comment: ([^|]+)/);
          
          if (variantMatch) variant = variantMatch[1].trim();
          if (selectionsMatch) choices = selectionsMatch[1].trim();
          if (commentMatch) customerComment = commentMatch[1].trim();
        }

        // Combine choices and comment for display - NOT NEEDED ANYMORE since we handle them separately in PDF
        // But we keep them for backward compatibility in some UI parts if needed
        
        // Build display name with variant info only
        let displayName = item.item_name;
        if (variant) {
          displayName += ` (${variant})`;
        }

        return {
          id: `menu-${item.item_id}`, // Add unique ID for React keys
          itemId: item.item_id, // IMPORTANT: This is needed for updates
          item: item.item_name || 'Unknown Item',
          variant: variant || '',
          category: item.category_name || 'Unknown',
          quantity: isPerPerson
            ? `${item.quantity} guests x ${Math.round(unitPrice)} CHF`
            : `${item.quantity} x ${Math.round(unitPrice)} CHF`,
          rawQuantity: item.quantity,
          unitPrice: unitPrice,
          price: `CHF ${totalPrice.toFixed(2)}`,
          pricingType: item.pricing_type || 'fixed',
          dietaryType: item.dietary_type || 'none',
          notes: choices || '',
          customerComment: customerComment || '',
        };
      });
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

    // Extract granular address fields from internal notes - using case-insensitive regex for robustness
    const business = booking.business || '';
    const occasion = booking.occasion || '';
    const reference = booking.reference || '';
    const paymentMethod = booking.payment_method || 'ec_card';
    const street = booking.street || '';
    const plz = booking.plz || '';
    const city = booking.location || '';
    const address = [street, plz, city].filter(Boolean).join(', ');

    const billingStreet = booking.billing_street || '';
    const billingPlz = booking.billing_plz || '';
    const billingLocation = booking.billing_location || '';
    const billingReference = booking.billing_reference || '';

    // Extract menu selection from internal notes for display in notes (legacy fallback)
    const menuMatch = booking.internal_notes?.match(/Menu Selection: ([^\n]+)/);
    const menuSelectionStr = menuMatch ? menuMatch[1] : '';

    // Combine notes with menu selection for display
    const displayNotes = [booking.special_requests || '', menuSelectionStr].filter(Boolean).join('\n');

    // Fetch contact history
    let contactHistory: any[] = [];
    try {
      const historyResult = await db.execute(sql`
        SELECT
          h.admin_user_id,
          h.subject,
          h.content,
          h.created_at,
          a.name as admin_name
        FROM booking_contact_history h
        LEFT JOIN admin_user a ON h.admin_user_id = a.id
        WHERE h.booking_id = ${validatedId}
        ORDER BY h.created_at ASC
      `);

      const historyRows = 'rows' in historyResult ? historyResult.rows : historyResult;
      contactHistory = (historyRows as any[]).map((log: any) => ({
        by: log.admin_name || (log.subject.includes("Manual Comment") ? "Admin" : "System"),
        time: new Date(log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
        date: new Date(log.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        action: log.content,
        type: log.subject.includes("Manual Comment") ? "manual" : "system"
      }));
    } catch (e) {
      console.error('Error fetching contact history:', e);
    }

    // Fetch check-ins
    let checkins: any[] = [];
    try {
      checkins = await db
        .select()
        .from(bookingCheckins)
        .where(eq(bookingCheckins.bookingId, validatedId))
        .orderBy(desc(bookingCheckins.submittedAt));
    } catch (e) {
      console.error('Error fetching check-ins:', e);
    }



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
        street: street,
        plz: plz,
        location: city,
        business: business,
        reference: reference,
      },
      billingStreet: billingStreet,
      billingPlz: billingPlz,
      billingLocation: billingLocation,
      billingReference: billingReference,
      paymentMethod: paymentMethod,
      event: {
        date: booking.event_date ? (typeof booking.event_date === 'string' ? booking.event_date : new Date(booking.event_date).toISOString().split('T')[0]) : '',
        time: booking.event_time ? (typeof booking.event_time === 'string' ? booking.event_time.split('.')[0] : booking.event_time) : '',
        rawDate: booking.event_date ? (typeof booking.event_date === 'string' ? booking.event_date : new Date(booking.event_date).toISOString().split('T')[0]) : '',
        rawTime: booking.event_time ? (typeof booking.event_time === 'string' ? booking.event_time.split('.')[0] : booking.event_time) : '',
        occasion: occasion || 'Event',
        location: booking.location || undefined,
        reference: reference, // Include in event as well if needed for UI mapping
      },
      location: booking.location || '',
      guests: booking.guest_count || 0,
      amount: booking.estimated_total
        ? `CHF ${Number(booking.estimated_total).toLocaleString()}`
        : 'CHF 0',
      rawAmount: booking.estimated_total ? Number(booking.estimated_total) : 0,
      status: booking.status || 'pending',
      contacted: {
        by: 'Admin',
        when: `${daysAgo}d ago`,
      },
      booking: `${daysAgo}d ago`,
      allergies: allergies || '',
      notes: displayNotes || '',
      kitchenNotes: booking.kitchen_notes || '',
      isLocked: booking.is_locked || false,
      menuItems: menuItems,
      contactHistory: contactHistory,
      editSecret: booking.edit_secret,
      room: booking.room || '',
      checkins: checkins,
    });
  } catch (error) {
    console.error("Error in GET /api/bookings/[id]:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid booking ID format" },
        { status: 400 }
      );
    }

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
    // Validate UUID format
    const { id } = await params;
    const validatedId = uuidSchema.parse(id);

    // Verify admin authentication
    const session = await requireAuth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

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

    const result = await updateBooking(validatedId, body, auditContext);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Error in PUT /api/bookings/[id]:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid booking ID format" },
        { status: 400 }
      );
    }

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Validate UUID format
    const { id } = await params;
    const validatedId = uuidSchema.parse(id);

    // Verify admin authentication
    const session = await requireAuth();

    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { adminUserId, adminUserName } = body;

    if (!adminUserId || !adminUserName) {
      return NextResponse.json(
        { success: false, error: "Missing admin user information" },
        { status: 400 }
      );
    }

    const result = await deleteBooking(validatedId, adminUserId, adminUserName);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    console.error("Error in DELETE /api/bookings/[id]:", error);

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid booking ID format" },
        { status: 400 }
      );
    }

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
