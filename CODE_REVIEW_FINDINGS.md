# Code Review Findings

**Date:** April 1, 2026  
**Repository:** Oliv Booking System  
**Review Scope:** Comprehensive codebase audit

---

## Executive Summary

This document outlines the findings from a comprehensive code review of the Oliv Booking System. The review identified **9 issues** across critical, high, and medium priority levels that require attention to ensure security, data integrity, and code quality.

### Priority Breakdown
- **Critical:** 4 issues (fix immediately)
- **High:** 3 issues (fix within 1 week)
- **Medium:** 2 issues (fix within 2 weeks)

---

## 🔴 CRITICAL ISSUES (Fix Immediately)

### 1. SQL Injection Risk in Stats Actions

**File:** `lib/actions/stats.ts`  
**Lines:** 62-71, 112-121, 482-507, 412-432  
**Severity:** Critical

**Issue Description:**
Raw SQL queries using direct string interpolation without proper parameterization:

```typescript
const result = await db.execute(sql`
  SELECT TO_CHAR(event_date, 'MM/DD') as date
  FROM bookings
  WHERE event_date >= ${thirtyDaysAgo.toISOString()}
  GROUP BY TO_CHAR(event_date, 'MM/DD'), event_date
  ORDER BY event_date ASC
`);
```

**Why It Matters:**
While using Drizzle's `sql` template literal is better than string concatenation, it's not fully parameterized. If input validation fails or is bypassed, this could lead to SQL injection attacks.

**Recommended Fix:**
1. Ensure all inputs are properly sanitized before SQL interpolation
2. Use parameterized queries where possible
3. Add input validation for all date parameters
4. Consider using Drizzle's built-in query builders for safer queries

**Example Fix:**
```typescript
// Sanitize input before use
const sanitizedDate = validateAndSanitizeDate(thirtyDaysAgo);

// Use parameterized query
const result = await db.execute(sql`
  SELECT TO_CHAR(event_date, 'MM/DD') as date
  FROM bookings
  WHERE event_date >= ${sanitizedDate}
  GROUP BY TO_CHAR(event_date, 'MM/DD'), event_date
  ORDER BY event_date ASC
`);
```

---

### 2. Missing Authorization on Public Wizard Form

**File:** `lib/actions/wizard.ts`  
**Lines:** 47-579  
**Severity:** Critical

**Issue Description:**
The public booking wizard form submission lacks rate limiting and abuse prevention mechanisms:

```typescript
export async function submitWizardForm(data: WizardFormData)
```

**Why It Matters:**
- Can be abused for spam submissions
- Vulnerable to fake booking attacks
- Potential DoS vector through automated submissions
- No protection against automated bots

**Recommended Fix:**
1. Implement rate limiting (e.g., max 5 submissions per IP per hour)
2. Add CAPTCHA verification (Google reCAPTCHA v3 or hCaptcha)
3. Add email verification for submitted leads
4. Implement honeypot fields to detect bots
5. Add spam detection for suspicious patterns

**Example Implementation:**
```typescript
// Add rate limiting middleware
import { ratelimit } from '@/lib/rate-limit';

export async function submitWizardForm(data: WizardFormData) {
  // Rate limit check
  const rateLimitResult = await ratelimit.limit(data.email);
  if (!rateLimitResult.success) {
    return { success: false, error: "Too many submissions. Please try again later." };
  }

  // CAPTCHA verification
  if (!await verifyCaptcha(data.captchaToken)) {
    return { success: false, error: "Invalid CAPTCHA" };
  }

  // Continue with normal flow...
}
```

---

### 3. Race Condition in Booking Updates

**File:** `lib/actions/wizard.ts`  
**Lines:** 300-341  
**Severity:** Critical

**Issue Description:**
Database transaction may not handle all partial failures properly:

```typescript
await db.transaction(async (tx) => {
  await tx.update(bookings).set(updateData).where(eq(bookings.id, data.bookingId!));
  // Multiple dependent operations...
});
```

**Why It Matters:**
- If transaction rolls back partially, data becomes inconsistent
- Booking items might be updated while booking details fail
- Financial calculations could be incorrect
- Audit logs might not capture all changes

**Recommended Fix:**
1. Ensure all operations within transactions are atomic
2. Add proper error handling for transaction failures
3. Implement compensating transactions for rollback scenarios
4. Add comprehensive logging for transaction outcomes

**Example Fix:**
```typescript
try {
  await db.transaction(async (tx) => {
    // All operations must succeed or all fail
    const updatedBooking = await tx.update(bookings)
      .set(updateData)
      .where(eq(bookings.id, data.bookingId!))
      .returning();

    if (!updatedBooking[0]) {
      throw new Error("Booking not found");
    }

    // Continue with dependent operations...
    await tx.insert(bookingItems).values(...);
    await tx.insert(bookingAuditLog).values(...);
  });
} catch (error) {
  // Log transaction failure
  console.error("Transaction failed:", error);
  throw new Error("Booking update failed. Please try again.");
}
```

---

### 4. Missing Transaction for Booking Deletion

**File:** `lib/actions/bookings.ts`  
**Lines:** 1227-1261  
**Severity:** Critical

**Issue Description:**
Multiple sequential delete operations without transaction wrapper:

```typescript
await db.delete(bookingItems).where(eq(bookingItems.bookingId, bookingId));
await db.delete(bookingContactHistory).where(eq(bookingContactHistory.bookingId, bookingId));
await db.delete(bookingAuditLog).where(eq(bookingAuditLog.bookingId, bookingId));
await db.delete(bookings).where(eq(bookings.id, bookingId));
```

**Why It Matters:**
- If any deletion fails midway, orphaned data remains
- Referential integrity is violated
- Database becomes inconsistent
- Hard to clean up partial deletions

**Recommended Fix:**
Wrap all deletion operations in a single database transaction:

```typescript
await db.transaction(async (tx) => {
  // Delete in correct order (child tables first)
  await tx.delete(bookingItems).where(eq(bookingItems.bookingId, bookingId));
  await tx.delete(bookingContactHistory).where(eq(bookingContactHistory.bookingId, bookingId));
  await tx.delete(bookingAuditLog).where(eq(bookingAuditLog.bookingId, bookingId));
  
  // Delete parent record last
  const result = await tx.delete(bookings).where(eq(bookings.id, bookingId));
  
  if (!result) {
    throw new Error("Booking deletion failed");
  }
});
```

---

## 🟠 HIGH PRIORITY ISSUES (Fix Within 1 Week)

### 5. Insufficient Input Validation

**File:** `lib/actions/wizard.ts`  
**Lines:** 74-91  
**Severity:** High

**Issue Description:**
Missing validation for quantities and pricing:

```typescript
const quantity = data.itemQuantities[itemId] || 1;
const unitPrice = Number(dbItem.pricePerPerson);
```

**Why It Matters:**
- Could allow negative quantities
- Zero or negative pricing could be set
- No maximum limits to prevent abuse
- Could lead to incorrect billing and fraud

**Recommended Fix:**
Add comprehensive validation for all numeric inputs:

```typescript
// Validate quantity
const quantity = data.itemQuantities[itemId] || 1;
if (quantity < 1 || quantity > 1000) {
  throw new Error("Quantity must be between 1 and 1000");
}

// Validate pricing
const unitPrice = Number(dbItem.pricePerPerson);
if (isNaN(unitPrice) || unitPrice < 0) {
  throw new Error("Invalid unit price");
}

// Use Zod schema for validation
import { z } from 'zod';

const bookingItemSchema = z.object({
  itemId: z.string(),
  quantity: z.number().int().min(1).max(1000),
  unitPrice: z.number().nonnegative()
});
```

---

### 6. CLAUDE.md Violation - neon-http Driver Usage

**File:** `lib/actions/stats.ts`  
**Lines:** 24, 118, 169  
**Severity:** High

**Issue Description:**
Using `orderBy()` which doesn't work with neon-http driver:

```typescript
const bookingsData = await db.select()
  .from(bookings)
  .orderBy(desc(bookings.createdAt));
```

**CLAUDE.md Rule:**
> The project uses `neon-http` driver which doesn't support some Drizzle query builders. Use raw SQL for complex queries. Common operations requiring raw SQL: `orderBy()` - Use `ORDER BY` in raw SQL

**Why It Matters:**
- Code will fail at runtime with neon-http driver
- Inconsistent with project's database driver choice
- Could cause unexpected errors in production

**Recommended Fix:**
Replace with raw SQL as specified in CLAUDE.md:

```typescript
// Before (doesn't work with neon-http)
const bookingsData = await db.select()
  .from(bookings)
  .orderBy(desc(bookings.createdAt));

// After (works with neon-http)
const result = await db.execute(sql`
  SELECT * FROM bookings 
  ORDER BY created_at DESC
`);
const bookingsData = 'rows' in result ? result.rows : result;
```

---

### 7. Sensitive Data Logging

**File:** `lib/actions/bookings.ts`  
**Lines:** 176-186  
**Severity:** High

**Issue Description:**
Edit secrets logged to console:

```typescript
console.log(`Edit Link: ${bookingEditUrl}`);
console.log('Note: Client can edit until admin locks the booking');
```

**Why It Matters:**
- Edit secrets provide access to modify bookings
- Console logs may be stored in logging systems
- Security vulnerability if logs are exposed
- Violates principle of least privilege

**Recommended Fix:**
Remove or conditionally disable console logs with sensitive data:

```typescript
// Option 1: Remove completely
// console.log(`Edit Link: ${bookingEditUrl}`); // REMOVED for security

// Option 2: Conditional logging
if (process.env.NODE_ENV === 'development') {
  console.log(`Edit Link: ${bookingEditUrl}`);
}

// Option 3: Sanitized logging
console.log(`Edit Link generated for booking: ${booking.id}`);
```

---

## 🟡 MEDIUM PRIORITY ISSUES (Fix Within 2 Weeks)

### 8. Financial Calculation Type Inconsistency

**File:** `lib/actions/bookings.ts`  
**Lines:** 525-588  
**Severity:** Medium

**Issue Description:**
Mixed string/number types for currency values:

```typescript
estimatedTotal: newEstimatedTotal.toString(),
unitPrice: unitPriceStr,
```

**Why It Matters:**
- String-based financial calculations are error-prone
- Can lead to rounding errors
- Type confusion causes bugs
- Harder to maintain and debug

**Recommended Fix:**
Use consistent decimal/numeric types for all financial calculations:

```typescript
// Use a dedicated currency/decimal library
import { Decimal } from '@prisma/client/runtime/library';

// Or use a consistent number type
estimatedTotal: Number(newEstimatedTotal.toFixed(2)),
unitPrice: Number(unitPrice.toFixed(2)),

// Best: Use a proper decimal library like decimal.js
import Decimal from 'decimal.js';
const total = new Decimal(estimatedTotal).plus(new Decimal(unitPrice));
```

---

### 9. Generic Error Messages

**Files:** Multiple files throughout codebase  
**Severity:** Medium

**Issue Description:**
Generic error messages that could leak sensitive information:

```typescript
return { success: false, error: "Internal server error" };
```

**Why It Matters:**
- Could expose internal application state
- May reveal database structure
- Makes debugging harder for legitimate users
- Security risk in production

**Recommended Fix:**
Implement environment-aware error handling:

```typescript
// Development: Detailed errors
if (process.env.NODE_ENV === 'development') {
  return { 
    success: false, 
    error: error.message,
    stack: error.stack
  };
}

// Production: Generic errors
return { 
  success: false, 
  error: "An error occurred. Please try again later."
};

// Log detailed errors securely
logger.error("Booking creation failed", {
  error: error.message,
  stack: error.stack,
  userId: session.user.id,
  timestamp: new Date().toISOString()
});
```

---

## Additional Observations

### Positive Findings
The codebase demonstrates several good practices:
- ✅ Proper RBAC implementation with granular permissions
- ✅ Comprehensive Zod validation schemas
- ✅ Internationalization support (English/German)
- ✅ Audit logging for booking changes
- ✅ Session management with Better Auth
- ✅ Security headers in Next.js config

### Code Quality Notes
- Well-structured project architecture
- Good separation of concerns (actions, components, lib)
- Consistent use of TypeScript
- Proper environment variable validation

---

## Recommended Action Plan

### Week 1: Critical Security Fixes
1. Fix SQL injection risks in `lib/actions/stats.ts`
2. Add rate limiting and CAPTCHA to wizard form
3. Fix race conditions in booking updates
4. Wrap booking deletion in transaction

### Week 2: High Priority Issues
1. Add comprehensive input validation
2. Fix neon-http driver compliance issues
3. Remove sensitive data from console logs

### Week 3-4: Medium Priority Issues
1. Standardize financial calculation types
2. Implement environment-aware error handling

### Ongoing: Best Practices
1. Regular security audits
2. Code review for all database operations
3. Keep dependencies updated
4. Monitor error logs for anomalies

---

## Testing Recommendations

Before deploying fixes:
1. Run `npx tsc --noEmit` to check for TypeScript errors
2. Test all database operations with edge cases
3. Verify transaction rollbacks work correctly
4. Test rate limiting and CAPTCHA functionality
5. Validate all input sanitization
6. Check audit logs capture all changes

---

## Resources

### CLAUDE.md References
- [Main CLAUDE.md](.claude/CLAUDE.md) - Project guidelines
- [Code Style Rules](.claude/rules/code_style.md) - Reusable components preference
- [Security Rules](.claude/rules/security.md) - Validation requirements
- [Testing Rules](.claude/rules/testing.md) - Pre-completion checklist

### Database Schema
- Schema location: `lib/db/schema.ts`
- Migrations: `lib/db/migrations/`
- Seed script: `lib/db/seed.ts`

---

## Conclusion

This code review identified actionable issues that, when addressed, will significantly improve the security, reliability, and maintainability of the Oliv Booking System. The critical issues should be addressed immediately to prevent potential security vulnerabilities and data integrity problems.

The codebase shows good overall architecture and security practices. Addressing these findings will make it even more robust and production-ready.

---

**Last Updated:** April 1, 2026  
**Next Review Scheduled:** May 1, 2026
