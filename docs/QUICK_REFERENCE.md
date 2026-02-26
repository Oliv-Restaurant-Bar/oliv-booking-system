# ZeptoMail Templates - Quick Reference

## TL;DR

You can now edit email templates in ZeptoMail dashboard instead of code! 🎉

## Enable Dashboard Templates

```env
# Add to .env.local
USE_ZEPTOMAIL_TEMPLATES=true

# Confirmation has TWO templates (based on amount)
ZEPTOMAIL_TEMPLATE_CONFIRMED_DEPOSIT=booking-confirmed-deposit
ZEPTOMAIL_TEMPLATE_CONFIRMED_NO_DEPOSIT=booking-confirmed-no-deposit

ZEPTOMAIL_TEMPLATE_CANCELLED=booking-cancelled
ZEPTOMAIL_TEMPLATE_COMPLETED=booking-completed
ZEPTOMAIL_TEMPLATE_REMINDER=booking-reminder
ZEPTOMAIL_TEMPLATE_NO_SHOW=booking-no-show
ZEPTOMAIL_TEMPLATE_DECLINED=booking-declined
```

## Create Templates

1. Open `ZEPTOMAIL_TEMPLATES_SETUP.md`
2. Copy HTML for each template
3. Paste into ZeptoMail dashboard
4. Done!

## Switch Modes

```bash
# Dashboard templates (edit in ZeptoMail)
USE_ZEPTOMAIL_TEMPLATES=true

# HTML templates (current, in code)
USE_ZEPTOMAIL_TEMPLATES=false
```

Restart dev server after changing!

## Template Variables

All templates get:
- `customer_name` - Customer name
- `event_date` - "Freitag, 18. Februar 2026"
- `event_time` - "19:00"
- `guest_count` - Number of guests
- `booking_id` - Short ID

Plus template-specific variables (see `ZEPTOMAIL_TEMPLATES_SETUP.md`)

## Files

- `ZEPTOMAIL_TEMPLATES_SETUP.md` - Setup guide with all HTML
- `MIGRATION_COMPLETE.md` - Full documentation
- `lib/email/template-mapper.ts` - Variable preparation
- `lib/email/README.md` - System documentation

## Test

```typescript
import { sendBookingConfirmation } from '@/lib/actions/email';

await sendBookingConfirmation({
  bookingId: "test",
  recipientEmail: "your@email.com",
  bookingData: booking,
  estimatedTotal: 1500,
});
```

---

That's it! Full docs in `MIGRATION_COMPLETE.md`
