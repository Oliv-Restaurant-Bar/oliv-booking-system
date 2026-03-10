# Client Feedback Task List

**Date:** 2026-03-10
**Source:** Client recording transcript
**Total Tasks:** 22 (4 high priority, 8 medium, 7 low, 2 menu, 1 question)

---

## 🔴 HIGH PRIORITY (Before Client Presentation)

These tasks must be completed before presenting to the client.

| # | Task | Description | File Location |
|---|------|-------------|---------------|
| #21 | Add all client menu categories for demo presentation | Add all menu categories that the client has shared so proper configuration and demo can be given | Database seed data or admin menu management |
| #4 | Fix average revenue calculation | Average revenue should NOT include revenue from declined and no-show bookings. Verify calculation accuracy. | lib/actions/analytics.ts or dashboard calculations |
| #7 | Fix PDF Kitchen Sheet formatting and visibility | - Make "internal use only" text visible<br>- Include client logo<br>- Improve alignment<br>- Highlight if no allergies/dietary specified<br>- Show separate sections for staff/customer notes<br>- Only show titles if there's a value<br>- Fix checkbox alignment<br>- Test with multiple items | components/admin/KitchenSheetPDF.tsx or lib/pdf/kitchen-sheet.ts |
| #15 | Add "received" timestamp with relative time display | Show when booking was received with relative time format:<br>- Less than 1 hour: "50 minutes ago"<br>- Less than 24 hours: "2 hours ago"<br>- More than 1 day: "2 days ago" | components/admin/booking-list.tsx or similar |

---

## 🟠 MEDIUM PRIORITY (UX Issues)

Important UX improvements that affect user experience.

| # | Task | Description | File Location |
|---|------|-------------|---------------|
| #17 | Remove profile picture section or make functional | Currently upload works but nothing happens - no save button. Either remove completely (admin users won't have pictures) OR make it dynamic with auto-save. Could be sticky footer. | components/admin/Sidebar.tsx or admin layout |
| #13 | Add filter indicator and clear filter button | When filters are applied, show a visual indicator (icon). Add "Clear Filter" button that removes all filters. Current "refresh" is not reset. | components/admin/booking-list.tsx or filter component |
| #2 | Implement limit for upcoming bookings (max 10) | Dashboard should show maximum 10 upcoming bookings, not all 100+. Verify current logic and implement limit. | components/admin/Dashboard.tsx or lib/actions/bookings.ts |
| #19 | Confirm and fix search scope to include description | Verify/document what fields are searched. Description field is currently not being searched but should be included. | lib/actions/bookings.ts or booking list component |
| #14 | Add "+2 more" and "show more" indicator | When description is truncated, show "+2" or "show more" text so users know they can click to expand. | components/admin/booking-list.tsx or booking card |
| #12 | Move Save Changes button near form fields | "Save Changes" button should be near the form fields for intuitive UX, not far away. | components/admin/BookingEdit.tsx or booking form |
| #8 | Make OLIV logo clickable to redirect to dashboard | When clicking OLIV logo in admin panel, should redirect to dashboard. | components/admin/Header.tsx or admin layout |
| #5 | Adjust highcharts height to fit available space | Charts showing full year data but height needs adjustment to fit viewport properly. | components/admin/Dashboard.tsx or chart components |

---

## 🟡 LOW PRIORITY (Polish & Bug Fixes)

Polish items and minor bug fixes.

| # | Task | Description | File Location |
|---|------|-------------|---------------|
| #11 | Fix date formatting to Swiss standard | Date display (like "27") should show proper full date format as per Swiss standard (DD.MM.YYYY). | All booking list/admin components showing dates |
| #18 | Verify bookings list sorting (latest first) | Ensure bookings list is properly sorted with latest/most recent bookings first. Needs thorough testing. | lib/actions/bookings.ts or booking list component |
| #10 | Fix Pending status typography consistency | "Pending" shows as "P" (capital) in some places. Use consistent component for consistency and easier translation. | All booking status display components |
| #6 | Fix address field validation and repopulation bug | Pin code field not repopulated properly when editing. Shows "pin code must be at least four characters" error. | components/admin/BookingEdit.tsx or address form |
| #1 | Fix skeleton loader for trending items | Skeleton loader showing pie chart type but should show trending items layout. Regenerate correct skeleton. | components/admin/Dashboard.tsx or trending items |
| #20 | Fix booking #92 incorrect item count display | Booking 92 shows incorrect number of items (5 items issue). Debug and fix item count logic. | lib/actions/bookings.ts or booking detail |
| #3 | Make staff notes read-only or improve labeling | If edit option not available, show as read-only instead of form fields. Label should be "Additional Information from User" for staff, not "for kitchen". | components/admin/BookingDetail.tsx or booking edit |

---

## 🔵 MENU MANAGEMENT

Menu-related improvements.

| # | Task | Description | File Location |
|---|------|-------------|---------------|
| #9 | Simplify menu item pricing mode UI | Remove "pricing mode" field. Instead directly ask "Single variant" or "Multiple variant". When single selected - show price field. When multiple selected - auto-show variants section. | components/admin/MenuItemForm.tsx |
| #16 | Reorder menu item form fields | Reorder form fields for better UX:<br>1. Item name (top)<br>2. Description<br>3. Item image<br>4. Pricing type (single/multiple)<br>5. Price (if single) OR Variants (if multiple)<br>6. Combo item checkbox (bottom) | components/admin/MenuItemForm.tsx |

---

## ❓ CLIENT QUESTION

Questions that need to be discussed with the client.

| # | Task | Description |
|---|------|-------------|
| #22 | When should edit be locked by booking status? | QUESTION FOR CLIENT: At what booking status should the edit option be disabled?<br>- When marked as "completed"?<br>- Other statuses?<br><br>This needs to be discussed with the client before implementing. |

---

## 📊 Summary Statistics

- **Total Tasks:** 22
- **High Priority:** 4
- **Medium Priority:** 8
- **Low Priority:** 7
- **Menu Management:** 2
- **Client Questions:** 1

---

## 📝 Notes

### Additional Feedback Context
- Client emphasized importance of thorough testing before presentation
- Need proper Swiss-based test data for demo (realistic Swiss names)
- Translation consistency is important
- UX should be intuitive (buttons near relevant actions)
- Visual feedback for applied filters is critical

### Testing Requirements
- All features must be tested with proper data before client presentation
- Pay special attention to:
  - Filter functionality and indicators
  - Date/timestamp displays
  - Form validation and repopulation
  - PDF generation and formatting
  - Revenue calculations accuracy

---

**Last Updated:** 2026-03-10
