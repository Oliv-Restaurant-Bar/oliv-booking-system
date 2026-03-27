import type { Booking, Lead } from "@/lib/db/schema";

export interface BookingCompletedEmailParams {
  booking: Booking & {
    lead?: Lead | null;
  };
  feedbackUrl?: string;
  rebookingUrl?: string;
}

/**
 * Template for Booking Completion Email
 * German language - asks for feedback and future bookings
 */
export function generateBookingCompletedEmail(params: BookingCompletedEmailParams): {
  subject: string;
  html: string;
} {
  const { booking, feedbackUrl, rebookingUrl } = params;
  const lead = booking.lead;
  const customerName = lead?.contactName || "Gast";

  const formattedDate = new Date(booking.eventDate).toLocaleDateString("de-CH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const subject = `Vielen Dank für Ihren Besuch - Oliv Restaurant`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #28a745; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .feedback-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .rebooking-box { background-color: #d1ecf1; border-left: 4px solid #17a2b8; padding: 20px; margin: 20px 0; border-radius: 4px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">🙏 Vielen Dank!</h1>
          <p style="margin: 10px 0 0 0;">Oliv Restaurant</p>
        </div>

        <div class="content">
          <p>Hallo ${customerName},</p>
          <p>Wir hoffen, dass Sie einen wundervollen Abend bei uns am <strong>${formattedDate}</strong> hatten! Es war uns eine Freude, Sie und Ihre Gäste (${booking.guestCount} Personen) zu begrüssen.</p>



          <div class="rebooking-box">
            <h3 style="margin: 0 0 10px 0; color: #0c5460;">📅 Planen Sie Ihren nächsten Anlass?</h3>
            <p style="margin: 0 0 15px 0; color: #0c5460;">
              Wir freuen uns schon darauf, Sie wiederzusehen! Buchen Sie jetzt Ihren nächsten Anlass bei uns.
            </p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/wizard" class="button" style="background-color: #17a2b8;">
              Neue Buchung erstellen
            </a>
          </div>

          <p><strong>Erinnerung an Ihren Besuch:</strong></p>
          <ul style="list-style: none; padding: 0;">
            <li>📅 Datum: ${formattedDate}</li>
            <li>🕐 Uhrzeit: ${booking.eventTime}</li>
            <li>👥 Anzahl Gäste: ${booking.guestCount} Personen</li>
          </ul>

          <p>Falls Sie Fragen, Anmerkungen oder besondere Wünsche für den nächsten Besuch haben, zögern Sie nicht, uns zu kontaktieren:</p>
          <p>
            📧 E-Mail: info@oliv-restaurant.ch<br/>
            📞 Telefon: +41 XX XXX XX XX
          </p>

          <p>Wir freuen uns darauf, Sie bald wieder bei uns begrüssen zu dürfen!</p>
          <p>Mit freundlichen Grüßen,<br/>Ihr Oliv-Team</p>
        </div>

        <div class="footer">
          <p>Oliv Restaurant | Ihre Adresse | Schweiz</p>
          <p><a href="https://oliv-restaurant.ch" style="color: #2c3e50;">www.oliv-restaurant.ch</a></p>
          <p style="font-size: 12px; margin-top: 10px;">
            Dies ist eine automatisch generierte E-Mail. Bitte antworten Sie nicht direkt auf diese E-Mail.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}
