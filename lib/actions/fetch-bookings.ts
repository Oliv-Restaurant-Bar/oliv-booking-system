'use server';

import { db } from "@/lib/db";
import { bookings, leads, bookingItems, menuItems, menuCategories, bookingContactHistory, kitchenPdfLogs } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/rbac-middleware";

export async function fetchBookings(options: {
  page?: number;
  limit?: number;
  searchQuery?: string;
  status?: string;
  sort?: 'created_at' | 'event_date';
} = {}) {
  try {
    const { page = 1, limit = 10, searchQuery = "", status = "All Status" } = options;
    const offset = (page - 1) * limit;

    // Get current user for role-based filtering
    const session = await getCurrentUser();
    const currentUser = session?.user;
    const isModerator = currentUser?.role === 'moderator';

    // Build the query fragments
    let whereClause = sql`TRUE`;

    // Moderators can only see bookings assigned to them
    if (isModerator && currentUser?.id) {
      whereClause = sql`${whereClause} AND b.assigned_to = ${currentUser.id}`;
    }

    if (status !== "All Status") {
      whereClause = sql`${whereClause} AND b.status = ${status.toLowerCase()}`;
    }

    if (searchQuery) {
      const search = `%${searchQuery.toLowerCase()}%`;
      whereClause = sql`${whereClause} AND (
        LOWER(l.contact_name) LIKE ${search} OR 
        LOWER(l.contact_email) LIKE ${search} OR 
        l.contact_phone LIKE ${search}
      )`;
    }

    // Get total count for pagination metadata
    const countResult = await db.execute(sql`
      SELECT COUNT(*) as count
      FROM bookings b
      LEFT JOIN leads l ON b.lead_id = l.id
      WHERE ${whereClause} AND b.deleted_at IS NULL
    `);
    const countRows = 'rows' in countResult ? (countResult.rows as any[]) : (countResult as any[]);
    const totalCount = Number(countRows[0]?.count || 0);

    // Get paginated bookings
    const result = await db.execute(sql`
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
        b.room,
        b.created_at,
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
      WHERE ${whereClause} AND b.deleted_at IS NULL
      ORDER BY ${options.sort === 'event_date' ? sql`b.event_date DESC, b.event_time DESC` : sql`b.created_at DESC`}
      LIMIT ${limit} OFFSET ${offset}
    `);

    const allBookings = 'rows' in result ? (result.rows as any[]) : (result as any[]);

    // Fetch all booking items for the current page of bookings
    const bookingIds = (allBookings as any[]).map(b => b.id);
    let allBookingItems: any[] = [];

    if (bookingIds.length > 0) {
      const bookingItemsResult = await db.execute(sql`
        SELECT
          bi.booking_id,
          bi.item_id,
          bi.quantity,
          bi.unit_price,
          mi.name,
          mi.category_id,
          mc.name as category_name
        FROM booking_items bi
        LEFT JOIN menu_items mi ON bi.item_id = mi.id
        LEFT JOIN menu_categories mc ON mi.category_id = mc.id
        WHERE bi.item_type = 'menu_item' AND bi.booking_id IN (${sql.join(bookingIds, sql`, `)})
      `);
      allBookingItems = 'rows' in bookingItemsResult ? (bookingItemsResult.rows as any[]) : (bookingItemsResult as any[]);
    }

    // Group items by booking_id
    const itemsByBooking: Record<string, any[]> = {};
    for (const item of allBookingItems as any[]) {
      if (!itemsByBooking[item.booking_id]) {
        itemsByBooking[item.booking_id] = [];
      }
      itemsByBooking[item.booking_id].push({
        item: item.name || 'Unknown Item',
        category: item.category_name || 'Unknown',
        quantity: `${item.quantity} x ${Math.round(Number(item.unit_price))} CHF`,
        price: `CHF ${(Number(item.unit_price) * item.quantity).toFixed(2)}`,
      });
    }

    // Fetch latest kitchen PDF status for each booking
    let kitchenPdfByBooking: Record<string, any> = {};
    if (bookingIds.length > 0) {
      const pdfResult = await db.execute(sql`
        SELECT DISTINCT ON (booking_id)
          booking_id,
          document_name,
          status,
          sent_at,
          sent_by
        FROM kitchen_pdf_logs
        WHERE booking_id IN (${sql.join(bookingIds, sql`, `)})
        ORDER BY booking_id, sent_at DESC
      `);
      const pdfRows = 'rows' in pdfResult ? (pdfResult.rows as any[]) : (pdfResult as any[]);
      for (const row of pdfRows) {
        kitchenPdfByBooking[row.booking_id] = {
          documentName: row.document_name,
          sentStatus: row.status === 'sent' ? 'sent' : 'failed',
          lastSentAt: row.sent_at,
          sentBy: row.sent_by,
        };
      }
    }

    const formattedBookings = (allBookings as any[]).map((booking: any) => {
      const contactName = booking.contact_name || 'Unknown';
      const firstName = contactName.split(' ')[0] || 'Guest';
      const lastName = contactName.split(' ').slice(1).join(' ') || '';
      const daysAgo = booking.created_at
        ? Math.floor((Date.now() - new Date(booking.created_at).getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      // Get menu items for this booking
      const menuItemsList = itemsByBooking[booking.id] || [];

      // Parse special requests and internal notes
      const notes = booking.special_requests || '';
      const internalNotes = booking.internal_notes || '';

      // Extract fields from internal notes
      const extractField = (field: string) => {
        const match = internalNotes.match(new RegExp(`${field}: ([^\\n]+)`));
        return match ? match[1].replace('N/A', '').trim() : '';
      };

      const business = extractField('Business');
      const street = extractField('Street');
      const plz = extractField('PLZ');
      const location = extractField('Location');
      const reference = extractField('Reference');
      const occasion = extractField('Occasion');
      const paymentMethod = extractField('Payment Method');
      const billingAddress = extractField('Billing Address');
      const billingStreet = extractField('Billing Street');
      const billingPlz = extractField('Billing PLZ');
      const billingLocation = extractField('Billing Location');
      const billingReference = extractField('Billing Reference');
      const billingCustomerReference = extractField('Billing Customer Reference');

      // Extract menu selection from internal notes for display in notes
      const menuMatch = internalNotes.match(/Menu Selection: ([^\n]+)/);
      const menuSelectionStr = menuMatch ? menuMatch[1] : '';

      // Combine notes with menu selection for display
      const displayNotes = [notes, menuSelectionStr].filter(Boolean).join('\n');

      return {
        id: booking.id,
        customer: {
          name: contactName,
          firstName,
          lastName,
          email: booking.contact_email || '',
          phone: booking.contact_phone || '',
          avatar: contactName.charAt(0).toUpperCase() || 'G',
          avatarColor: '#9DAE91',
          address: street && plz && location ? `${street}, ${plz} ${location}` : (extractField('Address') || ''),
          street: street,
          plz: plz,
          location: location,
          business: business,
          reference: reference,
        },
        billingAddress: billingAddress,
        billingStreet: billingStreet,
        billingPlz: billingPlz,
        billingLocation: billingLocation,
        billingReference: billingReference,
        billingCustomerReference: billingCustomerReference,
        paymentMethod: paymentMethod,
        room: booking.room || '',
        event: {
          date: booking.event_date
            ? new Date(booking.event_date).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
            : '',
          rawDate: booking.event_date ? (typeof booking.event_date === 'string' ? booking.event_date.split(' ')[0] : new Date(booking.event_date).toISOString().split('T')[0]) : '',
          time: booking.event_time ? booking.event_time.substring(0, 5) : '',
          rawTime: booking.event_time ? booking.event_time.substring(0, 5) : '',
          occasion: occasion || 'Event',
          location: booking.location || '',
          room: booking.room || '',
        },
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
        allergies: booking.allergy_details || '',
        notes: notes, // Special requests only
        internalNotes: internalNotes, // Full internal notes including business, address, occasion
        kitchenNotes: booking.kitchen_notes || '',
        menuItems: menuItemsList,
        contactHistory: [],
        isLocked: booking.is_locked || false,
        assignedTo: booking.assigned_to ? {
          id: booking.assigned_to,
          name: booking.assigned_to_name || 'Unknown',
          email: booking.assigned_to_email || '',
        } : null,
        kitchenPdf: kitchenPdfByBooking[booking.id] || undefined,
        createdAt: booking.created_at,
      };
    });

    return {
      bookings: formattedBookings,
      totalCount,
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit)
    };
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return {
      bookings: [],
      totalCount: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    };
  }
}

