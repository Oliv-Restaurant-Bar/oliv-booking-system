/**
 * Seed dummy bookings with current menu items
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { db, leads, bookings, bookingItems, menuItems, menuCategories } from '../lib/db';
import { randomUUID } from 'crypto';
import type { BookingStatus, BookingItemType } from '../lib/db/schema';

// Load environment variables
config({ path: resolve(process.cwd(), '.env') });

// Sample German names and data
const firstNames = [
  'Maria', 'Anna', 'Julia', 'Sarah', 'Laura', 'Lisa', 'Sophie', 'Emma',
  'Hans', 'Peter', 'Michael', 'Thomas', 'Andreas', 'Stefan', 'Christian',
  'Martin', 'Klaus', 'Werner', 'Jürgen', 'Karl', 'Wolfgang'
];

const lastNames = [
  'Müller', 'Schmidt', 'Weber', 'Wagner', 'Becker', 'Schulz', 'Hoffmann',
  'Fischer', 'Schneider', 'Koch', 'Bauer', 'Klein', 'Richter', 'Wolf',
  'Schröder', 'Neumann', 'Schwarz', 'Braun', 'Zimmermann', 'Krüger'
];

const companyNames = [
  'Müller GmbH', 'Schmidt AG', 'Weber & Co.', 'Wagner KG',
  'Becker Services', 'Schulz Consulting', 'Hoffmann Manufacturing',
  'Fischer Tech', 'Schneider Solutions', 'Koch Innovations'
];

const locations = [
  'Zürich', 'Basel', 'Bern', 'Lausanne', 'Genf', 'Winterthur',
  'Luzern', 'St. Gallen', 'Lugano', 'Locarno'
];

const occasions = [
  'Firmenevent', 'Geburtstag', 'Hochzeit', 'Jubiläum',
  'Weihnachtsfeier', 'Abschlussfeier', 'Team-Event',
  'Konferenz', 'Produktlaunch', 'Kundenevent'
];

const streets = [
  'Hauptstrasse', 'Bahnhofstrasse', 'Marktgasse', 'Rathausplatz',
  'Kirchgasse', 'Schlossgasse', 'Bergstrasse', 'Seestrasse',
  'Dorfstrasse', 'Promenadenstrasse'
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomPhoneNumber(): string {
  const areaCode = getRandomElement(['071', '076', '079', '044', '052', '078', '043', '031', '032', '033', '034', '035', '036']);
  const rest = getRandomInt(100000, 999999);
  return `+41 ${areaCode} ${rest.toString().slice(0, 3)} ${rest.toString().slice(3)}`;
}

function getRandomEmail(firstName: string, lastName: string): string {
  const domains = ['gmail.com', 'outlook.com', 'bluewin.ch', 'gmx.ch'];
  const cleanName = `${firstName.toLowerCase()}.${lastName.toLowerCase()}`;
  return `${cleanName}@${getRandomElement(domains)}`;
}

function generateRandomDate(offsetDaysFromNow: number = 1): Date {
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(now.getDate() + offsetDaysFromNow);
  return futureDate;
}

function generateRandomTime(): string {
  const hours = getRandomInt(10, 22);
  const minutes = getRandomInt(0, 1) * 30; // 0 or 30
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

function generateRandomPLZ(): string {
  return getRandomInt(1000, 9999).toString();
}

function generateRandomAddress(): { street: string; plz: string; location: string } {
  const streetNumber = getRandomInt(1, 150);
  const street = `${getRandomElement(streets)} ${streetNumber}`;
  const plz = generateRandomPLZ();
  const location = getRandomElement(locations);
  return { street, plz, location };
}

async function seedDummyBookings() {
  try {
    console.log('🌱 Starting to seed dummy bookings...\n');

    // 1. Get all menu items
    const allMenuItems = await db.select().from(menuItems);
    const allCategories = await db.select().from(menuCategories);

    if (allMenuItems.length === 0) {
      console.log('❌ No menu items found. Please add menu items first.');
      return;
    }

    console.log(`📊 Found ${allMenuItems.length} menu items in ${allCategories.length} categories\n`);

    // 2. Group items by category
    const itemsByCategory = new Map<string, typeof allMenuItems>();
    allMenuItems.forEach(item => {
      const category = allCategories.find(cat => cat.id === item.categoryId);
      const categoryName = category?.name || 'Other';
      if (!itemsByCategory.has(categoryName)) {
        itemsByCategory.set(categoryName, []);
      }
      itemsByCategory.get(categoryName)!.push(item);
    });

    // 3. Generate dummy bookings
    const numberOfBookings = 20;
    const bookingStatuses: BookingStatus[] = ['pending', 'confirmed', 'completed', 'cancelled'];
    let totalBookingItems = 0;

    for (let i = 0; i < numberOfBookings; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const fullName = `${firstName} ${lastName}`;
      const email = getRandomEmail(firstName, lastName);
      const phone = getRandomPhoneNumber();
      const address = generateRandomAddress();

      // Random date in the future (2 to 90 days from now)
      const daysFromNow = getRandomInt(2, 90);
      const eventDate = generateRandomDate(daysFromNow);
      const eventTime = generateRandomTime();
      const guestCount = getRandomInt(10, 150);

      // Create lead
      const leadId = randomUUID();
      const eventDateStr = eventDate.toISOString().split('T')[0]; // Convert Date to YYYY-MM-DD format

      const [newLead] = await db.insert(leads).values({
        id: leadId,
        contactName: fullName,
        contactEmail: email,
        contactPhone: phone,
        eventDate: eventDateStr,
        eventTime: eventTime,
        guestCount: guestCount,
        status: 'new',
        source: 'website',
      }).returning().onConflictDoNothing();

      // Calculate estimated total
      const selectedItemsCount = getRandomInt(2, 8);
      let estimatedTotal = 0;

      // Select random menu items
      const selectedItems = [];
      const availableItems = [...allMenuItems];

      for (let j = 0; j < selectedItemsCount; j++) {
        if (availableItems.length === 0) break;

        const randomIndex = getRandomInt(0, availableItems.length - 1);
        const item = availableItems.splice(randomIndex, 1)[0];
        const quantity = getRandomInt(1, Math.max(1, Math.floor(guestCount / 10)));

        selectedItems.push({
          item,
          quantity,
          unitPrice: Number(item.pricePerPerson)
        });

        // Calculate price based on pricing type
        if (item.pricingType === 'billed_by_consumption') {
          // Consumption items: price is per unit
          estimatedTotal += Number(item.pricePerPerson) * quantity;
        } else if (item.pricingType === 'flat_fee') {
          // Flat fee items
          estimatedTotal += Number(item.pricePerPerson) * quantity;
        } else {
          // Per-person items
          estimatedTotal += Number(item.pricePerPerson) * quantity * guestCount;
        }
      }

      // Create booking
      const randomLocation = getRandomElement(locations);
      const [newBooking] = await db.insert(bookings).values({
        leadId: leadId,
        eventDate: eventDateStr,
        eventTime: eventTime,
        guestCount: guestCount,
        allergyDetails: [],
        specialRequests: getRandomInt(0, 3) > 1 ? 'Bei Regenwetter Innenraum-Alternative' : null,
        estimatedTotal: estimatedTotal.toString(),
        requiresDeposit: getRandomInt(0, 10) > 7, // 30% chance
        status: getRandomElement(bookingStatuses),
        location: randomLocation,
        internalNotes: getRandomInt(0, 5) > 3 ? 'VIP Kunde - besondere Aufmerksamkeit' : null,
        termsAccepted: true,
      }).returning().onConflictDoNothing();

      const bookingId = newBooking?.id;

      if (!bookingId) {
        console.log(`⚠️  Skipping booking items for ${fullName} - booking creation failed`);
        continue;
      }

      // Create booking items
      for (const { item, quantity, unitPrice } of selectedItems) {
        await db.insert(bookingItems).values({
          bookingId: bookingId,
          itemType: 'menu_item' as const,
          itemId: item.id,
          quantity: quantity,
          unitPrice: unitPrice.toString(),
          notes: quantity > 1 ? `${quantity}x` : null,
        }).onConflictDoNothing();
        totalBookingItems++;
      }

      // Log booking details
      console.log(`✅ Booking ${i + 1}/${numberOfBookings}: ${fullName}`);
      console.log(`   📅 ${eventDate.toISOString().split('T')[0]} at ${eventTime}`);
      console.log(`   👥 ${guestCount} guests - ${selectedItemsCount} items`);
      console.log(`   💰 Total: CHF ${estimatedTotal.toFixed(2)}`);
      console.log(`   📍 ${address.location} (${status})`);
      console.log('');
    }

    console.log(`\n🎉 Successfully seeded ${numberOfBookings} dummy bookings!`);
    console.log('📊 Summary:');
    console.log(`   - Leads created: ${numberOfBookings}`);
    console.log(`   - Bookings created: ${numberOfBookings}`);
    console.log(`   - Total booking items: ${totalBookingItems}`);

  } catch (error) {
    console.error('❌ Error seeding dummy bookings:', error);
    throw error;
  }
}

// Run the seed
seedDummyBookings()
  .then(() => {
    console.log('\n✅ Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  });
