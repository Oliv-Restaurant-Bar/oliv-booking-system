'use server';

import { db } from "@/lib/db";
import { bookings, bookingItems, bookingContactHistory, emailLogs } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export interface CreateBookingInput {
  leadId?: string;
  eventDate: Date;
  eventTime: string;
  guestCount: number;
  allergyDetails?: string[];
  specialRequests?: string;
  estimatedTotal?: number;
  requiresDeposit?: boolean;
  internalNotes?: string;
}

export async function createBooking(input: CreateBookingInput) {
  try {
    // @ts-ignore - Drizzle ORM type compatibility issue
    const [booking] = await db.insert(bookings).values({
        leadId: input.leadId,
        eventDate: input.eventDate,
        eventTime: input.eventTime,
        guestCount: input.guestCount,
        allergyDetails: input.allergyDetails || [],
        specialRequests: input.specialRequests,
        estimatedTotal: input.estimatedTotal?.toString(),
        requiresDeposit: input.requiresDeposit || false,
        status: "pending",
        internalNotes: input.internalNotes,
      })
      .returning();

    revalidatePath("/admin/bookings");

    return { success: true, data: booking };
  } catch (error) {
    console.error("Error creating booking:", error);
    return { success: false, error: "Failed to create booking" };
  }
}

export async function convertLeadToBooking(leadId: string, bookingData: CreateBookingInput) {
  try {
    // First, create the booking
    const result = await createBooking({
      ...bookingData,
      leadId,
    });

    if (!result.success) {
      return result;
    }

    // Update lead status to converted
    await db
      .update(bookings)
      .set({ leadId })
      .where(eq(bookings.id, result.data!.id));

    revalidatePath("/admin/bookings");
    revalidatePath("/admin/leads");

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error converting lead to booking:", error);
    return { success: false, error: "Failed to convert lead to booking" };
  }
}

export async function updateBookingStatus(id: string, status: typeof bookings.$inferInsert.status) {
  try {
    const [booking] = await db
      .update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();

    revalidatePath("/admin/bookings");

    return { success: true, data: booking };
  } catch (error) {
    console.error("Error updating booking status:", error);
    return { success: false, error: "Failed to update booking status" };
  }
}

export async function updateBooking(id: string, updates: Partial<CreateBookingInput>) {
  try {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (updates.eventDate !== undefined) updateData.eventDate = updates.eventDate;
    if (updates.eventTime !== undefined) updateData.eventTime = updates.eventTime;
    if (updates.guestCount !== undefined) updateData.guestCount = updates.guestCount;
    if (updates.allergyDetails !== undefined) updateData.allergyDetails = updates.allergyDetails;
    if (updates.specialRequests !== undefined) updateData.specialRequests = updates.specialRequests;
    if (updates.estimatedTotal !== undefined) updateData.estimatedTotal = updates.estimatedTotal.toString();
    if (updates.requiresDeposit !== undefined) updateData.requiresDeposit = updates.requiresDeposit;
    if (updates.internalNotes !== undefined) updateData.internalNotes = updates.internalNotes;

    const [booking] = await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, id))
      .returning();

    revalidatePath("/admin/bookings");

    return { success: true, data: booking };
  } catch (error) {
    console.error("Error updating booking:", error);
    return { success: false, error: "Failed to update booking" };
  }
}

export async function getBookings(filters?: { status?: string }) {
  try {
    let query: any = db.select().from(bookings);

    if (filters?.status) {
      query = query.where(eq(bookings.status, filters.status as any));
    }

    // @ts-ignore - neon-http driver type limitation
    const bookingsData = await query.orderBy(bookings.createdAt);

    return { success: true, data: bookingsData };
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return { success: false, error: "Failed to fetch bookings", data: [] };
  }
}

export async function getBookingById(id: string) {
  try {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);

    if (!booking) {
      return { success: false, error: "Booking not found", data: null };
    }

    return { success: true, data: booking };
  } catch (error) {
    console.error("Error fetching booking:", error);
    return { success: false, error: "Failed to fetch booking", data: null };
  }
}

export async function addBookingItem(input: {
  bookingId: string;
  itemType: "menu_item" | "addon";
  itemId: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}) {
  try {
    const [item] = await db
      .insert(bookingItems)
      .values({
        bookingId: input.bookingId,
        itemType: input.itemType,
        itemId: input.itemId,
        quantity: input.quantity,
        unitPrice: input.unitPrice.toString(),
        notes: input.notes,
      })
      .returning();

    revalidatePath("/admin/bookings");

    return { success: true, data: item };
  } catch (error) {
    console.error("Error adding booking item:", error);
    return { success: false, error: "Failed to add booking item" };
  }
}

export async function getBookingItems(bookingId: string) {
  try {
    const items = await db
      .select()
      .from(bookingItems)
      .where(eq(bookingItems.bookingId, bookingId));

    return { success: true, data: items };
  } catch (error) {
    console.error("Error fetching booking items:", error);
    return { success: false, error: "Failed to fetch booking items", data: [] };
  }
}

export async function logContactHistory(input: {
  bookingId: string;
  adminUserId: string;
  contactType: "email" | "phone" | "in_person" | "other";
  subject: string;
  content: string;
  isReminder?: boolean;
}) {
  try {
    const [log] = await db
      .insert(bookingContactHistory)
      .values({
        id: randomUUID(),
        ...input,
      })
      .returning();

    revalidatePath("/admin/bookings");

    return { success: true, data: log };
  } catch (error) {
    console.error("Error logging contact history:", error);
    return { success: false, error: "Failed to log contact history" };
  }
}

export async function getBookingContactHistory(bookingId: string) {
  try {
    const history = await db
      .select()
      .from(bookingContactHistory)
      .where(eq(bookingContactHistory.bookingId, bookingId))
      .orderBy(bookingContactHistory.createdAt);

    return { success: true, data: history };
  } catch (error) {
    console.error("Error fetching contact history:", error);
    return { success: false, error: "Failed to fetch contact history", data: [] };
  }
}
