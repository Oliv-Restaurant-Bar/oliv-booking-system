import { sendRemindersForNext24Hours } from "@/lib/actions/reminders";
import { NextResponse } from "next/server";

/**
 * API Endpoint to send reminder emails
 * Can be called by cron job services like Vercel Cron, GitHub Actions, or external services
 *
 * Example cron configuration:
 * - Run every hour: 0 * * * *
 * - Run every day at 9 AM: 0 9 * * *
 *
 * Security: In production, add authentication (API key, cron secret, etc.)
 */
export async function GET(request: Request) {
  try {
    // ✅ SECURITY FIX: Require cron secret to be set
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Fail securely if CRON_SECRET is not configured
    if (!cronSecret) {
      console.error("CRON_SECRET not configured - cron endpoint disabled for security");
      return NextResponse.json(
        { error: "Cron endpoint not configured. Please set CRON_SECRET environment variable." },
        { status: 503 } // Service Unavailable
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Optional: IP whitelist for additional security
    const allowedIPs = process.env.CRON_ALLOWED_IPS?.split(',').map(ip => ip.trim()) || [];
    if (allowedIPs.length > 0) {
      const ip = request.headers.get("x-forwarded-for")?.split(',')[0].trim() ||
                 request.headers.get("x-real-ip") ||
                 "unknown";
      if (!allowedIPs.includes(ip) && ip !== "unknown") {
        console.warn(`Cron endpoint access denied from IP: ${ip}`);
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const result = await sendRemindersForNext24Hours();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Reminders sent successfully",
      data: result.data,
    });
  } catch (error: any) {
    console.error("Error in cron endpoint:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST endpoint for manual triggering
 */
export async function POST(request: Request) {
  try {
    // ✅ SECURITY FIX: Require cron secret for manual triggers too
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("CRON_SECRET not configured - cron endpoint disabled for security");
      return NextResponse.json(
        { error: "Cron endpoint not configured. Please set CRON_SECRET environment variable." },
        { status: 503 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await sendRemindersForNext24Hours();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Reminders sent successfully",
      data: result.data,
    });
  } catch (error: any) {
    console.error("Error in manual reminder trigger:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
