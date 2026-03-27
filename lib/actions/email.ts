'use server';

import { db } from "@/lib/db";
import { emailLogs, bookings, leads } from "@/lib/db/schema";
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
  attachments?: Array<{
    content: string;
    mime_type: string;
    name: string;
  }>;
}): Promise<{ success: boolean; error?: string; emailLogId?: string }> {
  try {
    // Skip email sending if ZeptoMail token is not configured
    if (!process.env.ZEPTOMAIL_API_TOKEN) {
      console.log('📧 Email skipped (ZEPTOMAIL_API_TOKEN not configured):', params.emailType);
      console.log('   Would send to:', params.recipientEmail);
      if (params.bookingEditUrl) {
        console.log('   Edit Link:', params.bookingEditUrl);
      }
      return {
        success: true,
        emailLogId: undefined,
      };
    }

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
        attachments: params.attachments,
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
        attachments: params.attachments,
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
}): Promise<{ success: boolean; error?: string; emailLogId?: string }> {
  return sendBookingEmail({
    bookingId: params.bookingId,
    emailType: "reminder",
    recipientEmail: params.recipientEmail,
    bookingData: params.bookingData,
    estimatedTotal: params.estimatedTotal,
  });
}

/**
 * Send "Thank You" email (after initial booking/inquiry)
 */
export async function sendThankYouEmail(params: {
  bookingId: string;
  recipientEmail: string;
  bookingData: Booking & { lead?: Lead | null };
  estimatedTotal?: number;
  bookingEditUrl?: string;
  pdfAttachment?: { content: string; mime_type: string; name: string };
}): Promise<{ success: boolean; error?: string; emailLogId?: string }> {
  return sendBookingEmail({
    bookingId: params.bookingId,
    emailType: "thank_you",
    recipientEmail: params.recipientEmail,
    bookingData: params.bookingData,
    estimatedTotal: params.estimatedTotal,
    bookingEditUrl: params.bookingEditUrl,
    attachments: params.pdfAttachment ? [params.pdfAttachment] : undefined,
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
}): Promise<{ success: boolean; error?: string; emailLogId?: string }> {
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
}): Promise<{ success: boolean; error?: string; emailLogId?: string }> {
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
}): Promise<{ success: boolean; error?: string; emailLogId?: string }> {
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
}): Promise<{ success: boolean; error?: string; emailLogId?: string }> {
  return sendBookingEmail({
    bookingId: params.bookingId,
    emailType: "no_show" as any,
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
}): Promise<{ success: boolean; error?: string; emailLogId?: string }> {
  return sendBookingEmail({
    bookingId: params.bookingId,
    emailType: "declined" as any,
    recipientEmail: params.recipientEmail,
    bookingData: params.bookingData,
    reason: params.reason,
  });
}

/**
 * Send notification to admin that an unlock was requested
 */
export async function sendUnlockRequestedNotification(params: {
  bookingId: string;
  adminEmail: string;
  bookingData: Booking & { lead?: Lead | null };
}): Promise<{ success: boolean; error?: string; emailLogId?: string }> {
  return sendBookingEmail({
    bookingId: params.bookingId,
    emailType: "unlock_requested",
    recipientEmail: params.adminEmail,
    bookingData: params.bookingData,
  });
}

/**
 * Send email to guest informing them their booking was unlocked
 */
export async function sendUnlockGrantedEmail(params: {
  bookingId: string;
  recipientEmail: string;
  bookingData: Booking & { lead?: Lead | null };
  bookingEditUrl: string;
}): Promise<{ success: boolean; error?: string; emailLogId?: string }> {
  return sendBookingEmail({
    bookingId: params.bookingId,
    emailType: "unlock_granted",
    recipientEmail: params.recipientEmail,
    bookingData: params.bookingData,
    bookingEditUrl: params.bookingEditUrl,
  });
}

/**
 * Send email to guest informing them their unlock request was declined
 */
export async function sendUnlockDeclinedEmail(params: {
  bookingId: string;
  recipientEmail: string;
  bookingData: Booking & { lead?: Lead | null };
  reason?: string;
}): Promise<{ success: boolean; error?: string; emailLogId?: string }> {
  return sendBookingEmail({
    bookingId: params.bookingId,
    emailType: "unlock_declined",
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
      .orderBy(emailLogs.sentAt);

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

/**
 * Send an email notification when a booking is assigned to a system user
 */
export async function sendAssignmentNotification(params: {
  bookingId: string;
  adminEmail: string;
  adminName: string;
  customerName: string;
  eventDate: string;
  eventTime: string;
}): Promise<{ success: boolean; error?: string; emailLogId?: string }> {
  try {
    const useTemplates = process.env.USE_ZEPTOMAIL_TEMPLATES === "true";
    const subject = `Neue Buchung zugewiesen: ${params.customerName}`;

    if (useTemplates) {
      const templateName = getTemplateName("assignment" as any);
      const [fetchedBooking] = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, params.bookingId))
        .leftJoin(leads, eq(bookings.leadId, leads.id))
        .limit(1);

      if (!fetchedBooking) return { success: false, error: "Booking not found" };

      const templateData = getTemplateData("assignment" as any, { ...fetchedBooking.bookings, lead: fetchedBooking.leads }, {
        adminName: params.adminName,
        eventDate: params.eventDate,
        eventTime: params.eventTime,
      });

      const emailLogId = randomUUID();
      await db.insert(emailLogs).values({
        id: emailLogId,
        bookingId: params.bookingId,
        emailType: "assignment",
        recipient: params.adminEmail,
        subject,
        status: "pending",
      });

      const result = await sendTemplateEmail({
        to: params.adminEmail,
        templateName,
        templateData,
        subject,
      });

      if (!result.success) {
        await db.update(emailLogs).set({ status: "failed" }).where(eq(emailLogs.id, emailLogId));
        return result;
      }

      await db.update(emailLogs).set({ status: "sent", sentAt: new Date() }).where(eq(emailLogs.id, emailLogId));
      return result;
    } else {
      // HTML fallback (existing logic)
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://oliv-booking.ch";
      const bookingUrl = `${baseUrl}/admin/bookings?id=${params.bookingId}`;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #4CAF50;">Benachrichtigung über Buchungszuweisung</h2>
          <p>Hallo ${params.adminName},</p>
          <p>Ihnen wurde im System eine neue Buchung zugewiesen.</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Kunde:</strong> ${params.customerName}</p>
            <p><strong>Datum:</strong> ${params.eventDate}</p>
            <p><strong>Uhrzeit:</strong> ${params.eventTime}</p>
          </div>
          <p>Bitte melden Sie sich im Admin-Panel an, um die vollständigen Details anzusehen und diese Buchung zu verwalten.</p>
          <a href="${bookingUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Buchung ansehen</a>
          <p style="margin-top: 30px; font-size: 12px; color: #777;">
            Dies ist eine automatisierte Nachricht aus dem Oliv Buchungssystem.
          </p>
        </div>
      `;

      const emailLogId = randomUUID();
      await db.insert(emailLogs).values({
        id: emailLogId,
        bookingId: params.bookingId,
        emailType: "assignment",
        recipient: params.adminEmail,
        subject,
        status: "pending",
      });

      const result = await sendEmail({
        to: params.adminEmail,
        subject,
        html,
      });

      if (!result.success) {
        await db.update(emailLogs).set({ status: "failed" }).where(eq(emailLogs.id, emailLogId));
        return result;
      }

      await db.update(emailLogs).set({ status: "sent", sentAt: new Date() }).where(eq(emailLogs.id, emailLogId));
      return result;
    }
  } catch (error: any) {
    console.error("Error sending assignment notification:", error);
    return { success: false, error: error.message || "Failed to send assignment notification" };
  }
}

/**
 * Send the kitchen PDF directly to internal or external staff
 */
export async function sendKitchenPdfEmail(params: {
  bookingId: string;
  recipientEmails: string[];
  documentName: string;
  pdfBase64: string;
  customerName: string;
  eventDate: string;
}): Promise<{ success: boolean; error?: string; emailLogId?: string }> {
  try {
    const useTemplates = process.env.USE_ZEPTOMAIL_TEMPLATES === "true";
    const subject = `Küchenblatt: ${params.customerName} - ${params.eventDate}`;

    // Clean and validate base64 content
    let base64Content = params.pdfBase64;

    // Remove data URI prefix if present (for backward compatibility)
    if (base64Content.startsWith('data:application/pdf;base64,')) {
      base64Content = base64Content.replace(/^data:application\/pdf;base64,/, "");
    }

    // Remove ALL whitespace (this is critical!)
    base64Content = base64Content.replace(/\s/g, '');

    // Verify base64 is valid
    if (!base64Content || base64Content.length === 0) {
      throw new Error("PDF base64 content is empty after processing");
    }

    // Validate that it's actually a PDF by checking magic bytes
    try {
      const pdfHeader = atob(base64Content.substring(0, 20));
      if (!pdfHeader.includes('%PDF-')) {
        console.error('❌ Invalid PDF header in email attachment!');
        console.error('   Expected: %PDF-, Got:', pdfHeader.substring(0, 20));
        throw new Error("Invalid PDF file - missing PDF header");
      }
    } catch (decodeError) {
      console.error('❌ Failed to decode base64 to validate PDF header:', decodeError);
      throw new Error("Base64 content is not valid PDF data");
    }

    // Log for debugging
    console.log('📄 PDF Attachment Debug:');
    console.log(`   - Original length: ${params.pdfBase64.length}`);
    console.log(`   - Cleaned length: ${base64Content.length}`);
    console.log(`   - PDF header valid: ✅`);
    console.log(`   - Filename: ${params.documentName}.pdf`);

    if (useTemplates) {
      const templateName = getTemplateName("kitchen_pdf" as any);
      const [fetchedBooking] = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, params.bookingId))
        .leftJoin(leads, eq(bookings.leadId, leads.id))
        .limit(1);

      if (!fetchedBooking) return { success: false, error: "Booking not found" };

      const templateData = getTemplateData("kitchen_pdf" as any, { ...fetchedBooking.bookings, lead: fetchedBooking.leads }, {
        documentName: params.documentName,
        eventDate: params.eventDate,
      });

      const emailLogId = randomUUID();
      await db.insert(emailLogs).values({
        id: emailLogId,
        bookingId: params.bookingId,
        emailType: "kitchen_pdf",
        recipient: params.recipientEmails.join(", "),
        subject,
        status: "pending",
      });

      const result = await sendTemplateEmail({
        to: params.recipientEmails,
        templateName,
        templateData,
        subject,
        attachments: [
          {
            name: `${params.documentName}.pdf`,
            mime_type: "application/pdf",
            content: base64Content
          }
        ]
      });

      console.log('📧 Template email sent, result:', result);

      if (!result.success) {
        await db.update(emailLogs).set({ status: "failed" }).where(eq(emailLogs.id, emailLogId));
        return result;
      }

      await db.update(emailLogs).set({ status: "sent", sentAt: new Date() }).where(eq(emailLogs.id, emailLogId));
      return result;
    } else {
      // HTML fallback (existing logic)
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-bottom: 2px solid #e2e8f0;">
            <tr>
              <td style="padding: 20px 30px;">
                <h2 style="color: #0f172a; margin: 0; font-size: 24px;">Küchenblatt-Weiterleitung</h2>
              </td>
            </tr>
          </table>
          
          <div style="padding: 30px;">
            <p style="font-size: 16px; line-height: 1.5; color: #334155; margin-top: 0;">
              Guten Tag,
            </p>
            <p style="font-size: 16px; line-height: 1.5; color: #334155;">
              ein neues Küchenblatt wurde für eine bevorstehende Buchung erstellt. Bitte finden Sie das PDF im Anhang dieser E-Mail.
            </p>
            
            <div style="background-color: #f1f5f9; border-left: 4px solid #3b82f6; padding: 15px 20px; margin: 25px 0;">
              <p style="margin: 0 0 10px 0; font-size: 15px;"><strong>Kunde:</strong> ${params.customerName}</p>
              <p style="margin: 0; font-size: 15px;"><strong>Datum:</strong> ${params.eventDate}</p>
            </div>
            
            <p style="font-size: 16px; line-height: 1.5; color: #334155; margin-bottom: 30px;">
              Dokumentenname: <em>${params.documentName}</em>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />
            
            <p style="font-size: 13px; color: #64748b; margin: 0; text-align: center;">
              Dies ist eine automatisierte betriebliche Nachricht aus dem Oliv Buchungssystem.
            </p>
          </div>
        </div>
      `;

      const emailLogId = randomUUID();
      await db.insert(emailLogs).values({
        id: emailLogId,
        bookingId: params.bookingId,
        emailType: "kitchen_pdf",
        recipient: params.recipientEmails.join(", "),
        subject,
        status: "pending",
      });

      const result = await sendEmail({
        to: params.recipientEmails,
        subject,
        html,
        attachments: [
          {
            name: `${params.documentName}.pdf`,
            mime_type: "application/pdf",
            content: base64Content
          }
        ]
      });

      console.log('📧 HTML email sent, result:', result);

      if (!result.success) {
        await db.update(emailLogs).set({ status: "failed" }).where(eq(emailLogs.id, emailLogId));
        return result;
      }

      await db.update(emailLogs).set({ status: "sent", sentAt: new Date() }).where(eq(emailLogs.id, emailLogId));
      return result;
    }
  } catch (error: any) {
    console.error("Error sending kitchen PDF email:", error);
    return { success: false, error: error.message || "Failed to send kitchen PDF email" };
  }
}

/**
 * Send user creation/welcome email
 */
export async function sendUserCreatedEmail(params: {
  userName: string;
  userEmail: string;
  userRole: string;
  createdBy?: string;
  tempPassword: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const useTemplates = process.env.USE_ZEPTOMAIL_TEMPLATES === "true";

    if (!process.env.ZEPTOMAIL_API_TOKEN) {
      console.log('📧 Email skipped (ZEPTOMAIL_API_TOKEN not configured): user_created');
      console.log('   Would send to:', params.userEmail);
      return { success: true };
    }

    const subject = "Willkommen beim Oliv Buchungssystem - Ihr Konto ist bereit";

    if (useTemplates) {
      const templateName = process.env.ZEPTOMAIL_TEMPLATE_USER_CREATED || "user-created";

      // Map role to display name
      const roleDisplayNames: Record<string, string> = {
        super_admin: "Super Administrator",
        admin: "Administrator",
        moderator: "Moderator",
        read_only: "Read Only",
      };
      const displayRole = roleDisplayNames[params.userRole] || params.userRole;

      const templateData = {
        user_name: params.userName,
        user_email: params.userEmail,
        user_role: displayRole,
        created_by: params.createdBy || "Systemadministrator",
        login_url: `${process.env.NEXT_PUBLIC_APP_URL}/admin/login`,
        temp_password: params.tempPassword,
      };

      // Create email log entry with pending status
      const emailLogId = randomUUID();
      await db.insert(emailLogs).values({
        id: emailLogId,
        bookingId: null, // No booking associated with user creation emails
        emailType: "user_created",
        recipient: params.userEmail,
        subject,
        status: "pending",
      });

      const result = await sendTemplateEmail({
        to: params.userEmail,
        subject,
        templateName,
        templateData,
      });

      if (!result.success) {
        await db.update(emailLogs).set({ status: "failed" }).where(eq(emailLogs.id, emailLogId));
        return result;
      }

      await db.update(emailLogs).set({ status: "sent", sentAt: new Date() }).where(eq(emailLogs.id, emailLogId));
      return result;
    } else {
      // Fallback: Generate HTML email
      const roleDisplayNames: Record<string, string> = {
        super_admin: "Super-Administrator",
        admin: "Administrator",
        moderator: "Moderator",
        read_only: "Nur Lesezugriff",
      };
      const displayRole = roleDisplayNames[params.userRole] || params.userRole;

      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 40px 20px;">
          <div style="background-color: white; border-radius: 8px; padding: 40px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #9DAE91; margin: 0 0 20px 0; font-size: 24px;">Willkommen beim Oliv Buchungssystem</h2>
            <p style="font-size: 16px; line-height: 1.5; color: #334155; margin-bottom: 20px;">
              Hallo <strong>${params.userName}</strong>,
            </p>
            <p style="font-size: 16px; line-height: 1.5; color: #334155; margin-bottom: 20px;">
              Ihr Konto wurde erfolgreich im Oliv Buchungssystem erstellt. Sie können nun auf das Admin-Panel zugreifen, um Buchungen, Menüs und mehr zu verwalten.
            </p>
 
            <div style="background-color: #f1f5f9; border-left: 4px solid #9DAE91; padding: 15px 20px; margin: 25px 0;">
              <p style="margin: 0 0 10px 0; font-size: 15px;"><strong>E-Mail:</strong> ${params.userEmail}</p>
              <p style="margin: 0; font-size: 15px;"><strong>Rolle:</strong> ${displayRole}</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/login" style="display: inline-block; background-color: #9DAE91; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Zum Admin-Panel anmelden
              </a>
            </div>

            <p style="font-size: 14px; line-height: 1.5; color: #64748b; margin-bottom: 10px;">
              Ihr temporäres Passwort lautet: <strong>${params.tempPassword}</strong>
            </p>
            <p style="font-size: 14px; line-height: 1.5; color: #64748b; margin-bottom: 20px;">
              Bitte ändern Sie Ihr Passwort aus Sicherheitsgründen nach Ihrer ersten Anmeldung.
            </p>

            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />

            <p style="font-size: 13px; color: #64748b; margin: 0; text-align: center;">
              Dies ist eine automatisierte Nachricht aus dem Oliv Buchungssystem.
            </p>
          </div>
        </div>
      `;

      // Create email log entry with pending status
      const emailLogId = randomUUID();
      await db.insert(emailLogs).values({
        id: emailLogId,
        bookingId: null, // No booking associated with user creation emails
        emailType: "user_created",
        recipient: params.userEmail,
        subject,
        status: "pending",
      });

      const result = await sendEmail({
        to: params.userEmail,
        subject,
        html,
      });

      if (!result.success) {
        await db.update(emailLogs).set({ status: "failed" }).where(eq(emailLogs.id, emailLogId));
        return result;
      }

      await db.update(emailLogs).set({ status: "sent", sentAt: new Date() }).where(eq(emailLogs.id, emailLogId));
      return result;
    }
  } catch (error: any) {
    console.error("Error sending user creation email:", error);
    return { success: false, error: error.message || "Failed to send user creation email" };
  }
}