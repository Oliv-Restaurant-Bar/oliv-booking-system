# ✅ FIXED: Zero Conditionals in ZeptoMail Templates

## Problem

ZeptoMail **does NOT support** `{{#if}}`, `{{else}}`, or any conditional statements. The previous templates had these conditionals and would cause errors.

## Solution

**ALL conditionals moved to backend code.** Templates now have ONLY simple variable substitution like `{{customer_name}}`.

---

## What Changed

### Templates (ZEPTOMAIL_TEMPLATES_CLEAN.md)
✅ **ZERO** `{{#if}}` statements
✅ **ZERO** `{{else}}` statements
✅ **ZERO** conditional logic
✅ **ONLY** simple variables: `{{variable_name}}`

### Backend (template-mapper.ts)
✅ **Always** sends ALL variables (never undefined)
✅ **Uses** default values like "Keine" (None) for empty fields
✅ **Handles** all logic (deposit vs no-deposit, optional fields, etc.)
✅ **Decides** which template to use

---

## 7 Clean Templates

1. **`booking-confirmed-deposit`** - For ≥5000 CHF
2. **`booking-confirmed-no-deposit`** - For <5000 CHF
3. **`booking-cancelled`**
4. **`booking-completed`**
5. **`booking-reminder`**
6. **`booking-no-show`**
7. **`booking-declined`**

**Every template is now "dumb HTML"** - just variable substitution. No logic.

---

## How Backend Handles Conditionals

### Example: Special Requests

**OLD (template with conditional):**
```html
{{#if special_requests}}
<p><strong>Bemerkungen:</strong><br/>{{special_requests}}</p>
{{/if}}
```

**NEW (template):**
```html
<p><strong>Bemerkungen:</strong><br/>{{special_requests}}</p>
```

**Backend (template-mapper.ts):**
```typescript
special_requests: booking.specialRequests || "Keine"
```

If no special requests, backend sends `"Keine"` instead of empty/undefined.

---

## Environment Variables

```env
USE_ZEPTOMAIL_TEMPLATES=true

# Confirmation (TWO templates)
ZEPTOMAIL_TEMPLATE_CONFIRMED_DEPOSIT=booking-confirmed-deposit
ZEPTOMAIL_TEMPLATE_CONFIRMED_NO_DEPOSIT=booking-confirmed-no-deposit

# Other templates
ZEPTOMAIL_TEMPLATE_CANCELLED=booking-cancelled
ZEPTOMAIL_TEMPLATE_COMPLETED=booking-completed
ZEPTOMAIL_TEMPLATE_REMINDER=booking-reminder
ZEPTOMAIL_TEMPLATE_NO_SHOW=booking-no-show
ZEPTOMAIL_TEMPLATE_DECLINED=booking-declined
```

---

## Files to Use

### ✅ USE THIS:
**`ZEPTOMAIL_TEMPLATES_CLEAN.md`** - Clean templates with ZERO conditionals

### ❌ DON'T USE:
**`ZEPTOMAIL_TEMPLATES_SETUP.md`** - Old version with conditionals (has errors)

---

## Quick Copy-Paste Summary

All templates are in **`ZEPTOMAIL_TEMPLATES_CLEAN.md`**

Copy each template directly into ZeptoMail dashboard. They will work perfectly because:

1. ✅ No `{{#if}}` statements
2. ✅ No `{{else}}` statements
3. ✅ Only `{{variable_name}}` substitution
4. ✅ All variables always sent (defaults to "Keine" if empty)
5. ✅ All conditional logic in backend code

---

## Testing

Once you create templates in ZeptoMail:

```typescript
// Test deposit template
await sendBookingConfirmation({
  bookingId: "test",
  recipientEmail: "your@email.com",
  bookingData: booking,
  estimatedTotal: 6000, // Uses deposit template
});

// Test no-deposit template
await sendBookingConfirmation({
  bookingId: "test",
  recipientEmail: "your@email.com",
  bookingData: booking,
  estimatedTotal: 4000, // Uses no-deposit template
  bookingEditUrl: "https://oliv-restaurant.ch/edit/test",
});
```

---

## Summary

✅ **Problem:** ZeptoMail doesn't support `{{#if}}` conditionals
✅ **Solution:** All conditionals in backend code
✅ **Templates:** Only simple variable substitution
✅ **Result:** Clean, working templates!

Use **`ZEPTOMAIL_TEMPLATES_CLEAN.md`** for your setup.
