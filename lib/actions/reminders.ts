'use server';

import { db } from "@/lib/db";
import { bookings, leads, emailLogs } from "@/lib/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { sendBookingReminder, sendManualBookingReminder } from "@/lib/actions/email";
import { subHours, addHours, startOfDay, endOfDay } from "date-fns";

/**
 * Send reminder emails for bookings in the next 24 hours
 * This function should be called by a cron job or scheduled task
 *
 * Run this every hour: node -e "require('./lib/actions/reminders.ts').sendRemindersForTomorrow()"
 */
export async function sendRemindersForNext24Hours() {
  try {
    const now = new Date();
    const tomorrow = addHours(now, 24);

    // Find all confirmed bookings in the next 24 hours
    const upcomingBookings = await db
      .select({
        booking: bookings,
        lead: leads,
      })
      .from(bookings)
      .leftJoin(leads, eq(bookings.leadId, leads.id))
      .where(
        and(
          eq(bookings.status, "confirmed"),
          gte(bookings.eventDate, now.toISOString()),
          lte(bookings.eventDate, tomorrow.toISOString())
        )
      );

    let sentCount = 0;
    let failedCount = 0;

    for (const { booking, lead } of upcomingBookings) {
      if (!lead?.contactEmail) {
        console.log(`No email for booking ${booking.id}`);
        failedCount++;
        continue;
      }

      // Check if reminder already sent
      const [existingLog] = await db
        .select()
        .from(emailLogs)
        .where(
          and(
            eq(emailLogs.bookingId, booking.id),
            eq(emailLogs.emailType, "reminder")
          )
        )
        .limit(1);

      if (existingLog) {
        console.log(`Reminder already sent for booking ${booking.id}`);
        continue;
      }

      // Send reminder
      const result = await sendBookingReminder({
        bookingId: booking.id,
        recipientEmail: lead.contactEmail,
        bookingData: { ...booking, lead },
        estimatedTotal: booking.estimatedTotal
          ? parseFloat(booking.estimatedTotal)
          : undefined,
      });

      if (result.success) {
        sentCount++;
        console.log(`Reminder sent for booking ${booking.id}`);
      } else {
        failedCount++;
        console.error(`Failed to send reminder for booking ${booking.id}:`, result.error);
      }
    }

    return {
      success: true,
      data: {
        total: upcomingBookings.length,
        sent: sentCount,
        failed: failedCount,
        alreadySent: upcomingBookings.length - sentCount - failedCount,
      },
    };
  } catch (error: any) {
    console.error("Error sending reminders:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get bookings that need reminders in the next 24 hours
 */
export async function getUpcomingBookingsForReminders() {
  try {
    const now = new Date();
    const tomorrow = addHours(now, 24);

    const upcomingBookings = await db
      .select({
        booking: bookings,
        lead: leads,
      })
      .from(bookings)
      .leftJoin(leads, eq(bookings.leadId, leads.id))
      .where(
        and(
          eq(bookings.status, "confirmed"),
          gte(bookings.eventDate, now.toISOString()),
          lte(bookings.eventDate, tomorrow.toISOString())
        )
      );

    return { success: true, data: upcomingBookings };
  } catch (error: any) {
    console.error("Error fetching upcoming bookings:", error);
    return { success: false, error: error.message, data: [] };
  }
}

/**
 * Send a manual reminder for a specific booking
 */
export async function sendManualReminder(bookingId: string) {
  try {
    const [result] = await db
      .select({
        booking: bookings,
        lead: leads,
      })
      .from(bookings)
      .leftJoin(leads, eq(bookings.leadId, leads.id))
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!result) {
      return { success: false, error: "Booking not found" };
    }

    const { booking, lead } = result;

    if (!lead?.contactEmail) {
      return { success: false, error: "No contact email found for this booking" };
    }

    const emailResult = await sendManualBookingReminder({
      bookingId: booking.id,
      recipientEmail: lead.contactEmail,
      bookingData: { ...booking, lead },
    });


    return emailResult;
  } catch (error: any) {
    console.error("Error sending manual reminder:", error);
    return { success: false, error: error.message };
  }
}

