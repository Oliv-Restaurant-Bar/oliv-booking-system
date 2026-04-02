import { sendRemindersForNext24Hours } from "@/lib/actions/reminders";
import { NextResponse } from "next/server";
import crypto from "crypto";

/**
 * API Endpoint to send reminder emails
 * Can be called by cron job services like Vercel Cron, GitHub Actions, or external services
 */
export async function GET(request: Request) {
  try {
    // ✅ SECURITY FIX: Require cron secret to be set
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("CRON_SECRET not configured - cron endpoint disabled for security");
      return NextResponse.json(
        { error: "Cron endpoint not configured. Please set CRON_SECRET environment variable." },
        { status: 503 }
      );
    }

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const expectedHeader = `Bearer ${cronSecret}`;
    const expectedBuffer = Buffer.from(expectedHeader);
    const providedBuffer = Buffer.from(authHeader);

    if (
      expectedBuffer.length !== providedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, providedBuffer)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await sendRemindersForNext24Hours();

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
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

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || !authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const expectedHeader = `Bearer ${cronSecret}`;
    const expectedBuffer = Buffer.from(expectedHeader);
    const providedBuffer = Buffer.from(authHeader);

    if (
      expectedBuffer.length !== providedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, providedBuffer)
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await sendRemindersForNext24Hours();

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
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


