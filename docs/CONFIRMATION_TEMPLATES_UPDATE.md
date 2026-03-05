# ✅ Updated: Confirmation Email Templates

## Important Change

As requested, the **confirmation email now has TWO separate templates** that are selected based on the booking amount:

### Template 1: `booking-confirmed-deposit`
- **Used when:** Estimated total ≥ 5000 CHF
- **Shows:** Deposit request (30% of total)
- **Content:** Bank details, payment instructions, booking ID for reference

### Template 2: `booking-confirmed-no-deposit`
- **Used when:** Estimated total < 5000 CHF
- **Shows:** Menu customization link
- **Content:** Link to edit menu up to 48 hours before event

---

## How It Works

The system automatically chooses the correct template:

```typescript
// In template-mapper.ts
const DEPOSIT_THRESHOLD = 5000;

if (estimatedTotal >= DEPOSIT_THRESHOLD) {
  // Use: booking-confirmed-deposit
  // Sends: deposit_amount, deposit_percentage, booking_id
} else {
  // Use: booking-confirmed-no-deposit
  // Sends: booking_edit_url, estimated_total
}
```

---

## Environment Variables

Update your `.env`:

```env
# Confirmation templates (TWO templates)
ZEPTOMAIL_TEMPLATE_CONFIRMED_DEPOSIT=booking-confirmed-deposit
ZEPTOMAIL_TEMPLATE_CONFIRMED_NO_DEPOSIT=booking-confirmed-no-deposit
```

---

## Template Variables

### `booking-confirmed-deposit` receives:
- `customer_name`
- `event_date`
- `event_time`
- `guest_count`
- `estimated_total`
- `deposit_amount` (30% of total)
- `deposit_percentage` ("30")
- `booking_id` (short ID for payment reference)
- `special_requests`
- `allergy_details`

### `booking-confirmed-no-deposit` receives:
- `customer_name`
- `event_date`
- `event_time`
- `guest_count`
- `estimated_total`
- `booking_edit_url` (link to edit menu)
- `special_requests`
- `allergy_details`

---

## Testing

Test both templates:

```typescript
// Test deposit template (≥ 5000 CHF)
await sendBookingConfirmation({
  bookingId: "test-1",
  recipientEmail: "your@email.com",
  bookingData: booking,
  estimatedTotal: 6000, // Triggers deposit template
});

// Test no-deposit template (< 5000 CHF)
await sendBookingConfirmation({
  bookingId: "test-2",
  recipientEmail: "your@email.com",
  bookingData: booking,
  estimatedTotal: 4000, // Triggers no-deposit template
  bookingEditUrl: "https://oliv-restaurant.ch/edit/abc",
});
```

---

## Files Updated

- ✅ `lib/email/template-mapper.ts` - Two separate data preparation functions
- ✅ `lib/actions/email.ts` - Passes estimatedTotal to template selector
- ✅ `ZEPTOMAIL_TEMPLATES_SETUP.md` - Two separate template definitions
- ✅ `QUICK_REFERENCE.md` - Updated environment variables
- ✅ `MIGRATION_COMPLETE.md` - Updated documentation

---

## Summary

✅ **7 total templates** to create in ZeptoMail dashboard (not 6)
✅ **Automatic template selection** based on booking amount
✅ **Different variables** for each template (relevant content only)
✅ **No conditional logic in templates** - cleaner separation

---

This matches exactly what you discussed during template creation!
