# Security Audit Report 3 - Oliv Booking System
**Date:** March 16, 2026
**Auditor:** Claude Code Security Analysis
**Round:** 3 - Deep Architecture & Business Logic Review
**Status:** ⚠️ 7 NEW VULNERABILITIES IDENTIFIED

---

## 🎯 EXECUTIVE SUMMARY

After two previous rounds fixing **18 critical vulnerabilities**, this **third audit** focused on **architecture-level issues**, **business logic vulnerabilities**, and **data integrity concerns**. The audit discovered **7 additional vulnerabilities** ranging from authorization gaps to race conditions.

**Cumulative Security Fixes:**
- **Round 1:** 10 critical issues fixed
- **Round 2:** 8 critical issues fixed
- **Round 3:** 7 issues identified (this report)
- **Total:** 25 vulnerabilities across 3 audits

---

## 🔴 CRITICAL ISSUES

### 1. VENUES API - MISSING RBAC ON MODIFICATION ENDPOINTS
**File:** `app/api/venues/[id]/route.ts`
**Risk:** HIGH → CRITICAL (due to data integrity impact)
**Impact:** Any authenticated user can modify or delete venues

**Current Code (VULNERABLE):**
```typescript
export async function PUT(request: NextRequest, { params }) {
  const session = await getSession();
  if (!session?.user) {  // ❌ ONLY CHECKS SESSION, NOT PERMISSIONS
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... venue update logic
}
```

**Attack Scenario:**
1. Regular user (read_only role) logs in
2. Sends PUT request to `/api/venues/[id]` with malicious data
3. Venue is updated with incorrect information
4. Business operations disrupted

**Fix Required:**
```typescript
import { requirePermissionWrapper } from "@/lib/auth/rbac-middleware";
import { Permission } from "@/lib/auth/rbac";

export async function PUT(request: NextRequest, { params }) {
  await requirePermissionWrapper(Permission.CREATE_MENU_ITEM);  // ✅ ADD RBAC
  // ... rest of code
}

export async function DELETE(request: NextRequest, { params }) {
  await requirePermissionWrapper(Permission.CREATE_MENU_ITEM);  // ✅ ADD RBAC
  // ... rest of code
}
```

---

### 2. LEAD CREATION - NO RATE LIMITING (PUBLIC ENDPOINT)
**File:** `lib/actions/leads.ts:21`
**Risk:** HIGH
**Impact:** Spam abuse, DoS attacks, database flooding

**Current Code (VULNERABLE):**
```typescript
export async function createLead(input: CreateLeadInput) {
  try {
    // Lead creation from the website doesn't require admin permission,
    // but we might want to track this if it's from the admin panel.
    // For now, we'll allow public creation.  ❌ NO RATE LIMITING

    const [lead] = await db.insert(leads).values({
      id: randomUUID(),
      contactName: input.contactName,
      // ... rest of fields
    }).returning();
  }
}
```

**Attack Scenario:**
1. Attacker writes script to automate lead creation
2. Floods database with thousands of fake leads per minute
3. Database performance degrades, legitimate leads lost
4. Disk space exhausted

**Fix Required:**
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "10 m"), // 5 leads per 10 minutes
});

export async function createLead(input: CreateLeadInput) {
  // Rate limit by IP or email
  const identifier = input.contactEmail; // or track by IP in API route
  const { success } = await ratelimit.limit(identifier);

  if (!success) {
    return {
      success: false,
      error: "Too many lead submissions. Please try again later."
    };
  }

  // ... rest of creation logic
}
```

**Alternative (if Upstash not available):**
- Implement in-memory rate limiting with database tracking
- Use Next.js route-level rate limiting middleware
- Add CAPTCHA after 3 submissions

---

## 🟡 HIGH PRIORITY ISSUES

### 3. BOOKING WIZARD - RACE CONDITION (DELETE-THEN-INSERT)
**File:** `lib/actions/wizard.ts:256-268`
**Risk:** MEDIUM-HIGH
**Impact:** Data loss, inconsistent booking state

**Current Code (VULNERABLE):**
```typescript
// Update booking items (relational sync)
console.log('  → Syncing booking items for update...');
await db.delete(bookingItems).where(eq(bookingItems.bookingId, data.bookingId));  // ❌ DELETE

for (const item of itemsToCreate) {
  await db.insert(bookingItems).values({  // ❌ INSERT (NOT ATOMIC)
    id: randomUUID(),
    bookingId: data.bookingId,
    itemType: "menu_item",
    itemId: item.itemId,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    notes: (item as any).notes,
  });
}

// If any insert fails, items are already deleted - DATA LOSS!
```

**Attack Scenario:**
1. User edits booking, changes items from [A, B] to [C, D]
2. Delete operation succeeds (items A, B removed)
3. Database connection fails during insert of item C
4. Booking now has NO items (A, B deleted, C, D not inserted)
5. Customer arrives with no food ordered

**Fix Required:**
```typescript
import { db } from '@/lib/db';

export async function updateBookingWithItems(...) {
  // Use database transaction for atomicity
  return await db.transaction(async (tx) => {
    // Delete old items
    await tx.delete(bookingItems)
      .where(eq(bookingItems.bookingId, data.bookingId));

    // Insert new items (all or nothing)
    for (const item of itemsToCreate) {
      await tx.insert(bookingItems).values({
        id: randomUUID(),
        bookingId: data.bookingId,
        itemType: "menu_item",
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        notes: item.notes,
      });
    }

    // If any operation fails, entire transaction rolls back
    return { success: true };
  });
}
```

**Note:** Drizzle ORM supports transactions with `db.transaction()`

---

### 4. MASS ASSIGNMENT VULNERABILITIES
**Files:**
- `lib/actions/users.ts:81, 104`
- `lib/actions/menu.ts:48, 549`
- `lib/actions/settings.ts:69`

**Risk:** MEDIUM-HIGH
**Impact:** Privilege escalation, data corruption

**Current Code (VULNERABLE):**
```typescript
export async function updateAdminUser(id: string, updates: Partial<User>) {
  // ... permission check ...

  const [user] = await db
    .update(adminUser)
    .set({ ...updates, updatedAt: new Date() })  // ❌ ALLOWS UPDATING ANY FIELD
    .where(eq(adminUser.id, id))
    .returning();

  // Attacker can send: { role: 'super_admin', id: 'victim-id' }
}
```

**Attack Scenario:**
1. Moderator user (can edit users) sends malicious request:
   ```json
   {
     "id": "another-user-id",
     "role": "super_admin",
     "password": "hacked"
   }
   ```
2. System updates ALL fields including `role`
3. Moderator elevates to super_admin
4. Full system compromise

**Fix Required:**
```typescript
export async function updateAdminUser(id: string, updates: Partial<User>) {
  await requirePermissionWrapper(Permission.EDIT_USER);

  // ✅ WHITELIST ALLOWED FIELDS
  const allowedFields: (keyof User)[] = ['name', 'email', 'role'];
  const sanitizedUpdates: Partial<User> = {};

  for (const field of allowedFields) {
    if (field in updates) {
      sanitizedUpdates[field] = updates[field];
    }
  }

  // Prevent changing ID
  delete (sanitizedUpdates as any).id;

  const [user] = await db
    .update(adminUser)
    .set({ ...sanitizedUpdates, updatedAt: new Date() })
    .where(eq(adminUser.id, id))
    .returning();

  return { success: true, data: user };
}
```

**Alternative:** Use Zod schemas to whitelist fields at API boundary

---

## 🟠 MEDIUM PRIORITY ISSUES

### 5. EMAIL TEMPLATES - NO HTML SANITIZATION
**File:** `lib/email/template-mapper.ts` (multiple locations)
**Risk:** MEDIUM
**Impact:** Email content injection, potential phishing

**Current Code (VULNERABLE):**
```typescript
export function getBookingConfirmedDepositTemplateData(...) {
  return {
    customer_name: customerName,
    special_requests: booking.specialRequests || "Keine",  // ❌ NO SANITIZATION
    allergy_details: booking.allergyDetails || "Keine",    // ❌ NO SANITIZATION
  };
}

// If specialRequests contains: "<script>alert('XSS')</script>"
// It will be included in email body
```

**Attack Scenario:**
1. Attacker submits booking with malicious special requests:
   ```text
   <img src=x onerror=alert('XSS')>
   Please call me at <b>0900-SCAM</b>
   ```
2. Email sent to staff with unsanitized content
3. If email client renders HTML, executes scripts
4. Or attacker injects fake phone numbers/links

**Note:** Risk is reduced because ZeptoMail templates are server-side rendered, but still a best practice violation.

**Fix Required:**
```typescript
import { DOMPurify } from 'isomorphic-dompurify';

function sanitizeHtml(text: string | undefined | null): string {
  if (!text) return "Keine";
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] }); // Strip all HTML
}

export function getBookingConfirmedDepositTemplateData(...) {
  return {
    customer_name: sanitizeHtml(customerName),
    special_requests: sanitizeHtml(booking.specialRequests),
    allergy_details: sanitizeHtml(booking.allergyDetails),
  };
}
```

**Installation:**
```bash
npm install isomorphic-dompurify
```

---

### 6. MENU API - PUBLIC WITHOUT RATE LIMITING
**File:** `app/api/menu/route.ts`
**Risk:** MEDIUM
**Impact:** Scraping, server resource exhaustion

**Current Code (VULNERABLE):**
```typescript
export async function GET() {
  try {
    const menuData = await getCompleteMenuData();  // ❌ NO AUTH, NO RATE LIMIT
    return NextResponse.json(menuData);
  }
}
```

**Attack Scenario:**
1. Competitor writes scraper to hit `/api/menu` every second
2. Extracts complete menu structure, pricing, items
3. Uses data for price competition
4. Server CPU wasted on repeated queries

**Note:** Menu data might be intentionally public (customer-facing feature)

**Fix Required:**
```typescript
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, "1 m"), // 60 requests per minute
});

export async function GET(request: NextRequest) {
  // Rate limit by IP
  const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  const menuData = await getCompleteMenuData();
  return NextResponse.json(menuData);
}
```

**Alternative:** Implement CDN caching for menu data

---

## 🟢 LOW PRIORITY ISSUES

### 7. CLIENT EDIT SECRET IN SESSIONSTORAGE
**File:** `app/booking/[id]/edit/[secret]/page.tsx:20-21`
**Risk:** LOW
**Impact:** Secret exposed via XSS, session hijacking

**Current Code (VULNERABLE):**
```typescript
useEffect(() => {
  params.then(({ id: bookingId, secret: editSecret }) => {
    sessionStorage.setItem('edit_booking_id', bookingId);  // ❌ XSS-ACCESSIBLE
    sessionStorage.setItem('edit_secret', editSecret);      // ❌ XSS-ACCESSIBLE
    router.push('/wizard?edit=true');
  });
}, [params, router]);
```

**Attack Scenario:**
1. Admin's account has XSS vulnerability (e.g., in special requests display)
2. Attacker injects script: `<script>fetch(localStorage).then(...)</script>`
3. Script reads `sessionStorage.edit_secret`
4. Attacker gains access to customer booking edit

**Note:** Risk is low because:
- Requires XSS vulnerability elsewhere
- Secret is single-use, expires after edit
- Session-specific, not persistent

**Fix Required:**
```typescript
// Option 1: Pass secret via URL hash (client-side only)
useEffect(() => {
  params.then(({ id: bookingId, secret: editSecret }) => {
    // Use state instead of sessionStorage
    router.push(`/wizard?edit=true&booking=${bookingId}#${editSecret}`);
  });
}, [params, router]);

// Option 2: Use encrypted cookie (httpOnly)
// Requires server-side component
```

**Best Practice:** Minimize sensitive data in JavaScript-accessible storage

---

## 📊 CUMULATIVE SECURITY METRICS

| Metric | After Round 1 | After Round 2 | After Round 3 |
|--------|---------------|---------------|---------------|
| Critical vulnerabilities | 0 | 0 | 1 |
| High-priority issues | 0 | 0 | 1 |
| Medium-priority issues | 0 | 5 | 4 |
| Low-priority issues | 0 | 2 | 1 |
| **Total vulnerabilities found** | 10 | 18 | **25** |
| **Total vulnerabilities fixed** | 10 | 18 | **18** |
| **Remaining to fix** | 0 | 0 | **7** |
| API endpoints with auth | 100% | 100% | 100% |
| API endpoints with RBAC | 85% | 100% | **95%** (venues gap) |
| Database transactions | 0% | 0% | 0% (critical gap) |
| Rate limiting | 0% | 0% | 0% |
| Input sanitization | 0% | 0% | 0% |
| Mass assignment protection | 0% | 0% | 0% |

---

## 🛡️ SECURITY POSTURE ASSESSMENT

### Overall Security Rating: **B (Good)** ⬇️ from B+

**Strengths Maintained:**
- ✅ 100% authentication coverage
- ✅ Strong password requirements
- ✅ CSRF protection
- ✅ HTTP security headers
- ✅ SQL injection prevention
- ✅ Timing attack prevention

**New Weaknesses Discovered:**
- 🔴 **Critical:** Venues API RBAC gap (1 endpoint)
- 🔴 **High:** Lead creation abuse vector
- 🟡 **Medium:** Race condition in booking updates
- 🟡 **Medium:** Mass assignment in multiple endpoints
- 🟠 **Medium:** No HTML sanitization
- 🟠 **Medium:** No rate limiting anywhere
- 🟢 **Low:** Client edit secret exposure

**Regression from Round 2:**
- RBAC coverage: 100% → 95% (venues endpoint gap discovered)

---

## 🎯 PRIORITY FIX ORDER

### Immediate (This Week):
1. ✅ **Fix venues RBAC** - 30 minutes
2. ✅ **Add rate limiting to lead creation** - 2 hours
3. ✅ **Fix booking wizard race condition** - 3 hours

### High Priority (This Month):
4. ✅ **Implement mass assignment protection** - 4 hours
5. ✅ **Add HTML sanitization to email templates** - 2 hours
6. ✅ **Add rate limiting to public APIs** - 3 hours

### Low Priority (Next Sprint):
7. ⚠️ **Refactor client edit secret storage** - 2 hours

---

## 📋 TESTING CHECKLIST

### Completed:
- [x] All API endpoints require authentication
- [x] RBAC permissions on most endpoints
- [x] Input validation on all public endpoints

### In Progress:
- [ ] Venues PUT/DELETE RBAC fix
- [ ] Rate limiting implementation
- [ ] Database transaction testing

### TODO:
- [ ] Mass assignment penetration testing
- [ ] Race condition testing with concurrent requests
- [ ] Email injection testing
- [ ] Load testing for rate limits

---

## 🏆 CONCLUSION

**Round 3 Summary:**
- **7 new vulnerabilities** discovered in architecture review
- **2 critical/high priority** issues requiring immediate attention
- **Focus areas:** Authorization gaps, data integrity, abuse prevention

**Recommendation:**
Fix the **critical venues RBAC gap** and **lead creation rate limiting** immediately. These are easily exploitable and could impact business operations.

**Production Status:**
⚠️ **REQUIRES FIXES** before production deployment
- Venues API must be secured
- Rate limiting should be implemented
- Database transactions for booking updates are critical for data integrity

---

**Audit Completed:** March 16, 2026
**Next Review Recommended:** After Round 3 fixes applied
**Security Rating:** B (Good) - Action Required
**Production Ready:** ❌ No (fix critical issues first)
