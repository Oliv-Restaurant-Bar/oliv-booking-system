import { fetchBookings } from "@/lib/actions/fetch-bookings";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'All Status';
    const sort = searchParams.get('sort') || 'created_at';

    const result = await fetchBookings({
      page,
      limit,
      searchQuery: search,
      status,
      sort: sort as 'created_at' | 'event_date'
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in bookings API:", error);
    return NextResponse.json({
      bookings: [],
      totalCount: 0,
      page: 1,
      limit: 10,
      totalPages: 0
    }, { status: 500 });
  }
}
