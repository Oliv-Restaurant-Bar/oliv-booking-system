'use server';

import { db } from "@/lib/db";
import { sql } from "drizzle-orm";
import { z } from "zod";

const uuidSchema = z.string().uuid();

export async function getBookingForCheckin(id: string) {
  try {
    const validatedId = uuidSchema.parse(id);

    const bookingResult = await db.execute(sql`
      SELECT
        b.id,
        b.event_date,
        b.guest_count,
        l.contact_name
      FROM bookings b
      LEFT JOIN leads l ON b.lead_id = l.id
      WHERE b.id = ${validatedId} AND b.deleted_at IS NULL
      LIMIT 1
    `);

    const rows = 'rows' in bookingResult ? bookingResult.rows : bookingResult;

    if (!rows || (rows as any[]).length === 0) {
      return { success: false, error: "Booking not found" };
    }

    const booking = (rows as any[])[0];

    return {
      success: true,
      data: {
        id: booking.id,
        customer: {
          name: booking.contact_name || 'Guest',
        },
        event: {
          date: booking.event_date ? (typeof booking.event_date === 'string' ? booking.event_date : new Date(booking.event_date).toISOString().split('T')[0]) : '',
        },
        guests: booking.guest_count || 0,
      }
    };
  } catch (error) {
    console.error("Error fetching booking for checkin:", error);
    return { success: false, error: "Internal server error" };
  }
}
