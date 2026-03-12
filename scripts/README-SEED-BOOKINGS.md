# Dummy Bookings Seeding Script

This script generates realistic dummy booking data using your current menu items.

## What It Does

The seed script creates:

### **1. Leads** (Contact Information)
- Random German names (Maria Müller, Hans Schmidt, etc.)
- Realistic email addresses
- Swiss phone numbers (+41)
- Addresses with Swiss cities (Zürich, Basel, Bern, etc.)
- Company names for corporate events

### **2. Bookings**
- Random dates 2-90 days in the future
- Random times (10:00 - 22:30)
- Guest counts between 10-150
- Different statuses: pending, confirmed, completed, cancelled
- Occasions: Firmenevent, Geburtstag, Hochzeit, etc.

### **3. Booking Items**
- Selects 2-8 random menu items per booking
- Respects item pricing types:
  - **Per-person items**: Price × quantity × guest count
  - **Flat fee items**: Price × quantity
  - **Consumption items**: Price per unit × quantity
- Calculates accurate totals

## How to Run

```bash
npm run db:seed-dummy-bookings
```

Or directly:

```bash
dotenv -e .env -- tsx scripts/seed-dummy-bookings.ts
```

## Generated Data Summary

After running, you'll have:

- **20 bookings** with full details
- **20 leads** with contact information
- **40-160 booking items** (2-8 items per booking)
- Realistic guest counts (10-150 people)
- Various event types and occasions

## Example Output

```
🌱 Starting to seed dummy bookings...

📊 Found 15 menu items in 4 categories

✅ Booking 1/20: Julia Wagner
   📅 2025-04-15 at 18:00
   👥 45 guests - 5 items
   💰 Total: CHF 2340.00
   📍 Zürich (confirmed)

✅ Booking 2/20: Thomas Klein
   📅 2025-05-02 at 12:30
   👥 80 guests - 6 items
   💰 Total: CHF 4560.00
   📍 Basel (pending)

...

🎉 Successfully seeded 20 dummy bookings!
```

## Notes

- All bookings have `termsAccepted: true`
- Some bookings (30%) require deposits
- Some have internal notes (VIP customers, etc.)
- All booking dates are in the future
- Prices are calculated based on your actual menu item prices

## Cleaning Up

To remove seeded data:

```sql
DELETE FROM booking_items;
DELETE FROM bookings;
DELETE FROM leads WHERE id IN (SELECT lead_id FROM bookings);
```

Or reset the entire database:

```bash
npm run db:reset-admin
```
