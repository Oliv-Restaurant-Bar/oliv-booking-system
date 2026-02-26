# ZeptoMail Integration Setup Plan

## Phase 1: Get ZeptoMail Credentials (You need to do this)

### Step 1: Create ZeptoMail Account
1. Go to [https://zeptomail.com/](https://zeptomail.com/)
2. Sign up for a new account (or log in if you already have one)
3. Verify your email address

### Step 2: Verify Sender Domain
1. In ZeptoMail dashboard, go to **Sender Domains**
2. Add your domain: `oliv-restaurant.ch` (or your preferred domain)
3. Add the DNS records provided by ZeptoMail to your domain's DNS settings:
   - TXT record for verification
   - MX records for email routing
   - SPF/DKIM records for authentication
4. Wait for domain verification (can take 24-48 hours)

### Step 3: Generate API Token
1. Go to **API Keys** or **Service Accounts** section
2. Click **Generate New Token** or **Create API Key**
3. Give it a descriptive name (e.g., "Oliv Booking System - Production")
4. Save the generated token - **you'll only see it once!**
5. Copy and save securely (you'll need this for the next phase)

### Step 4: Note Down Required Information
You'll need these values for the setup:

```
✅ ZEPTOMAIL_API_TOKEN: "your-api-token-here"
✅ ZEPTOMAIL_FROM_EMAIL: "bookings@oliv-restaurant.ch" (or your verified sender email)
✅ ZEPTOMAIL_FROM_NAME: "Oliv Restaurant" (or your preferred sender name)
✅ ZEPTOMAIL_REPLY_TO: "info@oliv-restaurant.ch" (optional)
```

---

## Phase 2: Implementation Plan (After you get the keys)

### 2.1 Environment Configuration
Create/update `.env.local` file with:
```env
# ZeptoMail Configuration
ZEPTOMAIL_API_TOKEN=your-token-here
ZEPTOMAIL_FROM_EMAIL=bookings@oliv-restaurant.ch
ZEPTOMAIL_FROM_NAME=Oliv Restaurant
ZEPTOMAIL_REPLY_TO=info@oliv-restaurant.ch
```

### 2.2 Create Email Service Module
Create `lib/email/zeptomail.ts` with:
- ZeptoMail client initialization
- Email sending function with error handling
- Template-based email composition
- Email logging to database

### 2.3 Create Email Templates
Create `lib/email/templates/` with templates for:
- **Booking Confirmation** (status: pending → confirmed)
- **Booking Cancellation** (status: any → cancelled)
- **Booking Completion** (status: confirmed → completed)
- **No Show Notification** (status: confirmed → no_show)
- **Booking Declined** (status: pending → declined)
- **Reminder Email** (scheduled before event)

### 2.4 Database Integration
Update existing actions to trigger emails:
- `updateBookingStatus()` - Send email when status changes
- `createBooking()` - Send confirmation email
- `convertLeadToBooking()` - Send conversion email

### 2.5 Email Logging
Log all sent emails to `email_logs` table:
- Track sent emails with booking_id
- Store email status (pending, sent, failed, bounced)
- Keep history of all communications

### 2.6 Admin Features (Optional)
Add UI components for:
- View email history per booking
- Manual email resend functionality
- Email template management
- Custom email sending

---

## Phase 3: File Structure

```
lib/
├── email/
│   ├── zeptomail.ts           # ZeptoMail client & send function
│   ├── templates/
│   │   ├── index.ts           # Template router
│   │   ├── booking-confirmed.ts
│   │   ├── booking-cancelled.ts
│   │   ├── booking-completed.ts
│   │   ├── booking-no-show.ts
│   │   ├── booking-declined.ts
│   │   └── booking-reminder.ts
│   └── types.ts               # Email-related types
├── actions/
│   ├── bookings.ts            # Update to trigger emails
│   └── email.ts               # New email actions
└── db/
    └── schema.ts              # Already has email_logs table

components/
└── admin/
    └── EmailHistory.tsx       # UI to view email logs (optional)
```

---

## Phase 4: Testing Plan

### Test Email Sending
1. Send test email to your own address
2. Verify email arrives in inbox (not spam)
3. Check email_logs table for entry

### Test Status Transitions
For each booking status change, verify correct email is sent:
- Pending → Confirmed: Confirmation email
- Confirmed → Cancelled: Cancellation email
- Confirmed → Completed: Thank you email
- Confirmed → No Show: No show notification
- Pending → Declined: Declined email

### Test Error Handling
1. Invalid recipient email
2. Missing API token
3. Network failures
4. ZeptoMail API rate limits

---

## Phase 5: Deployment Checklist

- [ ] ZeptoMail domain verified
- [ ] API token generated and saved
- [ ] Environment variables configured in production
- [ ] Email templates customized with Oliv branding
- [ ] Test emails sent successfully
- [ ] Email logging working correctly
- [ ] Admin can view email history
- [ ] Error monitoring set up (optional)

---

## Questions Before We Start Implementation

1. **Email Branding**: Do you have specific branding colors, logo, or email templates you want to use?

2. **Email Content**: Do you have specific text/wording you want for each status email, or should I create professional defaults?

3. **Bilingual**: I see your system supports German (nameDe, descriptionDe). Should emails be bilingual or based on user preference?

4. **Reminders**: Do you want automatic reminder emails (e.g., 24 hours before booking)?

5. **Admin Notifications**: Should admins receive emails for new bookings or only customers?

6. **Test Mode**: Do you want to implement a test mode that sends emails only to you during development?

---

## Next Steps

Once you have the ZeptoMail credentials:

1. **Reply with your credentials** (I'll help you set up `.env.local`)
2. **Answer the questions above** (for customization)
3. **I'll implement the complete email system** following this plan

Need help with any of the ZeptoMail setup steps?
