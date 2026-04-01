/**
 * Script to migrate address data from internal_notes to dedicated columns
 * Run with: npx tsx scripts/migrate-address-data.ts
 */

import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env as soon as possible
dotenv.config({ path: resolve(process.cwd(), '.env') });

import { db } from '../lib/db';
import { bookings } from '../lib/db/schema';
import { eq } from 'drizzle-orm';

/**
 * Helper to parse business, occupation and address from internalNotes field
 * (Copied from lib/actions/bookings.ts to avoid cross-import issues in script)
 */
function parseInternalNotes(notes: string | null) {
  let businessName = '';
  let occasion = '';
  let street = '';
  let plz = '';
  let location = '';
  let reference = '';
  let billingReference = '';
  let useSameAddressForBilling = true;
  let paymentMethod = 'ec_card';

  if (notes) {
    const lines = notes.split(/\r?\n/);
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('Business: ')) {
        businessName = trimmedLine.replace('Business: ', '').replace('N/A', '').trim();
      } else if (trimmedLine.startsWith('Occasion: ')) {
        occasion = trimmedLine.replace('Occasion: ', '').replace('N/A', '').trim();
      } else if (trimmedLine.startsWith('Reference: ')) {
        reference = trimmedLine.replace('Reference: ', '').replace('N/A', '').trim();
      } else if (trimmedLine.startsWith('Billing Reference: ')) {
        billingReference = trimmedLine.replace('Billing Reference: ', '').replace('N/A', '').trim();
      } else if (trimmedLine.startsWith('Payment Method: ')) {
        paymentMethod = trimmedLine.replace('Payment Method: ', '').replace('N/A', '').trim();
      } else if (trimmedLine.startsWith('Street: ')) {
        const val = trimmedLine.replace('Street: ', '').replace('N/A', '').trim();
        if (val) street = val;
      } else if (trimmedLine.startsWith('PLZ: ')) {
        const val = trimmedLine.replace('PLZ: ', '').replace('N/A', '').trim();
        if (val) plz = val;
      } else if (trimmedLine.startsWith('Location: ')) {
        const val = trimmedLine.replace('Location: ', '').replace('N/A', '').trim();
        if (val) location = val;
      } else if (trimmedLine.startsWith('Use Same Address: ')) {
        const val = trimmedLine.replace('Use Same Address: ', '').trim();
        if (val === 'false') useSameAddressForBilling = false;
        else if (val === 'true') useSameAddressForBilling = true;
      }
    }
  }

  return { businessName, occasion, street, plz, location, reference, billingReference, useSameAddressForBilling, paymentMethod };
}

async function migrateAddressData() {
  try {
    console.log('🚀 Starting address data migration...');

    const allBookings = await db.select().from(bookings);
    console.log(`📋 Found ${allBookings.length} bookings to process.`);

    let updatedCount = 0;

    for (const booking of allBookings) {
      const parsed = parseInternalNotes(booking.internalNotes);

      // Use existing billing fields if they exist, otherwise null
      const billingStreet = booking.billingStreet || null;
      const billingPlz = booking.billingPlz || null;
      const billingLocation = booking.billingLocation || null;

      // Update the booking row
      await db.update(bookings).set({
        street: parsed.street || null,
        plz: parsed.plz || null,
        location: parsed.location || booking.location || null, // Keep existing location if found
        business: parsed.businessName || null,
        occasion: parsed.occasion || null,
        reference: parsed.reference || null,
        paymentMethod: parsed.paymentMethod || 'ec_card',
        useSameAddressForBilling: parsed.useSameAddressForBilling,
        billingStreet: billingStreet,
        billingPlz: billingPlz,
        billingLocation: billingLocation,
        billingReference: parsed.billingReference || null,
      }).where(eq(bookings.id, booking.id));

      updatedCount++;
      if (updatedCount % 10 === 0) {
        console.log(`   Processed ${updatedCount} bookings...`);
      }
    }

    console.log(`\n✅ Migration complete! Updated ${updatedCount} bookings.`);
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during migration:', error);
    process.exit(1);
  }
}

migrateAddressData();
