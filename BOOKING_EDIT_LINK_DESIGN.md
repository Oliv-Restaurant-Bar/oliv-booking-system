# Booking Summary Edit Link - Design Document

## Overview
Allow users and admins to edit booking summaries through secure, unique links with proper audit logging and access control.

---

## Requirements Summary

### Functional Requirements
1. **Shared UI**: Same booking summary/edit screen for both users and admins
2. **Secure Links**: Unique, secret-based URLs that cannot be guessed
3. **Audit Logging**: Track all changes with who made them (user vs admin)
4. **Lock/Unlock Mechanism**: Prevent concurrent edits
5. **Separate Routes**: Different URLs for admin vs user access

### Non-Functional Requirements
- Security: Links must be unguessable and time-limited
- Performance: Minimal DB queries for validation
- UX: Clear indication of edit mode and who is editing

---

## Architecture Design

### 1. Database Schema Changes

```sql
-- Add to BOOKINGS table
ALTER TABLE bookings
ADD COLUMN edit_secret TEXT UNIQUE,              -- Secret token for edit link
ADD COLUMN edit_locked_by TEXT,                   -- ID of user/admin currently editing (null if unlocked)
ADD COLUMN edit_locked_at TIMESTAMP,              -- When lock was acquired
ADD COLUMN edit_link_expires_at TIMESTAMP,        -- When edit link expires (optional, for security)
ADD COLUMN allow_guest_edits BOOLEAN DEFAULT false; -- Whether user can edit without login

-- New table: BOOKING_AUDIT_LOG
CREATE TABLE booking_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  editor_type TEXT NOT NULL CHECK (editor_type IN ('admin', 'user', 'guest')),
  editor_id TEXT,                                  -- admin_user_id if admin, NULL if guest
  editor_name TEXT,                                -- Display name (admin name or guest email)
  editor_email TEXT,                               -- Email for tracking
  action TEXT NOT NULL,                            -- 'created', 'updated', 'status_changed', 'cancelled', etc.
  changes JSONB,                                   -- {before: {...}, after: {...}}
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_booking_audit_log_booking_id ON booking_audit_log(booking_id);
CREATE INDEX idx_booking_audit_log_created_at ON booking_audit_log(created_at DESC);
```

### 2. Drizzle Schema Updates

```typescript
// lib/db/schema.ts - Add to bookings table
export const bookings = pgTable("bookings", {
  // ... existing fields ...
  editSecret: text("edit_secret").unique(),
  editLockedBy: text("edit_locked_by"),             // admin_user_id or 'guest:<email>'
  editLockedAt: timestamp("edit_locked_at"),
  editLinkExpiresAt: timestamp("edit_link_expires_at"),
  allowGuestEdits: boolean("allow_guest_edits").notNull().default(false),
  // ... existing fields ...
});

// New table
export const bookingAuditLog = pgTable(
  "booking_audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    bookingId: uuid("booking_id").notNull().references(() => bookings.id, {
      onDelete: "cascade",
    }),
    editorType: text("editor_type", { enum: ["admin", "user", "guest"] }).notNull(),
    editorId: text("editor_id"),                    // admin_user_id for admin, NULL for guest
    editorName: text("editor_name").notNull(),
    editorEmail: text("editor_email"),
    action: text("action").notNull(),
    changes: jsonb("changes").$type<{
      before?: Record<string, any>;
      after?: Record<string, any>;
    }>(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => ({
    bookingIdIdx: index("booking_audit_log_booking_id_idx").on(table.bookingId),
    createdAtIdx: index("booking_audit_log_created_at_idx").on(table.createdAt),
  }),
);
```

---

## URL Structure Design

### User Route (Public/Guest Access)
```
/booking/[editSecret]/edit
```

**Example:**
```
https://oliv-restaurant.ch/booking/a1b2c3d4-e5f6-7890-abcd-ef1234567890/edit
```

### Admin Route (Authenticated Admin Access)
```
/admin/bookings/[bookingId]/edit
```

**Example:**
```
https://oliv-restaurant.ch/admin/bookings/123e4567-e89b-12d3-a456-426614174000/edit
```

### URL Token Generation
```typescript
// Generate secure edit secret
function generateEditSecret(): string {
  return randomUUID(); // or crypto.randomBytes(32).toString('base64url')
}

// Create booking with edit secret
const editSecret = generateEditSecret();
await db.insert(bookings).values({
  // ... other fields
  editSecret,
  editLinkExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  allowGuestEdits: true,
});

// Generate user edit link
const editUrl = `${process.env.NEXT_PUBLIC_APP_URL}/booking/${editSecret}/edit`;
```

---

## Access Control & Authentication

### User Route (Public)
```typescript
// app/booking/[editSecret]/edit/page.tsx

interface PageProps {
  params: { editSecret: string };
}

async function validateEditAccess(editSecret: string): Promise<{
  booking: Booking | null;
  canEdit: boolean;
  lockInfo: { lockedBy: string; lockedAt: Date } | null;
  error?: string;
}> {
  // 1. Find booking by editSecret
  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.editSecret, editSecret),
  });

  if (!booking) {
    return { booking: null, canEdit: false, error: "Invalid link" };
  }

  // 2. Check if link expired
  if (booking.editLinkExpiresAt && booking.editLinkExpiresAt < new Date()) {
    return { booking: null, canEdit: false, error: "Link expired" };
  }

  // 3. Check if guest edits are allowed
  if (!booking.allowGuestEdits) {
    return { booking: null, canEdit: false, error: "Guest edits not allowed" };
  }

  // 4. Check lock status
  const lockInfo = booking.editLockedBy ? {
    lockedBy: booking.editLockedBy,
    lockedAt: booking.editLockedAt!,
  } : null;

  // 5. Auto-acquire lock if not locked
  if (!lockInfo) {
    await acquireEditLock(booking.id, 'guest', null);
  }

  return { booking, canEdit: true, lockInfo };
}
```

### Admin Route (Authenticated)
```typescript
// app/admin/bookings/[bookingId]/edit/page.tsx

async function validateAdminEditAccess(
  bookingId: string,
  session: Session
): Promise<{
  booking: Booking | null;
  canEdit: boolean;
  lockInfo: LockInfo | null;
}> {
  // 1. Check admin is authenticated
  if (!session) {
    redirect('/admin/login');
  }

  // 2. Find booking by ID
  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.id, bookingId),
  });

  if (!booking) {
    return { booking: null, canEdit: false };
  }

  // 3. Check lock status
  const lockInfo = booking.editLockedBy ? {
    lockedBy: booking.editLockedBy,
    lockedAt: booking.editLockedAt!,
  } : null;

  // 4. Admin can override user locks, but should show warning
  // Auto-acquire lock for admin
  if (!lockInfo || lockInfo.lockedBy !== session.user.id) {
    await acquireEditLock(booking.id, 'admin', session.user.id);
  }

  return { booking, canEdit: true, lockInfo };
}
```

---

## Lock Mechanism

### Acquire Lock
```typescript
async function acquireEditLock(
  bookingId: string,
  editorType: 'admin' | 'user' | 'guest',
  editorId: string | null
): Promise<boolean> {
  try {
    await db.update(bookings)
      .set({
        editLockedBy: editorId ? `${editorType}:${editorId}` : `guest:${editorType}`,
        editLockedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));

    // Log lock acquisition
    await logAuditEvent({
      bookingId,
      editorType,
      editorId,
      action: 'lock_acquired',
    });

    return true;
  } catch (error) {
    console.error('Failed to acquire lock:', error);
    return false;
  }
}
```

### Release Lock
```typescript
async function releaseEditLock(
  bookingId: string,
  editorId: string
): Promise<void> {
  await db.update(bookings)
    .set({
      editLockedBy: null,
      editLockedAt: null,
    })
    .where(eq(bookings.id, bookingId));

  await logAuditEvent({
    bookingId,
    editorId,
    action: 'lock_released',
  });
}

// Auto-release on component unmount
useEffect(() => {
  return () => {
    fetch('/api/bookings/' + bookingId + '/release-lock', {
      method: 'POST',
    });
  };
}, [bookingId]);
```

### Lock Timeout (Heartbeat)
```typescript
// Client-side heartbeat to maintain lock
useEffect(() => {
  const heartbeat = setInterval(() => {
    fetch('/api/bookings/' + bookingId + '/heartbeat', {
      method: 'POST',
    });
  }, 30000); // Every 30 seconds

  return () => clearInterval(heartbeat);
}, [bookingId]);

// Server-side: Reset stale locks (> 5 minutes old)
async function cleanupStaleLocks() {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  await db.update(bookings)
    .set({
      editLockedBy: null,
      editLockedAt: null,
    })
    .where(
      and(
        lt(bookings.editLockedAt, fiveMinutesAgo),
        isNotNull(bookings.editLockedBy)
      )
    );
}
```

---

## Audit Logging

### Log Creation
```typescript
interface AuditLogInput {
  bookingId: string;
  editorType: 'admin' | 'user' | 'guest';
  editorId?: string;
  editorName: string;
  editorEmail?: string;
  action: string;
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
  };
  ipAddress?: string;
  userAgent?: string;
}

async function logAuditEvent(input: AuditLogInput) {
  await db.insert(bookingAuditLog).values({
    bookingId: input.bookingId,
    editorType: input.editorType,
    editorId: input.editorId,
    editorName: input.editorName,
    editorEmail: input.editorEmail,
    action: input.action,
    changes: input.changes,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });
}
```

### Log on Update
```typescript
async function updateBookingWithAudit(
  bookingId: string,
  updates: Partial<Booking>,
  editor: { type: 'admin' | 'user' | 'guest'; id?: string; name: string; email?: string },
  ipAddress?: string,
  userAgent?: string
) {
  // 1. Get current state
  const [currentBooking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (!currentBooking) {
    throw new Error('Booking not found');
  }

  // 2. Calculate changes
  const changes: Record<string, { before: any; after: any }> = {};
  for (const [key, value] of Object.entries(updates)) {
    if (currentBooking[key] !== value) {
      changes[key] = {
        before: currentBooking[key],
        after: value,
      };
    }
  }

  // 3. Update booking
  await db.update(bookings)
    .set({ ...updates, updatedAt: new Date() })
    .where(eq(bookings.id, bookingId));

  // 4. Log audit event
  if (Object.keys(changes).length > 0) {
    await logAuditEvent({
      bookingId,
      editorType: editor.type,
      editorId: editor.id,
      editorName: editor.name,
      editorEmail: editor.email,
      action: 'updated',
      changes: { before: changes, after: updates },
      ipAddress,
      userAgent,
    });
  }

  return currentBooking;
}
```

### View Audit Trail
```typescript
async function getBookingAuditLog(bookingId: string) {
  const logs = await db.query.bookingAuditLog.findMany({
    where: eq(bookingAuditLog.bookingId, bookingId),
    orderBy: [desc(bookingAuditLog.createdAt)],
  });

  return logs.map(log => ({
    ...log,
    // Format editor info
    editorDisplay: log.editorType === 'admin'
      ? `${log.editorName} (Admin)`
      : log.editorType === 'user'
      ? `${log.editorName} (User)`
      : `${log.editorName || 'Guest'} (Guest)`,
  }));
}
```

---

## Shared Component Architecture

### Component: `BookingEditPage`
```typescript
// components/booking/BookingEditPage.tsx

interface BookingEditPageProps {
  booking: Booking;
  editor: {
    type: 'admin' | 'user' | 'guest';
    id?: string;
    name: string;
  };
  isLocked?: boolean;
  lockInfo?: LockInfo;
}

export function BookingEditPage({
  booking,
  editor,
  isLocked,
  lockInfo,
}: BookingEditPageProps) {
  return (
    <div className="booking-edit-container">
      {/* Lock warning if locked by someone else */}
      {isLocked && lockInfo?.lockedBy !== getLockId(editor) && (
        <LockWarning lockInfo={lockInfo} />
      )}

      {/* Editor info banner */}
      <EditorBanner editor={editor} />

      {/* Booking form - same for all editor types */}
      <BookingForm
        booking={booking}
        onSubmit={handleSubmit}
        editor={editor}
      />

      {/* Audit trail - visible to admins */}
      {editor.type === 'admin' && (
        <AuditTrailSection bookingId={booking.id} />
      )}
    </div>
  );
}
```

### Component: `AuditTimeline`
```typescript
// components/booking/AuditTimeline.tsx

interface AuditTimelineProps {
  logs: AuditLog[];
}

export function AuditTimeline({ logs }: AuditTimelineProps) {
  return (
    <div className="audit-timeline">
      <h3>Audit Trail</h3>
      <Timeline>
        {logs.map((log) => (
          <TimelineItem key={log.id}>
            <TimelineIcon>
              {log.editorType === 'admin' && <AdminIcon />}
              {log.editorType === 'user' && <UserIcon />}
              {log.editorType === 'guest' && <GuestIcon />}
            </TimelineIcon>
            <TimelineContent>
              <Typography variant="body1">
                {log.editorName} {getActionText(log.action)}
              </Typography>
              <Typography variant="caption">
                {formatDateTime(log.createdAt)}
              </Typography>
              {log.changes && (
                <ChangeDiff changes={log.changes} />
              )}
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  );
}
```

---

## API Routes

### GET /api/booking/[editSecret]/validate
Validate edit link and return booking data.
```typescript
export async function GET(
  request: Request,
  { params }: { params: { editSecret: string } }
) {
  const result = await validateEditAccess(params.editSecret);

  if (!result.canEdit) {
    return Response.json({ error: result.error }, { status: 403 });
  }

  return Response.json({
    booking: result.booking,
    lockInfo: result.lockInfo,
  });
}
```

### POST /api/booking/[editSecret]/update
Update booking with audit logging.
```typescript
export async function POST(
  request: Request,
  { params }: { params: { editSecret: string } }
) {
  const body = await request.json();
  const { updates, guestInfo } = body;

  // Validate access
  const { booking } = await validateEditAccess(params.editSecret);

  if (!booking) {
    return Response.json({ error: 'Invalid link' }, { status: 403 });
  }

  // Update with audit
  const updated = await updateBookingWithAudit(
    booking.id,
    updates,
    {
      type: 'guest',
      name: guestInfo.name,
      email: guestInfo.email,
    },
    request.headers.get('x-forwarded-for') || undefined,
    request.headers.get('user-agent') || undefined
  );

  return Response.json({ success: true, booking: updated });
}
```

### POST /api/booking/[editSecret]/release-lock
Release edit lock.
```typescript
export async function POST(
  request: Request,
  { params }: { params: { editSecret: string } }
) {
  const { lockId } = await request.json();

  await releaseEditLockBySecret(params.editSecret, lockId);

  return Response.json({ success: true });
}
```

### GET /api/booking/[bookingId]/audit
Get audit log for a booking (admin only).
```typescript
export async function GET(
  request: Request,
  { params }: { params: { bookingId: string } }
) {
  const session = await requireAuth();

  if (!session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const logs = await getBookingAuditLog(params.bookingId);

  return Response.json({ logs });
}
```

---

## Email Integration

### Include Edit Link in Confirmation Email
```typescript
// lib/actions/email.ts

const bookingEditUrl = `${baseUrl}/booking/${booking.editSecret}/edit`;

const emailData = {
  // ... existing fields
  editLink: bookingEditUrl,
  editLinkExpiresAt: booking.editLinkExpiresAt,
};

await sendTemplateEmail({
  to: recipientEmail,
  templateName: 'booking-confirmed',
  templateData: emailData,
});
```

### ZeptoMail Template Variables
Add to all booking templates:
```handlebars
Edit Your Booking: {{edit_link}}
Link Expires: {{edit_link_expires_at}}
```

---

## Security Considerations

### 1. Secret Generation
- Use `crypto.randomUUID()` or `randomBytes(32)`
- Never use sequential or predictable values
- Store secrets hashed in DB (optional, for extra security)

### 2. Link Expiration
- Default expiry: 30 days
- Configurable per booking
- Show expiry in UI

### 3. Rate Limiting
```typescript
// middleware.ts - rate limit edit link validation
export const config = {
  matcher: '/booking/:editSecret/edit',
};

export async function middleware(request: NextRequest) {
  const ip = request.ip;

  // Rate limit: 10 requests per minute per IP
  const allowed = await rateLimit.check(ip, 10, 60);

  if (!allowed) {
    return new Response('Too many requests', { status: 429 });
  }

  return NextResponse.next();
}
```

### 4. HTTPS Only
- Redirect HTTP to HTTPS
- Set `Secure` flag on cookies

### 5. CSP Headers
```typescript
// next.config.ts
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: "frame-ancestors 'self';",
  },
];
```

---

## Implementation Checklist

### Phase 1: Database & Backend
- [ ] Add new columns to `bookings` table
- [ ] Create `booking_audit_log` table
- [ ] Create migration script
- [ ] Implement lock functions (acquire, release, heartbeat)
- [ ] Implement audit logging functions
- [ ] Create API routes for edit operations

### Phase 2: User Route
- [ ] Create `/booking/[editSecret]/edit/page.tsx`
- [ ] Implement access validation
- [ ] Create `BookingEditPage` shared component
- [ ] Add lock warning UI
- [ ] Implement auto-lock on mount
- [ ] Implement auto-release on unmount

### Phase 3: Admin Route
- [ ] Create `/admin/bookings/[bookingId]/edit/page.tsx`
- [ ] Add admin authentication
- [ ] Implement lock override capability
- [ ] Add audit trail viewer
- [ ] Add admin-specific fields (internal notes)

### Phase 4: Integration
- [ ] Update email templates with edit link
- [ ] Add edit link to booking confirmation
- [ ] Update `createBooking` to generate edit secret
- [ ] Test end-to-end flow

### Phase 5: Testing & Security
- [ ] Unit tests for lock mechanism
- [ ] Integration tests for audit logging
- [ ] Security audit of secret generation
- [ ] Penetration testing for link manipulation
- [ ] Performance testing

---

## Open Questions

1. **Lock Override**: Should admins be able to forcefully take over a locked booking?
   - Recommendation: Yes, but with confirmation dialog and audit log

2. **Multiple Edit Sessions**: Should we allow multiple users to view simultaneously (read-only)?
   - Recommendation: No, keep simple - one editor at a time

3. **Edit Link Regeneration**: Should expired links be regeneratable?
   - Recommendation: Yes, via admin panel action with audit log

4. **Guest Identity Collection**: How to identify guest editors?
   - Recommendation: Collect name + email on first edit action, store in audit log

5. **Real-time Updates**: Should we use WebSockets for live lock status?
   - Recommendation: Start with polling (heartbeat), upgrade to WebSockets if needed

---

## Migration Script

```typescript
// scripts/migrate-add-edit-link.ts

import { db } from '@/lib/db';
import { bookings } from '@/lib/db/schema';
import { randomUUID } from 'crypto';

async function migrate() {
  console.log('Starting migration...');

  // 1. Add columns using raw SQL (Drizzle doesn't support ALTER TABLE yet)
  await db.execute(sql`
    ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS edit_secret TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS edit_locked_by TEXT,
    ADD COLUMN IF NOT EXISTS edit_locked_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS edit_link_expires_at TIMESTAMP,
    ADD COLUMN IF NOT EXISTS allow_guest_edits BOOLEAN DEFAULT false;
  `);

  // 2. Create audit_log table
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS booking_audit_log (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
      editor_type TEXT NOT NULL CHECK (editor_type IN ('admin', 'user', 'guest')),
      editor_id TEXT,
      editor_name TEXT NOT NULL,
      editor_email TEXT,
      action TEXT NOT NULL,
      changes JSONB,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_booking_audit_log_booking_id
      ON booking_audit_log(booking_id);
    CREATE INDEX IF NOT EXISTS idx_booking_audit_log_created_at
      ON booking_audit_log(created_at DESC);
  `);

  // 3. Generate edit secrets for existing bookings
  const existingBookings = await db.select().from(bookings);

  for (const booking of existingBookings) {
    if (!booking.editSecret) {
      const editSecret = randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 days

      await db.update(bookings)
        .set({
          editSecret,
          editLinkExpiresAt: expiresAt,
          allowGuestEdits: true,
        })
        .where(eq(bookings.id, booking.id));

      console.log(`Generated edit secret for booking ${booking.id}`);
    }
  }

  console.log('Migration complete!');
}

migrate().catch(console.error);
```

---

## Example User Journey

### User Receives Confirmation Email
```
Subject: Your Booking Confirmation - Restaurant Oliv

Thank you for your booking! Here are your details:

Event: 2026-03-15 at 19:00
Guests: 4 people
Status: Pending

[Edit Your Booking] (link expires: April 15, 2026)
```

### User Clicks Edit Link
1. Lands on `/booking/a1b2c3d4-e5f6-7890-abcd-ef1234567890/edit`
2. System validates secret
3. Lock is acquired automatically
4. Booking form loads with current data
5. "Editing as Guest" banner shown at top

### User Makes Changes
1. Changes guest count from 4 to 6
2. Updates special requests
3. Clicks "Save Changes"
4. Changes saved to DB
5. Audit log entry created
6. Lock released
7. Confirmation message shown

### Admin Views Same Booking
1. Goes to `/admin/bookings/booking-id/edit`
2. Sees audit trail showing user's edit
3. Can make additional changes
4. All changes logged with "admin" type

---

## Example Audit Log Output

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "bookingId": "123e4567-e89b-12d3-a456-426614174000",
    "editorType": "guest",
    "editorName": "John Doe",
    "editorEmail": "john@example.com",
    "action": "updated",
    "changes": {
      "before": {
        "guestCount": 4,
        "specialRequests": null
      },
      "after": {
        "guestCount": 6,
        "specialRequests": "Vegetarian options needed"
      }
    },
    "ipAddress": "192.168.1.1",
    "userAgent": "Mozilla/5.0...",
    "createdAt": "2026-02-19T10:30:00.000Z"
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "bookingId": "123e4567-e89b-12d3-a456-426614174000",
    "editorType": "admin",
    "editorId": "admin-123",
    "editorName": "Admin User",
    "editorEmail": "admin@oliv-restaurant.ch",
    "action": "status_changed",
    "changes": {
      "before": { "status": "pending" },
      "after": { "status": "confirmed" }
    },
    "ipAddress": "10.0.0.1",
    "userAgent": "Mozilla/5.0...",
    "createdAt": "2026-02-19T11:00:00.000Z"
  }
]
```
