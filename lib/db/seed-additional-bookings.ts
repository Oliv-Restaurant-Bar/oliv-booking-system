import { config } from "dotenv";
config({ path: ".env" });

import { db } from "@/lib/db";
import {
  leads,
  bookings,
  bookingItems,
} from "@/lib/db/schema";
import { randomUUID } from "crypto";

async function seedAdditionalBookings() {
  console.log("📝 Creating additional test bookings across multiple months...");

  try {
    const currentYear = new Date().getFullYear();

    // Additional test bookings spread across different months
    const testBookings = [
      // March bookings
      { month: 2, name: "Klaus Schneider", email: "klaus.schneider@email.com", phone: "+41 78 999 88 77", guestCount: 22, status: "confirmed" },
      { month: 2, name: "Monica Frei", email: "monica.frei@email.com", phone: "+41 76 777 66 55", guestCount: 16, status: "pending" },
      { month: 2, name: "Rolf Baumann", email: "rolf.baumann@email.com", phone: "+41 79 444 33 22", guestCount: 35, status: "completed" },
      { month: 2, name: "Urs Wirth", email: "urs.wirth@email.com", phone: "+41 78 222 11 00", guestCount: 14, status: "declined" },

      // April bookings
      { month: 3, name: "Ruth Berger", email: "ruth.berger@email.com", phone: "+41 79 555 44 33", guestCount: 28, status: "confirmed" },
      { month: 3, name: "Walter Sutter", email: "walter.sutter@email.com", phone: "+41 77 333 22 11", guestCount: 12, status: "pending" },
      { month: 3, name: "Erika Neuhaus", email: "erika.neuhaus@email.com", phone: "+41 76 111 00 99", guestCount: 20, status: "confirmed" },

      // May bookings
      { month: 4, name: "Fritz Hofer", email: "fritz.hofer@email.com", phone: "+41 78 888 77 66", guestCount: 18, status: "completed" },
      { month: 4, name: "Gisela Lang", email: "gisela.lang@email.com", phone: "+41 79 222 33 44", guestCount: 24, status: "completed" },
      { month: 4, name: "Heinz Steiner", email: "heinz.steiner@email.com", phone: "+41 77 666 55 44", guestCount: 10, status: "no_show" },

      // June bookings
      { month: 5, name: "Margrit Kuhn", email: "margrit.kuhn@email.com", phone: "+41 76 444 33 22", guestCount: 32, status: "confirmed" },
      { month: 5, name: "Ernst Hauser", email: "ernst.hauser@email.com", phone: "+41 79 111 22 33", guestCount: 16, status: "pending" },
      { month: 5, name: "Rosa Blaser", email: "rosa.blaser@email.com", phone: "+41 78 555 66 77", guestCount: 22, status: "confirmed" },
      { month: 5, name: "Oskar Reh", email: "oskar.reh@email.com", phone: "+41 77 888 99 00", guestCount: 14, status: "cancelled" },

      // July bookings
      { month: 6, name: "Helena Gross", email: "helena.gross@email.com", phone: "+41 78 333 44 55", guestCount: 26, status: "completed" },
      { month: 6, name: "Martin Zimmermann", email: "martin.zimmermann@email.com", phone: "+41 79 777 88 99", guestCount: 19, status: "completed" },
      { month: 6, name: "Brigitte Kaufmann", email: "brigitte.kaufmann@email.com", phone: "+41 76 222 33 44", guestCount: 31, status: "confirmed" },

      // August bookings
      { month: 7, name: "Konrad Pfenninger", email: "konrad.pfenninger@email.com", phone: "+41 77 111 22 33", guestCount: 17, status: "pending" },
      { month: 7, name: "Verena Hug", email: "verena.hug@email.com", phone: "+41 78 444 55 66", guestCount: 23, status: "confirmed" },
      { month: 7, name: "Werner Frei", email: "werner.frei@email.com", phone: "+41 79 666 77 88", guestCount: 13, status: "no_show" },

      // September bookings
      { month: 8, name: "Christine Bühler", email: "christine.buhler@email.com", phone: "+41 76 555 66 77", guestCount: 29, status: "completed" },
      { month: 8, name: "Andreas Moser", email: "andreas.moser@email.com", phone: "+41 78 777 88 99", guestCount: 21, status: "completed" },
      { month: 8, name: "Ruth Meier", email: "ruth.meier@email.com", phone: "+41 79 888 99 00", guestCount: 15, status: "declined" },

      // October bookings
      { month: 9, name: "Jürg Löffel", email: "juerg.loeffel@email.com", phone: "+41 77 999 00 11", guestCount: 27, status: "confirmed" },
      { month: 9, name: "Susanne Wolf", email: "susanne.wolf@email.com", phone: "+41 78 111 22 33", guestCount: 18, status: "pending" },
      { month: 9, name: "Hanspeter Burkhardt", email: "hanspeter.burkhardt@email.com", phone: "+41 79 222 33 44", guestCount: 33, status: "confirmed" },

      // November bookings
      { month: 10, name: "Emanuel Bucher", email: "emanuel.bucher@email.com", phone: "+41 76 333 44 55", guestCount: 24, status: "completed" },
      { month: 10, name: "Vreni Gasser", email: "vreni.gasser@email.com", phone: "+41 78 444 55 66", guestCount: 16, status: "completed" },
      { month: 10, name: "Köbi Stalder", email: "kobi.stalder@email.com", phone: "+41 79 555 66 77", guestCount: 11, status: "cancelled" },

      // December bookings
      { month: 11, name: "Niklaus Hochstrasser", email: "niklaus.hochstrasser@email.com", phone: "+41 77 666 77 88", guestCount: 30, status: "confirmed" },
      { month: 11, name: "Elsbeth Weibel", email: "elsbeth.weibel@email.com", phone: "+41 78 777 88 99", guestCount: 25, status: "pending" },
      { month: 11, name: "Rudolf Streiff", email: "rudolf.streiff@email.com", phone: "+41 79 888 99 00", guestCount: 40, status: "confirmed" },
      { month: 11, name: "Anna Barbara Engel", email: "anna.barbara.engel@email.com", phone: "+41 76 999 00 11", guestCount: 22, status: "no_show" },
    ];

    // Get menu items
    const allMenuItems = await db.query.menuItems.findMany();

    const eventTimes = ["18:00:00", "18:30:00", "19:00:00", "19:30:00", "20:00:00"];

    for (const bookingData of testBookings) {
      // Create event date for the specified month
      const eventDate = new Date(currentYear, bookingData.month, Math.floor(Math.random() * 25) + 1);

      // Create lead
      // @ts-ignore - Drizzle ORM type compatibility issue
      const [lead] = await db.insert(leads).values({
        id: randomUUID(),
        contactName: bookingData.name,
        contactEmail: bookingData.email,
        contactPhone: bookingData.phone,
        eventDate: eventDate,
        eventTime: eventTimes[Math.floor(Math.random() * eventTimes.length)],
        guestCount: bookingData.guestCount,
        source: "manual",
        status: "contacted",
      }).returning();

      // Randomly select 2-3 menu items for this booking
      const shuffledMenuItems = [...allMenuItems].sort(() => Math.random() - 0.5);
      const selectedMenuItems = shuffledMenuItems.slice(0, Math.floor(Math.random() * 2) + 2);
      let estimatedTotal = 0;

      const bookingItemsToCreate = [];

      for (const menuItem of selectedMenuItems) {
        const quantity = Math.floor(Math.random() * 2) + 1;
        const pricePerPerson = Number(menuItem.pricePerPerson);
        const itemTotal = pricePerPerson * quantity * bookingData.guestCount;
        estimatedTotal += itemTotal;

        bookingItemsToCreate.push({
          itemType: "menu_item",
          itemId: menuItem.id,
          quantity,
          unitPrice: menuItem.pricePerPerson,
        });
      }

      // Create booking
      // @ts-ignore - Drizzle ORM type compatibility issue
      const [booking] = await db.insert(bookings).values({
        leadId: lead.id,
        eventDate: eventDate,
        eventTime: eventTimes[Math.floor(Math.random() * eventTimes.length)],
        guestCount: bookingData.guestCount,
        allergyDetails: [],
        specialRequests: null,
        estimatedTotal: estimatedTotal.toString(),
        requiresDeposit: estimatedTotal > 2000,
        status: bookingData.status,
        internalNotes: `Test booking for ${bookingData.name}`,
        termsAccepted: true,
        termsAcceptedAt: new Date(),
      }).returning();

      // Create booking items
      for (const item of bookingItemsToCreate) {
        // @ts-ignore - Drizzle ORM type compatibility issue
        await db.insert(bookingItems).values({
          bookingId: booking.id,
          itemType: item.itemType as "menu_item" | "addon",
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        });
      }
    }

    console.log(`✅ Created ${testBookings.length} additional test bookings across multiple months`);
    console.log("🎉 Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seedAdditionalBookings().then(() => process.exit(0));
