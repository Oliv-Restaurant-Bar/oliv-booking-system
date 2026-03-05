import { config } from "dotenv";
config({ path: ".env" });

import { db } from "@/lib/db";
import {
  leads,
  bookings,
  bookingItems,
} from "@/lib/db/schema";
import { randomUUID } from "crypto";

async function seedDailyBookings() {
  console.log("📝 Creating daily bookings for last 30 days...");

  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth();

    // Mock data matching adminUI - daily bookings for last 30 days
    const dailyBookingData = [
      { dayOffset: 29, bookings: 10, revenuePerBooking: 210 },
      { dayOffset: 27, bookings: 15, revenuePerBooking: 213 },
      { dayOffset: 25, bookings: 12, revenuePerBooking: 233 },
      { dayOffset: 23, bookings: 18, revenuePerBooking: 211 },
      { dayOffset: 21, bookings: 14, revenuePerBooking: 221 },
      { dayOffset: 19, bookings: 20, revenuePerBooking: 210 },
      { dayOffset: 17, bookings: 16, revenuePerBooking: 225 },
      { dayOffset: 15, bookings: 22, revenuePerBooking: 205 },
      { dayOffset: 13, bookings: 19, revenuePerBooking: 216 },
      { dayOffset: 11, bookings: 15, revenuePerBooking: 227 },
      { dayOffset: 9, bookings: 17, revenuePerBooking: 218 },
      { dayOffset: 7, bookings: 21, revenuePerBooking: 205 },
      { dayOffset: 5, bookings: 18, revenuePerBooking: 217 },
      { dayOffset: 3, bookings: 16, revenuePerBooking: 219 },
      { dayOffset: 1, bookings: 19, revenuePerBooking: 211 },
      { dayOffset: 0, bookings: 14, revenuePerBooking: 236 },
    ];

    const statuses: ("confirmed" | "pending" | "completed" | "declined" | "no_show" | "cancelled")[] =
      ["confirmed", "pending", "completed", "declined", "no_show", "cancelled"];

    // Status counts matching adminUI
    const statusCounts = {
      confirmed: 37,
      completed: 24,
      pending: 24, // New + Touchbase
      declined: 5,
      no_show: 3,
      cancelled: 7, // Unresponsive
    };

    let statusIndex = 0;
    const statusQueue: string[] = [];
    Object.entries(statusCounts).forEach(([status, count]) => {
      for (let i = 0; i < count; i++) {
        statusQueue.push(status);
      }
    });

    // Get menu items
    const allMenuItems = await db.query.menuItems.findMany();

    const eventTimes = ["18:00:00", "18:30:00", "19:00:00", "19:30:00", "20:00:00"];
    const firstNames = ["Maria", "Thomas", "Sophie", "Hans", "Anna", "Klaus", "Monica", "Rolf", "Urs", "Ruth", "Walter", "Erika", "Fritz", "Gisela", "Heinz"];
    const lastNames = ["Schmidt", "Müller", "Meier", "Weiss", "Brunner", "Schneider", "Frei", "Baumann", "Wirth", "Berger", "Sutter", "Neuhaus", "Hofer", "Lang", "Steiner"];

    let bookingCount = 0;

    for (const dayData of dailyBookingData) {
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() - dayData.dayOffset);
      eventDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

      for (let i = 0; i < dayData.bookings; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const name = `${firstName} ${lastName}`;
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`;
        const phone = `+41 ${7 + Math.floor(Math.random() * 3)} ${Math.floor(Math.random() * 90000000 + 10000000)}`;
        const guestCount = Math.floor(Math.random() * 25) + 10;
        const status = statusQueue[statusIndex % statusQueue.length] || "pending";
        statusIndex++;

        // Create lead
        // @ts-ignore - Drizzle type issue with date columns
        const [lead] = await db.insert(leads).values({
          id: randomUUID(),
          contactName: name,
          contactEmail: email,
          contactPhone: phone,
          eventDate: eventDate,
          eventTime: eventTimes[Math.floor(Math.random() * eventTimes.length)],
          guestCount: guestCount,
          source: "manual",
          status: "contacted",
        }).returning();

        // Randomly select 2-3 menu items
        const shuffledMenuItems = [...allMenuItems].sort(() => Math.random() - 0.5);
        const selectedMenuItems = shuffledMenuItems.slice(0, Math.floor(Math.random() * 2) + 2);
        let estimatedTotal = 0;

        const bookingItemsToCreate = [];

        for (const menuItem of selectedMenuItems) {
          const quantity = Math.floor(Math.random() * 2) + 1;
          const pricePerPerson = Number(menuItem.pricePerPerson);
          const itemTotal = pricePerPerson * quantity * guestCount;
          estimatedTotal += itemTotal;

          bookingItemsToCreate.push({
            itemType: "menu_item",
            itemId: menuItem.id,
            quantity,
            unitPrice: menuItem.pricePerPerson,
          });
        }

        // Create booking
        // @ts-ignore - Drizzle type issue with date columns
        const [booking] = await db.insert(bookings).values({
          leadId: lead.id,
          eventDate: eventDate,
          eventTime: eventTimes[Math.floor(Math.random() * eventTimes.length)],
          guestCount: guestCount,
          allergyDetails: [],
          specialRequests: null,
          estimatedTotal: estimatedTotal.toString(),
          requiresDeposit: estimatedTotal > 2000,
          status: status,
          internalNotes: `Test booking for ${name}`,
          termsAccepted: true,
          termsAcceptedAt: new Date(),
        }).returning();

        // Create booking items
        for (const item of bookingItemsToCreate) {
          // @ts-ignore - Drizzle type issue with itemType
          await db.insert(bookingItems).values({
            bookingId: booking.id,
            itemType: item.itemType as "menu_item" | "addon",
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          });
        }

        bookingCount++;
      }
    }

    console.log(`✅ Created ${bookingCount} bookings for the last 30 days`);
    console.log("🎉 Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedDailyBookings().then(() => process.exit(0));
