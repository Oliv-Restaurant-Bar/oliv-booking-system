'use server';

import { db } from "@/lib/db";
import { leads, bookings, bookingItems, menuItems, menuCategories, addonItems } from "@/lib/db/schema";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";
import { eq, sql } from "drizzle-orm";
import { ensureBookingSecret, validateBookingSecret } from "@/lib/booking-security";
import { sendThankYouEmail, sendUnlockRequestedNotification } from "@/lib/actions/email";
import { logBookingChange } from "@/lib/booking-audit";
import { sendEmail } from "@/lib/email/zeptomail";
import { wizardEventDetailsSchema } from "@/lib/validation/schemas";
import { ZodError } from "zod";
import { generateCustomerOfferPdf } from "@/lib/utils/pdf-generator";

export interface WizardFormData {
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  business?: string;
  street?: string;
  plz?: string;
  location?: string;
  eventDate: string;
  eventTime: string;
  guestCount: number;
  occasion?: string;
  specialRequests?: string;
  reference?: string;
  paymentMethod?: string;
  useSameAddressForBilling?: boolean;
  billingStreet?: string;
  billingPlz?: string;
  billingLocation?: string;
  billingReference?: string;
  selectedItems: string[];
  itemQuantities: Record<string, number>;
  itemGuestCounts?: Record<string, number>; // Per-item guest count for categories with guestCount enabled
  itemVariants?: Record<string, string>;
  itemAddOns?: Record<string, string[]>;
  itemComments?: Record<string, string>;
  allergyDetails?: string[];
  bookingId?: string | null; // For editing existing bookings
}

export async function submitWizardForm(data: WizardFormData) {
  try {
    console.log('\n========================================');
    console.log('📝 WIZARD FORM SUBMIT');
    console.log('========================================');
    console.log('Booking ID:', data.bookingId);
    console.log('Edit Mode:', !!data.bookingId);

    // VALIDATE INPUT DATA
    try {
      wizardEventDetailsSchema.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        console.error('❌ Validation Error:', error.errors);
        return {
          success: false,
          error: 'Invalid form data',
          validationErrors: error.errors
        };
      }
      throw error;
    }

    // Additional validation for selected items
    if (!data.selectedItems || data.selectedItems.length === 0) {
      return {
        success: false,
        error: 'Please select at least one menu item'
      };
    }

    // Validate item IDs format (UUID)
    const invalidItemIds = data.selectedItems.filter(itemId =>
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(itemId)
    );

    if (invalidItemIds.length > 0) {
      return {
        success: false,
        error: 'Invalid menu item IDs detected'
      };
    }

    // Validate booking ID if provided
    if (data.bookingId && data.bookingId !== 'null' && data.bookingId !== '') {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(data.bookingId)) {
        return {
          success: false,
          error: 'Invalid booking ID format'
        };
      }
    }

    // COMMON LOGIC: Fetch menu items, categories, and calculate totals
    const allMenuItems = await db
      .select({
        id: menuItems.id,
        name: menuItems.name,
        categoryId: menuItems.categoryId,
        pricePerPerson: menuItems.pricePerPerson,
        pricingType: menuItems.pricingType,
        variants: menuItems.variants,
      })
      .from(menuItems)
      .where(eq(menuItems.isActive, true));

    const allCategories = await db.select({
      id: menuCategories.id,
      name: menuCategories.name,
      guestCount: menuCategories.guestCount,
    }).from(menuCategories);

    const allAddonItems = await db.select({
      id: addonItems.id,
      name: addonItems.name,
      price: addonItems.price,
    }).from(addonItems);
    
    const addonMap = new Map(allAddonItems.map(a => [a.id, a]));

    const menuItemMap = new Map(allMenuItems.map(item => [item.id, item]));
    const categoryMap = new Map(allCategories.map(cat => [cat.id, cat.guestCount]));

    let estimatedTotal = 0;
    const itemsToCreate: Array<{
      itemType: "menu_item";
      itemId: string;
      quantity: number;
      unitPrice: string;
      notes?: string | null;
    }> = [];

    // Process selected items
    for (const itemId of data.selectedItems) {
      const dbItem = menuItemMap.get(itemId);
      const quantity = data.itemQuantities[itemId] || 1;

      if (dbItem) {
        let unitPrice = Number(dbItem.pricePerPerson);
        let variantName = "";

        // Handle variant price if selected
        const selectedVariantId = data.itemVariants?.[itemId];
        if (selectedVariantId && Array.isArray(dbItem.variants)) {
          // 1. Try lookup by ID
          let variant = (dbItem.variants as any[]).find(v => v.id === selectedVariantId);
          
          // 2. Fallback: Try lookup by name (resilience for ID/name mismatch)
          if (!variant) {
            variant = (dbItem.variants as any[]).find(v => v.name === selectedVariantId);
          }

          if (variant) {
            unitPrice = Number(variant.price);
            variantName = variant.name;
          }
        }

        // Handle addons price and names if selected
        let addonsPrice = 0;
        let addonsNames: string[] = [];
        const selectedAddOnIds = data.itemAddOns?.[itemId] || [];
        
        if (selectedAddOnIds.length > 0) {
          for (const addonId of selectedAddOnIds) {
            const addon = addonMap.get(addonId);
            if (addon) {
              addonsPrice += Number(addon.price || 0);
              addonsNames.push(addon.name);
            }
          }
        }

        // Calculate effective guest count and quantity based on pricing type
        let effectiveGuestCount = 1;
        let effectiveQuantity = quantity;

        if (dbItem.pricingType === 'per_person') {
          // Per-person items: quantity records the guest count
          effectiveQuantity = data.itemGuestCounts?.[itemId] || data.guestCount;
          effectiveGuestCount = 1; // Already accounted for in quantity
        } else {
          // Flat-fee or consumption: quantity is used directly
          effectiveQuantity = quantity;
          effectiveGuestCount = 1;
        }

        const itemTotal = (unitPrice + addonsPrice) * effectiveQuantity * effectiveGuestCount;
        estimatedTotal += itemTotal;

        // Build notes for booking_item (variant, addons, comments)
        const notesParts = [];
        if (variantName) notesParts.push(`Variant: ${variantName}`);
        if (addonsNames.length > 0) notesParts.push(`Add-ons: ${addonsNames.join(', ')}`);

        const comment = data.itemComments?.[itemId];
        if (comment) notesParts.push(`Comment: ${comment}`);

        itemsToCreate.push({
          itemType: "menu_item",
          itemId: dbItem.id,
          quantity: effectiveQuantity,
          unitPrice: (unitPrice + addonsPrice).toString(), // Store price including addons
          notes: notesParts.join(' | ') || null,
        });
      }
    }

    const eventTime = data.eventTime || '18:00:00';

    // If bookingId is provided, this is an UPDATE to existing booking
    if (data.bookingId) {
      console.log('🔄 UPDATING EXISTING BOOKING');

      // Get the booking to verify lock status and get lead ID
      const [booking] = await db.select().from(bookings).where(eq(bookings.id, data.bookingId)).limit(1);

      if (booking?.isLocked) {
        console.error("Attempted to edit a locked booking:", data.bookingId);
        return {
          success: false,
          error: "This booking has been locked by an administrator and can no longer be edited."
        };
      }

      // Build internal notes (Address, Business, Occasion)
      const addressParts = [data.street, data.plz, data.location].filter(Boolean);
      const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : '';

      // Build billing address from separate fields
      const billingAddressParts = [data.billingStreet, data.billingPlz, data.billingLocation].filter(Boolean);
      const billingAddress = billingAddressParts.length > 0 ? billingAddressParts.join(', ') : '';

      const internalNotesParts = [
        `Business: ${data.business || 'N/A'}`,
        `Occasion: ${data.occasion || 'N/A'}`,
        `Reference: ${data.reference || 'N/A'}`,
        `Billing Reference: ${data.billingReference || 'N/A'}`,
        `Address: ${fullAddress || 'N/A'}`,
      ];

      // Update booking details
      const updateData: any = {
        eventDate: data.eventDate,
        eventTime: eventTime,
        guestCount: data.guestCount,
        allergyDetails: data.allergyDetails || [],
        specialRequests: data.specialRequests || null,
        billingAddress: billingAddress || null,
        estimatedTotal: estimatedTotal.toString(),
        requiresDeposit: estimatedTotal > 1000,
        internalNotes: internalNotesParts.join('\n'),
        updatedAt: new Date(),
      };

      // 🔒 CRITICAL FIX: Use database transaction for atomicity
      // This prevents race conditions where delete succeeds but insert fails
      await db.transaction(async (tx) => {
        // Update booking
        await tx.update(bookings)
          .set(updateData)
          .where(eq(bookings.id, data.bookingId!));

        // Update lead info if leadId exists
        if (booking.leadId) {
          await tx.update(leads)
            .set({
              contactName: data.contactName,
              contactEmail: data.contactEmail,
              contactPhone: data.contactPhone,
              // @ts-ignore - Drizzle ORM type compatibility issue
              eventDate: data.eventDate,
              eventTime: eventTime,
              guestCount: data.guestCount,
              updatedAt: new Date(),
            })
            .where(eq(leads.id, booking.leadId));
        }

        // Update booking items (relational sync) - ATOMIC WITHIN TRANSACTION
        console.log('  → Syncing booking items for update...');
        await tx.delete(bookingItems).where(eq(bookingItems.bookingId, data.bookingId!));

        // All inserts must succeed - if any fail, entire transaction rolls back
        for (const item of itemsToCreate) {
          await tx.insert(bookingItems).values({
            id: randomUUID(),
            bookingId: data.bookingId!,
            itemType: "menu_item",
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            notes: (item as any).notes,
          });
        }
      });
      // Transaction complete - all updates committed atomically

      const editSecret = await ensureBookingSecret(data.bookingId);

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://oliv-restaurant.ch";
      const bookingEditUrl = `${baseUrl}/booking/${data.bookingId}/edit/${editSecret}`;

      console.log('✅ BOOKING UPDATED SUCCESSFULLY');
      console.log('========================================\n');

      console.log('\n========================================');
      console.log('📧 BOOKING EDIT LINK (UPDATE)');
      console.log('========================================');
      console.log(`To: ${data.contactEmail}`);
      console.log(`Booking ID: ${data.bookingId}`);
      console.log(`Edit Link: ${bookingEditUrl}`);
      console.log('========================================\n');

      // Non-blocking email sending (fire and forget)
      // Convert Date objects to strings for template serialization
      const bookingForEmailUpdate = {
        id: booking.id,
        leadId: booking.leadId,
        eventDate: (booking.eventDate as any) instanceof Date ? (booking.eventDate as any).toISOString() : booking.eventDate,
        eventTime: booking.eventTime,
        guestCount: booking.guestCount,
        allergyDetails: booking.allergyDetails,
        specialRequests: booking.specialRequests,
        estimatedTotal: booking.estimatedTotal,
        requiresDeposit: booking.requiresDeposit,
        status: booking.status,
        internalNotes: booking.internalNotes,
        termsAccepted: booking.termsAccepted,
        termsAcceptedAt: booking.termsAcceptedAt instanceof Date ? booking.termsAcceptedAt.toISOString() : booking.termsAcceptedAt,
        isLocked: booking.isLocked,
        createdAt: booking.createdAt instanceof Date ? booking.createdAt.toISOString() : booking.createdAt,
        updatedAt: booking.updatedAt instanceof Date ? booking.updatedAt.toISOString() : booking.updatedAt,
        lead: booking.leadId ? {
          id: booking.leadId,
          contactName: data.contactName,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          eventDate: data.eventDate,
          eventTime: eventTime,
          guestCount: data.guestCount,
          source: "website",
          status: "new",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } : null,
      } as any;

      // Send email (Awaited to ensure delivery on Vercel)
      try {
        console.log('📧 Sending update email...');
        const emailResult = await sendThankYouEmail({
          bookingId: data.bookingId!,
          recipientEmail: data.contactEmail,
          bookingData: bookingForEmailUpdate,
          estimatedTotal: estimatedTotal,
          bookingEditUrl: bookingEditUrl,
        });
        
        if (emailResult.success) {
          console.log(`   ✅ Update email sent successfully (ID: ${emailResult.emailLogId || 'unknown'})`);
        } else {
          console.error(`   ❌ Update email failed: ${emailResult.error}`);
        }
      } catch (err) {
        console.error("❌ Exception sending wizard update email:", err);
      }

      revalidatePath("/admin/bookings");
      revalidatePath("/admin/leads");
      revalidatePath(`/admin/bookings/${data.bookingId}`);

      return {
        success: true,
        data: {
          bookingId: data.bookingId,
          // SECURITY: editSecret is NOT returned here - it's sent via email only
          inquiryNumber: booking.leadId ? booking.leadId.substring(0, 8).toUpperCase() : 'INQ-UNKNOWN',
          estimatedTotal: estimatedTotal,
        },
      };
    }

    // CREATION BLOCK
    console.log('✨ CREATING NEW BOOKING');

    // Create lead
    // @ts-ignore - Drizzle ORM type compatibility issue
    const [lead] = await db.insert(leads).values({
      id: randomUUID(),
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      eventDate: data.eventDate,
      eventTime: eventTime,
      guestCount: data.guestCount,
      source: "website",
      status: "new",
    })
      .returning();

    // Build internal notes
    const addressParts = [data.street, data.plz, data.location].filter(Boolean);
    const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : '';

    // Build billing address from separate fields
    const billingAddressParts = [data.billingStreet, data.billingPlz, data.billingLocation].filter(Boolean);
    const billingAddress = billingAddressParts.length > 0 ? billingAddressParts.join(', ') : '';

    const internalNotesParts = [
      `Business: ${data.business || 'N/A'}`,
      `Occasion: ${data.occasion || 'N/A'}`,
      `Reference: ${data.reference || 'N/A'}`,
      `Billing Reference: ${data.billingReference || 'N/A'}`,
      `Address: ${fullAddress || 'N/A'}`,
    ].filter(Boolean);

    // Create booking
    // @ts-ignore - Drizzle ORM type compatibility issue
    const [booking] = await db.insert(bookings).values({
      id: randomUUID(),
      leadId: lead.id,
      eventDate: data.eventDate,
      eventTime: eventTime,
      guestCount: data.guestCount,
      allergyDetails: data.allergyDetails || [],
      specialRequests: data.specialRequests || null,
      billingAddress: billingAddress || null,
      estimatedTotal: estimatedTotal.toString(),
      requiresDeposit: estimatedTotal > 1000,
      status: "pending",
      internalNotes: internalNotesParts.join('\n'),
      termsAccepted: true,
      termsAcceptedAt: new Date(),
      isLocked: false,
    })
      .returning();

    const editSecret = await ensureBookingSecret(booking.id);

    // Create booking items
    for (const item of itemsToCreate) {
      await db.insert(bookingItems).values({
        id: randomUUID(),
        bookingId: booking.id,
        itemType: "menu_item",
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        notes: (item as any).notes,
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://oliv-restaurant.ch";
    const bookingEditUrl = `${baseUrl}/booking/${booking.id}/edit/${editSecret}`;

    console.log('\n========================================');
    console.log('📧 BOOKING EDIT LINK (CREATE)');
    console.log('========================================');
    console.log(`To: ${data.contactEmail}`);
    console.log(`Booking ID: ${booking.id}`);
    console.log(`Edit Link: ${bookingEditUrl}`);
    console.log('========================================\n');

    // Send confirmation email (truly non-blocking - doesn't delay booking creation response)
    // Fire and forget - PDF generation and email sending happen in background
    // Send confirmation email (Awaited to ensure delivery on Vercel)
    try {
      // Convert Date objects to strings for template serialization
      const bookingForEmail = {
        id: booking.id,
        leadId: booking.leadId,
        eventDate: (booking.eventDate as any) instanceof Date ? (booking.eventDate as any).toISOString() : booking.eventDate,
        eventTime: booking.eventTime,
        guestCount: booking.guestCount,
        allergyDetails: booking.allergyDetails,
        specialRequests: booking.specialRequests,
        estimatedTotal: booking.estimatedTotal,
        requiresDeposit: booking.requiresDeposit,
        status: booking.status,
        internalNotes: booking.internalNotes,
        termsAccepted: booking.termsAccepted,
        termsAcceptedAt: booking.termsAcceptedAt instanceof Date ? booking.termsAcceptedAt.toISOString() : booking.termsAcceptedAt,
        isLocked: booking.isLocked,
        createdAt: booking.createdAt instanceof Date ? booking.createdAt.toISOString() : booking.createdAt,
        updatedAt: booking.updatedAt instanceof Date ? booking.updatedAt.toISOString() : booking.updatedAt,
        lead,
      };

      // Generate PDF for the email
      const pdfData = {
        id: booking.id,
        customerName: lead.contactName,
        business: data.business || undefined,
        eventDate: booking.eventDate, // String from Drizzle
        eventTime: booking.eventTime,
        guestCount: booking.guestCount,
        occasion: data.occasion || undefined,
        items: data.selectedItems.map(itemId => {
          const dbItem = menuItemMap.get(itemId);
          const isPerPersonItem = dbItem?.pricingType === 'per_person';
          const quantity = isPerPersonItem
            ? (data.itemGuestCounts?.[itemId] || data.guestCount || 1)
            : (data.itemQuantities[itemId] || 1);

          const variantId = data.itemVariants?.[itemId];
          const variant = variantId && Array.isArray(dbItem?.variants)
            ? (dbItem?.variants as any[]).find(v => v.id === variantId)
            : null;

          const unitPrice = variant ? Number(variant.price) : Number(dbItem?.pricePerPerson || 0);

          return {
            id: itemId,
            name: dbItem?.name || 'Unknown Item',
            category: allCategories.find(c => c.id === dbItem?.categoryId)?.name || 'Other',
            quantity: quantity,
            unitPrice: unitPrice,
            totalPrice: unitPrice * quantity,
            notes: data.itemComments?.[itemId],
            pricingType: dbItem?.pricingType || 'per_person',
          };
        }),
        estimatedTotal: estimatedTotal,
        specialRequests: booking.specialRequests || undefined,
      };

      console.log('📧 Generating PDF for record...');
      const doc = await generateCustomerOfferPdf(pdfData as any);
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      console.log('📧 PDF generated, sending confirmation email...');

      const emailResult = await sendThankYouEmail({
        bookingId: booking.id,
        recipientEmail: data.contactEmail,
        bookingData: bookingForEmail as any,
        estimatedTotal: estimatedTotal,
        bookingEditUrl: bookingEditUrl,
        pdfAttachment: {
          name: `Angebot_${pdfData.customerName.replace(/\s+/g, '_')}.pdf`,
          mime_type: "application/pdf",
          content: pdfBase64,
        }
      });
      
      if (emailResult.success) {
        console.log(`   ✅ Confirmation email sent successfully (ID: ${emailResult.emailLogId || 'unknown'})`);
      } else {
        console.error(`   ❌ Confirmation email failed: ${emailResult.error}`);
      }
    } catch (emailError) {
      console.error("❌ Exception in confirmation email process:", emailError);
    }

    revalidatePath("/admin/bookings");
    revalidatePath("/admin/leads");

    return {
      success: true,
      data: {
        leadId: lead.id,
        bookingId: booking.id,
        // SECURITY: editSecret is NOT returned here - it's sent via email only
        inquiryNumber: lead.id.substring(0, 8).toUpperCase(),
        estimatedTotal: estimatedTotal,
      },
    };
  } catch (error) {
    console.error('Error submitting wizard form:', error);
    return { success: false, error: 'Internal server error' };
  }
}

/**
 * Handle a request from a client to unlock their booking for editing
 */
export async function requestBookingUnlock(bookingId: string, secret: string) {
  try {
    // 1. Validate secret
    const isValid = await validateBookingSecret(bookingId, secret);
    if (!isValid) {
      return { success: false, error: 'Unauthorized' };
    }

    // 2. Log audit entry
    await logBookingChange({
      bookingId,
      actorType: 'client',
      actorLabel: 'Client',
      changes: [
        {
          field: 'unlock_requested',
          from: false,
          to: true,
        }
      ]
    });

    // 3. Send email to admin
    const adminEmail = process.env.ZEPTOMAIL_REPLY_TO || process.env.ZEPTOMAIL_FROM_EMAIL || "info@oliv-restaurant.ch";
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, bookingId))
      .limit(1);

    if (booking) {
      await sendUnlockRequestedNotification({
        bookingId,
        adminEmail,
        bookingData: { ...booking } as any, // Cast to any to satisfy the complex schema type
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error requesting booking unlock:', error);
    return { success: false, error: 'Failed to process request' };
  }
}
