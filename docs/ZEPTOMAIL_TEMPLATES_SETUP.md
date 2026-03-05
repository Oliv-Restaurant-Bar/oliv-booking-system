# ZeptoMail Dashboard Templates Setup Guide

This guide will help you migrate from hardcoded email templates to ZeptoMail dashboard templates, allowing you to edit emails without deploying code.

---

## Benefits of Using ZeptoMail Templates

✅ **Edit emails without code changes** - Update templates directly in ZeptoMail dashboard
✅ **Visual template editor** - No HTML knowledge needed
✅ **Instant updates** - Changes take effect immediately
✅ **Version control** - Keep track of template changes
✅ **A/B testing** - Test different email variations
✅ **Marketing team friendly** - Non-developers can manage email content

---

## Step 1: Create Templates in ZeptoMail Dashboard

### 1. Log in to ZeptoMail
Go to [https://zeptomail.zoho.com/](https://zeptomail.zoho.com/) and log in.

### 2. Navigate to Templates
Go to **Mail Templates** or **Email Templates** section in the dashboard.

### 3. Create the following 7 templates:

For each template, click **"Create Template"** or **"New Template"**, then:

#### Template 1: `booking-confirmed-deposit`
**Purpose:** Sent when booking is confirmed AND total ≥ 5000 CHF (shows deposit request)

**Subject:** `Buchungsbestätigung - Oliv Restaurant - {{event_date}}`

**HTML Body:**
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
        {{#if special_requests}}
        <p><strong>Bemerkungen:</strong><br/>{{special_requests}}</p>
        {{/if}}
        {{#if allergy_details}}
        <p><strong>Allergien/Unverträglichkeiten:</strong><br/>{{allergy_details}}</p>
        {{/if}}
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
- `customer_name` - Customer's name
- `event_date` - Formatted date (e.g., "Freitag, 18. Februar 2026")
- `event_time` - Event time (e.g., "19:00")
- `guest_count` - Number of guests
- `estimated_total` - Estimated total cost (e.g., "150.00")
- `deposit_amount` - Deposit amount (e.g., "45.00")
- `deposit_percentage` - Deposit percentage (e.g., "30")
- `booking_id` - Short booking ID (e.g., "a1b2c3d4")
- `special_requests` - Special requests (optional)
- `allergy_details` - Allergy details (optional)

---

#### Template 2: `booking-confirmed-no-deposit`
**Purpose:** Sent when booking is confirmed AND total < 5000 CHF (shows menu edit link)

**Subject:** `Buchungsbestätigung - Oliv Restaurant - {{event_date}}`

**HTML Body:**
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
        {{#if booking_edit_url}}
        <div style="margin-top: 15px;">
          <a href="{{booking_edit_url}}" class="button">
            Menü jetzt bearbeiten
          </a>
        </div>
        {{/if}}
      </div>

      <div class="details">
        <h3>📋 Buchungsdetails</h3>
        <p><strong>Datum:</strong> {{event_date}}</p>
        <p><strong>Uhrzeit:</strong> {{event_time}}</p>
        <p><strong>Anzahl Gäste:</strong> {{guest_count}} Personen</p>
        <p><strong>Geschätzte Gesamtkosten:</strong> CHF {{estimated_total}}</p>
        {{#if special_requests}}
        <p><strong>Bemerkungen:</strong><br/>{{special_requests}}</p>
        {{/if}}
        {{#if allergy_details}}
        <p><strong>Allergien/Unverträglichkeiten:</strong><br/>{{allergy_details}}</p>
        {{/if}}
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
- `customer_name` - Customer's name
- `event_date` - Formatted date (e.g., "Freitag, 18. Februar 2026")
- `event_time` - Event time (e.g., "19:00")
- `guest_count` - Number of guests
- `estimated_total` - Estimated total cost (e.g., "150.00")
- `booking_edit_url` - URL to edit booking (optional)
- `special_requests` - Special requests (optional)
- `allergy_details` - Allergy details (optional)

---

#### Template 3: `booking-cancelled`
**Purpose:** Sent when booking is confirmed

**Subject:** `Buchungsbestätigung - Oliv Restaurant - {{event_date}}`

**HTML Body:**
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

      {{#if requires_deposit}}
      <div class="alert-box">
        <h3 style="margin: 0 0 10px 0; color: #856404;">💰 Anzahlung erforderlich</h3>
        <p style="margin: 0; color: #856404; line-height: 1.6;">
          Da Ihre Buchung CHF {{estimated_total}} überschreitet, bitten wir um eine Anzahlung von
          <strong>CHF {{deposit_amount}} (30%)</strong>, um Ihre Reservierung zu bestätigen.
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
      {{else}}
      <div class="info-box">
        <h3 style="margin: 0 0 10px 0; color: #0c5460;">🍽️ Menü anpassen</h3>
        <p style="margin: 0; color: #0c5460; line-height: 1.6;">
          Vielen Dank für Ihre Buchung! Sie können Ihr Menü noch anpassen, bis zu 48 Stunden vor der Veranstaltung.
        </p>
        {{#if booking_edit_url}}
        <div style="margin-top: 15px;">
          <a href="{{booking_edit_url}}" class="button">
            Menü jetzt bearbeiten
          </a>
        </div>
        {{/if}}
      </div>
      {{/if}}

      <div class="details">
        <h3>📋 Buchungsdetails</h3>
        <p><strong>Datum:</strong> {{event_date}}</p>
        <p><strong>Uhrzeit:</strong> {{event_time}}</p>
        <p><strong>Anzahl Gäste:</strong> {{guest_count}} Personen</p>
        <p><strong>Geschätzte Gesamtkosten:</strong> CHF {{estimated_total}}</p>
        {{#if special_requests}}
        <p><strong>Bemerkungen:</strong><br/>{{special_requests}}</p>
        {{/if}}
        {{#if allergy_details}}
        <p><strong>Allergien/Unverträglichkeiten:</strong><br/>{{allergy_details}}</p>
        {{/if}}
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
- `customer_name` - Customer's name
- `event_date` - Formatted date (e.g., "Freitag, 18. Februar 2026")
- `event_time` - Event time (e.g., "19:00")
- `guest_count` - Number of guests
- `estimated_total` - Estimated total cost
- `requires_deposit` - Boolean (true if total >= 5000)
- `deposit_amount` - Deposit amount (30% of total)
- `booking_id` - Short booking ID
- `booking_edit_url` - URL to edit booking (optional)
- `special_requests` - Special requests (optional)
- `allergy_details` - Allergy details (optional)

---

#### Template 2: `booking-cancelled`
**Purpose:** Sent when booking is cancelled

**Subject:** `Stornierung Ihrer Buchung - Oliv Restaurant - {{event_date}}`

**HTML Body:**
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

      {{#if cancellation_reason}}
      <div class="info-box">
        <h3 style="margin: 0 0 10px 0; color: #0c5460;">Grund für die Stornierung:</h3>
        <p style="margin: 0; color: #0c5460;">{{cancellation_reason}}</p>
      </div>
      {{/if}}

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
- `customer_name` - Customer's name
- `event_date` - Formatted date
- `event_time` - Event time
- `guest_count` - Number of guests
- `booking_id` - Short booking ID
- `cancellation_reason` - Reason for cancellation (optional)

---

#### Template 3: `booking-completed`
**Purpose:** Sent after event is completed (thank you email)

**Subject:** `Vielen Dank für Ihren Besuch - Oliv Restaurant`

**HTML Body:**
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
        {{#if feedback_url}}
        <a href="{{feedback_url}}" class="button" style="background-color: #ffc107; color: #333;">
          Feedback geben
        </a>
        {{else}}
        <p style="margin: 10px 0 0 0; color: #856404;">
          Besuchen Sie unsere Website, um Ihr Feedback abzugeben.
        </p>
        {{/if}}
      </div>

      <div class="rebooking-box">
        <h3 style="margin: 0 0 10px 0; color: #0c5460;">📅 Planen Sie Ihren nächsten Anlass?</h3>
        <p style="margin: 0 0 15px 0; color: #0c5460;">
          Wir freuen uns schon darauf, Sie wiederzusehen! Buchen Sie jetzt Ihren nächsten Anlass bei uns.
        </p>
        {{#if rebooking_url}}
        <a href="{{rebooking_url}}" class="button" style="background-color: #17a2b8;">
          Neue Buchung erstellen
        </a>
        {{else}}
        <p style="margin: 10px 0 0 0; color: #0c5460;">
          Besuchen Sie unsere Website für eine neue Buchung.
        </p>
        {{/if}}
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
- `customer_name` - Customer's name
- `event_date` - Formatted date
- `event_time` - Event time
- `guest_count` - Number of guests
- `feedback_url` - URL to feedback form (optional)
- `rebooking_url` - URL to create new booking (optional)

---

#### Template 4: `booking-reminder`
**Purpose:** Sent 24 hours before event as reminder

**Subject:** `Erinnerung an Ihre Buchung morgen - Oliv Restaurant`

**HTML Body:**
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

      {{#if requires_deposit}}
      <div class="alert-box">
        <h3 style="margin: 0 0 10px 0; color: #856404;">💰 Anzahlung erinnern</h3>
        <p style="margin: 0; color: #856404; line-height: 1.6;">
          Bitte überprüfen Sie, ob die Anzahlung von CHF {{deposit_amount}} (30%) bereits überwiesen wurde.
          Falls nicht, bitten wir um zeitnahe Überweisung auf unser Konto.
        </p>
      </div>
      {{else}}
      <div class="alert-box">
        <h3 style="margin: 0 0 10px 0; color: #856404;">🍽️ Letzte Änderungen</h3>
        <p style="margin: 0; color: #856404; line-height: 1.6;">
          Sie können Ihr Menü und Ihre Buchungsdetails noch bis heute anpassen. Kontaktieren Sie uns für Änderungen.
        </p>
      </div>
      {{/if}}

      <div class="details">
        <h3>📋 Buchungsdetails</h3>
        <p><strong>Datum:</strong> {{event_date}}</p>
        <p><strong>Uhrzeit:</strong> {{event_time}}</p>
        <p><strong>Anzahl Gäste:</strong> {{guest_count}} Personen</p>
        {{#if estimated_total}}
        <p><strong>Geschätzte Gesamtkosten:</strong> CHF {{estimated_total}}</p>
        {{/if}}
        {{#if special_requests}}
        <p><strong>Bemerkungen:</strong><br/>{{special_requests}}</p>
        {{/if}}
        {{#if allergy_details}}
        <p><strong>Allergien/Unverträglichkeiten:</strong><br/>{{allergy_details}}</p>
        {{/if}}
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
- `customer_name` - Customer's name
- `event_date` - Formatted date
- `event_time` - Event time
- `guest_count` - Number of guests
- `estimated_total` - Estimated total (optional)
- `requires_deposit` - Boolean
- `deposit_amount` - Deposit amount (optional)
- `special_requests` - Special requests (optional)
- `allergy_details` - Allergy details (optional)

---

#### Template 5: `booking-no-show`
**Purpose:** Sent when customer doesn't show up

**Subject:** `Nicht erschienen - Oliv Restaurant - {{event_date}}`

**HTML Body:**
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
- `customer_name` - Customer's name
- `event_date` - Formatted date
- `event_time` - Event time
- `guest_count` - Number of guests

---

#### Template 6: `booking-declined`
**Purpose:** Sent when booking request is declined

**Subject:** `Ihre Buchungsanfrage - Oliv Restaurant`

**HTML Body:**
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

      {{#if decline_reason}}
      <div class="info-box">
        <h3 style="margin: 0 0 10px 0; color: #0c5460;">Begründung:</h3>
        <p style="margin: 0; color: #0c5460;">{{decline_reason}}</p>
      </div>
      {{else}}
      <div class="info-box">
        <p style="margin: 0; color: #0c5460;">
          Leider ist das Restaurant zum gewünschten Zeitpunkt bereits ausgebucht oder wir können Ihre Anfrage aus anderen logistischen Gründen nicht erfüllen.
        </p>
      </div>
      {{/if}}

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
- `customer_name` - Customer's name
- `event_date` - Formatted date
- `event_time` - Event time
- `guest_count` - Number of guests
- `decline_reason` - Reason for declining (optional)

---

## Step 2: Save Template Names

After creating each template, **note down the template name/ID** shown in ZeptoMail. You'll need these exact names in your code:

- `booking-confirmed-deposit` - For bookings ≥ 5000 CHF (shows deposit request)
- `booking-confirmed-no-deposit` - For bookings < 5000 CHF (shows menu edit link)
- `booking-cancelled` - Template name/ID from ZeptoMail
- `booking-completed` - Template name/ID from ZeptoMail
- `booking-reminder` - Template name/ID from ZeptoMail
- `booking-no-show` - Template name/ID from ZeptoMail
- `booking-declined` - Template name/ID from ZeptoMail

---

## Step 3: Update Environment Variables

Add to your `.env`:

```env
# ZeptoMail Template Names (update these with actual template names from ZeptoMail dashboard)
# Note: Confirmation has TWO templates based on amount
ZEPTOMAIL_TEMPLATE_CONFIRMED_DEPOSIT=booking-confirmed-deposit
ZEPTOMAIL_TEMPLATE_CONFIRMED_NO_DEPOSIT=booking-confirmed-no-deposit
ZEPTOMAIL_TEMPLATE_CANCELLED=booking-cancelled
ZEPTOMAIL_TEMPLATE_COMPLETED=booking-completed
ZEPTOMAIL_TEMPLATE_REMINDER=booking-reminder
ZEPTOMAIL_TEMPLATE_NO_SHOW=booking-no-show
ZEPTOMAIL_TEMPLATE_DECLINED=booking-declined
ZEPTOMAIL_TEMPLATE_ASSIGNED=booking-assigned
ZEPTOMAIL_TEMPLATE_KITCHEN_PDF=kitchen-pdf
```

---

## Step 4: Template Variable Reference

### Common Variables (All Templates)
| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `customer_name` | string | Customer's name | "Hans Müller" |
| `event_date` | string | Formatted date in German | "Freitag, 18. Februar 2026" |
| `event_time` | string | Event time | "19:00" |
| `guest_count` | number | Number of guests | 4 |
| `booking_id` | string | Short booking ID | "a1b2c3d4" |

### Template-Specific Variables

#### booking-confirmed
| Variable | Type | Description |
|----------|------|-------------|
| `estimated_total` | string | Total cost formatted | "150.00" |
| `requires_deposit` | boolean | True if total >= 5000 |
| `deposit_amount` | string | Deposit amount formatted | "45.00" |
| `booking_edit_url` | string | URL to edit booking |
| `special_requests` | string | Customer's special requests |
| `allergy_details` | string | Comma-separated allergies |

#### booking-cancelled
| Variable | Type | Description |
|----------|------|-------------|
| `cancellation_reason` | string | Why booking was cancelled |

#### booking-completed
| Variable | Type | Description |
|----------|------|-------------|
| `feedback_url` | string | URL to feedback form |
| `rebooking_url` | string | URL to create new booking |

#### booking-reminder
| Variable | Type | Description |
|----------|------|-------------|
| `estimated_total` | string | Total cost formatted |
| `requires_deposit` | boolean | True if deposit needed |
| `deposit_amount` | string | Deposit amount formatted |
| `special_requests` | string | Customer's special requests |
| `allergy_details` | string | Comma-separated allergies |

#### booking-no-show
No additional variables beyond common ones.

#### booking-declined
| Variable | Type | Description |
|----------|------|-------------|
| `decline_reason` | string | Why booking was declined |

---

## Step 5: Testing Templates

After creating templates in ZeptoMail:

1. **Use ZeptoMail's "Test Send" feature** to send a test email to yourself
2. **Verify all variables are replaced correctly**
3. **Check responsive design** on mobile and desktop
4. **Test conditional logic** (e.g., with/without deposit, with/without URLs)

---

## Next Steps

Once templates are created in ZeptoMail dashboard:

1. ✅ Templates created in ZeptoMail
2. ✅ Template names saved in `.env`
3. ⏭️ Update code to send templates instead of HTML (I'll help with this)

---

## Important Notes

⚠️ **Template Syntax**: ZeptoMail uses Handlebars/Mustache syntax: `{{variable_name}}`

⚠️ **Conditionals**: Use `{{#if variable}}...{{/if}}` for conditional content

⚠️ **HTML Allowed**: You can use full HTML in templates

⚠️ **CSS Inline**: Email clients prefer inline styles (avoid external CSS)

⚠️ **Variables Must Exist**: If a variable doesn't exist, it will show as empty string (not error)

---

Need help? Check ZeptoMail's template documentation or contact me for assistance!
