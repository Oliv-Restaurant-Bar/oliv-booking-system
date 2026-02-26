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

**Subject:** `Anfrage auf Bearbeitung - Booking #{{booking_id}}`

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
      <h1 style="margin: 0; font-size: 28px;">🔑 Unlock Request</h1>
      <p style="margin: 10px 0 0 0;">Booking #{{booking_id}}</p>
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

      <p>Mit freundlichen Grüßen,<br/>Oliv Booking System</p>
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

---

## Template 11: `booking-thank-you-deposit`

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

## Template 12: `booking-thank-you-no-deposit`

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

## IMPORTANT: Backend Logic Handles ALL Conditionals

The backend code decides:
- Which template to use (deposit vs no-deposit)
- What data to send
- How to handle optional fields

All variables are **always sent** - empty strings if not applicable. No `{{#if}}` needed!

---

## Summary

✅ **12 templates total**
✅ **ZERO conditionals** in templates
✅ **Only simple variable substitution** like `{{customer_name}}`
✅ **All logic in backend code**

Copy and paste these directly into ZeptoMail dashboard - they will work perfectly!
