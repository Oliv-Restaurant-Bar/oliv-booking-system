import type { Booking, Lead } from "@/lib/db/schema";

export interface ManualReminderEmailParams {
  booking: Booking & {
    lead?: Lead | null;
  };
}

/**
 * Template for Manual Reminder Email (When staff tried to reach out)
 * German language
 */
export function generateManualReminderEmail(params: ManualReminderEmailParams): {
  subject: string;
  html: string;
} {
  const { booking } = params;
  const lead = booking.lead;
  const customerName = lead?.contactName || "Gast";

  const formattedDate = new Date(booking.eventDate).toLocaleDateString("de-CH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const subject = `Ihre Buchung bei Oliv Restaurant - Kontaktaufnahme`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #374151; background-color: #f9fafb; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 20px auto; padding: 0; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .header { background-color: #3d4a2e; color: #ffffff; padding: 40px 20px; text-align: center; }
        .content { padding: 40px 30px; }
        .message-box { background-color: #f0ede6; border-left: 4px solid #3d4a2e; padding: 25px; margin: 30px 0; border-radius: 0 8px 8px 0; }
        .details { background-color: #f9fafb; padding: 25px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 30px 0; }
        .footer { text-align: center; padding: 30px; background-color: #f9fafb; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Guten Tag</h1>
        </div>

        <div class="content">
          <p>Hallo ${customerName},</p>
          
          <div class="message-box">
            <p style="margin: 0; font-size: 16px; color: #3d4a2e; font-weight: 600;">
              Eines unserer Teammitglieder hat versucht, Sie bezüglich Ihrer Buchung zu erreichen, konnte Sie jedoch leider nicht persönlich sprechen.
            </p>
            <p style="margin: 10px 0 0 0; font-size: 16px;">
              Bitte kontaktieren Sie uns bei Gelegenheit, sobald es Ihnen möglich ist.
            </p>
          </div>

          <div class="details">
            <h3 style="margin-top: 0; color: #111827; font-size: 18px;">Details zu Ihrer Buchung:</h3>
            <p style="margin: 8px 0;"><strong>Datum:</strong> ${formattedDate}</p>
            <p style="margin: 8px 0;"><strong>Zeit:</strong> ${booking.eventTime} Uhr</p>
            <p style="margin: 8px 0;"><strong>Gäste:</strong> ${booking.guestCount} Personen</p>
          </div>

          <p>Sie erreichen uns unter:</p>
          <p style="margin: 5px 0;">📧 E-Mail: <a href="mailto:info@oliv-restaurant.ch" style="color: #3d4a2e; font-weight: 600;">info@oliv-restaurant.ch</a></p>
          <p style="margin: 5px 0;">📞 Telefon: <a href="tel:+41XXXXXXXXX" style="color: #3d4a2e; font-weight: 600;">+41 XX XXX XX XX</a></p>

          <p style="margin-top: 30px;">Wir freuen uns darauf, von Ihnen zu hören.</p>
          <p>Herzliche Grüsse,<br/>Ihr Oliv-Team</p>
        </div>

        <div class="footer">
          <p>Oliv Restaurant | Adresse | Schweiz</p>
          <p><a href="https://oliv-restaurant.ch" style="color: #6b7280; text-decoration: underline;">www.oliv-restaurant.ch</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}
