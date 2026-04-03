'use server';

import { db } from "@/lib/db";
import { bookings, bookingItems, bookingContactHistory, venues, kitchenPdfLogs, adminUser, bookingCheckins } from "@/lib/db/schema";
import { sql, eq, desc, asc } from "drizzle-orm";
import { requirePermissionWrapper } from "@/lib/auth/rbac-middleware";
import { Permission } from "@/lib/auth/rbac";
import { z } from "zod";

const uuidSchema = z.string().uuid();

export async function getBookingDetailAction(id: string) {
  try {
    // SECURITY: Require VIEW_BOOKING_DETAILS permission
    await requirePermissionWrapper(Permission.VIEW_BOOKING_DETAILS);

    const validatedId = uuidSchema.parse(id);

    // Fetch booking with lead information using parameterized SQL
    const bookingResult = await db.execute(sql`
      SELECT
        b.id, b.lead_id, b.event_date, b.event_time, b.guest_count,
        b.allergy_details, b.special_requests, b.internal_notes,
        b.estimated_total, b.status, b.location, b.street, b.plz,
        b.business, b.occasion, b.reference, b.payment_method,
        b.use_same_address_for_billing, b.billing_street, b.billing_plz,
        b.billing_location, b.billing_reference, b.created_at,
        b.is_locked, b.assigned_to, b.kitchen_notes, b.edit_secret,
        b.room, l.contact_name, l.contact_email, l.contact_phone,
        a.name as assigned_to_name, a.email as assigned_to_email
      FROM bookings b
      LEFT JOIN leads l ON b.lead_id = l.id
      LEFT JOIN admin_user a ON b.assigned_to = a.id
      WHERE b.id = ${validatedId} AND b.deleted_at IS NULL
      LIMIT 1
    `);

    const rows = 'rows' in bookingResult ? bookingResult.rows : bookingResult;
    if (!rows || (rows as any[]).length === 0) return null;

    const booking = (rows as any[])[0];

    // Fetch booking items
    const bookingItemsResult = await db.execute(sql`
      SELECT
        bi.booking_id, bi.item_id, bi.quantity, bi.unit_price, bi.notes,
        mi.name as item_name, mi.pricing_type, mi.dietary_type,
        mc.name as category_name, mc.guest_count as category_guest_count
      FROM booking_items bi
      LEFT JOIN menu_items mi ON bi.item_id = mi.id
      LEFT JOIN menu_categories mc ON mi.category_id = mc.id
      WHERE bi.item_type = 'menu_item' AND bi.booking_id = ${validatedId}
    `);

    const itemsRows = 'rows' in bookingItemsResult ? bookingItemsResult.rows : bookingItemsResult;
    const menuItems = (itemsRows as any[]).map((item: any) => {
        const isPerPerson = item.pricing_type === 'per_person' || item.category_guest_count === true;
        const unitPrice = Number(item.unit_price);
        const totalPrice = unitPrice * item.quantity;
        
        let variant = '', choices = '', customerComment = '';
        if (item.notes) {
          const vMatch = item.notes.match(/Variant: ([^|]+)/);
          const sMatch = item.notes.match(/((?:Add-ons|Choices): [^|]+)/);
          const cMatch = item.notes.match(/Comment: ([^|]+)/);
          if (vMatch) variant = vMatch[1].trim();
          if (sMatch) choices = sMatch[1].trim();
          if (cMatch) customerComment = cMatch[1].trim();
        }

        return {
          id: `menu-${item.item_id}`,
          itemId: item.item_id,
          item: item.item_name || 'Unknown Item',
          variant,
          category: item.category_name || 'Unknown',
          quantity: isPerPerson 
            ? `${item.quantity} guests x ${Math.round(unitPrice)} CHF` 
            : `${item.quantity} x ${Math.round(unitPrice)} CHF`,
          rawQuantity: item.quantity,
          unitPrice,
          price: `CHF ${totalPrice.toFixed(2)}`,
          pricingType: item.pricing_type || 'fixed',
          dietaryType: item.dietary_type || 'none',
          notes: choices,
          customerComment,
        };
    });

    // Fetch contact history
    const historyResult = await db.execute(sql`
      SELECT h.admin_user_id, h.subject, h.content, h.created_at, a.name as admin_name
      FROM booking_contact_history h
      LEFT JOIN admin_user a ON h.admin_user_id = a.id
      WHERE h.booking_id = ${validatedId}
      ORDER BY h.created_at ASC
    `);

    const historyRows = 'rows' in historyResult ? historyResult.rows : historyResult;
    const contactHistory = (historyRows as any[]).map((log: any) => ({
      by: log.admin_name || (log.subject.includes("Manual Comment") ? "Admin" : "System"),
      time: new Date(log.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
      date: new Date(log.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      action: log.content,
      type: log.subject.includes("Manual Comment") ? "manual" : "system"
    }));

    // Fetch check-ins
    const checkins = await db.select().from(bookingCheckins)
      .where(eq(bookingCheckins.bookingId, validatedId))
      .orderBy(desc(bookingCheckins.submittedAt));

    // Final result formatting
    const contactName = booking.contact_name || 'Unknown';
    const displayNotes = [booking.special_requests || '', booking.internal_notes?.match(/Menu Selection: ([^\n]+)/)?.[1] || ''].filter(Boolean).join('\n');
    const daysAgo = booking.created_at ? Math.floor((Date.now() - new Date(booking.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;

    return {
      id: booking.id,
      assignedTo: booking.assigned_to ? { id: booking.assigned_to, name: booking.assigned_to_name || 'Unknown', email: booking.assigned_to_email || '' } : null,
      customer: {
        name: contactName,
        firstName: contactName.split(' ')[0] || 'Guest',
        lastName: contactName.split(' ').slice(1).join(' ') || '',
        email: booking.contact_email || '',
        phone: booking.contact_phone || '',
        avatar: contactName.charAt(0).toUpperCase() || 'G',
        avatarColor: '#9DAE91',
        street: booking.street || '',
        plz: booking.plz || '',
        location: booking.location || '',
        business: booking.business || '',
        reference: booking.reference || '',
      },
      billingStreet: booking.billing_street || '',
      billingPlz: booking.billing_plz || '',
      billingLocation: booking.billing_location || '',
      billingReference: booking.billing_reference || '',
      paymentMethod: booking.payment_method || 'ec_card',
      event: {
        date: booking.event_date ? (typeof booking.event_date === 'string' ? booking.event_date : new Date(booking.event_date).toISOString().split('T')[0]) : '',
        time: booking.event_time ? (typeof booking.event_time === 'string' ? booking.event_time.split('.')[0] : booking.event_time) : '',
        occasion: booking.occasion || 'Event',
        location: booking.location || undefined,
      },
      location: booking.location || '',
      guests: booking.guest_count || 0,
      amount: booking.estimated_total ? `CHF ${Number(booking.estimated_total).toLocaleString()}` : 'CHF 0',
      rawAmount: booking.estimated_total ? Number(booking.estimated_total) : 0,
      status: booking.status || 'pending',
      contactHistory,
      checkins,
      menuItems,
      allergies: Array.isArray(booking.allergy_details) ? booking.allergy_details.join(', ') : (booking.allergy_details || ''),
      notes: displayNotes,
      kitchenNotes: booking.kitchen_notes || '',
      room: booking.room || '',
      isLocked: booking.is_locked || false,
      createdAt: booking.created_at,
      editSecret: booking.edit_secret,
    };
  } catch (error) {
    console.error("Error in getBookingDetailAction:", error);
    return null;
  }
}

export async function getVenuesAction() {
  try {
    await requirePermissionWrapper(Permission.VIEW_BOOKINGS);
    const allVenues = await db.query.venues.findMany({
      orderBy: [asc(venues.sortOrder), asc(venues.name)],
      where: eq(venues.isActive, true),
    });
    return allVenues.map(v => v.name);
  } catch (error) {
    console.error("Error in getVenuesAction:", error);
    return [];
  }
}

export async function getKitchenPdfHistoryAction(bookingId: string) {
  try {
    await requirePermissionWrapper(Permission.VIEW_BOOKING_DETAILS);
    const validatedId = uuidSchema.parse(bookingId);
    
    const logs = await db.query.kitchenPdfLogs.findMany({
      where: eq(kitchenPdfLogs.bookingId, validatedId),
      orderBy: [desc(kitchenPdfLogs.sentAt)],
    });

    if (logs && logs.length > 0) {
      const latest = logs[0];
      return {
        documentName: latest.documentName,
        sentStatus: latest.status === 'sent' ? 'sent' : 'failed',
        lastSentAt: latest.sentAt,
        sentBy: latest.sentBy,
        sendAttempts: logs.length,
      };
    }
    return null;
  } catch (error) {
    console.error("Error in getKitchenPdfHistoryAction:", error);
    return null;
  }
}
