'use server';

import { db } from "@/lib/db";
import { bookings, bookingItems, bookingContactHistory, emailLogs, leads, menuItems, adminUser, bookingAuditLog, bookingCheckins } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import {
  sendAssignmentNotification,
  sendThankYouEmail,
  sendBookingConfirmation,
  sendBookingCancellation,
  sendBookingCompletion,
  sendBookingDeclined,
  sendBookingNoShow,
  sendBookingReminder,
  sendUnlockGrantedEmail,
  sendUnlockDeclinedEmail,
} from "@/lib/actions/email";
import {
  calculateBookingChanges,
  logBookingChange,
  type AuditContext,
  type FieldChange,
} from "@/lib/booking-audit";
import { ensureBookingSecret } from "@/lib/booking-security";
import { requirePermissionWrapper } from "@/lib/auth/rbac-middleware";
import { Permission, AuthorizationError } from "@/lib/auth/rbac";

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
  location?: string;
  assignedTo?: string;
  kitchenNotes?: string;
  billingAddress?: string;
  room?: string;
}

/**
 * Helper to parse business, occupation and address from internalNotes field
 */
function parseInternalNotes(notes: string | null) {
  let businessName = '';
  let occasion = '';
  let street = '';
  let plz = '';
  let location = '';
  let reference = '';
  let billingReference = '';

  if (notes) {
    const lines = notes.split('\n');
    for (const line of lines) {
      if (line.startsWith('Business: ')) {
        businessName = line.replace('Business: ', '').replace('N/A', '').trim();
      } else if (line.startsWith('Occasion: ')) {
        occasion = line.replace('Occasion: ', '').replace('N/A', '').trim();
      } else if (line.startsWith('Reference: ')) {
        reference = line.replace('Reference: ', '').replace('N/A', '').trim();
      } else if (line.startsWith('Billing Reference: ')) {
        billingReference = line.replace('Billing Reference: ', '').replace('N/A', '').trim();
      } else if (line.startsWith('Address: ')) {
        const address = line.replace('Address: ', '').replace('N/A', '').trim();
        if (!address) continue;

        const addressParts = address.split(',').map(s => s.trim());

        if (addressParts.length >= 3) {
          // Format: Street, PLZ, Location
          street = addressParts[0];
          plz = addressParts[1];
          location = addressParts.slice(2).join(', ');
        } else if (addressParts.length === 2) {
          // Format: Street, PLZ Location OR PLZ, Ort
          const part1 = addressParts[0];
          const part2 = addressParts[1];

          // Check if first part is exactly a PLZ
          const firstPartPlzMatch = part1.match(/^(\d{4,5})$/);
          if (firstPartPlzMatch) {
            plz = part1;
            location = part2;
          } else {
            street = part1;
            // Try to split second part into PLZ and Location
            const plzMatch = part2.match(/^(\d{4,5})\s+(.+)$/);
            if (plzMatch) {
              plz = plzMatch[1];
              location = plzMatch[2];
            } else {
              location = part2;
            }
          }
        } else if (addressParts.length === 1) {
          // Check if it's just a PLZ ORT
          const plzMatch = addressParts[0].match(/^(\d{4,5})\s+(.+)$/);
          if (plzMatch) {
            plz = plzMatch[1];
            location = plzMatch[2];
          } else {
            street = addressParts[0];
          }
        }
      }
    }
  }

  return { businessName, occasion, street, plz, location, reference, billingReference };
}

export async function createBooking(input: CreateBookingInput & { leadEmail?: string; leadName?: string }) {
  try {
    // Require CREATE_BOOKING permission
    await requirePermissionWrapper(Permission.CREATE_BOOKING);

    // Additional permission check for assigning staff to bookings
    // Only super_admin with MANAGE_USERS permission can assign staff
    if (input.assignedTo !== undefined) {
      await requirePermissionWrapper(Permission.MANAGE_USERS);
    }

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
      status: "new",
      location: input.location,
      internalNotes: input.internalNotes,
      assignedTo: input.assignedTo,
      isLocked: false, // Bookings are unlocked by default - admin can lock to prevent client edits
    })
      .returning();

    // Generate edit secret for the booking
    const editSecret = await ensureBookingSecret(booking.id);

    // Log edit link to console (for development/testing when emails are disabled)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://oliv-restaurant.ch";
    const bookingEditUrl = `${baseUrl}/booking/${booking.id}/edit/${editSecret}`;
    console.log('\n========================================');
    console.log('📧 BOOKING EDIT LINK (EMAIL)');
    console.log('========================================');
    console.log(`To: ${input.leadEmail || 'No email provided'}`);
    console.log(`Booking ID: ${booking.id}`);
    console.log(`Status: UNLOCKED (by default)`);
    console.log(`Edit Link: ${bookingEditUrl}`);
    console.log(`Note: Client can edit until admin locks the booking`);
    console.log('========================================\n');

    // Send confirmation email if lead email is provided
    if (input.leadEmail && !(input as any).skipEmail) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://oliv-restaurant.ch";

      await sendThankYouEmail({
        bookingId: booking.id,
        recipientEmail: input.leadEmail,
        bookingData: {
          ...booking,
          lead: input.leadName && input.leadEmail ? {
            id: crypto.randomUUID(),
            contactName: input.leadName,
            contactEmail: input.leadEmail,
            contactPhone: "",
            eventDate: input.eventDate instanceof Date ? input.eventDate.toISOString() : input.eventDate,
            eventTime: input.eventTime,
            guestCount: input.guestCount,
            source: "booking",
            status: "converted",
            room: null,
            createdAt: new Date(),
            updatedAt: new Date(),
          } : null,
        },
        estimatedTotal: input.estimatedTotal,
        bookingEditUrl: `${baseUrl}/booking/${booking.id}/edit/${editSecret}`,
      });
    }

    revalidatePath("/admin/bookings");

    // SECURITY: Never return editSecret in API responses
    // It should only be sent via email
    const { editSecret: _, ...safeBookingData } = booking;
    return { success: true, data: safeBookingData };
  } catch (error) {
    console.error("Error creating booking:", error);
    return { success: false, error: "Failed to create booking" };
  }
}

export async function convertLeadToBooking(leadId: string, bookingData: CreateBookingInput) {
  try {
    // Require CONVERT_LEAD_TO_BOOKING permission
    await requirePermissionWrapper(Permission.CONVERT_LEAD_TO_BOOKING);

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

export async function updateBookingStatus(
  id: string,
  status: typeof bookings.$inferInsert.status,
  options?: {
    skipEmail?: boolean;
    reason?: string;
  }
) {
  try {
    // Require UPDATE_BOOKING_STATUS permission
    await requirePermissionWrapper(Permission.UPDATE_BOOKING_STATUS);

    // Get current booking with lead information
    const [currentBooking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .leftJoin(leads, eq(bookings.leadId, leads.id))
      .limit(1);

    if (!currentBooking) {
      return { success: false, error: "Booking not found" };
    }

    const bookingData = currentBooking.bookings;
    const leadData = currentBooking.leads;

    // Update booking status
    const [updatedBooking] = await db
      .update(bookings)
      .set({ status, updatedAt: new Date() })
      .where(eq(bookings.id, id))
      .returning();

    // Send email based on status change (unless skipEmail is true)
    if (!options?.skipEmail && leadData?.contactEmail) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://oliv-restaurant.ch";

      // Ensure booking has an edit secret
      const editSecret = await ensureBookingSecret(id);

      // Log edit link to console (for development/testing when emails are disabled)
      const bookingEditUrl = `${baseUrl}/booking/${id}/edit/${editSecret}`;
      console.log('\n========================================');
      console.log(`📧 ${(status || 'confirmation').toUpperCase()} EMAIL WITH EDIT LINK`);
      console.log('========================================');
      console.log(`To: ${leadData.contactEmail}`);
      console.log(`Booking ID: ${id}`);
      console.log(`Status: ${status}`);
      console.log(`Edit Link: ${bookingEditUrl}`);
      console.log('========================================\n');

      switch (status) {
        case "confirmed":
          await sendBookingConfirmation({
            bookingId: id,
            recipientEmail: leadData.contactEmail,
            bookingData: { ...bookingData, lead: leadData },
            estimatedTotal: bookingData.estimatedTotal
              ? parseFloat(bookingData.estimatedTotal)
              : undefined,
            bookingEditUrl: `${baseUrl}/booking/${id}/edit/${editSecret}`,
          });
          break;

        case "cancelled":
          await sendBookingCancellation({
            bookingId: id,
            recipientEmail: leadData.contactEmail,
            bookingData: { ...bookingData, lead: leadData },
            reason: options?.reason,
          });
          break;

        case "completed":
          await sendBookingCompletion({
            bookingId: id,
            recipientEmail: leadData.contactEmail,
            bookingData: { ...bookingData, lead: leadData },
            feedbackUrl: `${baseUrl}/feedback/${id}`,
            rebookingUrl: `${baseUrl}/booking`,
          });
          break;

        case "no_show":
          await sendBookingNoShow({
            bookingId: id,
            recipientEmail: leadData.contactEmail,
            bookingData: { ...bookingData, lead: leadData },
          });
          break;

        case "declined":
          await sendBookingDeclined({
            bookingId: id,
            recipientEmail: leadData.contactEmail,
            bookingData: { ...bookingData, lead: leadData },
            reason: options?.reason,
          });
          break;

        case "new":
        case "pending":
          // No email for new/pending status (usually initial state)
          break;
      }
    }

    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${id}`);

    return { success: true, data: updatedBooking };
  } catch (error) {
    console.error("Error updating booking status:", error);
    return { success: false, error: "Failed to update booking status" };
  }
}

export async function updateBooking(
  id: string,
  updates: Partial<CreateBookingInput>,
  auditContext?: AuditContext
) {
  try {
    // Only require EDIT_BOOKING permission for admin edits
    // Client edits (actorType: "client") are allowed without authentication
    if (auditContext?.actorType !== "client") {
      await requirePermissionWrapper(Permission.EDIT_BOOKING);

      // Additional permission check for assigning staff to bookings
      // Only super_admin with MANAGE_USERS permission can assign staff
      if (updates.assignedTo !== undefined) {
        await requirePermissionWrapper(Permission.MANAGE_USERS);
      }
    }

    console.log('\n========================================');
    console.log('🔄 UPDATE BOOKING FUNCTION START');
    console.log('========================================');
    console.log(`📋 Booking ID to UPDATE: ${id}`);
    console.log('📝 Updates requested:', JSON.stringify(updates, null, 2));
    console.log('👤 Actor:', auditContext?.actorLabel || 'Unknown');

    // Get current booking for change detection
    const [currentBooking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .limit(1);

    if (!currentBooking) {
      console.error('❌ ERROR: Booking not found with ID:', id);
      console.log('========================================\n');
      return { success: false, error: "Booking not found" };
    }

    console.log('✅ Found existing booking:', {
      id: currentBooking.id,
      status: currentBooking.status,
      eventDate: currentBooking.eventDate,
      guestCount: currentBooking.guestCount,
    });

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (updates.eventDate !== undefined) {
      updateData.eventDate = updates.eventDate;
      console.log('  → Updating eventDate:', updates.eventDate);
    }
    if (updates.eventTime !== undefined) {
      updateData.eventTime = updates.eventTime;
      console.log('  → Updating eventTime:', updates.eventTime);
    }
    if (updates.guestCount !== undefined) {
      updateData.guestCount = updates.guestCount;
      console.log('  → Updating guestCount:', updates.guestCount);
    }
    if (updates.allergyDetails !== undefined) {
      // Convert array to string for storage (can be converted back to array when reading)
      updateData.allergyDetails = Array.isArray(updates.allergyDetails)
        ? updates.allergyDetails.join(', ')
        : updates.allergyDetails;
      console.log('  → Updating allergyDetails:', updateData.allergyDetails);
    }
    if (updates.specialRequests !== undefined) {
      updateData.specialRequests = updates.specialRequests;
      console.log('  → Updating specialRequests:', updates.specialRequests);
    }
    if (updates.estimatedTotal !== undefined) {
      updateData.estimatedTotal = updates.estimatedTotal.toString();
      console.log('  → Updating estimatedTotal:', updateData.estimatedTotal);
    }
    if (updates.requiresDeposit !== undefined) {
      updateData.requiresDeposit = updates.requiresDeposit;
      console.log('  → Updating requiresDeposit:', updates.requiresDeposit);
    }
    if (updates.location !== undefined) {
      updateData.location = updates.location;
      console.log('  → Updating location:', updates.location);
    }
    if (updates.assignedTo !== undefined) {
      updateData.assignedTo = updates.assignedTo;
      console.log('  → Updating assignedTo:', updates.assignedTo);
    }
    if (updates.internalNotes !== undefined) {
      updateData.internalNotes = updates.internalNotes;
      console.log('  → Updating internalNotes');
    }
    if (updates.kitchenNotes !== undefined) {
      updateData.kitchenNotes = updates.kitchenNotes;
      console.log('  → Updating kitchenNotes:', updates.kitchenNotes);
    }
    if (updates.billingAddress !== undefined) {
      updateData.billingAddress = updates.billingAddress;
      console.log('  → Updating billingAddress:', updates.billingAddress);
    }
    if (updates.room !== undefined) {
      updateData.room = updates.room;
      console.log('  → Updating room:', updates.room);
    }


    console.log('\n🔧 Executing UPDATE query...');
    console.log('   WHERE id =', id);
    console.log('   SET:', JSON.stringify(updateData, null, 2));

    const [booking] = await db
      .update(bookings)
      .set(updateData)
      .where(eq(bookings.id, id))
      .returning();

    // Handle relational updates: Lead contact info
    if (booking.leadId && (updates as any).customer) {
      const customer = (updates as any).customer;
      console.log('  → Updating associated lead:', booking.leadId);

      const leadUpdate: any = { updatedAt: new Date() };
      if (customer.name) leadUpdate.contactName = customer.name;
      if (customer.email) leadUpdate.contactEmail = customer.email;
      if (customer.phone) leadUpdate.contactPhone = customer.phone;

      await db.update(leads).set(leadUpdate).where(eq(leads.id, booking.leadId));
    }

    // Handle relational updates: Booking Items
    if ((updates as any).selectedItems && (updates as any).itemQuantities) {
      console.log('  → Syncing booking items...');

      // Delete existing items
      await db.delete(bookingItems).where(eq(bookingItems.bookingId, id));

      // Fetch menu items to get unit prices
      const selectedItemIds = (updates as any).selectedItems;
      const itemQuantities = (updates as any).itemQuantities;

      const dbMenuItems = await db.select().from(menuItems);
      const menuItemMap = new Map(dbMenuItems.map(m => [m.id, m]));

      let newEstimatedTotal = 0;

      for (const itemId of selectedItemIds) {
        const menuItem = menuItemMap.get(itemId);
        if (menuItem) {
          const quantity = itemQuantities[itemId] || 1;
          const unitPrice = Number(menuItem.pricePerPerson);
          const lineTotal = quantity * unitPrice;
          newEstimatedTotal += lineTotal;

          await db.insert(bookingItems).values({
            id: randomUUID(),
            bookingId: id,
            itemType: "menu_item",
            itemId: itemId,
            quantity: quantity,
            unitPrice: menuItem.pricePerPerson,
          });
        }
      }

      // Update the booking's estimated total
      await db.update(bookings)
        .set({ estimatedTotal: newEstimatedTotal.toString() })
        .where(eq(bookings.id, id));

      console.log('  → Recalculated total:', newEstimatedTotal);

      // Update local booking object so audit log reflects the new total
      (booking as any).estimatedTotal = newEstimatedTotal.toString();
    }

    console.log('\n✅ SUCCESS: Booking updated in database');
    console.log('   Updated booking ID:', booking.id);
    console.log('   Updated booking status:', booking.status);
    console.log('========================================\n');

    // Log changes to audit trail if context is provided
    if (auditContext) {
      const changes = calculateBookingChanges(currentBooking, booking);

      console.log('📊 Changes detected:', changes.length);
      console.log('📝 Logging to audit trail...');

      await logBookingChange({
        bookingId: id,
        adminUserId: auditContext.adminUserId,
        actorType: auditContext.actorType,
        actorLabel: auditContext.actorLabel,
        changes,
        ipAddress: auditContext.ipAddress,
        userAgent: auditContext.userAgent,
      });

      console.log('✅ Audit log created');
    }

    console.log('🔄 Revalidating path: /admin/bookings');
    revalidatePath("/admin/bookings");

    console.log('✅ UPDATE BOOKING FUNCTION COMPLETE');
    console.log('========================================\n');

    // Trigger assignment notification if assignedTo changed
    if (updates.assignedTo && updates.assignedTo !== currentBooking.assignedTo) {
      try {
        // Fetch assigned user details
        const [assignedAdmin] = await db
          .select()
          .from(adminUser)
          .where(eq(adminUser.id, updates.assignedTo))
          .limit(1);

        if (assignedAdmin && assignedAdmin.email) {
          // Fetch customer name (lead info)
          const [bookingWithLead] = await db
            .select()
            .from(bookings)
            .where(eq(bookings.id, id))
            .leftJoin(leads, eq(bookings.leadId, leads.id))
            .limit(1);

          if (bookingWithLead) {
            const customerName = bookingWithLead.leads?.contactName || "Customer";
            const eventDate = (booking.eventDate as any) instanceof Date
              ? (booking.eventDate as unknown as Date).toLocaleDateString('de-CH', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
              : String(booking.eventDate);

            console.log(`📧 Sending assignment notification to: ${assignedAdmin.email}`);
            await sendAssignmentNotification({
              bookingId: id,
              adminEmail: assignedAdmin.email,
              adminName: assignedAdmin.name || "Admin",
              customerName: customerName,
              eventDate: eventDate,
              eventTime: booking.eventTime || "TBD",
            });
          }
        }
      } catch (err) {
        console.error("Error sending assignment notification:", err);
      }
    }

    return { success: true, data: booking };
  } catch (error) {
    console.error('\n❌ ERROR in updateBooking:', error);
    console.log('========================================\n');
    return { success: false, error: "Failed to update booking" };
  }
}

export async function getBookings(filters?: { status?: string }) {
  try {
    // Require VIEW_BOOKINGS permission
    await requirePermissionWrapper(Permission.VIEW_BOOKINGS);

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
    // Require VIEW_BOOKING_DETAILS permission
    await requirePermissionWrapper(Permission.VIEW_BOOKING_DETAILS);

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

export async function getBookingWithDetails(id: string) {
  try {
    // Require VIEW_BOOKING_DETAILS permission
    await requirePermissionWrapper(Permission.VIEW_BOOKING_DETAILS);

    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id)).limit(1);

    if (!booking) {
      return { success: false, error: "Booking not found", data: null };
    }

    // Get lead information
    const lead = booking.leadId ? await db.select().from(leads).where(eq(leads.id, booking.leadId)).limit(1) : null;

    // Get booking items
    const items = await db.select().from(bookingItems).where(eq(bookingItems.bookingId, id));

    // Parse internalNotes to extract business, address, occasion and references
    const { businessName, occasion, street, plz, location, reference, billingReference } = parseInternalNotes(booking.internalNotes);

    return {
      success: true,
      data: {
        ...booking,
        businessName,
        occasion,
        street,
        plz,
        location,
        reference,
        billingReference,
        lead: lead && lead[0] ? lead[0] : null,
        booking_items: items
      }
    };
  } catch (error) {
    console.error("Error fetching booking with details:", error);
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
    // Require EDIT_BOOKING permission
    await requirePermissionWrapper(Permission.EDIT_BOOKING);

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
    // Require VIEW_BOOKING_DETAILS permission
    await requirePermissionWrapper(Permission.VIEW_BOOKING_DETAILS);

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
    // Require EDIT_BOOKING permission
    await requirePermissionWrapper(Permission.EDIT_BOOKING);

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
    // Require VIEW_BOOKING_DETAILS permission
    await requirePermissionWrapper(Permission.VIEW_BOOKING_DETAILS);

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

/**
 * Lock a booking to prevent client edits
 *
 * @param bookingId - The booking ID
 * @param adminUserId - The admin user ID performing the lock
 * @param adminUserName - The admin user name for audit log
 * @returns Success status
 */
export async function lockBooking(
  bookingId: string,
  adminUserId: string,
  adminUserName: string
) {
  try {
    // Require EDIT_BOOKING permission
    await requirePermissionWrapper(Permission.EDIT_BOOKING);

    const [booking] = await db
      .update(bookings)
      .set({
        isLocked: true,
        lockedBy: adminUserId,
        lockedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    // Log the lock action
    const { logLockAction } = await import("@/lib/booking-audit");
    await logLockAction({
      bookingId,
      adminUserId,
      adminUserName,
      action: "lock",
    });

    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${bookingId}`);

    return { success: true, data: booking };
  } catch (error) {
    console.error("Error locking booking:", error);
    return { success: false, error: "Failed to lock booking" };
  }
}

/**
 * Unlock a booking to allow client edits
 *
 * @param bookingId - The booking ID
 * @param adminUserId - The admin user ID performing the unlock
 * @param adminUserName - The admin user name for audit log
 * @returns Success status
 */
export async function unlockBooking(
  bookingId: string,
  adminUserId: string,
  adminUserName: string
) {
  try {
    // Require EDIT_BOOKING permission
    await requirePermissionWrapper(Permission.EDIT_BOOKING);

    const [booking] = await db
      .update(bookings)
      .set({
        isLocked: false,
        lockedBy: null,
        lockedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId))
      .returning();

    if (!booking) {
      return { success: false, error: "Booking not found" };
    }

    // Log the unlock action
    const { logLockAction } = await import("@/lib/booking-audit");
    await logLockAction({
      bookingId,
      adminUserId,
      adminUserName,
      action: "unlock",
    });

    // Notify guest
    const [bookingWithLead] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .leftJoin(leads, eq(bookings.leadId, leads.id))
      .limit(1);

    if (bookingWithLead && bookingWithLead.leads?.contactEmail) {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://oliv-restaurant.ch";
      const editSecret = await ensureBookingSecret(bookingId);
      const bookingEditUrl = `${baseUrl}/booking/${bookingId}/edit/${editSecret}`;

      await sendUnlockGrantedEmail({
        bookingId,
        recipientEmail: bookingWithLead.leads.contactEmail,
        bookingData: { ...bookingWithLead.bookings, lead: bookingWithLead.leads },
        bookingEditUrl,
      });
    }

    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${bookingId}`);

    return { success: true, data: booking };
  } catch (error) {
    console.error("Error unlocking booking:", error);
    return { success: false, error: "Failed to unlock booking" };
  }
}

/**
 * Decline a request to unlock a booking
 *
 * @param bookingId - The booking ID
 * @param adminUserId - The admin user ID performing the decline
 * @param adminUserName - The admin user name for audit log
 * @param reason - Optional reason for decline
 * @returns Success status
 */
export async function declineUnlockRequest(
  bookingId: string,
  adminUserId: string,
  adminUserName: string,
  reason?: string
) {
  try {
    // Require EDIT_BOOKING permission
    await requirePermissionWrapper(Permission.EDIT_BOOKING);

    // Log the action
    await logBookingChange({
      bookingId,
      adminUserId,
      actorType: "admin",
      actorLabel: adminUserName,
      changes: [
        {
          field: "unlock_request_status",
          from: "pending",
          to: "declined",
        }
      ]
    });

    // Notify guest
    const [bookingWithLead] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .leftJoin(leads, eq(bookings.leadId, leads.id))
      .limit(1);

    if (bookingWithLead && bookingWithLead.leads?.contactEmail) {
      await sendUnlockDeclinedEmail({
        bookingId,
        recipientEmail: bookingWithLead.leads.contactEmail,
        bookingData: { ...bookingWithLead.bookings, lead: bookingWithLead.leads },
        reason: reason,
      });
    }

    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${bookingId}`);

    return { success: true };
  } catch (error) {
    console.error("Error declining unlock request:", error);
    return { success: false, error: "Failed to decline unlock request" };
  }
}

/**
 * Get a booking with its edit secret
 * Only for use in trusted contexts (admin, server-side)
 *
 * @param bookingId - The booking ID
 * @returns Booking with edit secret
 */
export async function getBookingWithEditSecret(bookingId: string) {
  try {
    // Require VIEW_BOOKING_DETAILS permission
    await requirePermissionWrapper(Permission.VIEW_BOOKING_DETAILS);

    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking) {
      return { success: false, error: "Booking not found", data: null };
    }

    // Ensure secret exists
    const editSecret = await ensureBookingSecret(bookingId);

    return {
      success: true,
      data: {
        ...booking,
        editSecret,
      },
    };
  } catch (error) {
    console.error("Error fetching booking with edit secret:", error);
    return { success: false, error: "Failed to fetch booking", data: null };
  }
}

/**
 * Get a booking with audit history
 *
 * @param bookingId - The booking ID
 * @returns Booking with audit history
 */
/**
 * Get a booking with audit history
 *
 * @param bookingId - The booking ID
 * @returns Booking with audit history
 */
export async function getBookingWithAudit(bookingId: string) {
  try {
    // Require VIEW_BOOKING_DETAILS permission
    await requirePermissionWrapper(Permission.VIEW_BOOKING_DETAILS);

    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking) {
      return { success: false, error: "Booking not found", data: null };
    }

    const { getBookingAuditHistoryWithAdmin } = await import("@/lib/booking-audit");
    const auditResult = await getBookingAuditHistoryWithAdmin(bookingId);

    return {
      success: true,
      data: {
        booking,
        auditHistory: auditResult.success ? auditResult.data : [],
      },
    };
  } catch (error) {
    console.error("Error fetching booking with audit:", error);
    return { success: false, error: "Failed to fetch booking", data: null };
  }
}

/**
 * Get booking details for CLIENT edit access
 * Does NOT require authentication - only the booking secret is validated by the caller
 * This is used by the client edit endpoint where users access their bookings via secret link
 *
 * @param bookingId - The booking ID
 * @returns Booking with full details for client editing
 */
export async function getBookingForClientEdit(bookingId: string) {
  try {
    // NO authentication required - secret is validated by the API route before calling this
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);

    if (!booking) {
      return { success: false, error: "Booking not found", data: null };
    }

    // Get lead information
    const lead = booking.leadId ? await db.select().from(leads).where(eq(leads.id, booking.leadId)).limit(1) : null;

    // Get booking items
    const items = await db.select().from(bookingItems).where(eq(bookingItems.bookingId, bookingId));

    // Parse internalNotes to extract business, address, occasion and references
    const { businessName, occasion, street, plz, location, reference, billingReference } = parseInternalNotes(booking.internalNotes);

    return {
      success: true,
      data: {
        id: booking.id,
        eventDate: booking.eventDate,
        eventTime: booking.eventTime,
        guestCount: booking.guestCount,
        allergyDetails: booking.allergyDetails,
        specialRequests: booking.specialRequests,
        businessName,
        occasion,
        street,
        plz,
        location,
        reference,
        billingReference,
        room: booking.room,
        lead: lead && lead[0] ? lead[0] : null,
        booking_items: items,
      }
    };
  } catch (error) {
    console.error("Error fetching booking for client edit:", error);
    return { success: false, error: "Failed to fetch booking", data: null };
  }
}

/**
 * Delete a booking permanently
 * Only super_admin with DELETE_BOOKING permission can perform this action
 *
 * @param bookingId - The booking ID to delete
 * @param adminUserId - The admin user ID performing the deletion
 * @param adminUserName - The admin user name for audit log
 * @returns Success status
 */
export async function deleteBooking(
  bookingId: string,
  adminUserId: string,
  adminUserName: string
) {
  try {
    console.log('\n========================================');
    console.log('🗑️ DELETE BOOKING FUNCTION START');
    console.log('========================================');
    console.log(`📋 Booking ID to DELETE: ${bookingId}`);
    console.log(`👤 Admin: ${adminUserName} (${adminUserId})`);

    // Require DELETE_BOOKING permission (only super_admin has this)
    await requirePermissionWrapper(Permission.DELETE_BOOKING);

    // Check if booking exists
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (!booking) {
      console.error('❌ ERROR: Booking not found with ID:', bookingId);
      console.log('========================================\n');
      return { success: false, error: "Booking not found" };
    }

    console.log('✅ Booking found:', booking.id);

    // Delete related records in order (due to foreign key constraints)

    // 1. Delete booking items
    console.log('🔄 Deleting booking items...');
    await db
      .delete(bookingItems)
      .where(eq(bookingItems.bookingId, bookingId));
    console.log('✅ Deleted booking items');

    // 2. Delete contact history
    console.log('🔄 Deleting contact history...');
    await db
      .delete(bookingContactHistory)
      .where(eq(bookingContactHistory.bookingId, bookingId));
    console.log('✅ Deleted contact history entries');

    // 3. Delete audit logs
    console.log('🔄 Deleting audit logs...');
    await db
      .delete(bookingAuditLog)
      .where(eq(bookingAuditLog.bookingId, bookingId));
    console.log('✅ Deleted audit log entries');

    // 4. Delete check-ins
    console.log('🔄 Deleting check-ins...');
    await db
      .delete(bookingCheckins)
      .where(eq(bookingCheckins.bookingId, bookingId));
    console.log('✅ Deleted check-ins');

    // 5. Delete the booking itself
    console.log('🔄 Deleting booking...');
    await db
      .delete(bookings)
      .where(eq(bookings.id, bookingId));
    console.log('✅ Booking deleted successfully');

    // Revalidate paths
    console.log('🔄 Revalidating paths: /admin/bookings');
    revalidatePath("/admin/bookings");
    revalidatePath(`/admin/bookings/${bookingId}`);

    console.log('✅ DELETE BOOKING FUNCTION COMPLETE');
    console.log('========================================\n');

    return { success: true, message: "Booking deleted successfully" };
  } catch (error) {
    console.error("❌ Error deleting booking:", error);
    console.log('========================================\n');

    // Check if it's a permission error
    if (error instanceof AuthorizationError) {
      return { success: false, error: "You don't have permission to delete bookings" };
    }

    return { success: false, error: "Failed to delete booking" };
  }
}
