# Oliv Booking System - Email Integration

## Overview

This system integrates ZeptoMail for sending automated emails based on booking status changes. All emails are in German and include appropriate templates for different booking states.

## ⚡ NEW: Dashboard Templates Mode

You can now manage email templates directly in ZeptoMail dashboard instead of hardcoding them!

**Benefits:**
- ✅ Edit emails without deploying code
- ✅ Visual template editor
- ✅ Marketing team can manage content
- ✅ Instant updates

**To enable:** Set `USE_ZEPTOMAIL_TEMPLATES=true` in `.env`

See `ZEPTOMAIL_TEMPLATES_SETUP.md` for detailed setup instructions.

## Architecture

The email system supports **two modes**:

### 1. HTML Mode (Default)
- Templates are hardcoded in TypeScript files (`lib/email/templates/`)
- HTML is generated in code and sent to ZeptoMail
- Requires code deployment to update email content

### 2. Template Mode (Recommended ✅)
- Templates are managed in ZeptoMail dashboard
- Only template name + data variables are sent from code
- Edit emails without deploying code
- Marketing team can manage email content

## Features

- ✅ **Booking Confirmation** - Sent when booking status changes to "confirmed"
  - Conditional logic for deposits (>= 5000 CHF) or menu edit links (< 5000 CHF)

- ⏰ **24h Reminder** - Automatic reminders sent 24 hours before event

- ✅ **Booking Completion** - Sent after event with feedback request and rebooking prompt

- ❌ **Cancellation** - Sent when booking is cancelled

- 📭 **No Show** - Sent when customer doesn't appear

- 🚫 **Declined** - Sent when booking request is declined

## Setup Instructions

### Option A: HTML Mode (Quick Start - Default)

#### 1. Get ZeptoMail Credentials

Follow the guide in `ZEPTOMAIL_SETUP_PLAN.md` to:
- Create ZeptoMail account
- Verify your domain (`oliv-restaurant.ch`)
- Generate API token

#### 2. Configure Environment Variables

Add these to your `.env` file:

```env
# ZeptoMail Configuration
ZEPTOMAIL_API_TOKEN="your-api-token-here"
ZEPTOMAIL_FROM_EMAIL="bookings@oliv-restaurant.ch"
ZEPTOMAIL_FROM_NAME="Oliv Restaurant"
ZEPTOMAIL_REPLY_TO="info@oliv-restaurant.ch"

# Cron Job Security
CRON_SECRET="generate-random-secret-here"

# Leave USE_ZEPTOMAIL_TEMPLATES unset or set to 'false' for HTML mode
# USE_ZEPTOMAIL_TEMPLATES=false
```

That's it! Emails will use HTML templates in code.

### Option B: Dashboard Templates Mode (Recommended ✅)

#### Steps 1-2: Same as Option A

#### 3. Enable Template Mode

Add to `.env`:

```env
USE_ZEPTOMAIL_TEMPLATES=true
```

#### 4. Set Template Names

```env
ZEPTOMAIL_TEMPLATE_CONFIRMED=booking-confirmed
ZEPTOMAIL_TEMPLATE_CANCELLED=booking-cancelled
ZEPTOMAIL_TEMPLATE_COMPLETED=booking-completed
ZEPTOMAIL_TEMPLATE_REMINDER=booking-reminder
ZEPTOMAIL_TEMPLATE_NO_SHOW=booking-no-show
ZEPTOMAIL_TEMPLATE_DECLINED=booking-declined
```

#### 5. Create Templates in ZeptoMail Dashboard

See `ZEPTOMAIL_TEMPLATES_SETUP.md` for detailed step-by-step instructions with:
- Full HTML for each template
- Variable definitions
- Conditional logic examples
- Testing guidelines

**Quick Summary:**
1. Log in to ZeptoMail dashboard
2. Go to **Mail Templates**
3. Create 6 templates with the names above
4. Copy HTML from `ZEPTOMAIL_TEMPLATES_SETUP.md`
5. Use variables like `{{customer_name}}`, `{{event_date}}`, etc.

### Switching Between Modes

To switch from HTML to Template mode (or vice versa):

```bash
# Enable template mode
USE_ZEPTOMAIL_TEMPLATES=true

# Disable template mode (use HTML)
USE_ZEPTOMAIL_TEMPLATES=false
# or just remove the line
```

**No code changes needed!** The system automatically detects the mode and sends emails accordingly.

### 3. Update Account Details in Templates

Before using in production, update these in the email templates:

**In `lib/email/templates/booking-confirmed.ts`:**
- IBAN number
- Bank account details
- Phone numbers
- Restaurant address

**In all templates:**
- Phone number: `+41 XX XXX XX XX`
- Email: `info@oliv-restaurant.ch`
- Address: `Ihre Adresse`

## How It Works

### Automatic Emails on Status Change

When you update a booking status, emails are automatically sent:

```typescript
import { updateBookingStatus } from '@/lib/actions/bookings';

// Update to confirmed → sends confirmation email
await updateBookingStatus(bookingId, "confirmed");

// Update to cancelled → sends cancellation email
await updateBookingStatus(bookingId, "cancelled", {
  reason: "Restaurant closed for renovation"
});

// Update to completed → sends feedback email
await updateBookingStatus(bookingId, "completed");
```

### Manual Email Sending

```typescript
import {
  sendBookingConfirmation,
  sendBookingReminder,
  sendBookingCancellation,
} from '@/lib/actions/email';

// Send confirmation email
await sendBookingConfirmation({
  bookingId: "uuid",
  recipientEmail: "customer@example.com",
  bookingData: booking,
  estimatedTotal: 4500,
  bookingEditUrl: "https://oliv-restaurant.ch/booking/uuid/edit",
});

// Send reminder email
await sendBookingReminder({
  bookingId: "uuid",
  recipientEmail: "customer@example.com",
  bookingData: booking,
  estimatedTotal: 4500,
});
```

### Setting Up Reminder Cron Job

#### Option 1: Vercel Cron Jobs (Recommended for Vercel deployment)

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 * * * *"
    }
  ]
}
```

This runs every hour. Adjust schedule as needed:
- `"0 * * * *"` - Every hour
- `"0 9 * * *"` - Every day at 9 AM
- `"0 */6 * * *"` - Every 6 hours

#### Option 2: External Cron Service

Use services like:
- [cron-job.org](https://cron-job.org) (free)
- [EasyCron](https://www.easycron.com)
- [GitHub Actions](https://github.com/features/actions)

**Example curl command:**
```bash
curl -X POST https://your-domain.com/api/cron/send-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

#### Option 3: Manual Trigger

For testing or manual execution:

```bash
# Using node
node -e "require('./lib/actions/reminders').sendRemindersForNext24Hours()"

# Or call the API endpoint
curl -X POST https://your-domain.com/api/cron/send-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## Testing Email System

### 1. Test Email Configuration

```typescript
import { validateEmailConfig, sendEmail } from '@/lib/email/zeptomail';

// Check if configuration is valid
const config = validateEmailConfig();
console.log(config); // { valid: true, missing: [] }

// Send test email
await sendEmail({
  to: "your-email@example.com",
  subject: "Test Email",
  html: "<h1>This is a test</h1>",
});
```

### 2. Test Status Change Emails

```typescript
// Update booking status to test different emails
await updateBookingStatus("booking-id", "confirmed");   // Confirmation
await updateBookingStatus("booking-id", "cancelled");   // Cancellation
await updateBookingStatus("booking-id", "completed");   // Completion
```

### 3. View Email Logs

```typescript
import { getBookingEmailLogs } from '@/lib/actions/email';

const logs = await getBookingEmailLogs("booking-id");
console.log(logs);
```

## Email Templates Location

All templates are in `lib/email/templates/`:

- `booking-confirmed.ts` - Confirmation with deposit/menu edit logic
- `booking-cancelled.ts` - Cancellation notice
- `booking-completed.ts` - Completion with feedback request
- `booking-reminder.ts` - 24h reminder
- `booking-no-show.ts` - No show notification
- `booking-declined.ts` - Booking declined notice

## Conditional Logic

### Deposit vs Menu Edit (Confirmation Email)

```typescript
const DEPOSIT_THRESHOLD = 5000;

if (estimatedTotal >= DEPOSIT_THRESHOLD) {
  // Shows deposit request section
  // Requests 30% deposit payment
} else {
  // Shows menu edit link
  // Allows menu customization up to 48h before event
}
```

## Troubleshooting

### Emails Not Sending

1. **Check environment variables:**
   ```bash
   echo $ZEPTOMAIL_API_TOKEN
   echo $ZEPTOMAIL_FROM_EMAIL
   ```

2. **Check email configuration:**
   ```typescript
   import { validateEmailConfig } from '@/lib/email/zeptomail';
   console.log(validateEmailConfig());
   ```

3. **Check logs in database:**
   ```sql
   SELECT * FROM email_logs WHERE status = 'failed';
   ```

4. **Check ZeptoMail dashboard** for delivery status

### Domain Verification Issues

- Make sure DNS records are correctly added
- Allow 24-48 hours for DNS propagation
- Check TXT, MX, SPF, and DKIM records

### Cron Job Not Running

- Verify CRON_SECRET matches between .env and API call
- Check cron job service logs
- Test endpoint manually with curl first

## Security Considerations

1. **Never commit `.env`** to version control
2. **Use strong CRON_SECRET** in production (generate with: `openssl rand -base64 32`)
3. **Rotate API tokens** regularly
4. **Monitor email logs** for suspicious activity
5. **Rate limiting** is handled by ZeptoMail

## Production Checklist

Before going live:

- [ ] ZeptoMail domain verified
- [ ] API token configured in production environment
- [ ] All phone numbers and addresses updated in templates
- [ ] IBAN and bank details correct
- [ ] Test emails sent successfully to test account
- [ ] Cron job configured and tested
- [ ] CRON_SECRET set to strong random value
- [ ] Email logging working correctly
- [ ] Error monitoring set up (optional)

## API Reference

### Main Functions

| Function | Purpose |
|----------|---------|
| `updateBookingStatus()` | Update status & auto-send email |
| `sendBookingConfirmation()` | Send confirmation email |
| `sendBookingCancellation()` | Send cancellation email |
| `sendBookingCompletion()` | Send completion email |
| `sendBookingReminder()` | Send reminder email |
| `sendBookingNoShow()` | Send no-show email |
| `sendBookingDeclined()` | Send declined email |
| `getBookingEmailLogs()` | Get all emails for a booking |
| `sendRemindersForNext24Hours()` | Send all upcoming reminders |

## Support

For issues or questions:
- Check ZeptoMail documentation: https://www.zoho.com/zeptomail/help/api/
- Check email logs in database
- Check server logs for errors
