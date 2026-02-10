# Work on OLIV Restaurant & Bar - Booking System

*Date: 2025-02-10*
*Project: Restaurant booking system with Next.js 16, PostgreSQL (NeonDB), Drizzle ORM*

---

## Overview

This session focused on fixing bugs, updating UI components, and ensuring the booking system works correctly. The main issues were related to database queries, UI consistency, and proper data flow from the user-facing wizard to the admin panel.

---

## Key Files Modified

### Database & Backend Actions

| File | Changes |
|------|----------|
| `lib/actions/stats.ts` | Fixed SQL queries for dashboard stats - changed column names (`totalAmount` → `estimatedTotal`), added proper joins with `leads` table, fixed GROUP BY issues |
| `lib/actions/fetch-bookings.ts` | Fixed `.orderBy()` not supported by neon-http, switched to raw SQL queries, added booking items fetching with menu details |
| `lib/actions/wizard.ts` | Updated to create actual `booking_items` records when wizard submits, added menu item fetching from database |
| `app/api/bookings/update-status/route.ts` | Created new API endpoint for updating booking status |

### Frontend Components

| File | Changes |
|------|----------|
| `components/admin/BookingsPage.tsx` | Added status dropdown with auto-save, fixed state updates with useEffect, removed default text values, added `Send` icon import |
| `components/admin/ReportsPage.tsx` | Fixed reduce() calls on empty arrays with safe defaults |
| `components/admin/UserManagementPage.tsx` | Updated role options to match database schema (`super_admin`, `admin`, `moderator`, `read_only`) |
| `components/user/CustomMenuWizardVariant1.tsx` | Added server action import, implemented actual form submission with loading states |
| `components/admin/MenuConfigPageV3Complete.tsx` | Fixed extra closing `</div>` tag |

---

## Bug Fixes

### 1. Dashboard Stats Error
**Error:** `function sum() does not exist` / `column "bookings.estimated_total" must appear in the GROUP BY clause`

**Solution:** Changed to use raw SQL with `db.execute()` and proper column references:
- `totalAmount` → `estimatedTotal`
- Added proper JOINs with `leads` table
- Fixed GROUP BY clauses

### 2. Bookings Fetch Error
**Error:** `orderBy is not a function` with neon-http driver

**Solution:** Switched to raw SQL queries with proper ORDER BY:
```sql
SELECT ... FROM bookings b LEFT JOIN leads l ON b.lead_id = l.id ORDER BY b.created_at DESC
```

### 3. Wizard Submission Error
**Error:** `invalid input syntax for type time: ""`

**Solution:** Added default time fallback:
```typescript
const eventTime = data.eventTime || '18:00:00';
```

### 4. Booking Status Not Showing
**Issue:** Status dropdown state not updating when modal opened

**Solution:** Added useEffect to sync localStatus when booking changes:
```typescript
useEffect(() => {
  if (booking?.status) {
    setLocalStatus(booking.status);
  }
}, [booking?.status]);
```

### 5. Menu Items Not Showing
**Issue:** Menu items table not appearing in booking details

**Solution:** Updated `fetch-bookings.ts` to:
- Fetch booking_items with JOINs to menu_items and menu_categories
- Group items by booking_id
- Return proper data format for UI

---

## Database Schema Mapping

### Status Values
| Old/Incorrect | Correct |
|---------------|---------|
| `new` | `pending` |
| `touchbase` | `pending` |
| `confirmed` | `confirmed` |
| `declined` | `declined` |
| `completed` | `completed` |

### User Roles
| Display Name | Database Value |
|--------------|----------------|
| Super Admin | `super_admin` |
| Admin | `admin` |
| Moderator | `moderator` |
| Read Only | `read_only` |

---

## Data Flow: Wizard → Admin Panel

```
User submits wizard form
    ↓
submitWizardForm() creates:
  1. Lead entry (customer info)
  2. Booking entry (event details)
  3. Booking Items entries (menu selections)
    ↓
Admin views /admin/bookings
    ↓
fetchBookings() queries:
  - Bookings with lead info
  - Booking items with menu details
    ↓
Booking Detail Modal shows:
  - Customer Information
  - Event Details (with editable status)
  - Additional Information
  - Menu Items table
  - Comments section
```

---

## Important Code Patterns

### Using neon-http with Drizzle ORM
Since `neon-http` driver doesn't support some Drizzle methods:

```typescript
// ❌ Doesn't work with neon-http
await db.select().from(bookings).orderBy(desc(bookings.createdAt));

// ✅ Use raw SQL instead
await db.execute(sql`SELECT ... FROM bookings ORDER BY created_at DESC`);
```

### Response Format Handling
```typescript
const result = await db.execute(sql`...`);
const rows = 'rows' in result ? result.rows : result;
```

---

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/bookings` | GET | Fetch all bookings |
| `/api/bookings/update-status` | POST | Update booking status |
| `/api/menu` | GET | Fetch menu data |
| `/api/reports` | GET | Fetch reports data (topCustomers, trendingItems, monthlyReport) |

---

## Recent Updates (2025-02-10 - Session 2)

### Trending Items - Real Data Implementation
**File:** `lib/actions/stats.ts`
- Added `getTrendingItems()` function that fetches actual menu item sales data
- Groups by menu item, counts total quantity sold and booking count
- Joins with `menu_categories` to get category names
- Orders by total quantity sold (descending)

**File:** `components/admin/TrendingItems.tsx`
- Replaced static mock data with real API data
- Added loading state
- Fixed height with scrollable content (maxHeight: 400px)
- Shows sales count and booking count per item
- Category filter dropdown functionality

### Top Customers Report
**File:** `lib/actions/stats.ts`
- `getTopCustomersByRevenue()` correctly groups by customer name
- Calculates average revenue per booking (avgRevenue)
- Shows total bookings and total persons
- Single SQL query with JOIN for optimal performance

**File:** `components/admin/ReportsPage.tsx`
- Added fixed height with scrollable content for Top Customers section (maxHeight: 400px)

### Build Configuration
**File:** `tsconfig.json`
- Excluded `adminUI` and `userUI` folders from Next.js build to avoid TypeScript conflicts

---

## Known Issues & Workarounds

### Wizard Menu Items Mismatch
- **Issue:** Wizard shows mock menu items (Salmon Crostini, Caprese Skewers) but database has Swiss items (Rösti, Cheese Fondue)
- **Workaround:** Wizard maps selected mock items to database menu items by index
- **Future:** Should update wizard to fetch and display actual database menu items

---

## File Structure Reference

```
lib/
├── actions/
│   ├── bookings.ts        # Booking CRUD operations
│   ├── fetch-bookings.ts   # Fetch bookings with menu items
│   ├── menu.ts             # Menu management
│   ├── stats.ts            # Dashboard & reports stats
│   ├── users.ts            # User management
│   └── wizard.ts           # Wizard form submission
├── auth/
│   └── index.ts            # Better Auth configuration
├── db/
│   ├── schema.ts           # Database schema definitions
│   └── index.ts            # Database connection (neon-http)
└── ...
```

---

## Testing Checklist

- [ ] Dashboard loads without errors
- [ ] Bookings page displays with menu items
- [ ] Status dropdown works and saves
- [ ] Wizard form submits successfully
- [ ] New bookings appear in admin panel
- [ ] Menu items table shows in booking details
- [ ] Reports page loads correctly
- [ ] User management roles display correctly

---

## Next Steps / Future Improvements

1. **Menu Synchronization:** Update wizard to use actual database menu items instead of mock data
2. **Email Notifications:** Add email sending for booking confirmations
3. **Leads Management Page:** Create dedicated page for managing leads
4. **Export Functionality:** Implement booking export to CSV/PDF
5. **Contact History:** Save comments to database instead of just local state

---

## Environment Variables Required

```env
DATABASE_URL=               # PostgreSQL connection string (NeonDB)
AUTH_SECRET=               # Better Auth secret
BETTER_AUTH_URL=          # Better Auth URL
```

---

## Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Seed database
npm run db:seed

# Verify database
npm run db:verify

# Run migrations
npm run db:push
```
