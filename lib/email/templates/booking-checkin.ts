import type { Booking, Lead } from "@/lib/db/schema";

export interface BookingCheckinEmailParams {
  booking: Booking & {
    lead?: Lead | null;
  };
  checkinUrl: string;
}

/**
 * Template for 4-Day Check-in Email
 * German language
 */
export function generateBookingCheckinEmail(params: BookingCheckinEmailParams): {
  subject: string;
  html: string;
} {
  const { booking, checkinUrl } = params;
  const lead = booking.lead;
  const customerName = lead?.contactName || "Gast";

  const formattedDate = new Date(booking.eventDate).toLocaleDateString("de-CH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const subject = `Wichtige Bestätigung: Ihre Veranstaltung am ${formattedDate} - Oliv Restaurant`;

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
        .details h3 { color: #3d4a2e; margin-top: 0; font-size: 18px; }
        .details p { margin: 10px 0; font-size: 15px; }
        .button-container { text-align: center; margin: 35px 0; }
        .button { background-color: #3d4a2e; color: #ffffff !important; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; transition: background-color 0.3s; }
        .footer { text-align: center; margin-top: 30px; padding: 20px; color: #777; font-size: 13px; }
        .highlight { color: #3d4a2e; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 26px;">Event Bestätigung</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Noch 4 Tage bis zu Ihrer Veranstaltung</p>
        </div>

        <div class="content">
          <p>Guten Tag ${customerName},</p>
          <p>Ihre geplante Veranstaltung am <span class="highlight">${formattedDate}</span> rückt näher und wir freuen uns sehr darauf, Sie bei uns im Oliv Restaurant begrüssen zu dürfen.</p>
          
          <p>Um alles perfekt für Sie vorzubereiten, benötigen wir jetzt Ihre <strong>finale Bestätigung</strong> der Gästeanzahl sowie eventuelle letzte Anpassungen.</p>

          <div class="details">
            <h3>📋 Aktuelle Buchungsübersicht</h3>
            <p><strong>Datum:</strong> ${formattedDate}</p>
            <p><strong>Uhrzeit:</strong> ${booking.eventTime} Uhr</p>
            <p><strong>Gästeanzahl (provisorisch):</strong> ${booking.guestCount} Personen</p>
            <p><strong>ID:</strong> ${booking.id.slice(0, 8).toUpperCase()}</p>
          </div>

          <p>Bitte klicken Sie auf den untenstehenden Button, um uns die Personenzahl definitiv zu bestätigen oder uns über Änderungen zu informieren. Dieser Prozess dauert weniger als 2 Minuten.</p>

          <div class="button-container">
            <a href="${checkinUrl}" class="button">Jetzt Details bestätigen</a>
          </div>

          <p>Bitte führen Sie den Check-in zeitnah durch, damit unser Küchenteam die Vorbereitungen optimal treffen kann.</p>

          <p>Falls Sie Fragen haben, erreichen Sie uns jederzeit per E-Mail oder Telefon.</p>

          <p>Wir freuen uns auf Sie!</p>
          <p>Herzliche Grüsse,<br/>Ihr Oliv-Team</p>
        </div>

        <div class="footer">
          <p>Oliv Restaurant | Ihre Adresse | Schweiz</p>
          <p><a href="https://oliv-restaurant.ch" style="color: #3d4a2e; text-decoration: none;">www.oliv-restaurant.ch</a> | <a href="mailto:info@oliv-restaurant.ch" style="color: #3d4a2e; text-decoration: none;">info@oliv-restaurant.ch</a></p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}
