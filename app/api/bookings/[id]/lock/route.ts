import { NextRequest, NextResponse } from "next/server";
import { lockBooking, unlockBooking } from "@/lib/actions/bookings";
import { getBookingById } from "@/lib/actions/bookings";
import { requirePermissionWrapper } from "@/lib/auth/rbac-middleware";
import { Permission } from "@/lib/auth/rbac";
import { z } from 'zod';

// Validation schema
const lockActionSchema = z.object({
  action: z.enum(['lock', 'unlock'], {
    errorMap: () => ({ message: "Action must be 'lock' or 'unlock'" })
  }),
});

/**
 * POST /api/bookings/[id]/lock
 * Lock or unlock a booking (requires EDIT_BOOKING permission)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // REQUIRE PROPER PERMISSION USING RBAC SYSTEM
    await requirePermissionWrapper(Permission.EDIT_BOOKING);

    const { id } = await params;
    const body = await request.json();
    const { action } = lockActionSchema.parse(body);

    // Verify booking exists
    const bookingResult = await getBookingById(id);
    if (!bookingResult.success || !bookingResult.data) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // Get user info from session
    const { getCurrentUser } = await import("@/lib/auth/rbac-middleware");
    const session = await getCurrentUser();
    const adminUserId = session?.user?.id || "unknown";
    const adminUserName = session?.user?.name || "Admin";

    // Lock or unlock the booking
    let result;
    if (action === "lock") {
      result = await lockBooking(id, adminUserId, adminUserName);
    } else {
      result = await unlockBooking(id, adminUserId, adminUserName);
    }

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        action,
        booking: result.data,
      },
    });
  } catch (error) {
    console.error("Error in POST /api/bookings/[id]/lock:", error);

    // Handle authorization errors
    if (error instanceof Error && error.name === "AuthorizationError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 403 }
      );
    }

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
