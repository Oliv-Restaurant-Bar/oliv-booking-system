import { NextRequest, NextResponse } from "next/server";
import { getBookings } from "@/lib/actions/bookings";
import { requirePermissionWrapper } from "@/lib/auth/rbac-middleware";
import { Permission } from "@/lib/auth/rbac";

export async function GET(request: NextRequest) {
  try {
    // Require authentication and permission
    await requirePermissionWrapper(Permission.VIEW_BOOKINGS);

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");

    const result = await getBookings(status ? { status } : undefined);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ data: result.data });
  } catch (error) {
    console.error("Error fetching bookings:", error);

    // Handle authorization errors
    if (error instanceof Error && error.name === "AuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }

    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
