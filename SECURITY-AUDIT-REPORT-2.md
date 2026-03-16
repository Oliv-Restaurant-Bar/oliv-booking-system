# Security Audit Report #2 - Oliv Booking System
**Date:** March 16, 2026
**Status:** ⚠️ ADDITIONAL SECURITY ISSUES FOUND

After the initial security fixes, a deeper code review has uncovered **additional critical vulnerabilities** that need immediate attention.

---

## 🔴 CRITICAL ISSUES (Immediate Action Required)

### 1. **UNAUTHENTICATED BOOKING STATUS UPDATE**
**File:** `app/api/bookings/update-status/route.ts`
**Severity:** CRITICAL
**Issue:** Anyone can change booking status without authentication

```typescript
// VULNERABLE CODE:
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { bookingId, status } = body;

  // NO AUTHENTICATION CHECK!
  const result = await updateBookingStatus(bookingId, status);
  return NextResponse.json({ success: true });
}
```

**Attack Scenario:**
- Attacker cancels all bookings
- Attacker marks fake bookings as "confirmed"
- Attacker marks legitimate bookings as "no_show"

**Solution:**
```typescript
import { requirePermissionWrapper } from "@/lib/auth/rbac-middleware";
import { Permission } from "@/lib/auth/rbac";

export async function POST(request: NextRequest) {
  try {
    // REQUIRE AUTHENTICATION AND PERMISSION
    await requirePermissionWrapper(Permission.UPDATE_BOOKING_STATUS);

    const body = await request.json();
    const { bookingId, status } = body;

    // Validate status enum
    const validStatuses = ['new', 'touchbase', 'pending', 'confirmed', 'completed', 'cancelled', 'no_show', 'declined'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Validate booking ID format
    const uuidSchema = require('zod').z.string().uuid();
    uuidSchema.parse(bookingId);

    const result = await updateBookingStatus(bookingId, status);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.name === "AuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
```

---

### 2. **BOOKING LIST API - NO AUTHENTICATION**
**File:** `app/api/bookings/route.ts`
**Severity:** CRITICAL
**Issue:** API endpoint has no authentication check at route level

```typescript
// VULNERABLE CODE:
export async function GET(request: Request) {
  const result = await fetchBookings({ /* ... */ });
  return NextResponse.json(result);
}
```

**Attack Scenario:**
- Anyone can access all booking data
- Customer data exposure (names, emails, phone numbers)
- Revenue data exposure

**Solution:**
```typescript
import { requirePermissionWrapper } from "@/lib/auth/rbac-middleware";
import { Permission } from "@/lib/auth/rbac";

export async function GET(request: Request) {
  try {
    // ADD AUTHENTICATION
    await requirePermissionWrapper(Permission.VIEW_BOOKINGS);

    const result = await fetchBookings({ /* ... */ });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && error.name === "AuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}
```

---

### 3. **VENUES API - INSUFFICIENT AUTHORIZATION**
**File:** `app/api/venues/route.ts`
**Severity:** HIGH
**Issue:** Only basic session check, no RBAC permissions

```typescript
// VULNERABLE CODE:
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ANY LOGGED-IN USER CAN CREATE VENUES!
  const [newVenue] = await db.insert(venues).values({ /* ... */ });
}
```

**Attack Scenario:**
- Moderator or read-only user creates fake venues
- Data pollution and integrity issues

**Solution:**
```typescript
import { requirePermissionWrapper } from "@/lib/auth/rbac-middleware";
import { Permission } from "@/lib/auth/rbac";

export async function POST(request: NextRequest) {
  try {
    // REQUIRE PROPER PERMISSION
    await requirePermissionWrapper(Permission.CREATE_MENU_ITEM); // or add CREATE_VENUE permission

    const body = await request.json();
    const { name, description } = createVenueSchema.parse(body);

    // ... rest of code
  } catch (error) {
    if (error instanceof Error && error.name === "AuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    // ... error handling
  }
}
```

---

### 4. **SETTINGS API - INSUFFICIENT AUTHORIZATION**
**File:** `app/api/settings/route.ts`
**Severity:** HIGH
**Issue:** Any authenticated user can modify system settings

```typescript
// VULNERABLE CODE:
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ANY USER CAN CHANGE SYSTEM SETTINGS!
  const [updated] = await db.update(systemSettings).set({ /* ... */ });
}
```

**Attack Scenario:**
- Moderator changes currency to cause pricing confusion
- Read-only user changes timezone to disrupt operations
- Data integrity and business logic issues

**Solution:**
```typescript
import { requirePermissionWrapper } from "@/lib/auth/rbac-middleware";
import { Permission } from "@/lib/auth/rbac";

export async function POST(request: NextRequest) {
  try {
    // REQUIRE ADMIN PERMISSION
    await requirePermissionWrapper(Permission.UPDATE_SETTINGS);

    const body = await request.json();
    const updates = updateSettingsSchema.parse(body);

    // ... rest of code
  } catch (error) {
    if (error instanceof Error && error.name === "AuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    // ... error handling
  }
}
```

---

### 5. **PROFILE API - EMAIL HIJACKING RISK**
**File:** `app/api/profile/route.ts`
**Severity:** MEDIUM
**Issue:** Insufficient validation for email changes

```typescript
// VULNERABLE CODE:
export async function PUT(request: NextRequest) {
  const session = await getCurrentUser();
  const body = await request.json();
  const { firstName, lastName, email, avatar } = body;

  // NO PASSWORD VERIFICATION FOR EMAIL CHANGE!
  if (email && email.trim() !== existingUser.email) {
    const [updatedUser] = await db.update(adminUser)
      .set({ email: email.trim() })
      .returning();
  }
}
```

**Attack Scenario:**
- Attacker with session hijacking can change email to take over account
- No verification step for email changes
- Account takeover vulnerability

**Solution:**
```typescript
export async function PUT(request: NextRequest) {
  try {
    const session = await getCurrentUser();
    const body = await request.json();
    const { firstName, lastName, email, currentPassword } = body;

    // If email is being changed, verify password
    if (email && email.trim() !== existingUser.email) {
      if (!currentPassword) {
        return NextResponse.json({
          error: "Current password required to change email"
        }, { status: 400 });
      }

      // Verify current password
      const auth = await import('@/lib/auth');
      const isValid = await auth.auth.api.signIn({
        body: {
          email: existingUser.email,
          password: currentPassword
        }
      });

      if (!isValid) {
        return NextResponse.json({
          error: "Invalid password"
        }, { status: 401 });
      }

      // Send verification email to new address
      await sendEmailVerificationEmail(email.trim(), session.user.id);

      return NextResponse.json({
        success: true,
        message: "Verification email sent to new address"
      });
    }

    // ... update other fields
  } catch (error) {
    // ... error handling
  }
}
```

---

### 6. **BOOKING LOCK API - MANUAL ROLE CHECK**
**File:** `app/api/bookings/[id]/lock/route.ts`
**Severity:** MEDIUM
**Issue:** Manual role checking instead of using RBAC system

```typescript
// INCONSISTENT CODE:
const [userWithRole] = await db
  .select({ role: adminUser.role })
  .from(adminUser)
  .where(eq(adminUser.id, session.user.id))
  .limit(1);

if (userRole !== "super_admin" && userRole !== "admin") {
  return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
}
```

**Problem:**
- Inconsistent with rest of codebase
- Bypasses RBAC permission system
- Harder to maintain and audit

**Solution:**
```typescript
import { requirePermissionWrapper } from "@/lib/auth/rbac-middleware";
import { Permission } from "@/lib/auth/rbac";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // USE RBAC SYSTEM INSTEAD OF MANUAL CHECKS
    await requirePermissionWrapper(Permission.EDIT_BOOKING);

    // ... rest of code
  } catch (error) {
    if (error instanceof Error && error.name === "AuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    // ... error handling
  }
}
```

---

## 🟠 HIGH PRIORITY ISSUES

### 7. **KITCHEN PDF SEND - INSUFFICIENT VALIDATION**
**File:** `app/api/kitchen-pdf/send/route.ts`
**Issue:** Only basic auth, no RBAC

**Solution:**
```typescript
import { requirePermissionWrapper } from "@/lib/auth/rbac-middleware";
import { Permission } from "@/lib/auth/rbac";

export async function POST(request: NextRequest) {
  try {
    await requirePermissionWrapper(Permission.VIEW_BOOKING_DETAILS);

    // ... rest of code
  } catch (error) {
    // ... error handling
  }
}
```

---

### 8. **COMMENTS API - NO PERMISSION CHECK**
**File:** `app/api/bookings/[id]/comments/route.ts`
**Issue:** Only basic auth, no RBAC

**Solution:**
```typescript
import { requirePermissionWrapper } from "@/lib/auth/rbac-middleware";
import { Permission } from "@/lib/auth/rbac";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requirePermissionWrapper(Permission.VIEW_BOOKING_DETAILS);

    // ... rest of code
  } catch (error) {
    // ... error handling
  }
}
```

---

## 🟡 MEDIUM PRIORITY ISSUES

### 9. **PUBLIC MENU DATA EXPOSURE**
**File:** `app/api/menu/route.ts`
**Issue:** Complete menu data exposed without authentication
**Status:** ✅ ACCEPTABLE (customer-facing feature)

**Note:** This is intentional for the booking wizard. However, consider:
- Adding rate limiting
- Monitoring for scraping
- Caching to reduce database load

---

### 10. **INCONSISTENT AUTHENTICATION PATTERNS**
**Issue:** Mix of `requireAuth()`, `getCurrentUser()`, `getSession()`, and `requirePermissionWrapper()`

**Problems:**
- Hard to audit which endpoints have proper authorization
- Inconsistent error handling
- Some endpoints check auth at API level, others in actions

**Solution:**
Create a standardized authentication wrapper:
```typescript
// lib/api-wrapper.ts
import { requirePermissionWrapper } from "./auth/rbac-middleware";
import { Permission } from "./auth/rbac";
import { NextResponse } from "next/server";

export async function withAuth(
  handler: () => Promise<Response>,
  permission?: Permission
) {
  try {
    if (permission) {
      await requirePermissionWrapper(permission);
    } else {
      const { getCurrentUser } = await import("./auth/rbac-middleware");
      const user = await getCurrentUser();
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }
    return await handler();
  } catch (error) {
    if (error instanceof Error && error.name === "AuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    throw error;
  }
}

// Usage:
export const GET = withAuth(async () => {
  const data = await fetchData();
  return NextResponse.json(data);
}, Permission.VIEW_BOOKINGS);
```

---

### 11. **MULTIPLE @ts-ignore COMMENTS**
**Files:** Multiple files
**Issue:** TypeScript type safety bypassed

**Locations:**
- `lib/actions/wizard.ts` (4 instances)
- `lib/actions/bookings.ts` (2 instances)
- `lib/actions/leads.ts` (3 instances)
- `lib/actions/menu.ts` (4 instances)

**Problem:**
- Type safety compromised
- Potential runtime errors
- Harder to refactor

**Solution:**
Replace `@ts-ignore` with proper type fixes:
```typescript
// Instead of:
// @ts-ignore - Drizzle ORM type compatibility issue
const [booking] = await db.insert(bookings).values({ /* ... */ });

// Use:
const [booking] = await db.insert(bookings).values({ /* ... */ }).returning() as unknown as Array<typeof bookings.$inferSelect>;
```

---

### 12. **SENSITIVE DATA IN CONSOLE.LOG**
**Files:** Multiple
**Issue:** Production code logs sensitive data

**Examples:**
```typescript
// lib/actions/bookings.ts
console.log('  → Updating specialRequests:', updates.specialRequests);
console.log('   WHERE id =', id);
console.log('   SET:', JSON.stringify(updateData, null, 2));

// app/api/booking/[id]/lock/route.ts
console.log("Lock API: User role from DB =", userRole);
console.log("Lock API: Insufficient permissions for role:", userRole);
```

**Problems:**
- Customer data logged to console
- Internal implementation details exposed
- Potential data leak in production logs

**Solution:**
```typescript
// Use structured logging with levels
import { logger } from '@/lib/logger';

// In production:
logger.info('Booking updated', { bookingId: id, changes: Object.keys(updateData) });

// In development only:
if (process.env.NODE_ENV === 'development') {
  console.log('Booking update details:', updateData);
}
```

---

### 13. **NO RATE LIMITING**
**Issue:** No rate limiting on any API endpoints

**Affected Endpoints:**
- `/api/auth/[...all]` - Authentication endpoints
- `/api/bookings` - Booking operations
- `/api/upload/image` - File uploads
- `/api/booking/[id]/edit/[secret]` - Client edits

**Attack Scenarios:**
- Brute force password attacks
- DoS via large file uploads
- Spam booking creation

**Solution:**
```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

export async function checkRateLimit(identifier: string) {
  const { success } = await ratelimit.limit(identifier);
  if (!success) {
    throw new Error("Too many requests");
  }
}

// Usage in API routes:
export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
  await checkRateLimit(ip);
  // ... rest of handler
}
```

---

### 14. **MISSING INPUT VALIDATION**
**Files:** Multiple API routes

**Examples:**
```typescript
// app/api/bookings/update-status/route.ts - NO VALIDATION
const { bookingId, status } = body;
// What if bookingId is not a UUID?
// What if status is not a valid enum value?
```

**Solution:**
Always validate input at API boundary:
```typescript
import { z } from 'zod';

const updateStatusSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  status: z.enum(['new', 'touchbase', 'pending', 'confirmed', 'completed', 'cancelled', 'no_show', 'declined'])
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { bookingId, status } = updateStatusSchema.parse(body);
  // ... rest of code
}
```

---

### 15. **BUILD WARNINGS**
**Issue:** Deprecated middleware and page config usage

**Warnings:**
```
⚠ The "middleware" file convention is deprecated. Please use "proxy" instead.
⚠ Page config in `config` is deprecated and ignored
```

**Solution:**
Update to Next.js 16 conventions:
```typescript
// next.config.ts - Remove deprecated config
// app/api/upload/image/route.ts - Remove config export
```

---

## 📊 SUMMARY

### Critical Issues Requiring Immediate Fix: 6
### High Priority Issues: 2
### Medium Priority Issues: 7

**Total Issues Found:** 15

### Risk Breakdown:
- **Unauthorized Access:** 8 endpoints
- **Data Exposure:** 5 endpoints
- **Data Integrity:** 4 endpoints
- **Account Takeover:** 1 endpoint

---

## 🔧 RECOMMENDED ACTION PLAN

### Phase 1: Critical Fixes (Today)
1. ✅ Add authentication to `/api/bookings/update-status`
2. ✅ Add authentication to `/api/bookings`
3. ✅ Add RBAC to `/api/venues`
4. ✅ Add RBAC to `/api/settings`

### Phase 2: High Priority (This Week)
5. ✅ Add email verification to profile updates
6. ✅ Standardize authentication patterns
7. ✅ Add RBAC to `/api/kitchen-pdf/send`
8. ✅ Add RBAC to `/api/bookings/[id]/comments`

### Phase 3: Medium Priority (This Month)
9. ✅ Implement rate limiting
10. ✅ Add comprehensive input validation
11. ✅ Remove or fix all @ts-ignore comments
12. ✅ Implement structured logging
13. ✅ Update to Next.js 16 conventions

---

## 🧪 TESTING CHECKLIST

After fixes, verify:
- [ ] All API endpoints require authentication
- [ ] RBAC permissions are enforced
- [ ] Input validation on all endpoints
- [ ] No console.log in production builds
- [ ] Rate limiting is active
- [ ] TypeScript compilation passes
- [ ] All tests pass

---

## 📝 SECURITY BEST PRACTICES FOR FUTURE

1. **Always validate at API boundaries**
2. **Use RBAC for authorization, never manual role checks**
3. **Never bypass TypeScript with @ts-ignore**
4. **Log security events, never sensitive data**
5. **Implement rate limiting on all public endpoints**
6. **Use structured logging with log levels**
7. **Audit authentication patterns monthly**
8. **Run security scans before each deployment**

---

**Report Generated:** March 16, 2026
**Next Review:** Recommended in 30 days or after any major changes
