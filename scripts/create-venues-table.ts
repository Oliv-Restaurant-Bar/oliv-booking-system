import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

// Load environment variables from .env.local
import * as dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

async function createVenuesTable() {
  try {
    console.log('Creating venues table...');

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "venues" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name" text NOT NULL UNIQUE,
        "is_active" boolean DEFAULT true NOT NULL,
        "sort_order" integer DEFAULT 0 NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "venues_name_idx"
      ON "venues" USING btree ("name");
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "venues_sort_order_idx"
      ON "venues" USING btree ("sort_order");
    `);

    // Insert default venues
    await db.execute(sql`
      INSERT INTO venues (name, sort_order)
      VALUES
        ('Main Hall', 1),
        ('Garden Terrace', 2),
        ('Private Dining Room', 3),
        ('Rooftop Bar', 4),
        ('Basement Lounge', 5)
      ON CONFLICT (name) DO NOTHING;
    `);

    console.log('✅ venues table created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating table:', error);
    process.exit(1);
  }
}

createVenuesTable();
