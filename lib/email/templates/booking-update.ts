import type { Booking, Lead } from "@/lib/db/schema";

export interface BookingUpdateEmailParams {
  booking: Booking & {
    lead?: Lead | null;
  };
}

/**
 * Template for Booking Update Email (Sent with PDF)
 * German language
 */
export function generateBookingUpdateEmail(params: BookingUpdateEmailParams): {
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

  const subject = `Aktualisierte Details zu Ihrer Buchung - ${formattedDate}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f0ede6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3d4a2e; color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .details { background-color: #f9f9f9; padding: 25px; border-radius: 8px; margin: 25px 0; border: 1px solid #eee; }
        .footer { text-align: center; margin-top: 30px; padding: 20px; color: #777; font-size: 13px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 26px;">Buchungs-Update</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Ihre Buchung am ${formattedDate}</p>
        </div>

        <div class="content">
          <p>Guten Tag ${customerName},</p>
          <p>Wir haben die Details Ihrer Buchung für die Veranstaltung am ${formattedDate} aktualisiert.</p>
          
          <p>Im Anhang finden Sie das aktuelle Bestätigungs-PDF mit allen vereinbarten Details, Menuwünschen und Preisen.</p>

          <div class="details">
            <p><strong>Buchungs-ID:</strong> ${booking.id.slice(0, 8).toUpperCase()}</p>
            <p><strong>Datum:</strong> ${formattedDate}</p>
            <p><strong>Uhrzeit:</strong> ${booking.eventTime} Uhr</p>
          </div>

          <p>Bitte prüfen Sie das Dokument sorgfältig. Sollten Sie Fragen haben oder weitere Anpassungen benötigen, stehen wir Ihnen gerne zur Verfügung.</p>

          <p>Wir freuen uns darauf, Sie bald bei uns begrüssen zu dürfen!</p>
          <p>Herzliche Grüsse,<br/>Ihr Oliv-Team</p>
        </div>

        <div class="footer">
          <p>Oliv Restaurant | Ihre Adresse | Schweiz</p>
          <p><a href="https://oliv-restaurant.ch" style="color: #3d4a2e; text-decoration: none;">www.oliv-restaurant.ch</a> | <a href="mailto:info@oliv-restaurant.ch" style="color: #3d4a2e; text-decoration: none;">info@oliv-restaurant.ch</a></p>
          <p style="font-size: 11px; margin-top: 15px; opacity: 0.7;">Hinweis: Die angehängte PDF-Datei enthält alle vertraulichen Details Ihrer Buchung.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}
