import { NextRequest, NextResponse } from "next/server";
import { updateBooking } from "@/lib/actions/bookings";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const result = await updateBooking(id, body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, data: result.data });
  } catch (error) {
    console.error("Error in PUT /api/bookings/[id]:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
