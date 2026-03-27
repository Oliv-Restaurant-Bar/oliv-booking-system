import type { Booking, Lead } from "@/lib/db/schema";

export interface BookingConfirmedEmailParams {
  booking: Booking & {
    lead?: Lead | null;
  };
  estimatedTotal: number;
  bookingEditUrl?: string;
}

/**
 * Template for Booking Confirmation Email
 * German language with conditional logic based on amount
 */
export function generateBookingConfirmedEmail(params: BookingConfirmedEmailParams): {
  subject: string;
  html: string;
} {
  const { booking, estimatedTotal, bookingEditUrl } = params;
  const lead = booking.lead;
  const customerName = lead?.contactName || "Gast";

  const formattedDate = new Date(booking.eventDate).toLocaleDateString("de-CH", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const DEPOSIT_THRESHOLD = 5000;
  const requiresDeposit = estimatedTotal >= DEPOSIT_THRESHOLD;

  let depositSection = "";

  if (requiresDeposit) {
    depositSection = `
      <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <h3 style="margin: 0 0 10px 0; color: #856404;">💰 Anzahlung erforderlich</h3>
        <p style="margin: 0; color: #856404; line-height: 1.6;">
          Da Ihre Buchung den Schwellenwert für Anzahlungen erreicht hat, bitten wir um eine Anzahlung, um Ihre Reservierung zu bestätigen.
        </p>
        <p style="margin: 10px 0 0 0; color: #856404;">
          Bitte überweisen Sie den Betrag innerhalb von 7 Tagen auf folgendes Konto:
        </p>
        <table style="margin: 15px 0; color: #856404;">
          <tr>
            <td style="padding: 5px 0;"><strong>Konto:</strong></td>
            <td style="padding: 5px 0;">Oliv Restaurant</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>IBAN:</strong></td>
            <td style="padding: 5px 0;">CHXX XXXX XXXX XXXX XXXX X</td>
          </tr>
          <tr>
            <td style="padding: 5px 0;"><strong>Verwendungszweck:</strong></td>
            <td style="padding: 5px 0;">Buchung ${booking.id.toString().slice(0, 8)}</td>
          </tr>
        </table>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #856404;">
          * Nach Erhalt der Anzahlung senden wir Ihnen eine Bestätigung per E-Mail.
        </p>
      </div>
    `;
  } else {
    depositSection = `
      <div style="background-color: #d1ecf1; border-left: 4px solid #17a2b8; padding: 20px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0; color: #0c5460; line-height: 1.6;">
          Vielen Dank für Ihre Buchung! Wir haben Ihre Reservierung erhalten und freuen uns auf Ihren Besuch.
        </p>
      </div>
    `;
  }

  const subject = `Buchungsbestätigung - Oliv Restaurant - ${formattedDate}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2c3e50; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .details h3 { color: #2c3e50; margin-top: 0; }
        .details p { margin: 10px 0; }
        .details strong { color: #2c3e50; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">🎉 Buchung Bestätigt</h1>
          <p style="margin: 10px 0 0 0;">Oliv Restaurant</p>
        </div>

        <div class="content">
          <p>Hallo ${customerName},</p>
          <p>Vielen Dank für Ihre Buchung! Wir freuen uns, Sie am <strong>${formattedDate}</strong> begrüssen zu dürfen.</p>

          ${depositSection}

          <div class="details">
            <h3>📋 Buchungsdetails</h3>
            <p><strong>Datum:</strong> ${formattedDate}</p>
            <p><strong>Uhrzeit:</strong> ${booking.eventTime}</p>
            <p><strong>Anzahl Gäste:</strong> ${booking.guestCount} Personen</p>
            <p><strong>Geschätzte Gesamtkosten:</strong> CHF ${estimatedTotal.toFixed(2)}</p>
            ${booking.specialRequests ? `
              <p><strong>Bemerkungen:</strong><br/>${booking.specialRequests}</p>
            ` : ""}
            ${booking.allergyDetails && booking.allergyDetails.length > 0 ? `
              <p><strong>Allergien/Unverträglichkeiten:</strong><br/>${Array.isArray(booking.allergyDetails) ? booking.allergyDetails.join(", ") : booking.allergyDetails}</p>
            ` : ""}
          </div>

          <p>Falls Sie Fragen haben oder Änderungen vornehmen möchten, kontaktieren Sie uns bitte:</p>
          <p>
            📧 E-Mail: info@oliv-restaurant.ch<br/>
            📞 Telefon: +41 XX XXX XX XX
          </p>

          <p>Wir freuen uns auf Ihren Besuch!</p>
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
