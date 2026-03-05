import { config } from "dotenv";
config({ path: ".env" });

import { db } from "@/lib/db";
import { bookings, bookingItems } from "@/lib/db/schema";
import { sql } from "drizzle-orm";

async function recalculateBookingTotals() {
  console.log("🔄 Recalculating booking totals from booking_items...\n");

  try {
    // Get all bookings that need recalculation
    const allBookings = await db.execute(sql`
      SELECT id, estimated_total
      FROM bookings
    `);

    const bookingsData = ('rows' in allBookings ? allBookings.rows : allBookings) as any[];

    let updatedCount = 0;
    let totalRevenue = 0;

    for (const booking of bookingsData) {
      // Get booking items for this booking
      const itemsResult = await db.execute(sql`
        SELECT
          unit_price,
          quantity
        FROM booking_items
        WHERE booking_id = ${booking.id}
      `);

      const itemsData = 'rows' in itemsResult ? itemsResult.rows : itemsResult;
      const items = itemsData as any[];

      // Calculate total from booking items
      let calculatedTotal = 0;
      for (const item of items) {
        const unitPrice = Number(item.unit_price) || 0;
        const quantity = Number(item.quantity) || 0;
        calculatedTotal += unitPrice * quantity;
      }

      // Update if different
      const currentTotal = Number(booking.estimated_total) || 0;
      if (calculatedTotal !== currentTotal) {
        await db.execute(sql`
          UPDATE bookings
          SET estimated_total = ${calculatedTotal.toString()}
          WHERE id = ${booking.id}
        `);

        console.log(`✅ Updated booking ${booking.id.substring(0, 8)}: ${currentTotal.toFixed(2)} CHF → ${calculatedTotal.toFixed(2)} CHF`);
        updatedCount++;
      }

      totalRevenue += calculatedTotal;
    }

    console.log(`\n📊 Summary:`);
    console.log(`   Updated: ${updatedCount} bookings`);
    console.log(`   Total Revenue: CHF ${totalRevenue.toLocaleString('de-CH', { minimumFractionDigits: 2 })}`);
    console.log(`   Avg per booking: CHF ${(totalRevenue / bookingsData.length).toFixed(2)}`);
  } catch (error) {
    console.error("❌ Recalculation failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

recalculateBookingTotals();
