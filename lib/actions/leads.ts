'use server';

import { db } from "@/lib/db";
import { leads, bookings, bookingItems, menuItems, addons } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { requirePermissionWrapper } from "@/lib/auth/rbac-middleware";
import { Permission } from "@/lib/auth/rbac";

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
    // Lead creation from the website doesn't require admin permission,
    // but we might want to track this if it's from the admin panel.
    // For now, we'll allow public creation.

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
    // Require EDIT_LEAD permission
    await requirePermissionWrapper(Permission.EDIT_LEAD);

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

export async function deleteLead(id: string) {
  try {
    // Require DELETE_LEAD permission
    await requirePermissionWrapper(Permission.DELETE_LEAD);

    await db.delete(leads).where(eq(leads.id, id));

    revalidatePath("/admin/bookings");
    revalidatePath("/admin/leads");

    return { success: true };
  } catch (error) {
    console.error("Error deleting lead:", error);
    return { success: false, error: "Failed to delete lead" };
  }
}

export async function getLeads(filters?: { status?: string }) {
  try {
    // Require VIEW_LEADS permission
    await requirePermissionWrapper(Permission.VIEW_LEADS);

    let query = db.select().from(leads);

    if (filters?.status) {
      // @ts-ignore - neon-http driver type limitation
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
    // Require VIEW_LEADS permission
    await requirePermissionWrapper(Permission.VIEW_LEADS);

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
