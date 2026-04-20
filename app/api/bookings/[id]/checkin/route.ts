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
  vegan_count: z.number().nullable(),
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
        veganCount: validatedData.vegan_count,
        nonVegetarianCount: validatedData.non_vegetarian_count,
        menuChanges: validatedData.menu_changes,
        additionalDetails: validatedData.additional_details,
        submittedAt: new Date(),
      })
      .returning();

    // Send notification emails to admins and assigned user
    try {
      const { sendCheckinSubmittedNotification } = await import("@/lib/actions/email");
      const { adminUser, leads } = await import("@/lib/db/schema");
      const { or } = await import("drizzle-orm");

      // Get booking details with lead info
      const [bookingWithLead] = await db
        .select()
        .from(bookings)
        .where(eq(bookings.id, id))
        .leftJoin(leads, eq(bookings.leadId, leads.id))
        .limit(1);

      if (bookingWithLead) {
        // Find admins and super admins
        const admins = await db
          .select()
          .from(adminUser)
          .where(or(eq(adminUser.role, "admin"), eq(adminUser.role, "super_admin")));

        const adminEmails = admins.map(a => a.email);
        
        // Find assigned user email
        if (bookingWithLead.bookings.assignedTo) {
          const [assignedUser] = await db
            .select()
            .from(adminUser)
            .where(eq(adminUser.id, bookingWithLead.bookings.assignedTo))
            .limit(1);
          
          if (assignedUser && !adminEmails.includes(assignedUser.email)) {
            adminEmails.push(assignedUser.email);
          }
        }

        // Send unique emails to everyone
        const uniqueRecipients = [...new Set(adminEmails)];
        
        const bookingData = {
          ...bookingWithLead.bookings,
          lead: bookingWithLead.leads
        };

        await Promise.allSettled(
          uniqueRecipients.map(recipientEmail => 
            sendCheckinSubmittedNotification({
              bookingId: id,
              recipientEmail,
              bookingData,
              hasChanges: validatedData.has_changes,
              guestCountChanged: validatedData.guest_count_changed,
              newGuestCount: validatedData.new_guest_count ?? undefined,
              vegetarianCount: validatedData.vegetarian_count ?? undefined,
              nonVegetarianCount: validatedData.non_vegetarian_count ?? undefined,
              menuChanges: validatedData.menu_changes ?? undefined,
              additionalDetails: validatedData.additional_details ?? undefined,
            })
          )
        );
      }
    } catch (emailError) {
      console.error("Error sending checkin notifications:", emailError);
      // Don't fail the response if email fails
    }

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
