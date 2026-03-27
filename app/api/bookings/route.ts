import { fetchBookings } from "@/lib/actions/fetch-bookings";
import { NextResponse } from "next/server";
import { requirePermissionWrapper } from "@/lib/auth/rbac-middleware";
import { Permission, AuthorizationError } from "@/lib/auth/rbac";

/**
 * GET /api/bookings
 * Fetch bookings with pagination and filtering (requires authentication)
 */
export async function GET(request: Request) {
  try {
    // REQUIRE AUTHENTICATION AND PERMISSION
    await requirePermissionWrapper(Permission.VIEW_BOOKINGS);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'All Status';
    const sort = searchParams.get('sort') || 'created_at';

    // Validate pagination parameters
    if (page < 1 || page > 10000) {
      return NextResponse.json(
        { error: 'Invalid page number' },
        { status: 400 }
      );
    }

    if (limit < 1 || limit > 1000) {
      return NextResponse.json(
        { error: 'Invalid limit value (max 1000)' },
        { status: 400 }
      );
    }

    const result = await fetchBookings({
      page,
      limit,
      searchQuery: search,
      status,
      sort: sort as 'created_at' | 'event_date'
    });

    // Explicitly set headers to ensure JSON response
    return NextResponse.json(result, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("Error in bookings API:", error);

    // Handle authorization errors
    if (error instanceof AuthorizationError) {
      return NextResponse.json(
        { error: error.message },
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Handle authentication errors (regular Error)
    if (error instanceof Error && error.message.includes("Authentication required")) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Handle other errors
    return NextResponse.json({
      bookings: [],
      totalCount: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    }, {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
