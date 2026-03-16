import { NextRequest, NextResponse } from 'next/server';
import { updateBookingStatus } from '@/lib/actions/fetch-bookings';
import { requirePermissionWrapper } from "@/lib/auth/rbac-middleware";
import { Permission } from "@/lib/auth/rbac";
import { z } from 'zod';

// Validation schema
const updateStatusSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID format'),
  status: z.enum(['new', 'touchbase', 'pending', 'confirmed', 'completed', 'cancelled', 'no_show', 'declined'], {
    errorMap: () => ({ message: 'Invalid status value' })
  }),
});

/**
 * POST /api/bookings/update-status
 * Update booking status (requires authentication and permission)
 */
export async function POST(request: NextRequest) {
  try {
    // REQUIRE AUTHENTICATION AND PERMISSION
    await requirePermissionWrapper(Permission.UPDATE_BOOKING_STATUS);

    const body = await request.json();

    // VALIDATE INPUT
    const { bookingId, status } = updateStatusSchema.parse(body);

    const result = await updateBookingStatus(bookingId, status);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: result.error || 'Failed to update status' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error updating booking status:', error);

    // Handle authorization errors
    if (error instanceof Error && error.name === "AuthorizationError") {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
