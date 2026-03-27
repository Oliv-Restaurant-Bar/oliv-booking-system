import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookingCheckins, bookings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const checkinSchema = z.object({
  booking_id: z.string().uuid(),
  has_changes: z.boolean(),
  guest_count_changed: z.boolean(),
  new_guest_count: z.number().nullable(),
  vegetarian_count: z.number().nullable(),
  non_vegetarian_count: z.number().nullable(),
  menu_changes: z.string().nullable(),
  additional_details: z.string().nullable(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Validate the incoming data
    const validatedData = checkinSchema.parse(body);

    // Verify the booking exists
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .limit(1);

    if (!booking) {
      return NextResponse.json(
        { success: false, error: "Booking not found" },
        { status: 404 }
      );
    }

    // Insert the check-in record
    const [insertedRecord] = await db
      .insert(bookingCheckins)
      .values({
        bookingId: id,
        hasChanges: validatedData.has_changes,
        guestCountChanged: validatedData.guest_count_changed,
        newGuestCount: validatedData.new_guest_count,
        vegetarianCount: validatedData.vegetarian_count,
        nonVegetarianCount: validatedData.non_vegetarian_count,
        menuChanges: validatedData.menu_changes,
        additionalDetails: validatedData.additional_details,
        submittedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      message: "Check-in submitted successfully",
      record: insertedRecord,
    });
  } catch (error) {
    console.error("Error in POST /api/bookings/[id]/checkin:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "Invalid data format", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
