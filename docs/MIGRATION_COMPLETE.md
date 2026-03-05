# ZeptoMail Templates Migration - Complete! ✅

## What Was Done

Your Oliv booking system now supports **ZeptoMail dashboard templates**! This means you can edit email templates in the ZeptoMail dashboard without deploying code.

## Two Modes Available

### Mode 1: HTML Templates (Default - Current)
- ✅ Works out of the box
- ✅ Templates in code (`lib/email/templates/`)
- ❌ Need to deploy to change email content

### Mode 2: Dashboard Templates (New - Recommended) ✨
- ✅ Edit emails in ZeptoMail dashboard
- ✅ Visual editor
- ✅ No deployment needed
- ✅ Marketing team can manage content
- ✅ Just toggle to enable!

---

## How to Enable Dashboard Templates

### Step 1: Create Templates in ZeptoMail

Open `ZEPTOMAIL_TEMPLATES_SETUP.md` and follow the instructions to create **7 templates** in ZeptoMail dashboard:

1. `booking-confirmed-deposit` - For bookings ≥ 5000 CHF (shows deposit request)
2. `booking-confirmed-no-deposit` - For bookings < 5000 CHF (shows menu edit link)
3. `booking-cancelled` - Cancellation email
4. `booking-completed` - Thank you + feedback
5. `booking-reminder` - 24h reminder
6. `booking-no-show` - No show notification
7. `booking-declined` - Declined booking

The guide includes:
- ✅ Full HTML for each template
- ✅ All variables defined
- ✅ Conditional logic (deposits, etc.)
- ✅ German content ready to use

### Step 2: Add to `.env`

```env
# Enable template mode
USE_ZEPTOMAIL_TEMPLATES=true

# Template names (must match ZeptoMail dashboard exactly)
# Note: Confirmation has TWO templates based on booking amount
ZEPTOMAIL_TEMPLATE_CONFIRMED_DEPOSIT=booking-confirmed-deposit
ZEPTOMAIL_TEMPLATE_CONFIRMED_NO_DEPOSIT=booking-confirmed-no-deposit
ZEPTOMAIL_TEMPLATE_CANCELLED=booking-cancelled
ZEPTOMAIL_TEMPLATE_COMPLETED=booking-completed
ZEPTOMAIL_TEMPLATE_REMINDER=booking-reminder
ZEPTOMAIL_TEMPLATE_NO_SHOW=booking-no-show
ZEPTOMAIL_TEMPLATE_DECLINED=booking-declined
```

### Step 3: Test It

That's it! Emails will now use ZeptoMail templates. The system automatically:
- ✅ Prepares template data from bookings
- ✅ Sends template name + variables to ZeptoMail
- ✅ Logs all emails in database
- ✅ Falls back gracefully if template not found

---

## Files Created/Modified

### New Files
- ✅ `ZEPTOMAIL_TEMPLATES_SETUP.md` - Complete setup guide with all template HTML
- ✅ `lib/email/template-mapper.ts` - Prepares data for ZeptoMail templates

### Modified Files
- ✅ `lib/email/zeptomail.ts` - Added `sendTemplateEmail()` function
- ✅ `lib/actions/email.ts` - Supports both HTML and template modes
- ✅ `lib/email/README.md` - Updated with both modes documentation

### Existing Files (Still Work)
- ✅ `lib/email/templates/*` - HTML templates (used when `USE_ZEPTOMAIL_TEMPLATES=false`)

---

## How It Works

### Template Mode (when `USE_ZEPTOMAIL_TEMPLATES=true`)

```typescript
// Your code calls this:
await sendBookingConfirmation({
  bookingId: booking.id,
  recipientEmail: customer.email,
  bookingData: booking,
  estimatedTotal: 1500,
});

// Behind the scenes:
// 1. template-mapper prepares data: { customer_name: "...", event_date: "...", ... }
// 2. Gets template name: "booking-confirmed"
// 3. Sends to ZeptoMail:
{
  template: {
    key: "booking-confirmed",
    data: { customer_name: "Hans", event_date: "Freitag, 18. Februar 2026", ... }
  }
}
// 4. ZeptoMail renders template and sends email
```

### HTML Mode (when `USE_ZEPTOMAIL_TEMPLATES=false` or unset)

```typescript
// Same code call...

// Behind the scenes:
// 1. Generates HTML from lib/email/templates/booking-confirmed.ts
// 2. Sends HTML directly to ZeptoMail
// 3. ZeptoMail sends email
```

**No code changes needed!** Just toggle the environment variable.

---

## Template Variables

All templates receive these variables (automatically prepared):

### Common Variables (All Templates)
- `customer_name` - Customer's name
- `event_date` - "Freitag, 18. Februar 2026" (German format)
- `event_time` - "19:00"
- `guest_count` - 4
- `booking_id` - Short ID like "a1b2c3d4"

### Template-Specific Variables

**booking-confirmed:**
- `estimated_total` - "150.00"
- `requires_deposit` - true/false
- `deposit_amount` - "45.00" (30% of total)
- `booking_edit_url` - URL to edit booking
- `special_requests` - Customer's requests
- `allergy_details` - Allergy information

**booking-cancelled:**
- `cancellation_reason` - Why cancelled

**booking-completed:**
- `feedback_url` - Feedback form link
- `rebooking_url` - New booking link

**booking-reminder:**
- `estimated_total` - Total cost
- `requires_deposit` - true/false
- `deposit_amount` - Deposit amount
- `special_requests` - Requests
- `allergy_details` - Allergies

**booking-no-show:**
- No additional variables

**booking-declined:**
- `decline_reason` - Why declined

---

## Switching Between Modes

### To Enable Dashboard Templates:

```env
USE_ZEPTOMAIL_TEMPLATES=true
```

### To Use HTML Templates (Current):

```env
USE_ZEPTOMAIL_TEMPLATES=false
# or just remove this line
```

**Restart your dev server** after changing `.env`!

---

## Testing

### Test HTML Mode (Current)

```typescript
import { sendBookingConfirmation } from '@/lib/actions/email';

await sendBookingConfirmation({
  bookingId: "test-id",
  recipientEmail: "your@email.com",
  bookingData: booking,
  estimatedTotal: 6000, // Test deposit threshold
  bookingEditUrl: "https://oliv-restaurant.ch/edit/test",
});
```

### Test Template Mode (After Setup)

1. Create templates in ZeptoMail dashboard
2. Set `USE_ZEPTOMAIL_TEMPLATES=true`
3. Restart dev server
4. Run same test code above
5. Check ZeptoMail dashboard to see template used

---

## What You Can Do Now

### With Dashboard Templates Enabled:

1. **Edit email content** in ZeptoMail dashboard
2. **Change colors/styles** visually
3. **Add new variables** (update code to send them)
4. **A/B test** different email versions
5. **Let marketing team** manage emails
6. **Instant updates** - no deployment!

### Without Touching Code:

- Change email wording
- Update phone numbers/addresses
- Modify colors/styles
- Add/remove sections
- Test different subject lines

---

## Next Steps

### Immediate (To Use Dashboard Templates):

1. ✅ Read `ZEPTOMAIL_TEMPLATES_SETUP.md`
2. ✅ Create templates in ZeptoMail dashboard
3. ✅ Add environment variables to `.env`
4. ✅ Test with a real booking
5. ✅ Verify emails use dashboard templates

### Optional Enhancements:

1. **Add more variables** - Edit `template-mapper.ts` to send additional data
2. **Custom templates per customer** - Create multiple template variants
3. **A/B testing** - Test different email versions
4. **Email analytics** - Track open rates in ZeptoMail dashboard
5. **Multi-language** - Create English/German template variants

---

## Benefits Summary

| Feature | HTML Mode | Template Mode |
|---------|-----------|---------------|
| Edit emails | Deploy code | Dashboard click ✨ |
| Marketing team | Need dev | Self-service ✨ |
| A/B testing | Hard | Built-in ✨ |
| Version control | Git | ZeptoMail ✨ |
| Deployment needed | Yes | No ✨ |
| HTML control | Full | Via dashboard |
| Learning curve | Low | Low |

---

## Troubleshooting

### Templates Not Working?

1. Check `USE_ZEPTOMAIL_TEMPLATES=true`
2. Restart dev server after changing `.env`
3. Verify template names match exactly
4. Check ZeptoMail dashboard for template errors
5. Check browser console for errors

### Variables Not Showing?

1. Check variable names match template
2. Check `template-mapper.ts` is preparing the data
3. Use ZeptoMail's test send feature
4. Check conditional logic (`{{#if}}...{{/if}}`)

### Want to Go Back to HTML Mode?

Just set `USE_ZEPTOMAIL_TEMPLATES=false` and restart. No other changes needed!

---

## Support Docs

- **Setup Guide:** `ZEPTOMAIL_TEMPLATES_SETUP.md`
- **Email README:** `lib/email/README.md`
- **Template Mapper:** `lib/email/template-mapper.ts`
- **ZeptoMail Docs:** https://zeptomail.zoho.com/docs

---

## Summary

You now have **flexible email template management**! 🎉

- ✅ Code supports both modes
- ✅ Toggle between modes instantly
- ✅ No breaking changes
- ✅ Backward compatible
- ✅ Future-proof

**Start using dashboard templates** to edit emails without deployment!

---

Want help creating the templates in ZeptoMail or testing the integration? Just let me know!
