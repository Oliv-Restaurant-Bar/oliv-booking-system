# Booking Summary Edit Link Feature - Implementation Plan

**Status:** 🔴 Pending Approval
**Version:** 1.0
**Date:** February 20, 2026
**Author:** Claude Code + Team

---

## 📋 Executive Summary

This document outlines the implementation of a **secure client-facing booking edit system** with comprehensive **audit logging** and **admin-controlled lock functionality**.

### Current State
- ✅ Booking system is functional
- ✅ Emails are sent with edit links (`/booking/{id}/edit`)
- ❌ **Edit routes don't exist** (404 error when clients click links)
- ❌ **No audit trail** (can't track who changed what)
- ❌ **No lock mechanism** (clients can edit anytime, even close to event)

### Proposed Solution
- 🔒 **Secure secret-based URLs** for client access
- 📝 **Field-level audit logging** for all changes
- 🔐 **Admin-controlled lock** to prevent client edits
- 👥 **Separate routes** for admin and client with shared UI



---

## 🎯 Business Requirements

### 1. Client Edit Access
- Clients receive a unique link in confirmation emails
- Link format: `/booking/{id}/edit/{secret}`
- Secret is stored in database, never expires
- Clients can edit: date, time, guest count, allergies, special requests

### 2. Admin Lock Control
- **Only admins** can lock/unlock bookings
- When locked: **Clients cannot edit**, but admins still can
- Purpose: Prevent last-minute changes before events
- Audit trail tracks who locked/unlocked and when

### 3. Audit Logging
- Track **EVERY booking change** (admin and client)
- Record **who** made the change (admin name or "Client")
- Record **what** changed (field-level: guestCount 10→15)
- Record **when** (timestamp)
- Optional: Record IP address for security

---

## 🏗️ Technical Architecture

### Database Schema Changes

#### 1. Modify `bookings` Table
Add 4 new columns:

```sql
ALTER TABLE bookings
ADD COLUMN edit_secret text UNIQUE,              -- Secret for client URL
ADD COLUMN is_locked boolean NOT NULL DEFAULT false,  -- Lock status
ADD COLUMN locked_by text REFERENCES admin_user(id),  -- Who locked it
ADD COLUMN locked_at timestamp;                  -- When locked

CREATE INDEX bookings_edit_secret_idx
ON bookings(edit_secret) WHERE edit_secret IS NOT NULL;
```

#### 2. Create `booking_audit_log` Table (NEW)
Track all changes with full context:

```sql
CREATE TABLE booking_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  admin_user_id text REFERENCES admin_user(id),
  actor_type text NOT NULL CHECK (actor_type IN ('admin', 'client')),
  actor_label text NOT NULL,  -- "Admin: John Doe" or "Client"
  changes jsonb NOT NULL,     -- [{"field":"guestCount","from":10,"to":15}]
  ip_address text,
  user_agent text,
  created_at timestamp NOT NULL DEFAULT NOW()
);

CREATE INDEX booking_audit_log_booking_id_idx ON booking_audit_log(booking_id);
CREATE INDEX booking_audit_log_created_at_idx ON booking_audit_log(created_at DESC);
```

---

## 🔐 Security Design

### URL Format
- **Client route:** `/booking/{id}/edit/{secret}`
  - Secret: 64-character hex string (256-bit random)
  - Example: `/booking/a1b2c3d4/edit/9f8e7d6c5b4a3210fedcba9876543210...`

- **Admin route:** `/admin/bookings/{id}/edit`
  - Requires authenticated session
  - Bypasses lock (admin can always edit)

### Access Control Flow

```
Client tries to edit:
  1. Validate secret against database
  2. Check if booking is locked
  3. If locked → Show lock screen
  4. If unlocked → Show edit form
  5. On save → Log to audit trail

Admin tries to edit:
  1. Check session authentication
  2. Check role (admin+ only for lock/unlock)
  3. Allow edit regardless of lock status
  4. On save → Log to audit trail
```

### Security Features
- ✅ **256-bit entropy** for secrets (cryptographically secure)
- ✅ **Constant-time comparison** (prevents timing attacks)
- ✅ **Unique constraint** on secrets (no collisions)
- ✅ **SQL injection protected** (Drizzle ORM parameterized queries)
- ✅ **Role-based access** (only admin+ can lock/unlock)
- ✅ **Audit immutability** (logs never modified, cascade delete only)

---

## 🔍 How We Identify Admin vs Client Edits

The system uses **route-based identification** - the URL path determines who is editing:

```
┌─────────────────────────────────────────────────────────────────┐
│                    IDENTIFICATION METHOD                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CLIENT ROUTE:                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ PUT /booking/{id}/edit/{secret}                          │  │
│  │                                                           │  │
│  │ ✅ No authentication required                            │  │
│  │ ✅ Secret validates booking ownership                    │  │
│  │ ✅ Actor = "Client"                                       │  │
│  │ ✅ admin_user_id = NULL                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ADMIN ROUTE:                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ PUT /api/bookings/{id}                                   │  │
│  │                                                           │  │
│  │ ✅ Requires authenticated session                        │  │
│  │ ✅ Role check (admin, super_admin, etc.)                 │  │
│  │ ✅ Actor = "Admin: John Doe"                             │  │
│  │ ✅ admin_user_id = session.user.id                       │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Key Database Fields

| Field | Client Edit | Admin Edit |
|-------|-------------|------------|
| `actor_type` | `"client"` | `"admin"` |
| `admin_user_id` | `NULL` | UUID of admin user |
| `actor_label` | `"Client"` | `"Admin: John Doe"` |

### Why This Approach?

✅ **Clear separation:** Different routes = unambiguous identification
✅ **No guesswork:** Route explicitly tells us who is editing
✅ **Security:** Client route has no session, admin route requires auth
✅ **Privacy:** Client edits don't store personal data (just "Client")
✅ **Audit integrity:** Impossible to forge admin logs without session

### Example Database Records

**Client Edit (no admin_user_id):**
```sql
INSERT INTO booking_audit_log (
  booking_id,
  actor_type,
  actor_label,
  admin_user_id,
  changes
) VALUES (
  'booking-uuid-123',
  'client',
  'Client',
  NULL,  -- ← NULL means client
  '[{"field": "guestCount", "from": 10, "to": 15}]'::jsonb
);
```

**Admin Edit (has admin_user_id):**
```sql
INSERT INTO booking_audit_log (
  booking_id,
  actor_type,
  actor_label,
  admin_user_id,
  changes
) VALUES (
  'booking-uuid-123',
  'admin',
  'Admin: John Doe',
  'admin-uuid-456',  -- ← References admin_user table
  '[{"field": "guestCount", "from": 15, "to": 20}]'::jsonb
);
```

### Query to See Who Edited What

```sql
SELECT
  bal.created_at,
  bal.actor_type,
  bal.actor_label,
  bal.changes,
  au.name AS admin_name,  -- NULL for client edits
  au.email AS admin_email  -- NULL for client edits
FROM booking_audit_log bal
LEFT JOIN admin_user au ON bal.admin_user_id = au.id
WHERE bal.booking_id = 'booking-uuid-123'
ORDER BY bal.created_at DESC;
```

**Result:**
```
created_at          | actor_type | actor_label      | admin_name | changes
--------------------+------------+------------------+------------+--------
2026-02-20 12:00:00 | admin      | Admin: John Doe  | John Doe   | [{"field": "guestCount", "from": 15, "to": 20}]
2026-02-20 11:45:00 | client     | Client           | NULL       | [{"field": "guestCount", "from": 10, "to": 15}]
2026-02-20 10:30:00 | admin      | Admin: Jane Smith| Jane Smith | [{"field": "eventDate", "from": "2026-03-01", "to": "2026-03-02"}]
```

### Code Implementation

**Client Route Handler** (`app/api/booking/[id]/edit/[secret]/route.ts`):
```typescript
export async function PUT(request, { params }) {
  const { id, secret } = await params;
  const body = await request.json();

  // No authentication needed - secret is enough
  const result = await updateBooking(id, body, {
    actorType: 'client',      // ← Explicitly "client"
    secret: secret,           // ← For validation
    // adminUserId undefined   // ← No admin user
  });

  return NextResponse.json(result);
}
```

**Admin Route Handler** (`app/api/bookings/[id]/route.ts`):
```typescript
export async function PUT(request, { params }) {
  const session = await requireAuth();  // ← Must be authenticated

  const { id } = await params;
  const body = await request.json();

  const result = await updateBooking(id, body, {
    actorType: 'admin',              // ← Explicitly "admin"
    adminUserId: session.user.id,    // ← From session
    adminUserName: session.user.name // ← From session
  });

  return NextResponse.json(result);
}
```

**Update Function** (`lib/actions/bookings.ts`):
```typescript
export async function updateBooking(
  id: string,
  updates: Partial<CreateBookingInput>,
  context?: {
    actorType: 'admin' | 'client',  // ← Required
    adminUserId?: string,            // ← Present for admin
    adminUserName?: string,          // ← Present for admin
    secret?: string                  // ← Present for client
  }
) {
  // ... validation and update logic ...

  // Log the change
  await logBookingChange({
    bookingId: id,
    adminUserId: context?.adminUserId,  // ← NULL for client
    actorType: context.actorType,       // ← "admin" or "client"
    actorLabel: context.actorType === 'admin'
      ? `Admin: ${context.adminUserName}`  // ← "Admin: John Doe"
      : 'Client',                          // ← "Client"
    changes: calculatedChanges,
    ipAddress: ...,  // Optional tracking
  });
}
```

---

## 📊 Audit Log Format

Every change is recorded in this format:

```json
{
  "id": "uuid",
  "bookingId": "booking-uuid",
  "actorType": "admin" | "client",
  "actorLabel": "Admin: John Doe" | "Client",
  "changes": [
    {
      "field": "guestCount",
      "from": 10,
      "to": 15
    },
    {
      "field": "eventDate",
      "from": "2024-02-20",
      "to": "2024-02-21"
    }
  ],
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "createdAt": "2026-02-20T10:30:00Z"
}
```

**Tracked Fields:**
- eventDate
- eventTime
- guestCount
- allergyDetails
- specialRequests
- estimatedTotal
- requiresDeposit
- status
- internalNotes
- is_locked (lock/unlock actions)

---

## 🛠️ Implementation Phases

### Phase 1: Database Foundation (Day 1)
**Deliverables:**
- [ ] Migration script for new columns
- [ ] Migration script for audit table
- [ ] Updated TypeScript types in `schema.ts`
- [ ] Verification script to test schema

**Files:**
- `drizzle/0003_add_booking_edit_and_audit.ts` (NEW)
- `lib/db/schema.ts` (MODIFY)

**Risk:** Low - Database changes are backward compatible

---

### Phase 2: Core Utilities (Day 1-2)
**Deliverables:**
- [ ] Secret generation and validation functions
- [ ] Audit logging functions
- [ ] Change detection logic
- [ ] Unit tests for security functions

**Files:**
- `lib/booking-security.ts` (NEW)
- `lib/booking-audit.ts` (NEW)

**Key Functions:**
```typescript
generateBookingSecret(): string              // 64-char hex
validateBookingSecret(id, secret): Promise   // Verify secret
isBookingLocked(id): Promise<boolean>        // Check lock
canClientEditBooking(id, secret): Promise    // Combined check
calculateBookingChanges(old, new): FieldChange[]  // Diff logic
logBookingChange(entry): Promise<void>       // Record audit
getBookingAuditHistory(id): Promise          // Fetch history
```

**Risk:** Low - Pure functions, no external dependencies

---

### Phase 3: Enhanced Actions (Day 2)
**Deliverables:**
- [ ] Enhanced `updateBooking()` with audit logging
- [ ] Lock/unlock functions
- [ ] Query functions with audit data

**Files:**
- `lib/actions/bookings.ts` (MODIFY)

**Changes:**
```typescript
// Existing function - add context parameter
updateBooking(id, updates, context?: {
  actorType: 'admin' | 'client',
  adminUserId?: string,
  adminUserName?: string,
  secret?: string
})

// New functions
lockBooking(bookingId, adminUserId, adminUserName): Promise
unlockBooking(bookingId, adminUserId, adminUserName): Promise
getBookingWithEditSecret(bookingId): Promise
getBookingWithAudit(bookingId): Promise
```

**Risk:** Medium - Enhancing core business logic

---

### Phase 4: API Routes (Day 2-3)
**Deliverables:**
- [ ] Client edit API (GET/PUT)
- [ ] Lock/unlock API (POST)
- [ ] Audit history API (GET)
- [ ] Secure existing admin APIs

**Files:**
- `app/api/booking/[id]/edit/[secret]/route.ts` (NEW)
- `app/api/bookings/[id]/lock/route.ts` (NEW)
- `app/api/bookings/[id]/audit/route.ts` (NEW)
- `app/api/bookings/[id]/route.ts` (MODIFY - add auth)

**API Endpoints:**
```
GET  /api/booking/:id/edit/:secret     # Get booking (client)
PUT  /api/booking/:id/edit/:secret     # Update booking (client)
POST /api/bookings/:id/lock            # Lock/unlock (admin)
GET  /api/bookings/:id/audit           # Get audit log (admin)
```

**Risk:** Medium - New routes, need authentication

---

### Phase 5: Client UI (Day 3-4)
**Deliverables:**
- [ ] Client edit page route
- [ ] Client edit component with form
- [ ] Lock screen display
- [ ] Real-time lock status checking

**Files:**
- `app/booking/[id]/edit/[secret]/page.tsx` (NEW)
- `components/booking/ClientBookingEditPage.tsx` (NEW)

**Features:**
- Edit form with all bookable fields
- Lock status indicator
- Save button with validation
- Lock screen (when locked) with contact info
- Auto-refresh lock status every 30s

**Risk:** Medium - User-facing, needs good UX

---

### Phase 6: Admin UI Enhancements (Day 4)
**Deliverables:**
- [ ] Lock/unlock toggle button
- [ ] Audit history display
- [ ] Admin edit route (optional)

**Files:**
- `components/admin/BookingDetailPage.tsx` (MODIFY)
- `app/admin/bookings/[id]/edit/page.tsx` (NEW - optional)

**Features:**
```tsx
<button onClick={handleToggleLock}>
  {isLocked ? <Unlock /> : <Lock />}
  {isLocked ? 'Unlock Booking' : 'Lock Booking'}
</button>

<button onClick={() => setShowAudit(!showAudit)}>
  <History />
  {showAudit ? 'Hide' : 'Show'} History
</button>

{showAudit && (
  <AuditHistory>
    {auditLogs.map(log => (
      <LogEntry>
        {log.actorLabel} - {log.createdAt}
        {log.changes.map(c => (
          <Change>{c.field}: {c.from} → {c.to}</Change>
        ))}
      </LogEntry>
    ))}
  </AuditHistory>
)}
```

**Risk:** Low - UI enhancement only

---

### Phase 7: Email Integration (Day 4-5)
**Deliverables:**
- [ ] Generate secret when creating bookings
- [ ] Update email templates with secret URLs
- [ ] Test email delivery

**Files:**
- `lib/actions/email.ts` (MODIFY)
- `lib/email/templates/booking-confirmed.ts` (MODIFY)

**Changes:**
```typescript
// In sendBookingConfirmation()
const secret = await ensureBookingSecret(bookingId);
const bookingEditUrl = `${baseUrl}/booking/${bookingId}/edit/${secret}`;
```

**Email Template:**
```html
<a href="${bookingEditUrl}">
  Menü jetzt bearbeiten
</a>
```

**Risk:** Low - Email system already works

---

### Phase 8: Testing & Documentation (Day 5)
**Deliverables:**
- [ ] End-to-end testing
- [ ] Security audit
- [ ] Performance testing
- [ ] User documentation
- [ ] Admin documentation

**Test Cases:**
- [ ] Client can edit unlocked booking
- [ ] Client cannot edit locked booking
- [ ] Admin can edit locked booking
- [ ] Lock/unlock works for admin+ only
- [ ] Audit trail records all changes
- [ ] Invalid secret returns 404
- [ ] Email links work correctly

**Risk:** Low - Quality assurance

---

## 📈 Estimated Effort

| Phase | Duration | Complexity | Risk |
|-------|----------|------------|------|
| Phase 1: Database | 1 day | Low | Low |
| Phase 2: Utilities | 1-2 days | Low | Low |
| Phase 3: Actions | 1 day | Medium | Medium |
| Phase 4: APIs | 1-2 days | Medium | Medium |
| Phase 5: Client UI | 1-2 days | Medium | Medium |
| Phase 6: Admin UI | 1 day | Low | Low |
| Phase 7: Emails | 1 day | Low | Low |
| Phase 8: Testing | 1 day | Low | Low |
| **Total** | **8-11 days** | **Medium** | **Medium** |

---

## ⚠️ Risks & Mitigations

### High Risk Items

**1. Database Migration**
- **Risk:** Schema changes could break existing queries
- **Mitigation:**
  - All new columns have default values
  - Indexes are partial (WHERE edit_secret IS NOT NULL)
  - Test migration on staging first
  - Prepare rollback script

**2. Email URLs Breaking**
- **Risk:** Old emails have wrong URL format
- **Mitigation:**
  - Keep old routes as redirects
  - Or regenerate secrets for all existing bookings
  - Document cutoff date for new format

### Medium Risk Items

**3. Performance**
- **Risk:** Audit table could grow large
- **Mitigation:**
  - Add proper indexes
  - Pagination on audit history display
  - Consider archiving old logs (future)

**4. Security**
- **Risk:** Secret leakage or timing attacks
- **Mitigation:**
  - Constant-time comparison implemented
  - Secrets never logged or displayed
  - HTTPS only in production
  - Rate limiting on edit endpoints

### Low Risk Items

**5. User Confusion**
- **Risk:** Clients don't understand lock message
- **Mitigation:**
  - Clear, friendly copy in lock screen
  - Contact information prominently displayed
  - Consider adding "reason for lock" field

---

## ✅ Success Criteria

### Functional Requirements
- [ ] Clients can edit bookings via email link
- [ ] Admins can lock/unlock bookings
- [ ] All changes are logged with full context
- [ ] Audit trail distinguishes admin vs client
- [ ] Locked bookings block client edits
- [ ] Admins can edit locked bookings

### Non-Functional Requirements
- [ ] Response time < 500ms for edit page load
- [ ] Audit log query < 200ms for typical booking
- [ ] Zero data loss (all changes logged)
- [ ] Secrets are cryptographically secure
- [ ] No SQL injection vulnerabilities
- [ ] No timing attack vulnerabilities

### User Acceptance Criteria
- [ ] Client successfully edits booking from email link
- [ ] Client sees lock screen when booking is locked
- [ ] Admin can lock booking and client is blocked
- [ ] Admin can unlock booking and client can edit again
- [ ] Admin can see full audit history of all changes
- [ ] Audit history clearly shows who changed what

---

## 🔄 Rollout Plan

### Option A: Big Bang (Recommended)
- All phases implemented together
- Feature flag to enable/disable
- Tested thoroughly in staging
- Single production deployment
- **Pros:** Consistent state, easier testing
- **Cons:** Larger deployment, harder to rollback

### Option B: Phased Rollout
- Phase 1-4 first (backend only)
- Phase 5-8 second (frontend + emails)
- Can test backend before frontend
- **Pros:** Smaller deployments, easier to debug
- **Cons:** Incomplete feature in production

### Option C: Parallel with Old System
- Keep old edit links working
- New system works in parallel
- Gradually migrate users
- **Pros:** Zero downtime, safe rollback
- **Cons:** Maintenance burden, complex routing

**Recommendation:** Option A (Big Bang) with feature flag

---

## 📚 Documentation Requirements

### Technical Documentation
- [ ] API endpoint documentation (OpenAPI/Swagger)
- [ ] Database schema documentation
- [ ] Security model documentation
- [ ] Audit log format specification

### User Documentation
- [ ] Admin guide for lock/unlock feature
- [ ] Admin guide for viewing audit history
- [ ] Client guide for editing bookings
- [ ] FAQ for common issues

### Developer Documentation
- [ ] Code comments on complex logic
- [ ] Architecture decision records (ADRs)
- [ ] Testing guide for new features
- [ ] Troubleshooting guide

---

## 🚀 Post-Launch Enhancements (Future)

### Phase 9: Advanced Features (Not in Scope)
- [ ] Secret expiration with configurable TTL
- [ ] Secret rotation (regenerate secrets periodically)
- [ ] Email notifications to admin on client edits
- [ ] Approval workflow (client changes require admin approval)
- [ ] Field-level permissions (restrict which fields clients can edit)
- [ ] Bulk lock/unlock (by date range, status, etc.)
- [ ] Audit history export (CSV, PDF)
- [ ] Real-time lock status updates (WebSocket)
- [ ] Mobile app support (API for mobile clients)

### Phase 10: Analytics & Reporting
- [ ] Dashboard showing edit frequency
- [ ] Lock/unlock statistics
- [ ] Client edit completion rate
- [ ] Most commonly changed fields
- [ ] Time-to-event edit patterns

---

## 📞 Questions & Discussion Points

For team discussion:

1. **Lock Behavior:** Should there be automatic locking (e.g., 48h before event) or manual only?
   - **Current decision:** Manual only

2. **Secret Expiration:** Should secrets expire after a certain time?
   - **Current decision:** No expiration, rely on lock mechanism

3. **Email Notifications:** Should admins receive emails when clients edit bookings?
   - **Current decision:** Not in initial release

4. **Audit Retention:** How long should we keep audit logs?
   - **Current decision:** Indefinite (consider archiving later)

5. **Rollback Strategy:** If we need to rollback, what's the plan?
   - **Current decision:** Big bang deployment with feature flag

6. **URL Format:** Are we happy with `/booking/{id}/edit/{secret}` format?
   - **Current decision:** Yes, secret-based approach

7. **Admin Permissions:** Should moderators be able to lock/unlock?
   - **Current decision:** Admin+ only (super_admin, admin)

---

## 📝 Approval Checklist

Please review and initial each section:

- [ ] **Architecture:** Database schema and security model approved
- [ ] **Implementation:** 8-phase plan accepted
- [ ] **Timeline:** 8-11 days timeline acceptable
- [ ] **Resources:** Development team availability confirmed
- [ ] **Risks:** Mitigation strategies acceptable
- [ ] **Rollout:** Big bang deployment with feature flag approved
- [ ] **Testing:** Test coverage requirements met
- [ ] **Documentation:** Documentation requirements accepted

**Approved by:** _______________________
**Date:** _______________________
**Signature:** _______________________

---

## 📎 Appendix

### A. Example Audit Log Entries

**Admin Changes Guest Count:**
```json
{
  "actorLabel": "Admin: John Doe",
  "changes": [
    {"field": "guestCount", "from": 10, "to": 15}
  ],
  "createdAt": "2026-02-20T10:30:00Z"
}
```

**Client Changes Date and Time:**
```json
{
  "actorLabel": "Client",
  "changes": [
    {"field": "eventDate", "from": "2026-03-01", "to": "2026-03-02"},
    {"field": "eventTime", "from": "18:00", "to": "19:00"}
  ],
  "ipAddress": "192.168.1.100",
  "createdAt": "2026-02-20T11:45:00Z"
}
```

**Admin Locks Booking:**
```json
{
  "actorLabel": "Admin: Jane Smith",
  "changes": [
    {"field": "is_locked", "from": false, "to": true}
  ],
  "createdAt": "2026-02-20T12:00:00Z"
}
```

### B. Database Migration Script (Draft)

```typescript
// File: drizzle/0003_add_booking_edit_and_audit.ts

import { sql } from 'drizzle-orm';
import { migrate } from '@/lib/db/migrate';

export const up = sql`
  -- Add new columns to bookings table
  ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS edit_secret text UNIQUE,
  ADD COLUMN IF NOT EXISTS is_locked boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS locked_by text REFERENCES admin_user(id),
  ADD COLUMN IF NOT EXISTS locked_at timestamp;

  -- Create index for secret lookups
  CREATE INDEX IF NOT EXISTS bookings_edit_secret_idx
  ON bookings(edit_secret) WHERE edit_secret IS NOT NULL;

  -- Create audit log table
  CREATE TABLE IF NOT EXISTS booking_audit_log (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
    admin_user_id text REFERENCES admin_user(id),
    actor_type text NOT NULL CHECK (actor_type IN ('admin', 'client')),
    actor_label text NOT NULL,
    changes jsonb NOT NULL,
    ip_address text,
    user_agent text,
    created_at timestamp NOT NULL DEFAULT NOW()
  );

  -- Create indexes for audit log queries
  CREATE INDEX IF NOT EXISTS booking_audit_log_booking_id_idx
  ON booking_audit_log(booking_id);

  CREATE INDEX IF NOT EXISTS booking_audit_log_created_at_idx
  ON booking_audit_log(created_at DESC);
`;

export const down = sql`
  -- Rollback changes
  DROP INDEX IF EXISTS bookings_edit_secret_idx;
  DROP INDEX IF EXISTS booking_audit_log_booking_id_idx;
  DROP INDEX IF EXISTS booking_audit_log_created_at_idx;
  DROP TABLE IF EXISTS booking_audit_log;

  ALTER TABLE bookings
  DROP COLUMN IF EXISTS edit_secret,
  DROP COLUMN IF EXISTS is_locked,
  DROP COLUMN IF EXISTS locked_by,
  DROP COLUMN IF EXISTS locked_at;
`;
```

### C. API Endpoint Examples

**Get Booking (Client):**
```bash
curl https://oliv-restaurant.ch/api/booking/a1b2c3d4-e5f6-7890-abcd-ef1234567890/edit/9f8e7d6c5b4a3210fedcba98765432109f8e7d6c5b4a3210fedcba9876543210
```

**Update Booking (Client):**
```bash
curl -X PUT \
  https://oliv-restaurant.ch/api/booking/a1b2c3d4/edit/9f8e... \
  -H "Content-Type: application/json" \
  -d '{
    "guestCount": 15,
    "specialRequests": "Window seat please"
  }'
```

**Lock Booking (Admin):**
```bash
curl -X POST \
  https://oliv-restaurant.ch/api/bookings/a1b2c3d4/lock \
  -H "Content-Type: application/json" \
  -H "Cookie: oliv-auth-session-token=..." \
  -d '{"action": "lock"}'
```

**Get Audit History (Admin):**
```bash
curl https://oliv-restaurant.ch/api/bookings/a1b2c3d4/audit \
  -H "Cookie: oliv-auth-session-token=..."
```

---

**Document Version:** 1.0
**Last Updated:** February 20, 2026
**Next Review:** After team approval
