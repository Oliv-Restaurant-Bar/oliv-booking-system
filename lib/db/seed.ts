import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "@/lib/db";
import {
  adminUser,
  menuCategories,
  menuItems,
  addons,
  leads,
  bookings,
  bookingItems,
  account,
} from "@/lib/db/schema";
import { randomUUID } from "crypto";
import { eq } from "drizzle-orm";
import * as argon2 from "@node-rs/argon2";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    // Check if admin already exists
    const existingAdmin = await db.query.adminUser.findFirst({
      where: eq(adminUser.email, "admin@oliv-restaurant.ch"),
    });

    if (!existingAdmin) {
      // Hash the password using argon2 (same as Better Auth)
      const hashedPassword = await argon2.hash("admin123", {
        memoryCost: 19456,
        timeCost: 2,
        outputLen: 32,
        parallelism: 1,
      });

      // Create admin user
      const adminId = randomUUID();
      await db.insert(adminUser).values({
        id: adminId,
        name: "Super Admin",
        email: "admin@oliv-restaurant.ch",
        emailVerified: true,
        role: "super_admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Create credential account with password
      await db.insert(account).values({
        id: randomUUID(),
        userId: adminId,
        accountId: "admin@oliv-restaurant.ch",
        providerId: "credential",
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      console.log("✅ Admin user created: admin@oliv-restaurant.ch / admin123");
    } else {
      console.log("ℹ️ Admin user already exists");

      // Check if account exists
      const existingAccount = await db.query.account.findFirst({
        where: eq(account.userId, existingAdmin.id),
      });

      if (!existingAccount) {
        const hashedPassword = await argon2.hash("admin123", {
          memoryCost: 19456,
          timeCost: 2,
          outputLen: 32,
          parallelism: 1,
        });
        await db.insert(account).values({
          id: randomUUID(),
          userId: existingAdmin.id,
          accountId: "admin@oliv-restaurant.ch",
          providerId: "credential",
          password: hashedPassword,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        console.log("✅ Credential account created for existing admin");
      }
    }

    // Check if menu categories exist
    const existingCategories = await db.query.menuCategories.findMany();
    if (existingCategories.length === 0) {
      // Create menu categories
      const [appetizers] = await db
        .insert(menuCategories)
        .values({
          id: randomUUID(),
          name: "Appetizers",
          nameDe: "Vorspeisen",
          description: "Start your meal with our delicious appetizers",
          descriptionDe:
            "Starten Sie Ihr Menü mit unseren köstlichen Vorspeisen",
          sortOrder: 1,
          isActive: true,
        })
        .returning();

      const [mains] = await db
        .insert(menuCategories)
        .values({
          id: randomUUID(),
          name: "Main Courses",
          nameDe: "Hauptgerichte",
          description: "Our signature main dishes",
          descriptionDe: "unsere Signature-Hauptgerichte",
          sortOrder: 2,
          isActive: true,
        })
        .returning();

      const [desserts] = await db
        .insert(menuCategories)
        .values({
          id: randomUUID(),
          name: "Desserts",
          nameDe: "Nachspeisen",
          description: "Sweet endings to your meal",
          descriptionDe: "Süße Enden für Ihr Mahl",
          sortOrder: 3,
          isActive: true,
        })
        .returning();

      console.log("✅ Menu categories created");

      // Create menu items
      await db.insert(menuItems).values([
        {
          id: randomUUID(),
          categoryId: appetizers.id,
          name: "Rösti",
          nameDe: "Rösti",
          description: "Traditional Swiss potato dish",
          descriptionDe: "Traditionelles Schweizer Kartoffelgericht",
          pricePerPerson: "12.00",
          sortOrder: 1,
          isActive: true,
        },
        {
          id: randomUUID(),
          categoryId: appetizers.id,
          name: "Cheese Fondue",
          nameDe: "Käsefondue",
          description: "Melted cheese with bread cubes",
          descriptionDe: "Geschmolzener Käse mit Brotwürfeln",
          pricePerPerson: "24.00",
          sortOrder: 2,
          isActive: true,
        },
        {
          id: randomUUID(),
          categoryId: mains.id,
          name: "Zurich Style Veal",
          nameDe: "Zürcher Geschnetzeltes",
          description: "Creamy veal strips with mushrooms",
          descriptionDe: "Cremige Kalbsstreifen mit Pilzen",
          pricePerPerson: "38.00",
          sortOrder: 1,
          isActive: true,
        },
        {
          id: randomUUID(),
          categoryId: mains.id,
          name: "Raclette",
          nameDe: "Raclette",
          description: "Melted cheese over potatoes and pickles",
          descriptionDe: "Geschmolzener Käse über Kartoffeln und Gewürzgurken",
          pricePerPerson: "32.00",
          sortOrder: 2,
          isActive: true,
        },
        {
          id: randomUUID(),
          categoryId: desserts.id,
          name: "Chocolate Fondue",
          nameDe: "Schokoladenfondue",
          description: "Warm melted chocolate with fruits",
          descriptionDe: "Warmer geschmolzener Schokolade mit Früchten",
          pricePerPerson: "16.00",
          sortOrder: 1,
          isActive: true,
        },
      ]);

      console.log("✅ Menu items created");

      // Create addons
      await db.insert(addons).values([
        {
          id: randomUUID(),
          name: "Welcome Drink",
          nameDe: "Begrüssungsgetränk",
          description: "Glass of prosecco or aperitif",
          descriptionDe: "Ein Glas Prosecco oder Aperitif",
          price: "8.00",
          pricingType: "per_person",
          isActive: true,
        },
        {
          id: randomUUID(),
          name: "Table Decoration",
          nameDe: "Tischdekoration",
          description: "Floral arrangement for your table",
          descriptionDe: "Blumenarrangement für Ihren Tisch",
          price: "50.00",
          pricingType: "flat_fee",
          isActive: true,
        },
      ]);

      console.log("✅ Addons created");
    } else {
      console.log("ℹ️ Menu data already exists");
    }

    // === Create test bookings with booking items ===
    const existingBookings = await db.query.bookings.findMany();
    if (existingBookings.length === 0) {
      console.log("📝 Creating test bookings...");

      // Get menu items for bookings
      const allMenuItems = await db.query.menuItems.findMany();
      const allCategories = await db.query.menuCategories.findMany();

      const currentYear = new Date().getFullYear();

      // Create test bookings spread across different months
      const testBookings = [
        // January bookings
        { month: 0, name: "Maria Schmidt", email: "maria.schmidt@email.com", phone: "+41 79 123 45 67", guestCount: 15, status: "completed" },
        { month: 0, name: "Thomas Weber", email: "thomas.weber@email.com", phone: "+41 78 234 56 78", guestCount: 20, status: "completed" },
        { month: 0, name: "Sophie Keller", email: "sophie.keller@email.com", phone: "+41 76 345 67 89", guestCount: 12, status: "confirmed" },

        // February bookings
        { month: 1, name: "Hans Weiss", email: "hans.weiss@email.com", phone: "+41 79 987 65 43", guestCount: 25, status: "completed" },
        { month: 1, name: "Anna Brunner", email: "anna.brunner@email.com", phone: "+41 78 654 32 10", guestCount: 18, status: "completed" },
        { month: 1, name: "Peter Meyer", email: "peter.meyer@email.com", phone: "+41 77 543 21 09", guestCount: 30, status: "confirmed" },
        { month: 1, name: "Lisa Fischer", email: "lisa.fischer@email.com", phone: "+41 79 111 22 33", guestCount: 8, status: "pending" },

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
      ];

      const statuses: ("confirmed" | "pending" | "completed" | "declined" | "no_show" | "cancelled")[] =
        ["confirmed", "pending", "completed", "declined", "no_show", "cancelled"];

      const eventTimes = ["18:00:00", "18:30:00", "19:00:00", "19:30:00", "20:00:00"];

      for (const bookingData of testBookings) {
        // Create event date for the specified month
        const eventDate = new Date(currentYear, bookingData.month, Math.floor(Math.random() * 25) + 1);

        // Create lead
        // @ts-ignore - Drizzle type issue with date columns
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
        // @ts-ignore - Drizzle type issue with date columns
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
          // @ts-ignore - Drizzle type issue with itemType
          await db.insert(bookingItems).values({
            bookingId: booking.id,
            itemType: item.itemType as "menu_item" | "addon",
            itemId: item.itemId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          });
        }
      }

      console.log(`✅ Created ${testBookings.length} test bookings across multiple months`);
    } else {
      console.log(`ℹ️ ${existingBookings.length} bookings already exist`);
    }

    console.log("🎉 Seeding completed successfully!");
    console.log("\n📝 Login credentials:");
    console.log("   Email: admin@oliv-restaurant.ch");
    console.log("   Password: admin123");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed().then(() => process.exit(0));
