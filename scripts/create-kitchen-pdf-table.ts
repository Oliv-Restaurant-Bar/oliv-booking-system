import 'dotenv/config';
import { resolve } from 'path';
import { config } from 'dotenv';

// Load environment variables from .env.local
config({ path: resolve(process.cwd(), '.env.local') });

import { db } from '../lib/db';
import { sql } from 'drizzle-orm';

async function createKitchenPdfLogsTable() {
  try {
    console.log('Creating kitchen_pdf_logs table...');

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "kitchen_pdf_logs" (
        "id" text PRIMARY KEY NOT NULL,
        "booking_id" uuid NOT NULL,
        "document_name" text NOT NULL,
        "sent_at" timestamp NOT NULL,
        "sent_by" text NOT NULL,
        "recipient_email" text NOT NULL,
        "status" text NOT NULL,
        "error_message" text,
        "idempotency_key" text UNIQUE,
        "created_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "kitchen_pdf_logs_booking_id_bookings_id_fk"
          FOREIGN KEY ("booking_id")
          REFERENCES "public"."bookings"("id")
          ON DELETE cascade
          ON UPDATE no action
      );
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "kitchen_pdf_logs_booking_id_idx"
      ON "kitchen_pdf_logs" USING btree ("booking_id");
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "kitchen_pdf_logs_idempotency_key_idx"
      ON "kitchen_pdf_logs" USING btree ("idempotency_key");
    `);

    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS "kitchen_pdf_logs_sent_at_idx"
      ON "kitchen_pdf_logs" USING btree ("sent_at");
    `);

    console.log('✅ kitchen_pdf_logs table created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating table:', error);
    process.exit(1);
  }
}

createKitchenPdfLogsTable();
