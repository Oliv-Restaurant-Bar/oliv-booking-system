import { SendMailClient } from "zeptomail";

// Initialize ZeptoMail client
const token = process.env.ZEPTOMAIL_API_TOKEN;

if (!token) {
  console.error("ZEPTOMAIL_API_TOKEN is not configured in environment variables");
}

// Initialize ZeptoMail client with robust token cleaning
// Some users provide the token with the "Zoho-enczapikey" prefix, but the SDK expects the raw key
// Pass raw token AS-IS - ZeptoMail REQUIRES the "Zoho-enczapikey" prefix in the Authorization header
// DO NOT STRIP the prefix. Confirmed via raw fetch testing (code TM_4001 = stripped prefix = access denied)
const rawToken = token || "";
let zeptomailUrl = process.env.ZEPTOMAIL_URL || "https://api.zeptomail.eu/";

// Robust URL cleaning — the SDK appends /v1.1/email internally, strip it if already present
if (!zeptomailUrl.startsWith('http')) zeptomailUrl = 'https://' + zeptomailUrl;
zeptomailUrl = zeptomailUrl.replace(/\/v1\.1\/email\/?$/, '');
if (!zeptomailUrl.endsWith('/')) zeptomailUrl += '/';

console.log('📧 ZeptoMail Configuration Debug:');
console.log(`   - URL: ${zeptomailUrl}`);
console.log(`   - Raw Token available: ${!!token}`);
console.log(`   - Token prefix detected: ${token?.startsWith('Zoho-enczapikey') ? 'Yes' : 'No'}`);
console.log(`   - Token length: ${rawToken.length}`);
console.log(`   - From Email: ${process.env.ZEPTOMAIL_FROM_EMAIL}`);

export const zcClient = new SendMailClient({
  url: zeptomailUrl,
  token: rawToken,
});

export interface EmailParams {
  to: string | string[];
  subject: string;
  html: string;
  from?: {
    address: string;
    name: string;
  };
  attachments?: Array<{
    content: string; // base64 content
    mime_type: string;
    name: string;
  }>;
}

export interface TemplateEmailParams {
  to: string | string[];
  templateName: string;
  templateData: Record<string, any>;
  subject?: string; // Optional override
  from?: {
    address: string;
    name: string;
  };
  attachments?: Array<{
    content: string; // base64 content
    mime_type: string;
    name: string;
  }>;
}

/**
 * Send email using ZeptoMail with HTML content
 */
export async function sendEmail(params: EmailParams): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    if (!token) {
      return {
        success: false,
        error: "ZeptoMail API token is not configured",
      };
    }

    const fromEmail = params.from?.address || process.env.ZEPTOMAIL_FROM_EMAIL || "bookings@oliv-restaurant.ch";
    const fromName = params.from?.name || process.env.ZEPTOMAIL_FROM_NAME || "Oliv Restaurant";
    const recipients = Array.isArray(params.to) ? params.to.join(', ') : params.to;

    console.log('');
    console.log('📬 ======== ZEPTOMAIL SEND START ========');
    console.log(`   To       : ${recipients}`);
    console.log(`   From     : ${fromEmail}`);
    console.log(`   Subject  : ${params.subject}`);

    // Log attachment info if present
    if (params.attachments && params.attachments.length > 0) {
      console.log(`   Attachments: ${params.attachments.length} file(s)`);
      params.attachments.forEach((att, idx) => {
        console.log(`     [${idx + 1}] ${att.name} (${att.mime_type})`);
        console.log(`         Base64 length: ${att.content?.length || 0} chars`);

        // Validate base64 content more thoroughly
        if (!att.content || att.content.length === 0) {
          console.error(`         ❌ ERROR: Attachment ${idx + 1} has empty base64 content!`);
        } else {
          // Check if base64 is valid (no whitespace, proper padding)
          const hasWhitespace = /\s/.test(att.content);
          if (hasWhitespace) {
            console.error(`         ❌ ERROR: Attachment ${idx + 1} contains whitespace!`);
          } else {
            console.log(`         ✅ No whitespace in base64`);
          }

          // Try to decode first few bytes to validate
          try {
            const decoded = atob(att.content.substring(0, 100));
            const header = decoded.substring(0, 5);
            if (header === '%PDF-') {
              console.log(`         ✅ Valid PDF header detected`);
            } else {
              console.error(`         ❌ ERROR: Invalid PDF header! Got: ${header}`);
            }
          } catch (decodeError) {
            console.error(`         ❌ ERROR: Base64 decode failed!`, decodeError);
          }
        }
      });
    }

    console.log('   Sending...');

    const mailOptions = {
      from: {
        address: fromEmail,
        name: fromName,
      },
      to: Array.isArray(params.to) ? params.to.map(email => ({ email_address: { address: email, name: "" } })) : [{ email_address: { address: params.to, name: "" } }],
      subject: params.subject,
      htmlbody: params.html,
      ...(params.attachments && params.attachments.length > 0 ? { attachments: params.attachments } : {}),
    };

    // @ts-ignore - ZeptoMail types may not match exactly
    const response = await zcClient.sendMail(mailOptions);

    console.log('   ✅ SUCCESS');
    console.log('📬 ======== ZEPTOMAIL SEND END ========');

    return {
      success: true,
      messageId: (response as any).message_id || "sent",
    };
  } catch (error: any) {
    console.error("   ❌ ERROR sending email via ZeptoMail:", error);
    console.error('📬 ======== ZEPTOMAIL SEND END ========');
    return {
      success: false,
      error: error.message || "Failed to send email",
    };
  }
}

/**
 * Send email using ZeptoMail template
 *
 * @example
 * await sendTemplateEmail({
 *   to: "customer@example.com",
 *   templateName: "booking-confirmed",
 *   templateData: {
 *     customer_name: "John Doe",
 *     event_date: "Freitag, 18. Februar 2026",
 *     event_time: "19:00",
 *     guest_count: 4,
 *     estimated_total: "150.00",
 *   }
 * });
 */
export async function sendTemplateEmail(params: TemplateEmailParams): Promise<{ success: boolean; error?: string; messageId?: string }> {
  try {
    if (!token) {
      return {
        success: false,
        error: "ZeptoMail API token is not configured",
      };
    }

    const fromEmail = params.from?.address || process.env.ZEPTOMAIL_FROM_EMAIL || "noreply@enactweb.com";
    const fromName = params.from?.name || process.env.ZEPTOMAIL_FROM_NAME || "Oliv Restaurant";
    const baseUrl = zeptomailUrl.replace(/\/$/, '');
    const templateUrl = `${baseUrl}/v1.1/email/template`;
    const recipients = Array.isArray(params.to) ? params.to.join(', ') : params.to;

    console.log('');
    console.log('📬 ======== ZEPTOMAIL SEND START ========');
    console.log(`   Template : ${params.templateName}`);
    console.log(`   To       : ${recipients}`);
    console.log(`   From     : ${fromEmail}`);
    console.log(`   Endpoint : ${templateUrl}`);

    // Log attachment info if present
    if (params.attachments && params.attachments.length > 0) {
      console.log(`   Attachments: ${params.attachments.length} file(s)`);
      params.attachments.forEach((att, idx) => {
        console.log(`     [${idx + 1}] ${att.name} (${att.mime_type})`);
        console.log(`         Base64 length: ${att.content?.length || 0} chars`);
      });
    }

    console.log('   Sending...');

    const body = {
      mail_template_key: params.templateName,
      from: { address: fromEmail, name: fromName },
      to: Array.isArray(params.to)
        ? params.to.map(email => ({ email_address: { address: email, name: "" } }))
        : [{ email_address: { address: params.to, name: "" } }],
      merge_info: params.templateData,
      ...(params.attachments && params.attachments.length > 0 ? { attachments: params.attachments } : {}),
    };

    const startTime = Date.now();
    const controller = new AbortController();
    // Increased timeout to 45 seconds for emails with PDF attachments
    // Vercel serverless functions have a 60s limit (Hobby plan)
    const timeout = setTimeout(() => controller.abort(), 45000);

    const response = await fetch(templateUrl, {
      method: "POST",
      headers: {
        "accept": "application/json",
        "content-type": "application/json",
        "Authorization": rawToken,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const elapsed = Date.now() - startTime;
    const data = await response.json();

    if (!response.ok) {
      console.log(`   ❌ FAILED  (${response.status}, ${elapsed}ms)`);
      console.log(`   Error    : ${JSON.stringify(data?.error)}`);
      console.log('📬 ======== ZEPTOMAIL SEND END ========');
      return {
        success: false,
        error: JSON.stringify(data?.error || data),
      };
    }

    console.log(`   ✅ SUCCESS (${elapsed}ms)`);
    console.log(`   Request  : ${data.request_id}`);
    console.log('📬 ======== ZEPTOMAIL SEND END ========');

    return {
      success: true,
      messageId: data.request_id || "sent",
    };
  } catch (error: any) {
    if (error.name === "AbortError") {
      console.error("   ❌ TIMEOUT — ZeptoMail template email timed out after 45s");
      console.log('📬 ======== ZEPTOMAIL SEND END ========');
      return { success: false, error: "Email request timed out" };
    }
    console.error("   ❌ ERROR sending template email via ZeptoMail:", error);
    console.log('📬 ======== ZEPTOMAIL SEND END ========');
    return {
      success: false,
      error: error.message || "Failed to send template email",
    };
  }
}

/**
 * Validate email configuration
 */
export function validateEmailConfig(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  if (!process.env.ZEPTOMAIL_API_TOKEN) missing.push("ZEPTOMAIL_API_TOKEN");
  if (!process.env.ZEPTOMAIL_FROM_EMAIL) missing.push("ZEPTOMAIL_FROM_EMAIL");
  if (!process.env.ZEPTOMAIL_FROM_NAME) missing.push("ZEPTOMAIL_FROM_NAME");

  return {
    valid: missing.length === 0,
    missing,
  };
}
