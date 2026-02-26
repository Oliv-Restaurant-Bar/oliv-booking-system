# i18n Migration Example - BookingsPage Component

This document shows how to migrate a component from hardcoded text to i18n translations.

---

## Before: Hardcoded Text

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, Search } from 'lucide-react';

export function BookingsPage() {
  return (
    <div className="min-h-full bg-background flex flex-col">
      <div className="px-4 md:px-0 pb-1">
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              className="w-full pl-10 pr-4 py-2.5"
            />
            <Button>
              Export
            </Button>
          </div>
        </div>

        <div className="text-center py-16">
          <p>No bookings found</p>
        </div>

        <div className="text-center pt-4 pb-1 mt-auto">
          <p>© 2026 Restaurant Oliv Restaurant & Bar</p>
        </div>
      </div>
    </div>
  );
}
```

**Problems:**
❌ Hardcoded English text
❌ Cannot translate to other languages
❌ Difficult to maintain consistent terminology
❌ Text scattered throughout components

---

## After: Using i18n Translations

```tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Download, Search } from 'lucide-react';
import { useBookingTranslation, useCommonTranslation, useButtonTranslation, useMessageTranslation } from '@/lib/i18n/client';

export function BookingsPage() {
  const t = useBookingTranslation();
  const commonT = useCommonTranslation();
  const buttonT = useButtonTranslation();
  const messageT = useMessageTranslation();

  return (
    <div className="min-h-full bg-background flex flex-col">
      <div className="px-4 md:px-0 pb-1">
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('customerName') + ', ' + t('customerEmail') + ', ' + t('customerPhone')}
              className="w-full pl-10 pr-4 py-2.5"
            />
            <Button icon={Download}>
              {commonT('export')}
            </Button>
          </div>
        </div>

        <div className="text-center py-16">
          <p className="text-muted-foreground">{messageT('noDataFound')}</p>
        </div>

        <div className="text-center pt-4 pb-1 mt-auto">
          <p className="text-muted-foreground">© 2026 Restaurant Oliv Restaurant & Bar</p>
        </div>
      </div>
    </div>
  );
}
```

**Benefits:**
✅ All text uses translation keys
✅ Easy to add translations for other languages
✅ Consistent terminology across app
✅ Centralized translation management

---

## Translation Keys Used

| Hardcoded Text | Translation Key | Namespace |
|----------------|-----------------|------------|
| "Search by name, email, or phone..." | `customerName`, `customerEmail`, `customerPhone` | `booking` |
| "Export" | `export` | `common` |
| "No bookings found" | `noDataFound` | `message` |

---

## Step-by-Step Migration

### Step 1: Identify Hardcoded Text

Go through your component and list all hardcoded text:

```tsx
// Found in BookingsPage.tsx:
- "Search by name, email, or phone..."
- "Export"
- "No bookings found"
- "© 2026 Restaurant Oliv Restaurant & Bar"
- "Loading..."
- "Error"
- "Status"
- "Actions"
```

### Step 2: Check if Translation Exists

Look in `messages/en.json`:

```json
{
  "booking": {
    "customerName": "Customer Name",
    "customerEmail": "Customer Email",
    "customerPhone": "Customer Phone"
  },
  "common": {
    "export": "Export",
    "loading": "Loading...",
    "error": "Error",
    "status": "Status",
    "actions": "Actions"
  },
  "message": {
    "noDataFound": "No data found"
  }
}
```

### Step 3: Add Missing Translations (if needed)

If a translation doesn't exist, add it to `messages/en.json`:

```json
{
  "booking": {
    "searchPlaceholder": "Search by {fields}..."
  }
}
```

### Step 4: Replace with Translation Hook

**Before:**
```tsx
<input placeholder="Search by name, email, or phone..." />
<button>Export</button>
```

**After:**
```tsx
const t = useBookingTranslation();
const commonT = useCommonTranslation();

<input placeholder={`${t('customerName')}, ${t('customerEmail')}, ${t('customerPhone')}`} />
<button>{commonT('export')}</button>
```

### Step 5: Test

Run your app and verify:
- Text displays correctly
- No missing translation keys
- All placeholders and labels work

---

## Common Patterns

### Pattern 1: Simple Text

```tsx
// Before
<h1>Bookings</h1>

// After
const t = useBookingTranslation();
<h1>{t('title')}</h1>
```

### Pattern 2: Button Labels

```tsx
// Before
<button>Save</button>
<button>Cancel</button>

// After
const buttonT = useButtonTranslation();
<button>{buttonT('save')}</button>
<button>{buttonT('cancel')}</button>
```

### Pattern 3: Placeholders

```tsx
// Before
<input placeholder="Search by name..." />

// After
const t = useBookingTranslation();
<input placeholder={t('searchPlaceholder', { fields: 'name' })} />
```

### Pattern 4: Status Labels

```tsx
// Before
<span>Confirmed</span>
<span>Cancelled</span>

// After
const t = useTranslation('bookingStatus');
<span>{t('confirmed')}</span>
<span>{t('cancelled')}</span>
```

### Pattern 5: Error Messages

```tsx
// Before
<p>This field is required</p>
<p>Invalid email address</p>

// After
const t = useValidationTranslation();
<p>{t('required')}</p>
<p>{t('invalidEmail')}</p>
```

### Pattern 6: Dynamic Values

```tsx
// Before
<p>3 days ago</p>

// After
const t = useTranslation('time');
<p>{t('daysAgo', { days: 3 })}</p>
```

---

## Quick Migration Checklist

For each component:

- [ ] Import translation hooks
- [ ] Find all hardcoded text
- [ ] Check if translation keys exist
- [ ] Add missing keys to `messages/en.json`
- [ ] Replace hardcoded text with translation keys
- [ ] Test component displays correctly
- [ ] Check console for missing translation warnings

---

## Example: Complete Component Migration

### Original (with hardcoded text)

```tsx
export function StatusBadge({ status }: { status: string }) {
  return (
    <span className="badge">
      {status === 'confirmed' && 'Confirmed'}
      {status === 'pending' && 'Pending'}
      {status === 'cancelled' && 'Cancelled'}
    </span>
  );
}
```

### Migrated (with translations)

```tsx
import { useTranslation } from '@/lib/i18n/client';

export function StatusBadge({ status }: { status: string }) {
  const t = useTranslation('bookingStatus');

  return (
    <span className="badge">
      {t(status)}
    </span>
  );
}
```

**Much cleaner!** ✨

---

## Benefits Summary

### Before Migration
❌ Hardcoded English text
❌ Duplicate translations across files
❌ Inconsistent terminology
❌ Cannot support multiple languages
❌ Difficult to update copy

### After Migration
✅ Centralized translations
✅ Consistent terminology
✅ Easy to add languages
✅ Professional structure
✅ Easy copy updates

---

## Next Steps

1. **Start with high-traffic components** - Dashboard, Bookings, Menu
2. **Use pre-configured hooks** - `useCommonTranslation()`, `useBookingTranslation()`, etc.
3. **Add missing keys as needed** - Check `messages/en.json` first
4. **Test thoroughly** - Ensure all text displays correctly
5. **Repeat for all components** - Gradually migrate entire app

---

**Your app is now ready for multi-language support!** 🌍
