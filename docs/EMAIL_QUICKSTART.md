# 🚀 ZeptoMail Email Integration - Quick Start

## ✅ Setup Complete!

The ZeptoMail email system has been successfully integrated into your Oliv booking system.

## 📋 What's Been Created

### Email System Files
```
lib/
├── email/
│   ├── zeptomail.ts           # ZeptoMail client & configuration
│   ├── templates/
│   │   ├── index.ts           # Template router
│   │   ├── booking-confirmed.ts    # ✅ Confirmation (with deposit/menu edit logic)
│   │   ├── booking-cancelled.ts    # ❌ Cancellation
│   │   ├── booking-completed.ts    # 🎉 Completion (with feedback request)
│   │   ├── booking-reminder.ts     # ⏰ 24h reminder
│   │   ├── booking-no-show.ts      # 📭 No show
│   │   └── booking-declined.ts     # 🚫 Declined
│   └── README.md              # Full documentation
├── actions/
│   ├── email.ts               # Email sending functions
│   ├── reminders.ts           # Reminder automation
│   └── bookings.ts            # ✨ Updated to auto-send emails
└── api/cron/send-reminders/   # Cron job endpoint

scripts/
└── test-email.ts              # Test script
```

### Database
- `email_logs` table already exists (created in previous migration)
- Tracks all sent emails with status

## 🔧 Setup Steps (You Need to Do This)

### 1. Get ZeptoMail Credentials

1. Go to **https://zeptomail.com/**
2. Create account / Login
3. **Add & verify your domain** (`oliv-restaurant.ch`)
4. **Generate API token** (you'll only see it once!)
5. **Copy** the token and save it

### 2. Update Environment Variables

Edit `.env` and add:

```env
# ZeptoMail Configuration
ZEPTOMAIL_API_TOKEN="paste-your-token-here"
ZEPTOMAIL_FROM_EMAIL="bookings@oliv-restaurant.ch"
ZEPTOMAIL_FROM_NAME="Oliv Restaurant"
ZEPTOMAIL_REPLY_TO="info@oliv-restaurant.ch"

# Cron Job Security
CRON_SECRET="generate-random-secret-here"  # Use: openssl rand -base64 32
```

### 3. Update Account Details in Templates

**⚠️ Before using in production, update these files:**

Edit `lib/email/templates/booking-confirmed.ts`:
- Line ~97: IBAN number
- Line ~98: Bank name
- Line ~104: Reference text

Edit **all templates**:
- Phone number: `+41 XX XXX XX XX`
- Email addresses (if different)
- Restaurant address

### 4. Test the Configuration

```bash
npm run email:test
```

Or:
```bash
npx tsx scripts/test-email.ts
```

This will send a test email to verify everything works.

## 🎯 How Email Sending Works

### Automatic Emails (Status Changes)

When you update a booking status, emails are sent automatically:

```typescript
import { updateBookingStatus } from '@/lib/actions/bookings';

// ✅ Sends confirmation email
await updateBookingStatus("booking-id", "confirmed");

// ❌ Sends cancellation email
await updateBookingStatus("booking-id", "cancelled", {
  reason: "Restaurant closed for renovation"
});

// 🎉 Sends completion email with feedback request
await updateBookingStatus("booking-id", "completed");
```

### Manual Email Sending

```typescript
import { sendBookingReminder } from '@/lib/actions/email';

await sendBookingReminder({
  bookingId: "booking-id",
  recipientEmail: "customer@example.com",
  bookingData: booking,
  estimatedTotal: 4500,
});
```

### Conditional Logic in Confirmation Emails

```
If amount >= 5000 CHF:
  ✋ Request 30% deposit payment
  ✋ Show bank account details
  ✋ Payment instructions

If amount < 5000 CHF:
  📝 Thank you message
  🔗 Link to edit menu (up to 48h before event)
```

## ⏰ Setting Up Automatic Reminders

Reminders are sent **24 hours before** confirmed bookings.

### Option 1: Vercel Cron (Recommended)

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

### Option 2: Manual/External Cron

Run hourly via:
```bash
curl -X POST https://your-domain.com/api/cron/send-reminders \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Option 3: Test Reminders

```bash
npm run email:send-reminders
```

## 📊 Email Tracking

All emails are logged to the `email_logs` table:

```typescript
import { getBookingEmailLogs } from '@/lib/actions/email';

const logs = await getBookingEmailLogs("booking-id");
// Returns array of all emails sent for this booking
```

## 📝 Email Templates Summary

| Template | Trigger | Key Features |
|----------|---------|--------------|
| **Confirmation** | Status → `confirmed` | Deposit (>=5000) or menu edit (<5000) |
| **Cancellation** | Status → `cancelled` | Reason included if provided |
| **Completion** | Status → `completed` | Feedback request + rebooking link |
| **Reminder** | 24h before event | Deposit reminder (if applicable) |
| **No Show** | Status → `no_show` | Notification of missed booking |
| **Declined** | Status → `declined` | Reason for decline |

All emails are in **German** as requested.

## 🧪 Testing Checklist

Before going live:

- [ ] Get ZeptoMail API token
- [ ] Configure `.env` variables
- [ ] Update account details in templates (IBAN, phone, address)
- [ ] Run test: `npm run email:test`
- [ ] Check test email arrives in inbox
- [ ] Test status change emails in dev environment
- [ ] Set up cron job for reminders
- [ ] Verify email logs are created in database

## 📚 Full Documentation

See `lib/email/README.md` for complete documentation including:
- Troubleshooting guide
- API reference
- Security considerations
- Production checklist

## 🆘 Troubleshooting

### Emails Not Sending

1. Check environment variables: `echo $ZEPTOMAIL_API_TOKEN`
2. Verify domain is confirmed in ZeptoMail dashboard
3. Check email_logs table: `SELECT * FROM email_logs WHERE status = 'failed'`

### Domain Verification

- DNS changes can take 24-48 hours
- Verify TXT, MX, SPF, and DKIM records are added
- Check ZeptoMail dashboard for verification status

## ✨ Features Implemented

✅ German-only emails
✅ 24h automatic reminders
✅ Deposit logic (>= 5000 CHF)
✅ Menu edit links (< 5000 CHF)
✅ Feedback requests on completion
✅ Rebooking prompts
✅ Email logging to database
✅ Cron job endpoint
✅ Test script included

---

**Questions? Check `lib/email/README.md` or `ZEPTOMAIL_SETUP_PLAN.md`**
