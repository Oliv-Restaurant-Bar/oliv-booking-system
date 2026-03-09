import { NextRequest, NextResponse } from "next/server";
import { logContactHistory, getBookingContactHistory } from "@/lib/actions/bookings";
import { requireAuth } from "@/lib/auth/server";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await requireAuth();
        if (!session?.user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const { action, type } = await request.json();

        if (!action) {
            return NextResponse.json({ success: false, error: "Comment content is required" }, { status: 400 });
        }

        const isSystem = type === 'system';

        const result = await logContactHistory({
            bookingId: id,
            adminUserId: session.user.id,
            contactType: "other",
            subject: isSystem ? "System Log" : "Manual Comment",
            content: action,
        });

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }

        return NextResponse.json({ success: true, data: result.data });
    } catch (error) {
        console.error("Error in POST /api/bookings/[id]/comments:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await requireAuth();
        if (!session?.user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;
        const result = await getBookingContactHistory(id);

        if (!result.success) {
            return NextResponse.json({ success: false, error: result.error }, { status: 500 });
        }

        // Map DB history to frontend comment format
        const formattedComments = result.data.map(log => ({
            by: log.subject.includes("Manual Comment") ? "Admin" : "System",
            time: new Date(log.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
            date: new Date(log.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
            action: log.content,
            type: log.subject.includes("Manual Comment") ? "manual" : "system"
        }));

        return NextResponse.json({ success: true, data: formattedComments });
    } catch (error) {
        console.error("Error in GET /api/bookings/[id]/comments:", error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
