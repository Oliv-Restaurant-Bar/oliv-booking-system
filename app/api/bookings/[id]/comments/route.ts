import { NextRequest, NextResponse } from "next/server";
import { logContactHistory, getBookingContactHistory } from "@/lib/actions/bookings";
import { requireAuth } from "@/lib/auth/server";
import { requirePermissionWrapper } from "@/lib/auth/rbac-middleware";
import { Permission } from "@/lib/auth/rbac";
import { z } from 'zod';

// Validation schema
const commentSchema = z.object({
  action: z.string().min(1, 'Comment cannot be empty').max(1000, 'Comment too long'),
  type: z.enum(['system', 'manual']).optional(),
});

/**
 * POST /api/bookings/[id]/comments
 * Add a comment to booking contact history
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // REQUIRE PERMISSION
        await requirePermissionWrapper(Permission.VIEW_BOOKING_DETAILS);

        const { id } = await params;
        const { action, type } = await request.json();

        // Validate input
        const { action: validatedAction, type: validatedType } = commentSchema.parse({
            action,
            type: type || 'manual'
        });

        // Get user info
        const { getCurrentUser } = await import("@/lib/auth/rbac-middleware");
        const session = await getCurrentUser();

        if (!session?.user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const isSystem = validatedType === 'system';

        const result = await logContactHistory({
            bookingId: id,
            adminUserId: session.user.id,
            contactType: "other",
            subject: isSystem ? "System Log" : "Manual Comment",
            content: validatedAction,
        });

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: result.data });
    } catch (error) {
        console.error("Error in POST /api/bookings/[id]/comments:", error);

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

        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

/**
 * GET /api/bookings/[id]/comments
 * Get booking contact history
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // REQUIRE PERMISSION
        await requirePermissionWrapper(Permission.VIEW_BOOKING_DETAILS);

        const { id } = await params;
        const result = await getBookingContactHistory(id);

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }

        // Map DB history to frontend comment format
        const comments = (result.data || []).map((log: any) => ({
            id: log.id,
            by: log.adminUserName || 'System',
            time: new Date(log.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            date: new Date(log.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            action: log.content,
            type: log.subject === "System Log" ? "system" : "manual"
        }));

        return NextResponse.json({ success: true, data: comments });
    } catch (error) {
        console.error("Error in GET /api/bookings/[id]/comments:", error);

        // Handle authorization errors
        if (error instanceof Error && error.name === "AuthorizationError") {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 403 }
            );
        }

        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
