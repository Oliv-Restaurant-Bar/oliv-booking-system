import type { Booking, Lead } from "@/lib/db/schema";
import type { EmailType } from "@/lib/db/schema";

/**
 * Template mapper for ZeptoMail dashboard templates
 *
 * This file contains functions to prepare template data for each email type.
 * The actual HTML templates are managed in ZeptoMail dashboard, not in code.
 */

export interface TemplateData {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Format date to German locale
 */
function formatGermanDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("de-CH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format currency to Swiss Francs
 */
function formatCHF(amount: number): string {
  return amount.toFixed(2);
}

/**
 * Generate short booking ID
 */
function generateShortBookingId(bookingId: number | string): string {
  return bookingId.toString().slice(0, 8);
}

/**
 * Prepare template data for booking confirmed email (with deposit)
 */
export function getBookingConfirmedDepositTemplateData(
  booking: Booking & { lead?: Lead | null },
  estimatedTotal: number,
  bookingEditUrl?: string,
  editLinkExpiresAt?: string
): TemplateData {
  const lead = booking.lead;
  const customerName = lead?.contactName || lead?.name || "Gast";

  return {
    customer_name: customerName,
    event_date: formatGermanDate(booking.eventDate),
    event_time: booking.eventTime,
    guest_count: booking.guestCount,
    estimated_total: formatCHF(estimatedTotal),
    deposit_amount: formatCHF(estimatedTotal * 0.3),
    deposit_percentage: "30",
    booking_id: generateShortBookingId(booking.id),
    booking_edit_url: bookingEditUrl || "https://oliv-restaurant.ch",
    edit_link_expires_at: editLinkExpiresAt || "",
    special_requests: booking.specialRequests || "Keine",
    allergy_details: Array.isArray(booking.allergyDetails)
      ? booking.allergyDetails.join(", ") || "Keine"
      : booking.allergyDetails || "Keine",
  };
}

/**
 * Prepare template data for booking confirmed email (no deposit - menu edit)
 */
export function getBookingConfirmedNoDepositTemplateData(
  booking: Booking & { lead?: Lead | null },
  estimatedTotal: number,
  bookingEditUrl?: string,
  editLinkExpiresAt?: string
): TemplateData {
  const lead = booking.lead;
  const customerName = lead?.contactName || lead?.name || "Gast";

  return {
    customer_name: customerName,
    event_date: formatGermanDate(booking.eventDate),
    event_time: booking.eventTime,
    guest_count: booking.guestCount,
    estimated_total: formatCHF(estimatedTotal),
    booking_edit_url: bookingEditUrl || "https://oliv-restaurant.ch",
    edit_link_expires_at: editLinkExpiresAt || "",
    special_requests: booking.specialRequests || "Keine",
    allergy_details: Array.isArray(booking.allergyDetails)
      ? booking.allergyDetails.join(", ") || "Keine"
      : booking.allergyDetails || "Keine",
  };
}

/**
 * Prepare template data for booking cancelled email
 */
export function getBookingCancelledTemplateData(
  booking: Booking & { lead?: Lead | null },
  reason?: string
): TemplateData {
  const lead = booking.lead;
  const customerName = lead?.contactName || lead?.name || "Gast";

  return {
    customer_name: customerName,
    event_date: formatGermanDate(booking.eventDate),
    event_time: booking.eventTime,
    guest_count: booking.guestCount,
    booking_id: generateShortBookingId(booking.id),
    cancellation_reason: reason || "Keine Angabe",
  };
}

/**
 * Prepare template data for booking completed email
 */
export function getBookingCompletedTemplateData(
  booking: Booking & { lead?: Lead | null },
  feedbackUrl?: string,
  rebookingUrl?: string
): TemplateData {
  const lead = booking.lead;
  const customerName = lead?.contactName || lead?.name || "Gast";

  return {
    customer_name: customerName,
    event_date: formatGermanDate(booking.eventDate),
    event_time: booking.eventTime,
    guest_count: booking.guestCount,
    feedback_url: feedbackUrl || "",
    rebooking_url: rebookingUrl || "",
  };
}

/**
 * Prepare template data for booking reminder email
 */
export function getBookingReminderTemplateData(
  booking: Booking & { lead?: Lead | null },
  estimatedTotal?: number
): TemplateData {
  const lead = booking.lead;
  const customerName = lead?.contactName || lead?.name || "Gast";

  const DEPOSIT_THRESHOLD = 5000;
  const requiresDeposit = estimatedTotal && estimatedTotal >= DEPOSIT_THRESHOLD;

  return {
    customer_name: customerName,
    event_date: formatGermanDate(booking.eventDate),
    event_time: booking.eventTime,
    guest_count: booking.guestCount,
    estimated_total: estimatedTotal ? formatCHF(estimatedTotal) : "0.00",
    deposit_amount: requiresDeposit ? formatCHF((estimatedTotal || 0) * 0.3) : "0.00",
    deposit_percentage: "30",
    special_requests: booking.specialRequests || "Keine",
    allergy_details: Array.isArray(booking.allergyDetails)
      ? booking.allergyDetails.join(", ") || "Keine"
      : booking.allergyDetails || "Keine",
  };
}

/**
 * Prepare template data for booking no-show email
 */
export function getBookingNoShowTemplateData(
  booking: Booking & { lead?: Lead | null }
): TemplateData {
  const lead = booking.lead;
  const customerName = lead?.contactName || lead?.name || "Gast";

  return {
    customer_name: customerName,
    event_date: formatGermanDate(booking.eventDate),
    event_time: booking.eventTime,
    guest_count: booking.guestCount,
  };
}

/**
 * Prepare template data for booking declined email
 */
export function getBookingDeclinedTemplateData(
  booking: Booking & { lead?: Lead | null },
  reason?: string
): TemplateData {
  const lead = booking.lead;
  const customerName = lead?.contactName || lead?.name || "Gast";

  return {
    customer_name: customerName,
    event_date: formatGermanDate(booking.eventDate),
    event_time: booking.eventTime,
    guest_count: booking.guestCount,
    decline_reason: reason || "Leider ist das Restaurant zum gewünschten Zeitpunkt bereits ausgebucht oder wir können Ihre Anfrage aus anderen logistischen Gründen nicht erfüllen.",
  };
}

/**
 * Get template data for any email type
 *
 * This is the main function to get template data based on email type
 * For confirmation emails, returns different data based on deposit requirement
 */
export function getTemplateData(
  emailType: EmailType,
  booking: Booking & { lead?: Lead | null },
  params: {
    estimatedTotal?: number;
    reason?: string;
    bookingEditUrl?: string;
    editLinkExpiresAt?: string;
    feedbackUrl?: string;
    rebookingUrl?: string;
  } = {}
): TemplateData {
  const DEPOSIT_THRESHOLD = 5000;

  switch (emailType) {
    case "confirmation":
      // Return different data based on whether deposit is required
      if (params.estimatedTotal && params.estimatedTotal >= DEPOSIT_THRESHOLD) {
        return getBookingConfirmedDepositTemplateData(
          booking,
          params.estimatedTotal,
          params.bookingEditUrl,
          params.editLinkExpiresAt
        );
      } else {
        return getBookingConfirmedNoDepositTemplateData(
          booking,
          params.estimatedTotal || 0,
          params.bookingEditUrl,
          params.editLinkExpiresAt
        );
      }

    case "cancellation":
      return getBookingCancelledTemplateData(booking, params.reason);

    case "follow_up":
      return getBookingCompletedTemplateData(
        booking,
        params.feedbackUrl,
        params.rebookingUrl
      );

    case "reminder":
      return getBookingReminderTemplateData(booking, params.estimatedTotal);

    case "no_show":
      return getBookingNoShowTemplateData(booking);

    case "declined":
      return getBookingDeclinedTemplateData(booking, params.reason);

    case "custom":
      // For custom emails, return basic data
      return {
        customer_name: booking.lead?.contactName || booking.lead?.name || "Gast",
        event_date: formatGermanDate(booking.eventDate),
        event_time: booking.eventTime,
        guest_count: booking.guestCount,
      };

    default:
      return {};
  }
}

/**
 * Get ZeptoMail template name for email type
 *
 * Maps internal email types to ZeptoMail dashboard template names
 * For confirmation emails, returns different template based on deposit requirement
 */
export function getTemplateName(emailType: EmailType, estimatedTotal?: number): string {
  const templateNames: Record<string, string> = {
    // Confirmation has TWO templates based on amount
    confirmation_deposit: process.env.ZEPTOMAIL_TEMPLATE_CONFIRMED_DEPOSIT || "booking-confirmed-deposit",
    confirmation_no_deposit: process.env.ZEPTOMAIL_TEMPLATE_CONFIRMED_NO_DEPOSIT || "booking-confirmed-no-deposit",

    // Other email types
    cancellation: process.env.ZEPTOMAIL_TEMPLATE_CANCELLED || "booking-cancelled",
    follow_up: process.env.ZEPTOMAIL_TEMPLATE_COMPLETED || "booking-completed",
    reminder: process.env.ZEPTOMAIL_TEMPLATE_REMINDER || "booking-reminder",
    no_show: process.env.ZEPTOMAIL_TEMPLATE_NO_SHOW || "booking-no-show",
    declined: process.env.ZEPTOMAIL_TEMPLATE_DECLINED || "booking-declined",
    custom: "custom-email",
  };

  // For confirmation, decide based on estimated total
  if (emailType === "confirmation") {
    const DEPOSIT_THRESHOLD = 5000;
    if (estimatedTotal && estimatedTotal >= DEPOSIT_THRESHOLD) {
      return templateNames.confirmation_deposit;
    }
    return templateNames.confirmation_no_deposit;
  }

  return templateNames[emailType] || "custom-email";
}

/**
 * Get email subject for email type (fallback, templates can override)
 */
export function getEmailSubject(
  emailType: EmailType,
  booking: Booking & { lead?: Lead | null }
): string {
  const formattedDate = formatGermanDate(booking.eventDate);

  const subjects: Record<EmailType, string> = {
    confirmation: `Buchungsbestätigung - Oliv Restaurant - ${formattedDate}`,
    cancellation: `Stornierung Ihrer Buchung - Oliv Restaurant - ${formattedDate}`,
    follow_up: `Vielen Dank für Ihren Besuch - Oliv Restaurant`,
    reminder: `Erinnerung an Ihre Buchung morgen - Oliv Restaurant`,
    no_show: `Nicht erschienen - Oliv Restaurant - ${formattedDate}`,
    declined: `Ihre Buchungsanfrage - Oliv Restaurant`,
    custom: `Nachricht von Oliv Restaurant`,
  };

  return subjects[emailType] || "Nachricht von Oliv Restaurant";
}
