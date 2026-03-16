import { NextRequest, NextResponse } from "next/server";
import { ensureBookingSecret } from "@/lib/booking-security";
import { requirePermissionWrapper } from "@/lib/auth/rbac-middleware";
import { Permission } from "@/lib/auth/rbac";

/**
 * POST /api/bookings/[id]/generate-secret
 * Generate or retrieve the edit secret for a booking (admin only)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // ✅ SECURITY FIX: Use RBAC for consistency
    await requirePermissionWrapper(Permission.EDIT_BOOKING);

    const { id } = await params;

    // Generate or retrieve the secret
    const editSecret = await ensureBookingSecret(id);

    return NextResponse.json({
      success: true,
      editSecret,
    });
  } catch (error) {
    console.error("Error generating edit secret:", error);

    // Handle authorization errors
    if (error instanceof Error && error.name === "AuthorizationError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
