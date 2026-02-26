# i18n (Internationalization) Setup Guide

## Overview

The Oliv booking system now supports multiple languages using `next-intl`. Currently, **English (en)** is the default and fully implemented language.

---

## Structure

```
project-root/
├── i18n.ts                      # i18n configuration
├── next.config.ts               # Next.js config with next-intl plugin
├── messages/                    # Translation files
│   ├── en.json                 # English translations (default)
│   └── de.json                 # German translations (for future use)
└── lib/
    └── i18n/
        ├── client.ts           # Client-side translation hooks
        └── server.ts           # Server-side translation utilities
```

---

## Translation Namespaces

Translations are organized by namespace to keep them organized:

| Namespace | Purpose | Example Keys |
|-----------|---------|--------------|
| `common` | Common UI terms | `save`, `cancel`, `delete`, `loading` |
| `nav` | Navigation items | `dashboard`, `bookings`, `menu`, `reports` |
| `auth` | Authentication | `signIn`, `signOut`, `email`, `password` |
| `booking` | Booking related | `customerName`, `eventDate`, `guests` |
| `bookingStatus` | Booking statuses | `new`, `confirmed`, `cancelled`, `completed` |
| `dashboard` | Dashboard labels | `totalBookings`, `totalRevenue` |
| `reports` | Reports | `monthlyReport`, `selectYear` |
| `menu` | Menu items | `addItem`, `categories`, `dietary` |
| `user` | User management | `userName`, `userRole`, `roles` |
| `settings` | Settings | `general`, `notifications`, `saveChanges` |
| `validation` | Form validation | `required`, `invalidEmail`, `minLength` |
| `email` | Email types | `bookingConfirmed`, `bookingCancelled` |
| `occasion` | Event types | `wedding`, `birthday`, `corporate` |
| `button` | Button labels | `submit`, `cancel`, `delete` |
| `message` | System messages | `noDataFound`, `loadingData`, `errorOccurred` |
| `time` | Time expressions | `today`, `yesterday`, `minutesAgo` |

---

## Usage

### Client-Side (React Components)

```typescript
'use client';

import { useTranslation } from '@/lib/i18n/client';

export function MyComponent() {
  const t = useTranslation('booking');

  return (
    <div>
      <h1>{t('title')}</h1> {/* "Bookings" */}
      <label>{t('customerName')}</label> {/* "Customer Name" */}
      <button>{t('newBooking')}</button> {/* "New Booking" */}
    </div>
  );
}
```

#### Pre-configured Hooks (Recommended)

```typescript
'use client';

import {
  useCommonTranslation,
  useNavTranslation,
  useBookingTranslation,
  useAuthTranslation,
  useValidationTranslation,
  useButtonTranslation,
  useMessageTranslation
} from '@/lib/i18n/client';

export function MyComponent() {
  const t = useBookingTranslation();
  const commonT = useCommonTranslation();
  const buttonT = useButtonTranslation();

  return (
    <div>
      <h1>{t('title')}</h1>
      <button>{buttonT('submit')}</button>
      <button>{buttonT('cancel')}</button>
    </div>
  );
}
```

### Server-Side (Server Components & API Routes)

```typescript
import { getTranslation } from '@/lib/i18n/server';

export default async function Page() {
  const t = await getTranslation('booking');

  return (
    <div>
      <h1>{t('title')}</h1> {/* "Bookings" */}
      <p>{t('newBooking')}</p> {/* "New Booking" */}
    </div>
  );
}
```

#### Pre-configured Server Functions

```typescript
import {
  getCommonTranslation,
  getBookingTranslation,
  getNavTranslation
} from '@/lib/i18n/server';

export default async function Page() {
  const t = await getBookingTranslation();
  const navT = await getNavTranslation();

  return (
    <div>
      <h1>{navT('dashboard')}</h1>
      <h2>{t('title')}</h2>
    </div>
  );
}
```

### With Parameters (Dynamic Values)

```typescript
const t = useValidationTranslation();

// In en.json: "minLength": "Must be at least {min} characters"
<p>{t('minLength', { min: 5 })}</p>
// Output: "Must be at least 5 characters"

// In en.json: "daysAgo": "{days} days ago"
<p>{t('daysAgo', { days: 3 })}</p>
// Output: "3 days ago"
```

---

## Adding New Translations

### 1. Add to English Translation File

Edit `messages/en.json`:

```json
{
  "myNamespace": {
    "myKey": "My English Text",
    "anotherKey": "Another Text"
  }
}
```

### 2. Add to German Translation File (Optional)

Edit `messages/de.json`:

```json
{
  "myNamespace": {
    "myKey": "Mein deutscher Text",
    "anotherKey": "Ein weiterer Text"
  }
}
```

### 3. Use in Your Component

```typescript
import { useTranslation } from '@/lib/i18n/client';

const t = useTranslation('myNamespace');
console.log(t('myKey')); // "My English Text"
```

---

## Migration Plan: Hardcoded Text → Translations

### Step 1: Identify Hardcoded Text

Find all hardcoded English text in your components:
```tsx
<h1>Bookings</h1>
<button>Save</button>
<label>Customer Name</label>
```

### Step 2: Add to Translation File (if not exists)

Check `messages/en.json` and add if missing:
```json
{
  "booking": {
    "title": "Bookings"
  },
  "common": {
    "save": "Save"
  },
  "booking": {
    "customerName": "Customer Name"
  }
}
```

### Step 3: Replace with Translation Hook

Before:
```tsx
'use client';

export function Header() {
  return <h1>Bookings</h1>;
}
```

After:
```tsx
'use client';

import { useBookingTranslation } from '@/lib/i18n/client';

export function Header() {
  const t = useBookingTranslation();
  return <h1>{t('title')}</h1>;
}
```

---

## Best Practices

### ✅ DO

- **Organize by namespace** - Group related translations together
- **Use descriptive keys** - `customerEmail` instead of `email2`
- **Keep keys consistent** - Use camelCase throughout
- **Add to both en.json and de.json** - Even if German isn't used yet
- **Use pre-configured hooks** - For common namespaces like 'common', 'nav', etc.
- **Extract all UI text** - No hardcoded strings in components

### ❌ DON'T

- **Don't hardcode text** - Always use translation keys
- **Don't use one-level keys** - Use namespaces: `booking.title` not `bookingTitle`
- **Don't forget params** - Include `{param}` placeholders in translations
- **Don't mix languages** - Keep all text in translation files
- **Don't duplicate keys** - Reuse existing translation keys when possible

---

## Examples

### Simple Button

```tsx
import { useButtonTranslation } from '@/lib/i18n/client';

export function SubmitButton() {
  const t = useButtonTranslation();
  return <button>{t('submit')}</button>; // "Submit"
}
```

### Status Badge

```tsx
import { useTranslation } from '@/lib/i18n/client';

export function StatusBadge({ status }: { status: string }) {
  const t = useTranslation('bookingStatus');
  return <span>{t(status)}</span>;
  // status="confirmed" → "Confirmed"
  // status="cancelled" → "Cancelled"
}
```

### Form Validation

```tsx
import { useValidationTranslation } from '@/lib/i18n/client';

export function ErrorMessage({ error }: { error: string }) {
  const t = useValidationTranslation();
  return <p className="error">{t(error)}</p>;
}

// Usage:
// <ErrorMessage error="required" /> → "This field is required"
// <ErrorMessage error="invalidEmail" /> → "Invalid email address"
```

### Navigation

```tsx
import { useNavTranslation } from '@/lib/i18n/client';

export function NavBar() {
  const t = useNavTranslation();

  return (
    <nav>
      <a href="/dashboard">{t('dashboard')}</a> {/* "Dashboard" */}
      <a href="/bookings">{t('bookings')}</a> {/* "Bookings" */}
      <a href="/menu">{t('menu')}</a> {/* "Menu" */}
      <a href="/reports">{t('reports')}</a> {/* "Reports" */}
    </nav>
  );
}
```

---

## Adding a New Language (Future)

### Step 1: Create Translation File

```bash
# Create translation file for new language
touch messages/fr.json  # French
```

### Step 2: Add Translations

```json
{
  "common": {
    "save": "Enregistrer",
    "cancel": "Annuler"
  },
  "booking": {
    "title": "Réservations"
  }
}
```

### Step 3: Update i18n Configuration

Modify `i18n.ts` to detect locale from user preferences:

```typescript
export default getRequestConfig(async ({ requestLocale }) => {
  // Read locale from cookies, headers, or user preference
  let locale = await requestLocale;

  // Fallback to default locale
  if (!locale) locale = 'en';

  // Validate locale
  if (!['en', 'de', 'fr'].includes(locale)) {
    locale = 'en';
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});
```

---

## Current Status

✅ **Implemented:**
- i18n structure with next-intl
- English (en) translations - 100% complete
- German (de) translations - Ready for future use
- Client-side translation hooks
- Server-side translation utilities
- Comprehensive translation coverage

⏳ **To Do:**
- Replace all hardcoded text with translation keys in components
- Add language switcher UI (when multiple languages are ready)
- Add more languages as needed (French, Italian, etc.)

---

## Quick Reference

| File | Purpose |
|------|---------|
| `i18n.ts` | Main i18n configuration |
| `messages/en.json` | English translations (default) |
| `messages/de.json` | German translations |
| `lib/i18n/client.ts` | Client-side hooks (`useTranslation`) |
| `lib/i18n/server.ts` | Server-side utilities (`getTranslation`) |
| `next.config.ts` | Next.js config with next-intl plugin |

---

## Testing Translations

To test if translations work:

```typescript
'use client';

import { useTranslation } from '@/lib/i18n/client';

export function TestComponent() {
  const t = useTranslation('common');

  return (
    <div>
      <p>{t('loading')}</p> {/* Should show: "Loading..." */}
      <p>{t('save')}</p> {/* Should show: "Save" */}
      <p>{t('cancel')}</p> {/* Should show: "Cancel" */}
    </div>
  );
}
```

---

## Summary

✅ **i18n structure is complete**
✅ **English translations are comprehensive**
✅ **Ready to use in all components**
✅ **Extensible for future languages**

**Next step:** Start replacing hardcoded text in components with translation keys!
