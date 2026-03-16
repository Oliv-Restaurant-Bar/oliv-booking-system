/**
 * Database-based rate limiting utility
 *
 * This provides a simple rate limiting implementation using the database
 * to track submission counts. For production, consider using Upstash Redis
 * or a dedicated rate limiting service for better performance.
 */

import { db } from "@/lib/db";
import { eq, and, gte, lt } from "drizzle-orm";

// Rate limit tracking table schema (to be added to schema.ts if needed)
// For now, we'll use a simple approach with the leads table itself

interface RateLimitResult {
  success: boolean;
  remaining?: number;
  resetAt?: Date;
  error?: string;
}

/**
 * Check rate limit for lead submissions by email
 * Limits: 5 submissions per 10 minutes per email
 */
export async function checkLeadRateLimit(email: string): Promise<RateLimitResult> {
  const WINDOW_MINUTES = 10;
  const MAX_SUBMISSIONS = 5;

  try {
    // Calculate the time window
    const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);

    // Check how many leads from this email were created in the time window
    const { leads } = await import("@/lib/db/schema");

    // Use raw SQL with neon-http compatibility
    const result = await db.execute(`
      SELECT COUNT(*) as count
      FROM leads
      WHERE contact_email = ${email}
        AND created_at >= ${windowStart.toISOString()}
    `);

    const rows = 'rows' in result ? (result.rows as any[]) : (result as any[]);
    const count = parseInt(rows[0]?.count || '0');

    if (count >= MAX_SUBMISSIONS) {
      // Rate limit exceeded
      return {
        success: false,
        error: `Too many lead submissions. Please try again later.`,
        remaining: 0,
        resetAt: new Date(Date.now() + WINDOW_MINUTES * 60 * 1000),
      };
    }

    return {
      success: true,
      remaining: MAX_SUBMISSIONS - count,
    };
  } catch (error) {
    console.error("Rate limit check error:", error);

    // Fail open - allow submission if rate limit check fails
    // This prevents rate limiting bugs from blocking legitimate users
    return {
      success: true,
      error: "Rate limit check failed, allowing submission",
    };
  }
}

/**
 * Check rate limit by IP address
 * Limits: 10 submissions per hour per IP
 */
export async function checkIPRateLimit(ip: string): Promise<RateLimitResult> {
  const WINDOW_MINUTES = 60;
  const MAX_SUBMISSIONS = 10;

  try {
    // For IP-based limiting, we'd need a separate rate_limits table
    // For now, this is a placeholder that can be implemented with a proper table

    // TODO: Implement IP-based rate limiting with dedicated table
    // CREATE TABLE rate_limits (
    //   id TEXT PRIMARY KEY,
    //   identifier TEXT NOT NULL, -- IP or email
    //   count INTEGER NOT NULL,
    //   window_start TIMESTAMP NOT NULL,
    //   created_at TIMESTAMP NOT NULL DEFAULT NOW()
    // );

    return {
      success: true,
      error: "IP rate limiting not implemented yet",
    };
  } catch (error) {
    console.error("IP rate limit check error:", error);
    return {
      success: true,
      error: "Rate limit check failed, allowing submission",
    };
  }
}

/**
 * Generic rate limiter using a dedicated table
 *
 * To use this, first create the rate_limits table:
 *
 * ```sql
 * CREATE TABLE IF NOT EXISTS rate_limits (
 *   id TEXT PRIMARY KEY,
 *   identifier TEXT NOT NULL,
 *   action TEXT NOT NULL,
 *   count INTEGER NOT NULL DEFAULT 1,
 *   window_start TIMESTAMP NOT NULL DEFAULT NOW(),
 *   created_at TIMESTAMP NOT NULL DEFAULT NOW(),
 *   updated_at TIMESTAMP NOT NULL DEFAULT NOW()
 * );
 *
 * CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_action
 *   ON rate_limits(identifier, action);
 * ```
 */
export async function checkRateLimit(params: {
  identifier: string;
  action: string;
  maxRequests: number;
  windowMinutes: number;
}): Promise<RateLimitResult> {
  const { identifier, action, maxRequests, windowMinutes } = params;

  try {
    // Check if rate_limits table exists
    const tableExists = await db.execute(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_name = 'rate_limits'
      );
    `);

    const existsRows = 'rows' in tableExists ? (tableExists.rows as any[]) : (tableExists as any[]);
    if (!existsRows[0]?.exists) {
      // Table doesn't exist yet, allow request
      return { success: true };
    }

    // Check existing rate limit record
    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000);

    const result = await db.execute(`
      SELECT count, window_start
      FROM rate_limits
      WHERE identifier = ${identifier}
        AND action = ${action}
        AND window_start >= ${windowStart.toISOString()}
      ORDER BY window_start DESC
      LIMIT 1
    `);

    const resultRows = 'rows' in result ? (result.rows as any[]) : (result as any[]);
    const record = resultRows[0];

    if (!record) {
      // First request in window, create record
      await db.execute(`
        INSERT INTO rate_limits (id, identifier, action, count, window_start)
        VALUES (${Date.now()}, ${identifier}, ${action}, 1, ${new Date().toISOString()})
      `);

      return {
        success: true,
        remaining: maxRequests - 1,
      };
    }

    if (record.count >= maxRequests) {
      // Rate limit exceeded
      return {
        success: false,
        error: `Rate limit exceeded. Please try again later.`,
        remaining: 0,
        resetAt: new Date(record.window_start.getTime() + windowMinutes * 60 * 1000),
      };
    }

    // Increment counter
    await db.execute(`
      UPDATE rate_limits
      SET count = count + 1, updated_at = NOW()
      WHERE identifier = ${identifier} AND action = ${action}
    `);

    return {
      success: true,
      remaining: maxRequests - record.count - 1,
    };
  } catch (error) {
    console.error("Rate limit check error:", error);
    return {
      success: true,
      error: "Rate limit check failed, allowing submission",
    };
  }
}
