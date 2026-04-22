import { NextRequest, NextResponse } from "next/server";
import { updateBooking, deleteBooking } from "@/lib/actions/bookings";
import { db } from "@/lib/db";
import { sql, eq, desc } from "drizzle-orm";
import { bookings, leads, adminUser, bookingCheckins } from "@/lib/db/schema";
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

    // Fetch booking using Drizzle select for automatic field mapping
    const [booking] = await db
      .select({
        id: bookings.id,
        leadId: bookings.leadId,
        eventDate: bookings.eventDate,
        eventTime: bookings.eventTime,
        guestCount: bookings.guestCount,
        allergyDetails: bookings.allergyDetails,
        specialRequests: bookings.specialRequests,
        internalNotes: bookings.internalNotes,
        estimatedTotal: bookings.estimatedTotal,
        status: bookings.status,
        location: bookings.location,
        street: bookings.street,
        plz: bookings.plz,
        business: bookings.business,
        occasion: bookings.occasion,
        reference: bookings.reference,
        paymentMethod: bookings.paymentMethod,
        useSameAddressForBilling: bookings.useSameAddressForBilling,
        billingStreet: bookings.billingStreet,
        billingPlz: bookings.billingPlz,
        billingLocation: bookings.billingLocation,
        billingBusiness: bookings.billingBusiness,
        billingEmail: bookings.billingEmail,
        billingReference: bookings.billingReference,
        createdAt: bookings.createdAt,
        isLocked: bookings.isLocked,
        assignedTo: bookings.assignedTo,
        kitchenNotes: bookings.kitchenNotes,
        editSecret: bookings.editSecret,
        room: bookings.room,
      })
      .from(bookings)
      .where(eq(bookings.id, validatedId))
      .limit(1);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // Fetch lead separately
    let lead: any = null;
    if (booking.leadId) {
      const [leadResult] = await db
        .select()
        .from(leads)
        .where(eq(leads.id, booking.leadId))
        .limit(1);
      lead = leadResult;
    }

    // Fetch assigned user separately
    let assignedUser: any = null;
    if (booking.assignedTo) {
      const [userResult] = await db
        .select()
        .from(adminUser)
        .where(eq(adminUser.id, booking.assignedTo))
        .limit(1);
      assignedUser = userResult;
    }

    // Fetch booking items
    let menuItems: any[] = [];
    try {
      const itemsRows = await db.execute(sql`
        SELECT
          bi.booking_id,
          bi.item_id,
          bi.item_type,
          bi.quantity,
          bi.unit_price,
          bi.notes,
          COALESCE(mi.name, ai.name) as item_name,
          COALESCE(mi.pricing_type, ai.pricing_type) as pricing_type,
          mi.dietary_type,
          COALESCE(mi.internal_cost, ai.internal_cost) as internal_cost,
          mc.name as category_name,
          mc.guest_count as category_guest_count,
          mc.use_special_calculation,
          ag.name as addon_group_name
        FROM booking_items bi
        LEFT JOIN menu_items mi ON bi.item_id = mi.id AND bi.item_type = 'menu_item'
        LEFT JOIN menu_categories mc ON mi.category_id = mc.id
        LEFT JOIN addon_items ai ON bi.item_id = ai.id AND bi.item_type = 'addon'
        LEFT JOIN addon_groups ag ON ai.addon_group_id = ag.id
        WHERE bi.booking_id = ${validatedId}
      `);

      const rows = 'rows' in itemsRows ? itemsRows.rows : itemsRows;
      menuItems = (rows as any[]).map((item: any) => {
        const isPerPerson = item.pricing_type === 'per_person' || item.category_guest_count === true;
        const unitPrice = Number(item.unit_price);
        const totalPrice = unitPrice * item.quantity;
        const internalCost = item.internal_cost ? Number(item.internal_cost) : 0;

        let variant = '', choices = '', customerComment = '';
        if (item.notes) {
          const vMatch = item.notes.match(/Variant: ([^|]+)/);
          const sMatch = item.notes.match(/((?:Add-ons|Choices): [^|]+)/);
          const cMatch = item.notes.match(/Comment: ([^|]+)/);
          if (vMatch) variant = vMatch[1].trim();
          if (sMatch) choices = sMatch[1].trim();
          if (cMatch) customerComment = cMatch[1].trim();
        }

        let categoryName = item.category_name;
        if (item.item_type === 'addon') {
          categoryName = item.addon_group_name || 'Add-on';
        }

        return {
          id: `${item.item_type}-${item.item_id}`,
          itemId: item.item_id,
          item: item.item_name || 'Unknown Item',
          itemType: item.item_type,
          variant: variant || '',
          category: categoryName || 'Unknown',
          quantity: isPerPerson
            ? `${item.quantity} guests x ${Math.round(unitPrice)} CHF`
            : `${item.quantity} x ${Math.round(unitPrice)} CHF`,
          rawQuantity: item.quantity,
          unitPrice: unitPrice,
          internalCost: internalCost,
          price: `CHF ${totalPrice.toFixed(2)}`,
          pricingType: item.pricing_type || 'fixed',
          dietaryType: item.dietary_type || 'none',
          useSpecialCalculation: !!item.use_special_calculation,
          notes: choices || '',
          customerComment: customerComment || '',
        };
      });
    } catch (e) {
      console.error('Error fetching booking items:', e);
    }

    // Format final response
    const contactName = lead?.contact_name || 'Unknown';
    const daysAgo = booking.createdAt
      ? Math.floor((Date.now() - new Date(booking.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const displayNotes = [booking.specialRequests || '', booking.internalNotes?.match(/Menu Selection: ([^\n]+)/)?.[1] || ''].filter(Boolean).join('\n');

    // Fetch contact history
    let contactHistory: any[] = [];
    try {
      const historyResult = await db.execute(sql`
        SELECT h.admin_user_id, h.subject, h.content, h.created_at, a.name as admin_name
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
    } catch (e) {}

    // Fetch check-ins
    let checkins = await db.select().from(bookingCheckins)
      .where(eq(bookingCheckins.bookingId, validatedId))
      .orderBy(desc(bookingCheckins.submittedAt));

    return NextResponse.json({
      id: booking.id,
      assignedTo: assignedUser ? {
        id: assignedUser.id,
        name: assignedUser.name || 'Unknown',
        email: assignedUser.email || '',
      } : null,
      customer: {
        name: contactName,
        firstName: contactName.split(' ')[0] || 'Guest',
        lastName: contactName.split(' ').slice(1).join(' ') || '',
        email: lead?.contact_email || '',
        phone: lead?.contact_phone || '',
        avatar: contactName.charAt(0).toUpperCase() || 'G',
        avatarColor: '#9DAE91',
        street: booking.street || '',
        plz: booking.plz || '',
        location: booking.location || '',
        business: booking.business || '',
        reference: booking.reference || '',
      },
      billingStreet: booking.billingStreet || '',
      billingPlz: booking.billingPlz || '',
      billingLocation: booking.billingLocation || '',
      billingBusiness: booking.billingBusiness || '',
      billingEmail: booking.billingEmail || '',
      billingReference: booking.billingReference || '',
      paymentMethod: booking.paymentMethod || 'ec_card',
      event: {
        date: booking.eventDate ? (typeof booking.eventDate === 'string' ? booking.eventDate : new Date(booking.eventDate as any).toISOString().split('T')[0]) : '',
        time: booking.eventTime ? (typeof booking.eventTime === 'string' ? booking.eventTime.split('.')[0] : booking.eventTime) : '',
        occasion: booking.occasion || 'Event',
        location: booking.location || undefined,
      },
      location: booking.location || '',
      guests: booking.guestCount || 0,
      amount: booking.estimatedTotal ? `CHF ${Number(booking.estimatedTotal).toLocaleString('en-US')}` : 'CHF 0',
      rawAmount: booking.estimatedTotal ? Number(booking.estimatedTotal) : 0,
      status: booking.status || 'pending',
      notes: displayNotes,
      kitchenNotes: booking.kitchenNotes || '',
      isLocked: booking.isLocked || false,
      menuItems,
      contactHistory,
      editSecret: booking.editSecret,
      room: booking.room || '',
      checkins,
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
