import { NextRequest, NextResponse } from "next/server";
import { updateBooking, getBookingForClientEdit } from "@/lib/actions/bookings";
import { canClientEditBooking } from "@/lib/booking-security";
import type { AuditContext } from "@/lib/booking-audit";

/**
 * GET /api/booking/[id]/edit/[secret]
 * Get booking details for client edit
 * Validates secret and returns booking if valid
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; secret: string }> }
) {
  try {
    const { id, secret } = await params;

    // Get the booking with full details (lead and booking_items)
    // NO authentication required - only secret validation
    const bookingResult = await getBookingForClientEdit(id);

    if (!bookingResult.success || !bookingResult.data) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // Validate the secret (but don't check lock status for GET - allow viewing locked bookings)
    const { validateBookingSecret, isBookingLocked } = await import("@/lib/booking-security");
    const isValidSecret = await validateBookingSecret(id, secret);

    if (!isValidSecret) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired edit link" },
        { status: 403 }
      );
    }

    // Check if booking is locked
    const locked = await isBookingLocked(id);

    // Return booking with lock status (client can view but may not edit)
    return NextResponse.json({
      success: true,
      data: {
        ...bookingResult.data,
        isLocked: locked,
      },
    });
  } catch (error) {
    console.error("Error in GET /api/booking/[id]/edit/[secret]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/booking/[id]/edit/[secret]
 * Update booking (client edit)
 * Validates secret and lock status before allowing update
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; secret: string }> }
) {
  try {
    const { id, secret } = await params;
    const body = await request.json();

    console.log('\n========================================');
    console.log('📝 CLIENT BOOKING EDIT REQUEST');
    console.log('========================================');
    console.log(`Booking ID: ${id}`);
    console.log(`Update data:`, body);
    console.log('========================================\n');

    // Validate the secret and check lock status
    const canEdit = await canClientEditBooking(id, secret);

    if (!canEdit) {
      const { isBookingLocked } = await import("@/lib/booking-security");
      const locked = await isBookingLocked(id);

      if (locked) {
        return NextResponse.json(
          {
            success: false,
            error: "This booking is locked and cannot be edited. Please contact us for changes.",
            locked: true,
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { success: false, error: "Invalid or expired edit link" },
        { status: 403 }
      );
    }

    // Create audit context for client edit
    const auditContext: AuditContext = {
      actorType: "client",
      actorLabel: "Client",
      ipAddress: request.headers.get("x-forwarded-for") ||
                 request.headers.get("x-real-ip") ||
                 undefined,
      userAgent: request.headers.get("user-agent") || undefined,
    };

    // Update the booking with audit logging
    const result = await updateBooking(id, body, auditContext);

    if (!result.success) {
      console.error('❌ Failed to update booking:', result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    console.log('✅ Booking updated successfully!');
    console.log('========================================\n');

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Error in PUT /api/booking/[id]/edit/[secret]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
