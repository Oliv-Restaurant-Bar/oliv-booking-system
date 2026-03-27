import type { Booking, Lead } from "@/lib/db/schema";
import type { EmailType } from "@/lib/db/schema";
import {
  generateBookingConfirmedEmail,
  BookingConfirmedEmailParams,
} from "./booking-confirmed";
import {
  generateBookingCancelledEmail,
  BookingCancelledEmailParams,
} from "./booking-cancelled";
import {
  generateBookingCompletedEmail,
  BookingCompletedEmailParams,
} from "./booking-completed";
import {
  generateBookingReminderEmail,
  BookingReminderEmailParams,
} from "./booking-reminder";
import {
  generateBookingNoShowEmail,
  BookingNoShowEmailParams,
} from "./booking-no-show";
import {
  generateBookingDeclinedEmail,
  BookingDeclinedEmailParams,
} from "./booking-declined";
import {
  generateBookingCheckinEmail,
  BookingCheckinEmailParams,
} from "./booking-checkin";
import {
  generateBookingUpdateEmail,
  BookingUpdateEmailParams,
} from "./booking-update";
import {
  generateManualReminderEmail,
  ManualReminderEmailParams,
} from "./manual-reminder";


export {
  generateBookingConfirmedEmail,
  generateBookingCancelledEmail,
  generateBookingCompletedEmail,
  generateBookingReminderEmail,
  generateBookingNoShowEmail,
  generateBookingDeclinedEmail,
  generateBookingCheckinEmail,
  generateBookingUpdateEmail,
  generateManualReminderEmail,
};

export type {
  BookingConfirmedEmailParams,
  BookingCancelledEmailParams,
  BookingCompletedEmailParams,
  BookingReminderEmailParams,
  BookingNoShowEmailParams,
  BookingDeclinedEmailParams,
  BookingCheckinEmailParams,
  BookingUpdateEmailParams,
  ManualReminderEmailParams,
};

/**
 * Generate email content based on email type
 */
export function generateEmailContent(
  emailType: EmailType,
  params: {
    booking: Booking & { lead?: Lead | null };
    estimatedTotal?: number;
    reason?: string;
    bookingEditUrl?: string;
    feedbackUrl?: string;
    rebookingUrl?: string;
  }
): { subject: string; html: string } {
  switch (emailType) {
    case "confirmation":
      return generateBookingConfirmedEmail({
        booking: params.booking,
        estimatedTotal: params.estimatedTotal || 0,
        bookingEditUrl: params.bookingEditUrl,
      });

    case "cancellation":
      return generateBookingCancelledEmail({
        booking: params.booking,
        reason: params.reason,
      });

    case "follow_up":
      return generateBookingCompletedEmail({
        booking: params.booking,
        feedbackUrl: params.feedbackUrl,
        rebookingUrl: params.rebookingUrl,
      });

    case "reminder":
      return generateBookingReminderEmail({
        booking: params.booking,
        estimatedTotal: params.estimatedTotal,
      });

    case "checkin_reminder":
      return generateBookingCheckinEmail({
        booking: params.booking,
        checkinUrl: params.bookingEditUrl || `${process.env.NEXT_PUBLIC_APP_URL}/booking/${params.booking.id}/checkin`,
      });

    case "booking_update":
      return generateBookingUpdateEmail({
        booking: params.booking,
      });

    case "manual_reminder":
      return generateManualReminderEmail({
        booking: params.booking,
      });

    case "custom":
      // For custom emails, a basic template is returned
      return {
        subject: "Nachricht von Oliv Restaurant",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <p>Dies ist eine benutzerdefinierte E-Mail bezüglich Ihrer Buchung.</p>
            </div>
          </body>
          </html>
        `,
      };

    default:
      return {
        subject: "Nachricht von Oliv Restaurant",
        html: "<p>E-Mail-Inhalt konnte nicht generiert werden.</p>",
      };
  }
}
