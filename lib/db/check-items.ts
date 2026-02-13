import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "@/lib/db";
import { bookings, bookingItems, menuItems } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

async function checkBookingItems() {
  console.log("🔍 Checking booking items...\n");

  try {
    // Count bookings
    const bookingsCount = await db.execute(sql`SELECT COUNT(*) as count FROM bookings`);
    const bookingsResult = 'rows' in bookingsCount ? bookingsCount.rows : bookingsCount;
    console.log(`📋 Total bookings: ${(bookingsResult as any)[0]?.count || 0}`);

    // Count booking_items
    const itemsCount = await db.execute(sql`SELECT COUNT(*) as count FROM booking_items`);
    const itemsResult = 'rows' in itemsCount ? itemsCount.rows : itemsCount;
    console.log(`📦 Total booking items: ${(itemsResult as any)[0]?.count || 0}`);

    // Count menu items
    const menuItemsCount = await db.execute(sql`SELECT COUNT(*) as count FROM menu_items`);
    const menuResult = 'rows' in menuItemsCount ? menuItemsCount.rows : menuItemsCount;
    console.log(`🍽️ Total menu items: ${(menuResult as any)[0]?.count || 0}`);

    // Get a sample booking
    const sampleBooking = await db.execute(sql`
      SELECT id, estimated_total, status
      FROM bookings
      LIMIT 3
    `);
    const sampleData = 'rows' in sampleBooking ? sampleBooking.rows : sampleBooking;

    console.log(`\n📝 Sample bookings:`);
    for (const booking of sampleData as any[]) {
      console.log(`   ID: ${booking.id?.substring(0, 8)}`);
      console.log(`   Total: ${booking.estimated_total || 'NULL'}`);
      console.log(`   Status: ${booking.status}`);
      console.log('');
    }

  } catch (error) {
    console.error("❌ Check failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

checkBookingItems();
