import type { Booking, Lead } from "@/lib/db/schema";
import type { EmailType } from "@/lib/db/schema";
import { sanitizeBookingDetails, sanitizeText, sanitizeEmailContent } from "@/lib/utils/sanitize";

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
 * Prepare template data for booking confirmed email (no deposit - menu edit)
 */
export function getBookingConfirmedNoDepositTemplateData(
  booking: Booking & { lead?: Lead | null },
  estimatedTotal: number,
  bookingEditUrl?: string
): TemplateData {
  const lead = booking.lead;
  const customerName = sanitizeText(lead?.contactName) || "Gast";

  // ✅ SECURITY FIX: Sanitize user-provided content
  const sanitized = sanitizeBookingDetails({
    specialRequests: booking.specialRequests,
    allergyDetails: booking.allergyDetails,
  });

  return {
    customer_name: customerName,
    event_date: formatGermanDate(booking.eventDate),
    event_time: booking.eventTime,
    guest_count: booking.guestCount,
    estimated_total: formatCHF(estimatedTotal),
    booking_edit_url: bookingEditUrl || "https://oliv-restaurant.ch",
    special_requests: sanitized.specialRequests,
    allergy_details: sanitized.allergyDetails,
  };
}

/**
 * Prepare template data for "Thank You" email (with deposit inquiry)
 */
export function getThankYouDepositTemplateData(
  booking: Booking & { lead?: Lead | null },
  estimatedTotal: number
): TemplateData {
  const lead = booking.lead;
  const customerName = sanitizeText(lead?.contactName) || "Gast";

  // ✅ SECURITY FIX: Sanitize user-provided content
  const sanitized = sanitizeBookingDetails({
    specialRequests: booking.specialRequests,
    allergyDetails: booking.allergyDetails,
  });

  return {
    customer_name: customerName,
    event_date: formatGermanDate(booking.eventDate),
    event_time: booking.eventTime,
    guest_count: booking.guestCount,
    estimated_total: formatCHF(estimatedTotal),
    booking_id: generateShortBookingId(booking.id),
    special_requests: sanitized.specialRequests,
    allergy_details: sanitized.allergyDetails,
  };
}

/**
 * Prepare template data for "Thank You" email (no deposit - menu edit)
 */
export function getThankYouNoDepositTemplateData(
  booking: Booking & { lead?: Lead | null },
  estimatedTotal: number,
  bookingEditUrl?: string
): TemplateData {
  const lead = booking.lead;
  const customerName = sanitizeText(lead?.contactName) || "Gast";

  // ✅ SECURITY FIX: Sanitize user-provided content
  const sanitized = sanitizeBookingDetails({
    specialRequests: booking.specialRequests,
    allergyDetails: booking.allergyDetails,
  });

  return {
    customer_name: customerName,
    event_date: formatGermanDate(booking.eventDate),
    event_time: booking.eventTime,
    guest_count: booking.guestCount,
    estimated_total: formatCHF(estimatedTotal),
    booking_edit_url: bookingEditUrl || "https://oliv-restaurant.ch",
    special_requests: sanitized.specialRequests,
    allergy_details: sanitized.allergyDetails,
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
  const customerName = lead?.contactName || "Gast";

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
  const customerName = lead?.contactName || "Gast";

  return {
    customer_name: customerName,
    event_date: formatGermanDate(booking.eventDate),
    event_time: booking.eventTime,
    guest_count: booking.guestCount,
    rebooking_url: `${process.env.NEXT_PUBLIC_APP_URL}/wizard`,
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
  const customerName = sanitizeText(lead?.contactName) || "Gast";

  const DEPOSIT_THRESHOLD = 5000;
  const requiresDeposit = estimatedTotal && estimatedTotal >= DEPOSIT_THRESHOLD;

  // ✅ SECURITY FIX: Sanitize user-provided content
  const sanitized = sanitizeBookingDetails({
    specialRequests: booking.specialRequests,
    allergyDetails: booking.allergyDetails,
  });

  return {
    customer_name: customerName,
    event_date: formatGermanDate(booking.eventDate),
    event_time: booking.eventTime,
    guest_count: booking.guestCount,
    special_requests: sanitized.specialRequests,
    allergy_details: sanitized.allergyDetails,
  };
}

/**
 * Prepare template data for booking no-show email
 */
export function getBookingNoShowTemplateData(
  booking: Booking & { lead?: Lead | null }
): TemplateData {
  const lead = booking.lead;
  const customerName = lead?.contactName || "Gast";

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
  const customerName = lead?.contactName || "Gast";

  return {
    customer_name: customerName,
    event_date: formatGermanDate(booking.eventDate),
    event_time: booking.eventTime,
    guest_count: booking.guestCount,
    decline_reason: reason || "Leider ist das Restaurant zum gewünschten Zeitpunkt bereits ausgebucht oder wir können Ihre Anfrage aus anderen logistischen Gründen nicht erfüllen.",
  };
}

/**
 * Prepare template data for unlock request notification (to admin)
 */
export function getUnlockRequestedTemplateData(
  booking: Booking & { lead?: Lead | null }
): TemplateData {
  const lead = booking.lead;
  const customerName = lead?.contactName || "Gast";

  return {
    customer_name: customerName,
    event_date: formatGermanDate(booking.eventDate),
    booking_id: generateShortBookingId(booking.id),
    admin_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/bookings?id=${booking.id}`,
  };
}

/**
 * Prepare template data for unlock granted email (to guest)
 */
export function getUnlockGrantedTemplateData(
  booking: Booking & { lead?: Lead | null },
  bookingEditUrl?: string
): TemplateData {
  const lead = booking.lead;
  const customerName = lead?.contactName || "Gast";

  return {
    customer_name: customerName,
    event_date: formatGermanDate(booking.eventDate),
    booking_edit_url: bookingEditUrl || "https://oliv-restaurant.ch",
  };
}

/**
 * Prepare template data for unlock declined email (to guest)
 */
export function getUnlockDeclinedTemplateData(
  booking: Booking & { lead?: Lead | null },
  reason?: string
): TemplateData {
  const lead = booking.lead;
  const customerName = lead?.contactName || "Gast";

  return {
    customer_name: customerName,
    event_date: formatGermanDate(booking.eventDate),
    decline_reason: reason || "Ihre Anfrage auf Freischaltung wurde abgelehnt.",
  };
}

/**
 * Prepare template data for 4-day check-in reminder
 */
export function getCheckinReminderTemplateData(
  booking: Booking & { lead?: Lead | null },
  bookingCheckinUrl?: string
): TemplateData {
  const lead = booking.lead;
  const customerName = lead?.contactName || "Gast";

  return {
    customer_name: customerName,
    event_date: formatGermanDate(booking.eventDate),
    event_time: booking.eventTime,
    guest_count: booking.guestCount,
    booking_id: generateShortBookingId(booking.id),
    checkin_url: bookingCheckinUrl || `${process.env.NEXT_PUBLIC_APP_URL}/booking/${booking.id}/checkin`,
  };
}

/**
 * Prepare template data for check-in submission notification (to admin)
 */
export function getCheckinSubmittedTemplateData(
  booking: Booking & { lead?: Lead | null },
  params: {
    hasChanges?: boolean;
    guestCountChanged?: boolean;
    newGuestCount?: number;
    vegetarianCount?: number;
    veganCount?: number;
    nonVegetarianCount?: number;
    menuChanges?: string;
    additionalDetails?: string;
    adminUrl?: string;
  } = {}
): TemplateData {
  const lead = booking.lead;
  const customerName = lead?.contactName || "Gast";

  return {
    customer_name: customerName,
    event_date: formatGermanDate(booking.eventDate),
    booking_id: booking.id.toString().slice(0, 8),
    has_changes: params.hasChanges ? "Ja" : "Nein",
    guest_count_changed: params.guestCountChanged ? "Ja" : "Nein",
    new_guest_count: params.newGuestCount || booking.guestCount,
    vegetarian_count: params.vegetarianCount || 0,
    vegan_count: params.veganCount || 0,
    non_vegetarian_count: params.nonVegetarianCount || 0,
    menu_changes: params.menuChanges || "Keine",
    additional_details: params.additionalDetails || "Keine",
    admin_url: params.adminUrl || `${process.env.NEXT_PUBLIC_APP_URL}/admin/bookings?id=${booking.id}`,
  };
}

/**
 * Prepare template data for booking update email
 */
export function getBookingUpdateTemplateData(
  booking: Booking & { lead?: Lead | null }
): TemplateData {
  const lead = booking.lead;
  const customerName = lead?.contactName || "Gast";

  return {
    customer_name: customerName,
    event_date: formatGermanDate(booking.eventDate),
    booking_id: generateShortBookingId(booking.id),
  };
}

/**
 * Prepare template data for manual reminder email
 */
export function getManualReminderTemplateData(
  booking: Booking & { lead?: Lead | null }
): TemplateData {
  const lead = booking.lead;
  const customerName = sanitizeText(lead?.contactName) || "Gast";

  return {
    customer_name: customerName,
    event_date: formatGermanDate(booking.eventDate),
    event_time: booking.eventTime,
    guest_count: booking.guestCount,
    booking_id: generateShortBookingId(booking.id),
  };
}

/**
 * Prepare template data for assignment notification (to admin)
 */
export function getAssignmentTemplateData(
  booking: Booking & { lead?: Lead | null },
  params: { adminName?: string; eventDate?: string; eventTime?: string; bookingUrl?: string } = {}
): TemplateData {
  return {
    admin_name: params.adminName || "Admin",
    customer_name: booking.lead?.contactName || "Gast",
    event_date: params.eventDate || formatGermanDate(booking.eventDate),
    event_time: params.eventTime || booking.eventTime,
    booking_url: params.bookingUrl || `${process.env.NEXT_PUBLIC_APP_URL}/admin/bookings?id=${booking.id}`,
  };
}

/**
 * Prepare template data for kitchen PDF routing
 */
export function getKitchenPdfTemplateData(
  booking: Booking & { lead?: Lead | null },
  params: { documentName?: string; eventDate?: string } = {}
): TemplateData {
  return {
    customer_name: booking.lead?.contactName || "Gast",
    event_date: params.eventDate || formatGermanDate(booking.eventDate),
    document_name: params.documentName || "Küchenblatt",
  };
}

/**
 * Prepare template data for user creation email
 */
export function getUserCreatedTemplateData(params: {
  userName: string;
  userEmail: string;
  userRole: string;
  tempPassword: string;
  createdBy?: string;
  loginUrl?: string;
}): TemplateData {
  const roleDisplayNames: Record<string, string> = {
    super_admin: "Super-Administrator",
    admin: "Administrator",
    moderator: "Moderator",
    read_only: "Nur Lesezugriff",
  };

  return {
    user_name: params.userName,
    user_email: params.userEmail,
    user_role: roleDisplayNames[params.userRole] || params.userRole,
    temp_password: params.tempPassword,
    created_by: params.createdBy || "Systemadministrator",
    login_url: params.loginUrl || `${process.env.NEXT_PUBLIC_APP_URL}/admin/login`,
  };
}

/**
 * Get template data for any email type
 */
export function getTemplateData(
  emailType: EmailType,
  booking: Booking & { lead?: Lead | null },
  params: {
    estimatedTotal?: number;
    reason?: string;
    bookingEditUrl?: string;
    feedbackUrl?: string;
    rebookingUrl?: string;
    adminName?: string;
    eventDate?: string;
    eventTime?: string;
    bookingUrl?: string;
    documentName?: string;
    userName?: string;
    userEmail?: string;
    userRole?: string;
    tempPassword?: string;
    createdBy?: string;
    loginUrl?: string;
    hasChanges?: boolean;
    guestCountChanged?: boolean;
    newGuestCount?: number;
    vegetarianCount?: number;
    veganCount?: number;
    nonVegetarianCount?: number;
    menuChanges?: string;
    additionalDetails?: string;
  } = {}
): TemplateData {
  const DEPOSIT_THRESHOLD = 5000;

  switch (emailType) {
    case "confirmation":
      // Always use no-deposit template for all confirmation emails
      return getBookingConfirmedNoDepositTemplateData(
        booking,
        params.estimatedTotal || 0,
        params.bookingEditUrl
      );

    case "thank_you":
      // Return different data based on whether deposit is required
      if (params.estimatedTotal && params.estimatedTotal >= DEPOSIT_THRESHOLD) {
        return getThankYouDepositTemplateData(booking, params.estimatedTotal);
      } else {
        return getThankYouNoDepositTemplateData(
          booking,
          params.estimatedTotal || 0,
          params.bookingEditUrl
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

    case "no_show" as any:
      return getBookingNoShowTemplateData(booking);

    case "declined" as any:
      return getBookingDeclinedTemplateData(booking, params.reason);

    case "unlock_requested":
      return getUnlockRequestedTemplateData(booking);

    case "unlock_granted":
      return getUnlockGrantedTemplateData(booking, params.bookingEditUrl);

    case "unlock_declined":
      return getUnlockDeclinedTemplateData(booking, params.reason);

    case "assignment":
      return getAssignmentTemplateData(booking, {
        adminName: params.adminName,
        eventDate: params.eventDate,
        eventTime: params.eventTime,
        bookingUrl: params.bookingUrl,
      });

    case "kitchen_pdf":
      return getKitchenPdfTemplateData(booking, {
        documentName: params.documentName,
        eventDate: params.eventDate,
      });

    case "checkin_reminder":
      return getCheckinReminderTemplateData(booking, params.bookingEditUrl);

    case "booking_update":
      return getBookingUpdateTemplateData(booking);

    case "manual_reminder":
      return getManualReminderTemplateData(booking);

    case "custom":
      return {
        customer_name: booking.lead?.contactName || "Gast",
        event_date: formatGermanDate(booking.eventDate),
        event_time: booking.eventTime,
        guest_count: booking.guestCount,
      };

    case "user_created":
      return getUserCreatedTemplateData({
        userName: params.userName || "",
        userEmail: params.userEmail || "",
        userRole: params.userRole || "admin",
        tempPassword: params.tempPassword || "",
        createdBy: params.createdBy,
        loginUrl: params.loginUrl,
      });

    case "checkin_submitted":
      return getCheckinSubmittedTemplateData(booking, {
        hasChanges: params.hasChanges,
        guestCountChanged: params.guestCountChanged,
        newGuestCount: params.newGuestCount,
        vegetarianCount: params.vegetarianCount,
        veganCount: params.veganCount,
        nonVegetarianCount: params.nonVegetarianCount,
        menuChanges: params.menuChanges,
        additionalDetails: params.additionalDetails,
        adminUrl: params.bookingUrl,
      });

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
    // Confirmation - always use no-deposit template
    confirmation: process.env.ZEPTOMAIL_TEMPLATE_CONFIRMED_NO_DEPOSIT || "booking-confirmed-no-deposit",

    // Thank You has TWO templates based on amount
    thank_you_deposit: process.env.ZEPTOMAIL_TEMPLATE_THANK_YOU_DEPOSIT || "booking-thank-you-deposit",
    thank_you_no_deposit: process.env.ZEPTOMAIL_TEMPLATE_THANK_YOU_NO_DEPOSIT || "booking-thank-you-no-deposit",

    // Other email types
    cancellation: process.env.ZEPTOMAIL_TEMPLATE_CANCELLED || "booking-cancelled",
    follow_up: process.env.ZEPTOMAIL_TEMPLATE_COMPLETED || "booking-completed",
    reminder: process.env.ZEPTOMAIL_TEMPLATE_REMINDER || "booking-reminder",
    no_show: process.env.ZEPTOMAIL_TEMPLATE_NO_SHOW || "booking-no-show",
    declined: process.env.ZEPTOMAIL_TEMPLATE_DECLINED || "booking-declined",
    unlock_requested: process.env.ZEPTOMAIL_TEMPLATE_UNLOCK_REQUESTED || "unlock-requested",
    unlock_granted: process.env.ZEPTOMAIL_TEMPLATE_UNLOCK_GRANTED || "unlock-granted",
    unlock_declined: process.env.ZEPTOMAIL_TEMPLATE_UNLOCK_DECLINED || "unlock-declined",
    assignment: process.env.ZEPTOMAIL_TEMPLATE_ASSIGNED || "booking-assigned",
    kitchen_pdf: process.env.ZEPTOMAIL_TEMPLATE_KITCHEN_PDF || "kitchen-pdf",
    user_created: process.env.ZEPTOMAIL_TEMPLATE_USER_CREATED || "user-created",
    checkin_reminder: process.env.ZEPTOMAIL_TEMPLATE_CHECKIN_REMINDER || "booking-checkin",
    booking_update: process.env.ZEPTOMAIL_TEMPLATE_BOOKING_UPDATE || "booking-update",
    manual_reminder: process.env.ZEPTOMAIL_TEMPLATE_MANUAL_REMINDER || "manual-reminder",
    checkin_submitted: process.env.ZEPTOMAIL_TEMPLATE_CHECKIN_SUBMITTED || "checkin-submitted",
    custom: "custom-email",
  };

  // For thank you, decide based on estimated total
  if (emailType === "thank_you") {
    const DEPOSIT_THRESHOLD = 5000;
    if (estimatedTotal && estimatedTotal >= DEPOSIT_THRESHOLD) {
      return templateNames.thank_you_deposit;
    }
    return templateNames.thank_you_no_deposit;
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

  const subjects: Record<string, string> = {
    confirmation: `Buchungsbestätigung - Oliv Restaurant - ${formattedDate}`,
    thank_you: `Vielen Dank für Ihre Anfrage - Oliv Restaurant - ${formattedDate}`,
    cancellation: `Stornierung Ihrer Buchung - Oliv Restaurant - ${formattedDate}`,
    follow_up: `Vielen Dank für Ihren Besuch - Oliv Restaurant`,
    reminder: `Erinnerung an Ihre Buchung morgen - Oliv Restaurant`,
    no_show: `Nicht erschienen - Oliv Restaurant - ${formattedDate}`,
    declined: `Ihre Buchungsanfrage - Oliv Restaurant`,
    unlock_requested: `Anfrage auf Bearbeitung - Buchung #${generateShortBookingId(booking.id).toUpperCase()}`,
    unlock_granted: `Ihre Buchung wurde freigeschaltet - Oliv Restaurant`,
    unlock_declined: `Update zu Ihrer Anfrage auf Bearbeitung - Oliv Restaurant`,
    assignment: `Neue Buchung zugewiesen: ${booking.lead?.contactName || "Gast"}`,
    kitchen_pdf: `Küchenblatt: ${booking.lead?.contactName || "Gast"} - ${formattedDate}`,
    user_created: `Willkommen beim Oliv Buchungssystem - Ihr Konto ist bereit`,
    checkin_reminder: `Wichtige Bestätigung: Ihre Veranstaltung am ${formattedDate} - Oliv Restaurant`,
    booking_update: `Aktualisierte Details zu Ihrer Buchung - ${formattedDate}`,
    manual_reminder: `Ihre Buchung bei Oliv Restaurant - Kontaktaufnahme`,
    checkin_submitted: `Check-in eingegangen: ${booking.lead?.contactName || "Gast"} - ${formattedDate}`,
    custom: `Nachricht von Oliv Restaurant`,
  };

  return subjects[emailType] || "Nachricht von Oliv Restaurant";
}
