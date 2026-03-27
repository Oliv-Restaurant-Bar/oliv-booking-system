# ZeptoMail Templates - NO CONDITIONALS VERSION

This document contains **clean ZeptoMail templates** with **ZERO conditional logic**. All conditional logic is handled in backend code.

---

## Template 1: `booking-confirmed-deposit`

**When to use:** Bookings ≥ 5000 CHF (backend decides)

**Subject:** `Buchungsbestätigung - Oliv Restaurant - {{event_date}}`

**HTML:**
```html
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
    .alert-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 4px; }
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
      <p>Hallo {{customer_name}},</p>
      <p>Vielen Dank für Ihre Buchung! Wir freuen uns, Sie am <strong>{{event_date}}</strong> begrüssen zu dürfen.</p>

      <div class="alert-box">
        <h3 style="margin: 0 0 10px 0; color: #856404;">💰 Anzahlung erforderlich</h3>
        <p style="margin: 0; color: #856404; line-height: 1.6;">
          Da Ihre Buchung CHF {{estimated_total}} überschreitet, bitten wir um eine Anzahlung von
          <strong>CHF {{deposit_amount}} ({{deposit_percentage}}%)</strong>, um Ihre Reservierung zu bestätigen.
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
            <td style="padding: 5px 0;">Buchung {{booking_id}}</td>
          </tr>
        </table>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #856404;">
          * Nach Erhalt der Anzahlung senden wir Ihnen eine Bestätigung per E-Mail.
        </p>
      </div>

      <div class="details">
        <h3>📋 Buchungsdetails</h3>
        <p><strong>Datum:</strong> {{event_date}}</p>
        <p><strong>Uhrzeit:</strong> {{event_time}}</p>
        <p><strong>Anzahl Gäste:</strong> {{guest_count}} Personen</p>
        <p><strong>Geschätzte Gesamtkosten:</strong> CHF {{estimated_total}}</p>
        <p><strong>Bemerkungen:</strong><br/>{{special_requests}}</p>
        <p><strong>Allergien/Unverträglichkeiten:</strong><br/>{{allergy_details}}</p>
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
```

**Variables:**
- `customer_name`
- `event_date`
- `event_time`
- `guest_count`
- `estimated_total`
- `deposit_amount`
- `deposit_percentage`
- `booking_id`
- `special_requests`
- `allergy_details`

---

## Template 2: `booking-confirmed-no-deposit`

**When to use:** Bookings < 5000 CHF (backend decides)

**Subject:** `Buchungsbestätigung - Oliv Restaurant - {{event_date}}`

**HTML:**
```html
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
    .info-box { background-color: #d1ecf1; border-left: 4px solid #17a2b8; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
    .button { display: inline-block; background-color: #17a2b8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">🎉 Buchung Bestätigt</h1>
      <p style="margin: 10px 0 0 0;">Oliv Restaurant</p>
    </div>

    <div class="content">
      <p>Hallo {{customer_name}},</p>
      <p>Vielen Dank für Ihre Buchung! Wir freuen uns, Sie am <strong>{{event_date}}</strong> begrüssen zu dürfen.</p>

      <div class="info-box">
        <h3 style="margin: 0 0 10px 0; color: #0c5460;">🍽️ Menü anpassen</h3>
        <p style="margin: 0; color: #0c5460; line-height: 1.6;">
          Vielen Dank für Ihre Buchung! Sie können Ihr Menü noch anpassen, bis zu 48 Stunden vor der Veranstaltung.
        </p>
        <div style="margin-top: 15px;">
          <a href="{{booking_edit_url}}" class="button">
            Menü jetzt bearbeiten
          </a>
        </div>
      </div>

      <div class="details">
        <h3>📋 Buchungsdetails</h3>
        <p><strong>Datum:</strong> {{event_date}}</p>
        <p><strong>Uhrzeit:</strong> {{event_time}}</p>
        <p><strong>Anzahl Gäste:</strong> {{guest_count}} Personen</p>
        <p><strong>Geschätzte Gesamtkosten:</strong> CHF {{estimated_total}}</p>
        <p><strong>Bemerkungen:</strong><br/>{{special_requests}}</p>
        <p><strong>Allergien/Unverträglichkeiten:</strong><br/>{{allergy_details}}</p>
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
```

**Variables:**
- `customer_name`
- `event_date`
- `event_time`
- `guest_count`
- `estimated_total`
- `booking_edit_url`
- `special_requests`
- `allergy_details`

---

## Template 3: `booking-cancelled`

**Subject:** `Stornierung Ihrer Buchung - Oliv Restaurant - {{event_date}}`

**HTML:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
    .info-box { background-color: #d1ecf1; border-left: 4px solid #17a2b8; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">❌ Buchung Storniert</h1>
      <p style="margin: 10px 0 0 0;">Oliv Restaurant</p>
    </div>

    <div class="content">
      <p>Hallo {{customer_name}},</p>
      <p>leider müssen wir Ihnen mitteilen, dass Ihre Buchung für den <strong>{{event_date}}</strong> storniert wurde.</p>

      <div class="info-box">
        <h3 style="margin: 0 0 10px 0; color: #0c5460;">Grund für die Stornierung:</h3>
        <p style="margin: 0; color: #0c5460;">{{cancellation_reason}}</p>
      </div>

      <div class="details">
        <h3>📋 Stornierte Buchung:</h3>
        <p><strong>Datum:</strong> {{event_date}}</p>
        <p><strong>Uhrzeit:</strong> {{event_time}}</p>
        <p><strong>Anzahl Gäste:</strong> {{guest_count}} Personen</p>
        <p><strong>Buchungsnummer:</strong> {{booking_id}}</p>
      </div>

      <p>Wenn Sie eine neue Buchung erstellen möchten, besuchen Sie uns gerne wieder auf unserer Website.</p>

      <p>Falls Sie Fragen zur Stornierung haben, kontaktieren Sie uns bitte:</p>
      <p>
        📧 E-Mail: info@oliv-restaurant.ch<br/>
        📞 Telefon: +41 XX XXX XX XX
      </p>

      <p>Wir bedauern die Umstände und hoffen, Sie in Zukunft wieder begrüssen zu dürfen.</p>
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
```

**Variables:**
- `customer_name`
- `event_date`
- `event_time`
- `guest_count`
- `booking_id`
- `cancellation_reason`

---

## Template 4: `booking-completed`

**Subject:** `Vielen Dank für Ihren Besuch - Oliv Restaurant`

**HTML:**
```html
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
      <p>Hallo {{customer_name}},</p>
      <p>Wir hoffen, dass Sie einen wundervollen Abend bei uns am <strong>{{event_date}}</strong> hatten! Es war uns eine Freude, Sie und Ihre Gäste ({{guest_count}} Personen) zu begrüssen.</p>

      <div class="feedback-box">
        <h3 style="margin: 0 0 10px 0; color: #856404;">⭐ Helfen Sie uns, besser zu werden</h3>
        <p style="margin: 0 0 15px 0; color: #856404;">
          Ihre Meinung ist uns sehr wichtig. Bitte nehmen Sie sich 2 Minuten Zeit, um uns Ihr Feedback zu geben.
        </p>
        <a href="{{feedback_url}}" class="button" style="background-color: #ffc107; color: #333;">
          Feedback geben
        </a>
      </div>

      <div class="rebooking-box">
        <h3 style="margin: 0 0 10px 0; color: #0c5460;">📅 Planen Sie Ihren nächsten Anlass?</h3>
        <p style="margin: 0 0 15px 0; color: #0c5460;">
          Wir freuen uns schon darauf, Sie wiederzusehen! Buchen Sie jetzt Ihren nächsten Anlass bei uns.
        </p>
        <a href="{{rebooking_url}}" class="button" style="background-color: #17a2b8;">
          Neue Buchung erstellen
        </a>
      </div>

      <p><strong>Erinnerung an Ihren Besuch:</strong></p>
      <ul style="list-style: none; padding: 0;">
        <li>📅 Datum: {{event_date}}</li>
        <li>🕐 Uhrzeit: {{event_time}}</li>
        <li>👥 Anzahl Gäste: {{guest_count}} Personen</li>
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
```

**Variables:**
- `customer_name`
- `event_date`
- `event_time`
- `guest_count`
- `feedback_url`
- `rebooking_url`

---

## Template 5: `booking-reminder`

**Subject:** `Erinnerung an Ihre Buchung morgen - Oliv Restaurant`

**HTML:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #ff6b6b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
    .details h3 { color: #2c3e50; margin-top: 0; }
    .details p { margin: 10px 0; }
    .details strong { color: #2c3e50; }
    .alert-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">⏰ Erinnerung</h1>
      <p style="margin: 10px 0 0 0;">Ihre Buchung ist morgen!</p>
    </div>

    <div class="content">
      <p>Hallo {{customer_name}},</p>
      <p>Dies ist eine freundliche Erinnerung an Ihre bevorstehende Buchung bei Oliv Restaurant.</p>
      <p>Wir freuen uns darauf, Sie und Ihre Gäste morgen, am <strong>{{event_date}}</strong> um <strong>{{event_time}}</strong> Uhr begrüssen zu dürfen.</p>

      <div class="alert-box">
        <h3 style="margin: 0 0 10px 0; color: #856404;">💰 Anzahlung erinnern</h3>
        <p style="margin: 0; color: #856404; line-height: 1.6;">
          Bitte überprüfen Sie, ob die Anzahlung von CHF {{deposit_amount}} ({{deposit_percentage}}%) bereits überwiesen wurde.
          Falls nicht, bitten wir um zeitnahe Überweisung auf unser Konto.
        </p>
      </div>

      <div class="details">
        <h3>📋 Buchungsdetails</h3>
        <p><strong>Datum:</strong> {{event_date}}</p>
        <p><strong>Uhrzeit:</strong> {{event_time}}</p>
        <p><strong>Anzahl Gäste:</strong> {{guest_count}} Personen</p>
        <p><strong>Geschätzte Gesamtkosten:</strong> CHF {{estimated_total}}</p>
        <p><strong>Bemerkungen:</strong><br/>{{special_requests}}</p>
        <p><strong>Allergien/Unverträglichkeiten:</strong><br/>{{allergy_details}}</p>
      </div>

      <p><strong>Wichtige Hinweise:</strong></p>
      <ul style="color: #555;">
        <li>Bitte erscheinen Sie pünktlich zur vereinbarten Uhrzeit</li>
        <li>Bei Verzögerungen bitten wir um telefonische Nachricht</li>
        <li>Die Buchung ist für {{guest_count}} Personen reserviert</li>
      </ul>

      <p>Falls Sie Fragen haben oder Änderungen vornehmen müssen, kontaktieren Sie uns bitte so schnell wie möglich:</p>
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
```

**Variables:**
- `customer_name`
- `event_date`
- `event_time`
- `guest_count`
- `estimated_total`
- `deposit_amount`
- `deposit_percentage`
- `special_requests`
- `allergy_details`

---

## Template 6: `booking-no-show`

**Subject:** `Nicht erschienen - Oliv Restaurant - {{event_date}}`

**HTML:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #6c757d; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">📭 Nicht erschienen</h1>
      <p style="margin: 10px 0 0 0;">Oliv Restaurant</p>
    </div>

    <div class="content">
      <p>Hallo {{customer_name}},</p>
      <p>leider haben wir Sie am <strong>{{event_date}}</strong> nicht zu Ihrer Buchung begrüssen können.</p>

      <p>Da wir ohne Absage nicht erscheinen konnten, mussten wir die Reservierung stornieren. Dies hilft uns, andere Gäste zu berücksichtigen und unsere Planung zu optimieren.</p>

      <div class="details">
        <h3>📋 Buchungsdetails:</h3>
        <p><strong>Datum:</strong> {{event_date}}</p>
        <p><strong>Uhrzeit:</strong> {{event_time}}</p>
        <p><strong>Anzahl Gäste:</strong> {{guest_count}} Personen</p>
      </div>

      <p>Wir hoffen, dass Sie in Zukunft wieder bei uns reservieren. Bitte beachten Sie, dass wir bei zukünftigen Buchungen um eine frühzeitige Absage bitten (mindestens 24 Stunden vorher), falls Sie doch nicht kommen können.</p>

      <p>Bei Fragen oder falls Sie eine neue Buchung erstellen möchten, kontaktieren Sie uns gerne:</p>
      <p>
        📧 E-Mail: info@oliv-restaurant.ch<br/>
        📞 Telefon: +41 XX XXX XX XX
      </p>

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
```

**Variables:**
- `customer_name`
- `event_date`
- `event_time`
- `guest_count`

---

## Template 7: `booking-declined`

**Subject:** `Ihre Buchungsanfrage - Oliv Restaurant`

**HTML:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #dc3545; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
    .info-box { background-color: #d1ecf1; border-left: 4px solid #17a2b8; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">❌ Buchung nicht möglich</h1>
      <p style="margin: 10px 0 0 0;">Oliv Restaurant</p>
    </div>

    <div class="content">
      <p>Hallo {{customer_name}},</p>
      <p>leider können wir Ihre Buchungsanfrage für den <strong>{{event_date}}</strong> nicht bestätigen.</p>

      <div class="info-box">
        <h3 style="margin: 0 0 10px 0; color: #0c5460;">Begründung:</h3>
        <p style="margin: 0; color: #0c5460;">{{decline_reason}}</p>
      </div>

      <div class="details">
        <h3>📋 Angefragte Details:</h3>
        <p><strong>Gewünschtes Datum:</strong> {{event_date}}</p>
        <p><strong>Gewünschte Uhrzeit:</strong> {{event_time}}</p>
        <p><strong>Anzahl Gäste:</strong> {{guest_count}} Personen</p>
      </div>

      <p>Wir möchten Ihnen gerne ein alternatives Datum oder eine alternative Uhrzeit anbieten. Bitte kontaktieren Sie uns, um gemeinsam eine Lösung zu finden:</p>
      <p>
        📧 E-Mail: info@oliv-restaurant.ch<br/>
        📞 Telefon: +41 XX XXX XX XX
      </p>

      <p>Wir bedauern die Umstände und hoffen, Ihnen trotzdem einen schönen Abend bei uns bieten zu können.</p>
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
```

**Variables:**
- `customer_name`
- `event_date`
- `event_time`
- `guest_count`
- `decline_reason`

---

## Template 8: `unlock-requested`

**When to use:** Notifies admin when a guest requests to unlock a booking.

**Subject:** `Anfrage zur Freischaltung - Buchung #{{booking_id}}`

**HTML:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f39c12; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 24px; background-color: #f39c12; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">🔑 Anfrage zur Freischaltung</h1>
      <p style="margin: 10px 0 0 0;">Buchung #{{booking_id}}</p>
    </div>

    <div class="content">
      <p>Hallo Admin,</p>
      <p>Der Kunde <strong>{{customer_name}}</strong> hat eine Anfrage gestellt, seine Buchung für den <strong>{{event_date}}</strong> wieder freizuschalten.</p>

      <div class="details">
        <h3>📋 Details:</h3>
        <p><strong>Kunde:</strong> {{customer_name}}</p>
        <p><strong>Datum:</strong> {{event_date}}</p>
        <p><strong>Buchungs-ID:</strong> {{booking_id}}</p>
      </div>

      <p>Klicken Sie auf den untenstehenden Link, um die Buchung im Admin-Dashboard zu prüfen und freizuschalten:</p>
      <a href="{{admin_url}}" class="button">Zum Admin-Dashboard</a>

      <p>Mit freundlichen Grüßen,<br/>Oliv Buchungssystem</p>
    </div>

    <div class="footer">
      <p>Oliv Restaurant System</p>
    </div>
  </div>
</body>
</html>
```

**Variables:**
- `customer_name`
- `event_date`
- `booking_id`
- `admin_url`

---

## Template 9: `unlock-granted`

**When to use:** Notifies guest that their request to edit has been granted.

**Subject:** `Ihre Buchung wurde freigeschaltet - Oliv Restaurant`

**HTML:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #27ae60; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .info-box { background-color: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .button { display: inline-block; padding: 12px 24px; background-color: #27ae60; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">✅ Freigeschaltet</h1>
      <p style="margin: 10px 0 0 0;">Oliv Restaurant</p>
    </div>

    <div class="content">
      <p>Hallo {{customer_name}},</p>
      <p>Ihre Anfrage auf Bearbeitung der Buchung für den <strong>{{event_date}}</strong> wurde bestätigt.</p>

      <div class="info-box">
        <p style="margin: 0; color: #155724;">
          Sie können Ihre Buchung nun wieder online anpassen. Bitte nutzen Sie den folgenden Link:
        </p>
        <div style="margin-top: 15px;">
          <a href="{{booking_edit_url}}" class="button">Buchung jetzt bearbeiten</a>
        </div>
      </div>

      <p>Falls Sie Fragen haben, kontaktieren Sie uns bitte:</p>
      <p>
        📧 E-Mail: info@oliv-restaurant.ch<br/>
      </p>

      <p>Wir freuen uns auf Ihren Besuch!</p>
      <p>Mit freundlichen Grüßen,<br/>Ihr Oliv-Team</p>
    </div>

    <div class="footer">
      <p>Oliv Restaurant | Schweiz</p>
    </div>
  </div>
</body>
</html>
```

**Variables:**
- `customer_name`
- `event_date`
- `booking_edit_url`

---

## Template 10: `unlock-declined`

**When to use:** Notifies guest that their request to edit has been declined.

**Subject:** `Update zu Ihrer Anfrage auf Bearbeitung - Oliv Restaurant`

**HTML:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #7f8c8d; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .info-box { background-color: #f8d7da; border-left: 4px solid #dc3545; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">ℹ️ Update zur Anfrage</h1>
      <p style="margin: 10px 0 0 0;">Oliv Restaurant</p>
    </div>

    <div class="content">
      <p>Hallo {{customer_name}},</p>
      <p>vielen Dank für Ihre Anfrage zur Bearbeitung Ihrer Buchung für den <strong>{{event_date}}</strong>.</p>

      <div class="info-box">
        <h3 style="margin: 0 0 10px 0; color: #721c24;">Status der Anfrage:</h3>
        <p style="margin: 0; color: #721c24;">{{decline_reason}}</p>
      </div>

      <p>Leider können wir zum jetzigen Zeitpunkt keine weiteren Online-Änderungen zulassen. Bitte kontaktieren Sie uns direkt für dringende Anliegen:</p>
      <p>
        📧 E-Mail: info@oliv-restaurant.ch<br/>
        📞 Telefon: +41 XX XXX XX XX
      </p>

      <p>Vielen Dank für Ihr Verständnis.</p>
      <p>Mit freundlichen Grüßen,<br/>Ihr Oliv-Team</p>
    </div>

    <div class="footer">
      <p>Oliv Restaurant | Schweiz</p>
    </div>
  </div>
</body>
</html>
```

**Variables:**
- `customer_name`
- `event_date`
- `decline_reason`

---

## Template 11: `booking-assigned`

**When to use:** Notifies a system user that a booking is assigned to them.

**Subject:** `Neue Buchung zugewiesen - {{customer_name}} - {{event_date}}`

**HTML:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #17a2b8; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
    .details h3 { color: #2c3e50; margin-top: 0; }
    .details p { margin: 10px 0; }
    .details strong { color: #2c3e50; }
    .info-box { background-color: #d1ecf1; border-left: 4px solid #17a2b8; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .button { display: inline-block; padding: 12px 24px; background-color: #17a2b8; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px 0; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">📋 Neue Buchung zugewiesen</h1>
      <p style="margin: 10px 0 0 0;">Oliv Restaurant</p>
    </div>

    <div class="content">
      <p>Hallo {{admin_name}},</p>
      <p>eine neue Buchung wurde Ihnen im System zugewiesen.</p>

      <div class="details">
        <h3>📋 Buchungsdetails:</h3>
        <p><strong>Kunde:</strong> {{customer_name}}</p>
        <p><strong>Datum:</strong> {{event_date}}</p>
        <p><strong>Uhrzeit:</strong> {{event_time}}</p>
      </div>

      <p>Bitte melden Sie sich im Admin-Panel an, um die vollständigen Details anzusehen und diese Buchung zu verwalten.</p>

      <div style="text-align: center; margin: 20px 0;">
        <a href="{{booking_url}}" class="button">Zur Buchung</a>
      </div>

      <p>Mit freundlichen Grüßen,<br/>Oliv Buchungssystem</p>
    </div>

    <div class="footer">
      <p>Oliv Restaurant System</p>
      <p style="font-size: 12px; margin-top: 10px;">
        Dies ist eine automatisch generierte E-Mail aus dem Oliv Buchungssystem.
      </p>
    </div>
  </div>
</body>
</html>
```

**Variables:**
- `admin_name`
- `customer_name`
- `event_date`
- `event_time`
- `booking_url`

---

## Template 12: `kitchen-pdf`

**When to use:** Dispatch of kitchen PDF sheet.

**Subject:** `Küchenblatt: {{customer_name}} - {{event_date}}`

**HTML:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #6f42c1; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
    .details h3 { color: #2c3e50; margin-top: 0; }
    .details p { margin: 10px 0; }
    .details strong { color: #2c3e50; }
    .info-box { background-color: #d1ecf1; border-left: 4px solid #17a2b8; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">👨‍🍳 Küchenblatt</h1>
      <p style="margin: 10px 0 0 0;">Oliv Restaurant</p>
    </div>

    <div class="content">
      <p>Hallo,</p>
      <p>für eine bevorstehende Buchung wurde ein neues Küchenblatt erstellt. Bitte finden Sie das PDF im Anhang dieser E-Mail.</p>

      <div class="details">
        <h3>📋 Details:</h3>
        <p><strong>Kunde:</strong> {{customer_name}}</p>
        <p><strong>Datum:</strong> {{event_date}}</p>
        <p><strong>Dokument:</strong> <em>{{document_name}}</em></p>
      </div>

      <p>Bitte überprüfen Sie das Küchenblatt und bereiten Sie die Bestellung entsprechend vor.</p>

      <p>Falls Sie Fragen haben, kontaktieren Sie bitte die Verwaltung:</p>
      <p>
        📧 E-Mail: info@oliv-restaurant.ch<br/>
      </p>

      <p>Mit freundlichen Grüßen,<br/>Oliv Buchungssystem</p>
    </div>

    <div class="footer">
      <p>Oliv Restaurant System</p>
      <p style="font-size: 12px; margin-top: 10px;">
        Dies ist eine automatisch generierte operative E-Mail aus dem Oliv Buchungssystem.
      </p>
    </div>
  </div>
</body>
</html>
```

**Variables:**
- `customer_name`
- `event_date`
- `document_name`

---

---

## Template 13: `booking-thank-you-deposit`

**When to use:** Initial inquiry for bookings ≥ 5000 CHF (Phase 1)

**Subject:** `Vielen Dank für Ihre Anfrage - Oliv Restaurant - {{event_date}}`

**HTML:**
```html
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
    .alert-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">🙏 Vielen Dank</h1>
      <p style="margin: 10px 0 0 0;">Anfrage erhalten</p>
    </div>

    <div class="content">
      <p>Hallo {{customer_name}},</p>
      <p>Vielen Dank für Ihre Buchungsanfrage! Wir haben Ihre Details erhalten und prüfen diese nun. Wir freuen uns, dass Sie Ihren Anlass im Oliv Restaurant planen.</p>

      <div class="alert-box">
        <h3 style="margin: 0 0 10px 0; color: #856404;">💰 Mögliche Anzahlung</h3>
        <p style="margin: 0; color: #856404; line-height: 1.6;">
          Da Ihre Anfrage CHF {{estimated_total}} überschreitet, wird nach der Bestätigung durch unser Team eine Anzahlung von
          <strong>CHF {{deposit_amount}} ({{deposit_percentage}}%)</strong> erforderlich sein, um die Reservierung final zu garantieren.
        </p>
        <p style="margin: 10px 0 0 0; color: #856404;">
          <strong>Hinweis:</strong> Sie müssen jetzt noch nichts überweisen. Sobald wir Ihre Anfrage bestätigt haben, senden wir Ihnen die finale Buchungsbestätigung mit den Zahlungsinformationen zu.
        </p>
      </div>

      <div class="details">
        <h3>📋 Details Ihrer Anfrage</h3>
        <p><strong>Datum:</strong> {{event_date}}</p>
        <p><strong>Uhrzeit:</strong> {{event_time}}</p>
        <p><strong>Anzahl Gäste:</strong> {{guest_count}} Personen</p>
        <p><strong>Geschätzte Gesamtkosten:</strong> CHF {{estimated_total}}</p>
        <p><strong>Bemerkungen:</strong><br/>{{special_requests}}</p>
        <p><strong>Allergien/Unverträglichkeiten:</strong><br/>{{allergy_details}}</p>
      </div>

      <p>Falls Sie Fragen haben oder noch Details ändern möchten, erreichen Sie uns unter:</p>
      <p>
        📧 E-Mail: info@oliv-restaurant.ch<br/>
        📞 Telefon: +41 XX XXX XX XX
      </p>

      <p>Wir melden uns so bald wie möglich bei Ihnen!</p>
      <p>Mit freundlichen Grüßen,<br/>Ihr Oliv-Team</p>
    </div>

    <div class="footer">
      <p>Oliv Restaurant | Schweiz</p>
      <p><a href="https://oliv-restaurant.ch" style="color: #2c3e50;">www.oliv-restaurant.ch</a></p>
    </div>
  </div>
</body>
</html>
```

**Variables:**
- `customer_name`
- `event_date`
- `event_time`
- `guest_count`
- `estimated_total`
- `deposit_amount`
- `deposit_percentage`
- `booking_id`
- `special_requests`
- `allergy_details`

---

## Template 14: `booking-thank-you-no-deposit`

**When to use:** Initial inquiry for bookings < 5000 CHF (Phase 1)

**Subject:** `Vielen Dank für Ihre Anfrage - Oliv Restaurant - {{event_date}}`

**HTML:**
```html
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
    .info-box { background-color: #d1ecf1; border-left: 4px solid #17a2b8; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
    .button { display: inline-block; background-color: #17a2b8; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">🙏 Vielen Dank</h1>
      <p style="margin: 10px 0 0 0;">Anfrage erhalten</p>
    </div>

    <div class="content">
      <p>Hallo {{customer_name}},</p>
      <p>Vielen Dank für Ihre Buchungsanfrage! Wir haben Ihre Details erhalten und prüfen diese nun. Wir freuen uns, dass Sie Ihren Anlass im Oliv Restaurant planen.</p>

      <div class="info-box">
        <h3 style="margin: 0 0 10px 0; color: #0c5460;">🍽️ Menü anpassen</h3>
        <p style="margin: 0; color: #0c5460; line-height: 1.6;">
          Sie können Ihre Anfrage oder Ihr Menü weiterhin anpassen, während wir Ihre Reservierung prüfen.
        </p>
        <div style="margin-top: 15px;">
          <a href="{{booking_edit_url}}" class="button">
            Anfrage bearbeiten
          </a>
        </div>
      </div>

      <div class="details">
        <h3>📋 Details Ihrer Anfrage</h3>
        <p><strong>Datum:</strong> {{event_date}}</p>
        <p><strong>Uhrzeit:</strong> {{event_time}}</p>
        <p><strong>Anzahl Gäste:</strong> {{guest_count}} Personen</p>
        <p><strong>Geschätzte Gesamtkosten:</strong> CHF {{estimated_total}}</p>
        <p><strong>Bemerkungen:</strong><br/>{{special_requests}}</p>
        <p><strong>Allergien/Unverträglichkeiten:</strong><br/>{{allergy_details}}</p>
      </div>

      <p>Falls Sie weitere Fragen haben, kontaktieren Sie uns bitte:</p>
      <p>
        📧 E-Mail: info@oliv-restaurant.ch<br/>
        📞 Telefon: +41 XX XXX XX XX
      </p>

      <p>Wir melden uns so bald wie möglich bei Ihnen!</p>
      <p>Mit freundlichen Grüßen,<br/>Ihr Oliv-Team</p>
    </div>

    <div class="footer">
      <p>Oliv Restaurant | Schweiz</p>
      <p><a href="https://oliv-restaurant.ch" style="color: #2c3e50;">www.oliv-restaurant.ch</a></p>
    </div>
  </div>
</body>
</html>
```

**Variables:**
- `customer_name`
- `event_date`
- `event_time`
- `guest_count`
- `estimated_total`
- `booking_edit_url`
- `special_requests`
- `allergy_details`

---

---

## Template 15: `user-created`

**When to use:** New admin user account is created

**Subject:** `Willkommen beim Oliv Buchungssystem - Ihr Konto ist bereit`

**HTML:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #9DAE91; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .details { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
    .details h3 { color: #2c3e50; margin-top: 0; }
    .details p { margin: 10px 0; }
    .details strong { color: #2c3e50; }
    .info-box { background-color: #f1f5f9; border-left: 4px solid #9DAE91; padding: 20px; margin: 20px 0; border-radius: 4px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
    .button { display: inline-block; background-color: #9DAE91; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; }
    .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px 20px; margin: 20px 0; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">🎉 Willkommen beim Oliv Buchungssystem</h1>
      <p style="margin: 10px 0 0 0;">Ihr Konto ist bereit</p>
    </div>

    <div class="content">
      <p>Hallo <strong>{{user_name}}</strong>,</p>
      <p>Ihr Konto wurde erfolgreich im Oliv Buchungssystem erstellt. Sie können nun auf das Admin-Panel zugreifen, um Buchungen, Menüs und mehr zu verwalten.</p>

      <div class="info-box">
        <h3 style="margin: 0 0 10px 0; color: #2c3e50;">👤 Kontodetails</h3>
        <p style="margin: 0 0 5px 0; color: #2c3e50;"><strong>E-Mail:</strong> {{user_email}}</p>
        <p style="margin: 0; color: #2c3e50;"><strong>Rolle:</strong> {{user_role}}</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="{{login_url}}" class="button">
          Zum Admin-Panel anmelden
        </a>
      </div>

      <div class="warning">
        <p style="margin: 0; font-size: 14px; color: #856404;">
          <strong>Wichtig:</strong> Ihr temporäres Passwort lautet: <code>{{temp_password}}</code><br/>
          Bitte ändern Sie Ihr Passwort aus Sicherheitsgründen nach Ihrer ersten Anmeldung.
        </p>
      </div>

      <p style="margin-top: 20px;">Falls Sie Fragen haben, wenden Sie sich bitte an Ihren Systemadministrator.</p>
      <p>Mit freundlichen Grüßen,<br/>Ihr Oliv Buchungssystem-Team</p>
    </div>

    <div class="footer">
      <p>Oliv Restaurant Buchungssystem</p>
      <p><a href="https://oliv-restaurant.ch" style="color: #2c3e50;">www.oliv-restaurant.ch</a></p>
    </div>
  </div>
</body>
</html>
```

**Variables:**
- `user_name`
- `user_email`
- `user_role`
- `login_url`
- `temp_password`

---

## Template 16: `booking-checkin`

**When to use:** Sent 4 days before event to get final guest count confirmation.

**Subject:** `Wichtige Bestätigung: Ihre Veranstaltung am {{event_date}} - Oliv Restaurant`

**HTML:**
```html
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
    .button { background-color: #3d4a2e; color: #ffffff !important; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; }
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
      <p>Guten Tag {{customer_name}},</p>
      <p>Ihre geplante Veranstaltung am <span class="highlight">{{event_date}}</span> rückt näher und wir freuen uns sehr darauf, Sie bei uns im Oliv Restaurant begrüssen zu dürfen.</p>
      
      <p>Um alles perfekt für Sie vorzubereiten, benötigen wir jetzt Ihre <strong>finale Bestätigung</strong> der Gästeanzahl sowie eventuelle letzte Anpassungen.</p>

      <div class="details">
        <h3>📋 Aktuelle Buchungsübersicht</h3>
        <p><strong>Datum:</strong> {{event_date}}</p>
        <p><strong>Uhrzeit:</strong> {{event_time}} Uhr</p>
        <p><strong>Gästeanzahl (provisorisch):</strong> {{guest_count}} Personen</p>
        <p><strong>ID:</strong> {{booking_id}}</p>
      </div>

      <p>Bitte klicken Sie auf den untenstehenden Button, um uns die Personenzahl definitiv zu bestätigen oder uns über Änderungen zu informieren.</p>

      <div class="button-container">
        <a href="{{checkin_url}}" class="button">Jetzt Details bestätigen</a>
      </div>

      <p>Wir freuen uns auf Sie!</p>
      <p>Herzliche Grüsse,<br/>Ihr Oliv-Team</p>
    </div>

    <div class="footer">
      <p>Oliv Restaurant | Schweiz</p>
      <p><a href="https://oliv-restaurant.ch" style="color: #3d4a2e;">www.oliv-restaurant.ch</a></p>
    </div>
  </div>
</body>
</html>
```

**Variables:**
- `customer_name`
- `event_date`
- `event_time`
- `guest_count`
- `booking_id`
- `checkin_url`

---

## Template 17: `booking-update`

**When to use:** Triggered manually to send the latest offer/changes to the guest (usually with PDF).

**Subject:** `Aktualisierte Details zu Ihrer Buchung - {{event_date}}`

**HTML:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f7f6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #4a5568; color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; }
    .content { background-color: #ffffff; padding: 40px 30px; border-radius: 0 0 12px 12px; }
    .footer { text-align: center; margin-top: 30px; padding: 20px; color: #718096; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 26px;">Buchungs-Update</h1>
    </div>
    <div class="content">
      <p>Guten Tag {{customer_name}},</p>
      <p>wir haben die Details Ihrer Buchung für den <strong>{{event_date}}</strong> aktualisiert.</p>
      <p>Im Anhang finden Sie das aktuelle Angebot mit allen Details zu Ihrem Menü und dem Ablauf Ihrer Veranstaltung.</p>
      <p>Bitte prüfen Sie die Unterlagen. Falls Sie noch Fragen haben, stehen wir Ihnen gerne zur Verfügung.</p>
      <p>Herzliche Grüsse,<br/>Ihr Oliv-Team</p>
    </div>
    <div class="footer">
      <p>Oliv Restaurant | Schweiz</p>
    </div>
  </div>
</body>
</html>
```

**Variables:**
- `customer_name`
- `event_date`

---

## Template 18: `manual-reminder`

**When to use:** When staff tried to reach the guest by phone but was unsuccessful.

**Subject:** `Ihre Buchung bei Oliv Restaurant - Kontaktaufnahme`

**HTML:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #374151; background-color: #f9fafb; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; padding: 0; background-color: #ffffff; border-radius: 12px; overflow: hidden; }
    .header { background-color: #3d4a2e; color: #ffffff; padding: 40px 20px; text-align: center; }
    .content { padding: 40px 30px; }
    .message-box { background-color: #f0ede6; border-left: 4px solid #3d4a2e; padding: 25px; margin: 30px 0; border-radius: 0 8px 8px 0; }
    .details { background-color: #f9fafb; padding: 25px; border-radius: 8px; border: 1px solid #e5e7eb; margin: 30px 0; }
    .footer { text-align: center; padding: 30px; background-color: #f9fafb; color: #6b7280; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">Guten Tag</h1>
    </div>
    <div class="content">
      <p>Hallo {{customer_name}},</p>
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
        <p><strong>Datum:</strong> {{event_date}}</p>
        <p><strong>Uhrzeit:</strong> {{event_time}} Uhr</p>
        <p><strong>Gäste:</strong> {{guest_count}} Personen</p>
      </div>
      <p>Herzliche Grüsse,<br/>Ihr Oliv-Team</p>
    </div>
    <div class="footer">
      <p>Oliv Restaurant | Schweiz</p>
    </div>
  </div>
</body>
</html>
```

**Variables:**
- `customer_name`
- `event_date`
- `event_time`
- `guest_count`

---

---

## Template 20: `custom-email`

**When to use:** Generic/custom communications sent manually from the dashboard.

**Subject:** `Nachricht von Oliv Restaurant`

**HTML:**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #2c3e50; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; min-height: 200px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 24px;">Nachricht von Oliv</h1>
    </div>
    <div class="content">
      <p>Hallo {{customer_name}},</p>
      <div style="margin: 20px 0;">
        {{custom_content}}
      </div>
      <p>Mit freundlichen Grüßen,<br/>Ihr Oliv-Team</p>
    </div>
    <div class="footer">
      <p>Oliv Restaurant | Schweiz</p>
    </div>
  </div>
</body>
</html>
```

**Variables:**
- `customer_name`
- `custom_content`

---

## Template 19: `checkin-submitted`

**When to use:** Notifies admins when a guest submits their 4-day check-in.

**Subject:** `Check-in eingegangen: {{customer_name}} - {{event_date}}`

**HTML:**
```html
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
    /* Note: Conditionals like badge color are handled in backend by sending full HTML or different variables */
    .change-status { background-color: #f1f5f9; padding: 10px; border-radius: 5px; margin-bottom: 15px; font-weight: bold; }
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
        <div class="change-status">
          Änderungen gemeldet: {{has_changes}}
        </div>
        <p><span class="label">Gästeanzahl-Update:</span> <span class="value">{{guest_count_changed}}</span></p>
      </div>

      <div class="section">
        <div class="section-title">Buchungsübersicht (Neu)</div>
        <p><span class="label">Kunde:</span> <span class="value">{{customer_name}}</span></p>
        <p><span class="label">Datum:</span> <span class="value">{{event_date}}</span></p>
        <p><span class="label">Buchungs-ID:</span> <span class="value">{{booking_id}}</span></p>
        <p><span class="label">Gästeanzahl:</span> <span class="value" style="font-weight:bold;">{{new_guest_count}} Personen</span></p>
      </div>

      <div class="section">
        <div class="section-title">Details der Änderungen</div>
        <p><strong>Menü- / Komponenten-Änderungen:</strong></p>
        <p style="white-space: pre-wrap; background: #f5f5f5; padding: 10px; border-radius: 3px;">{{menu_changes}}</p>
        
        <p><strong>Zusätzliche Wünsche / Details:</strong></p>
        <p style="white-space: pre-wrap; background: #f5f5f5; padding: 10px; border-radius: 3px;">{{additional_details}}</p>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <a href="{{admin_url}}" class="button">In Admin-Panel öffnen</a>
      </div>
    </div>

    <div class="footer">
      <p>Dies ist eine automatische Benachrichtigung vom Oliv Restaurant Buchungssystem.</p>
    </div>
  </div>
</body>
</html>
```

**Variables:**
- `customer_name`
- `event_date`
- `booking_id`
- `has_changes` ("Ja" / "Nein")
- `guest_count_changed` ("Ja" / "Nein")
- `new_guest_count`
- `menu_changes`
- `additional_details`
- `admin_url`

---

## IMPORTANT: Backend Logic Handles ALL Conditionals

The backend code decides:
- Which template to use (deposit vs no-deposit)
- What data to send
- How to handle optional fields

All variables are **always sent** - empty strings if not applicable. No `{{#if}}` needed!

---

---

---

## Summary

✅ **20 templates total**
✅ **ZERO conditionals** in templates
✅ **Only simple variable substitution** like `{{customer_name}}`
✅ **All logic in backend code**

Copy and paste these directly into ZeptoMail dashboard - they will work perfectly!
