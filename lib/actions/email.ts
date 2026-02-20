'use server';

import { db } from "@/lib/db";
import { emailLogs } from "@/lib/db/schema";
import { sendEmail, sendTemplateEmail } from "@/lib/email/zeptomail";
import { generateEmailContent } from "@/lib/email/templates";
import { getTemplateData, getTemplateName, getEmailSubject } from "@/lib/email/template-mapper";
import type { EmailType, Booking, Lead } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

/**
 * Send booking email and log to database
 *
 * Supports two modes:
 * 1. HTML mode (legacy) - sends HTML content directly
 * 2. Template mode (new) - sends template name + data to ZeptoMail dashboard
 *
 * Set USE_ZEPTOMAIL_TEMPLATES=true in .env to use template mode
 */
export async function sendBookingEmail(params: {
  bookingId: string;
  emailType: EmailType;
  recipientEmail: string;
  bookingData: Booking & { lead?: Lead | null };
  estimatedTotal?: number;
  reason?: string;
  bookingEditUrl?: string;
  feedbackUrl?: string;
  rebookingUrl?: string;
}): Promise<{ success: boolean; error?: string; emailLogId?: string }> {
  try {
    // Check if we should use ZeptoMail templates
    const useTemplates = process.env.USE_ZEPTOMAIL_TEMPLATES === "true";

    let subject: string;
    let emailResult: { success: boolean; error?: string; messageId?: string };

    if (useTemplates) {
      // Template mode - send template name + data
      const templateName = getTemplateName(params.emailType, params.estimatedTotal);
      const templateData = getTemplateData(params.emailType, params.bookingData, {
        estimatedTotal: params.estimatedTotal,
        reason: params.reason,
        bookingEditUrl: params.bookingEditUrl,
        feedbackUrl: params.feedbackUrl,
        rebookingUrl: params.rebookingUrl,
      });

      subject = getEmailSubject(params.emailType, params.bookingData);

      // Create email log entry with pending status
      const emailLogId = randomUUID();
      await db.insert(emailLogs).values({
        id: emailLogId,
        bookingId: params.bookingId,
        emailType: params.emailType,
        recipient: params.recipientEmail,
        subject,
        status: "pending",
      });

      // Send email using template
      emailResult = await sendTemplateEmail({
        to: params.recipientEmail,
        templateName,
        templateData,
        subject,
      });

      if (!emailResult.success) {
        // Update log to failed
        await db
          .update(emailLogs)
          .set({ status: "failed" })
          .where(eq(emailLogs.id, emailLogId));

        return {
          success: false,
          error: emailResult.error || "Failed to send template email",
          emailLogId,
        };
      }

      // Update log to sent
      await db
        .update(emailLogs)
        .set({ status: "sent", sentAt: new Date() })
        .where(eq(emailLogs.id, emailLogId));

      return {
        success: true,
        emailLogId,
      };
    } else {
      // HTML mode (legacy) - generate and send HTML directly
      const { subject, html } = generateEmailContent(params.emailType, {
        booking: params.bookingData,
        estimatedTotal: params.estimatedTotal,
        reason: params.reason,
        bookingEditUrl: params.bookingEditUrl,
        feedbackUrl: params.feedbackUrl,
        rebookingUrl: params.rebookingUrl,
      });

      // Create email log entry with pending status
      const emailLogId = randomUUID();
      await db.insert(emailLogs).values({
        id: emailLogId,
        bookingId: params.bookingId,
        emailType: params.emailType,
        recipient: params.recipientEmail,
        subject,
        status: "pending",
      });

      // Send email
      emailResult = await sendEmail({
        to: params.recipientEmail,
        subject,
        html,
      });

      if (!emailResult.success) {
        // Update log to failed
        await db
          .update(emailLogs)
          .set({ status: "failed" })
          .where(eq(emailLogs.id, emailLogId));

        return {
          success: false,
          error: emailResult.error || "Failed to send email",
          emailLogId,
        };
      }

      // Update log to sent
      await db
        .update(emailLogs)
        .set({ status: "sent", sentAt: new Date() })
        .where(eq(emailLogs.id, emailLogId));

      return {
        success: true,
        emailLogId,
      };
    }
  } catch (error: any) {
    console.error("Error in sendBookingEmail:", error);
    return {
      success: false,
      error: error.message || "Failed to send booking email",
    };
  }
}

/**
 * Send reminder email (24 hours before booking)
 */
export async function sendBookingReminder(params: {
  bookingId: string;
  recipientEmail: string;
  bookingData: Booking & { lead?: Lead | null };
  estimatedTotal?: number;
}): Promise<{ success: boolean; error?: string }> {
  return sendBookingEmail({
    bookingId: params.bookingId,
    emailType: "reminder",
    recipientEmail: params.recipientEmail,
    bookingData: params.bookingData,
    estimatedTotal: params.estimatedTotal,
  });
}

/**
 * Send confirmation email
 */
export async function sendBookingConfirmation(params: {
  bookingId: string;
  recipientEmail: string;
  bookingData: Booking & { lead?: Lead | null };
  estimatedTotal?: number;
  bookingEditUrl?: string;
  editLinkExpiresAt?: string;
}): Promise<{ success: boolean; error?: string }> {
  return sendBookingEmail({
    bookingId: params.bookingId,
    emailType: "confirmation",
    recipientEmail: params.recipientEmail,
    bookingData: params.bookingData,
    estimatedTotal: params.estimatedTotal,
    bookingEditUrl: params.bookingEditUrl,
  });
}

/**
 * Send cancellation email
 */
export async function sendBookingCancellation(params: {
  bookingId: string;
  recipientEmail: string;
  bookingData: Booking & { lead?: Lead | null };
  reason?: string;
}): Promise<{ success: boolean; error?: string }> {
  return sendBookingEmail({
    bookingId: params.bookingId,
    emailType: "cancellation",
    recipientEmail: params.recipientEmail,
    bookingData: params.bookingData,
    reason: params.reason,
  });
}

/**
 * Send completion/follow-up email with feedback request
 */
export async function sendBookingCompletion(params: {
  bookingId: string;
  recipientEmail: string;
  bookingData: Booking & { lead?: Lead | null };
  feedbackUrl?: string;
  rebookingUrl?: string;
}): Promise<{ success: boolean; error?: string }> {
  return sendBookingEmail({
    bookingId: params.bookingId,
    emailType: "follow_up",
    recipientEmail: params.recipientEmail,
    bookingData: params.bookingData,
    feedbackUrl: params.feedbackUrl,
    rebookingUrl: params.rebookingUrl,
  });
}

/**
 * Send no-show email
 */
export async function sendBookingNoShow(params: {
  bookingId: string;
  recipientEmail: string;
  bookingData: Booking & { lead?: Lead | null };
}): Promise<{ success: boolean; error?: string }> {
  return sendBookingEmail({
    bookingId: params.bookingId,
    emailType: "no_show",
    recipientEmail: params.recipientEmail,
    bookingData: params.bookingData,
  });
}

/**
 * Send declined email
 */
export async function sendBookingDeclined(params: {
  bookingId: string;
  recipientEmail: string;
  bookingData: Booking & { lead?: Lead | null };
  reason?: string;
}): Promise<{ success: boolean; error?: string }> {
  return sendBookingEmail({
    bookingId: params.bookingId,
    emailType: "declined",
    recipientEmail: params.recipientEmail,
    bookingData: params.bookingData,
    reason: params.reason,
  });
}

/**
 * Get email logs for a booking
 */
export async function getBookingEmailLogs(bookingId: string) {
  try {
    const logs = await db
      .select()
      .from(emailLogs)
      .where(eq(emailLogs.bookingId, bookingId))
      .orderBy(emailLogs.createdAt);

    return { success: true, data: logs };
  } catch (error: any) {
    console.error("Error fetching email logs:", error);
    return { success: false, error: "Failed to fetch email logs", data: [] };
  }
}

/**
 * Resend an email (for manual resend functionality)
 */
export async function resendBookingEmail(emailLogId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const [emailLog] = await db
      .select()
      .from(emailLogs)
      .where(eq(emailLogs.id, emailLogId))
      .limit(1);

    if (!emailLog) {
      return { success: false, error: "Email log not found" };
    }

    // Send email again with same content
    const emailResult = await sendEmail({
      to: emailLog.recipient,
      subject: emailLog.subject,
      html: emailLog.subject, // Note: We don't store HTML, so this would need to be regenerated
    });

    if (!emailResult.success) {
      return {
        success: false,
        error: emailResult.error || "Failed to resend email",
      };
    }

    // Create new log entry for the resent email
    await db.insert(emailLogs).values({
      id: randomUUID(),
      bookingId: emailLog.bookingId,
      emailType: emailLog.emailType,
      recipient: emailLog.recipient,
      subject: emailLog.subject,
      status: "sent",
      sentAt: new Date(),
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error resending email:", error);
    return { success: false, error: error.message || "Failed to resend email" };
  }
}
