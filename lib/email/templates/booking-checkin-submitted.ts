import type { Booking, Lead } from "@/lib/db/schema";

export interface BookingCheckinSubmittedEmailParams {
  booking: Booking & {
    lead?: Lead | null;
  };
  hasChanges: boolean;
  guestCountChanged: boolean;
  newGuestCount?: number;
  vegetarianCount?: number;
  nonVegetarianCount?: number;
  menuChanges?: string;
  additionalDetails?: string;
}

/**
 * Template for Check-in Submission Notification (Admin)
 * German language
 */
export function generateBookingCheckinSubmittedEmail(params: BookingCheckinSubmittedEmailParams): {
  subject: string;
  html: string;
} {
  const { booking, hasChanges, guestCountChanged, newGuestCount, vegetarianCount, nonVegetarianCount, menuChanges, additionalDetails } = params;
  const lead = booking.lead;
  const customerName = lead?.contactName || "Gast";

  const formattedDate = new Date(booking.eventDate).toLocaleDateString("de-CH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const subject = `Check-in eingegangen: ${customerName} - ${formattedDate}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #3d4a2e; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }
        .section { background-color: #fff; padding: 20px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #eee; }
        .section-title { font-weight: bold; color: #3d4a2e; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px; }
        .change-badge { display: inline-block; padding: 4px 12px; border-radius: 15px; font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 15px; }
        .change-yes { background-color: #ffe8e8; color: #cc0000; }
        .change-no { background-color: #e8f5e9; color: #2e7d32; }
        .label { font-weight: bold; color: #666; width: 140px; display: inline-block; }
        .value { color: #333; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .button { display: inline-block; background-color: #3d4a2e; color: #fff !important; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-weight: bold; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">Check-in Submission</h1>
          <p style="margin: 5px 0 0 0;">Oliv Restaurant Buchungssystem</p>
        </div>

        <div class="content">
          <p>Ein Kunde hat den 4-Tage-Status-Check durchgeführt.</p>

          <div class="section">
            <div class="section-title">Status der Änderungen</div>
            <div class="change-badge ${hasChanges ? "change-yes" : "change-no"}">
              ${hasChanges ? "⚠️ Änderungen gemeldet" : "✅ Keine Änderungen"}
            </div>
            
            <p><span class="label">Gästeanzahl-Änderung:</span> <span class="value">${guestCountChanged ? "Ja" : "Nein"}</span></p>
          </div>

          <div class="section">
            <div class="section-title">Buchungsübersicht (Neu)</div>
            <p><span class="label">Kunde:</span> <span class="value">${customerName}</span></p>
            <p><span class="label">Datum:</span> <span class="value">${formattedDate}</span></p>
            <p><span class="label">Uhrzeit:</span> <span class="value">${booking.eventTime} Uhr</span></p>
            <p><span class="label">Gästeanzahl:</span> <span class="value" style="font-weight:bold; font-size: 1.1em;">${newGuestCount || booking.guestCount} Personen</span></p>
            ${(vegetarianCount || nonVegetarianCount) ? `
            <p style="margin-left: 20px; font-size: 0.9em; color: #666;">
              ${vegetarianCount ? `• Vegetarisch: ${vegetarianCount}<br>` : ""}
              ${nonVegetarianCount ? `• Non-Veg: ${nonVegetarianCount}` : ""}
            </p>
            ` : ""}
            <p><span class="label">Provisorisch war:</span> <span class="value">${booking.guestCount} Personen</span></p>
          </div>

          ${hasChanges ? `
          <div class="section" style="border-left: 4px solid #cc0000;">
            <div class="section-title">Details der Änderungen</div>
            <p><strong>Menü- / Komponenten-Änderungen:</strong></p>
            <p style="white-space: pre-wrap; background: #f5f5f5; padding: 10px; border-radius: 3px;">${menuChanges || "Keine spezifischen Angaben"}</p>
            
            <p><strong>Zusätzliche Wünsche / Details:</strong></p>
            <p style="white-space: pre-wrap; background: #f5f5f5; padding: 10px; border-radius: 3px;">${additionalDetails || "Keine"}</p>
          </div>
          ` : `
          <div class="section">
            <p>Der Kunde hat die Details als korrekt bestätigt.</p>
          </div>
          `}

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/bookings?id=${booking.id}" class="button">Buchung im Admin-Panel öffnen</a>
          </div>
        </div>

        <div class="footer">
          <p>Dies ist eine automatische Benachrichtigung vom Oliv Restaurant Buchungssystem.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
}
