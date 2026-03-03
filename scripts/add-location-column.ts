/**
 * Add location column to bookings table
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

// Load environment variables
config({ path: resolve(process.cwd(), '.env') });

async function addLocationColumn() {
  try {
    console.log('Adding location column to bookings table...');

    // Check if column already exists
    const checkResult = await db.execute(sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'bookings'
      AND column_name = 'location'
    `);

    const rows = 'rows' in checkResult ? checkResult.rows : checkResult;

    if (rows && (rows as any[]).length > 0) {
      console.log('✅ Column "location" already exists in bookings table');
      return;
    }

    // Add the column
    await db.execute(sql`
      ALTER TABLE bookings
      ADD COLUMN location TEXT
    `);

    console.log('✅ Successfully added location column to bookings table');
  } catch (error) {
    console.error('❌ Error adding location column:', error);
    throw error;
  }
}

// Run the migration
addLocationColumn()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
