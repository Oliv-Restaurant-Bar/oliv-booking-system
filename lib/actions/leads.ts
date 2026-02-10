'use server';

import { db } from "@/lib/db";
import { leads, bookings, bookingItems, menuItems, addons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export interface CreateLeadInput {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  eventDate: Date;
  eventTime: string;
  guestCount: number;
  source?: string;
}

export async function createLead(input: CreateLeadInput) {
  try {
    // @ts-ignore - Drizzle ORM type compatibility issue
    const [lead] = await db.insert(leads).values({
        id: randomUUID(),
        contactName: input.contactName,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
        eventDate: input.eventDate,
        eventTime: input.eventTime,
        guestCount: input.guestCount,
        source: input.source || "website",
        status: "new",
      })
      .returning();

    revalidatePath("/admin/bookings");
    revalidatePath("/admin/leads");

    return { success: true, data: lead };
  } catch (error) {
    console.error("Error creating lead:", error);
    return { success: false, error: "Failed to create lead" };
  }
}

export async function updateLeadStatus(id: string, status: typeof leads.$inferInsert.status) {
  try {
    const [lead] = await db
      .update(leads)
      .set({ status, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();

    revalidatePath("/admin/bookings");
    revalidatePath("/admin/leads");

    return { success: true, data: lead };
  } catch (error) {
    console.error("Error updating lead status:", error);
    return { success: false, error: "Failed to update lead status" };
  }
}

export async function getLeads(filters?: { status?: string }) {
  try {
    let query = db.select().from(leads);

    if (filters?.status) {
      query = query.where(eq(leads.status, filters.status as any));
    }

    // @ts-ignore - neon-http driver type limitation
    const leadsData = await (query as any).orderBy(leads.createdAt);

    return { success: true, data: leadsData };
  } catch (error) {
    console.error("Error fetching leads:", error);
    return { success: false, error: "Failed to fetch leads", data: [] };
  }
}

export async function getLeadById(id: string) {
  try {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);

    if (!lead) {
      return { success: false, error: "Lead not found", data: null };
    }

    return { success: true, data: lead };
  } catch (error) {
    console.error("Error fetching lead:", error);
    return { success: false, error: "Failed to fetch lead", data: null };
  }
}
