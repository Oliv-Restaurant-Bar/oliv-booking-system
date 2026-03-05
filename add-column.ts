import { db } from "./lib/db";
import { sql } from "drizzle-orm";

async function main() {
    try {
        console.log("Adding assigned_to column...");
        await db.execute(sql`ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "assigned_to" text`);
        console.log("Adding foreign key constraint...");
        await db.execute(sql`
      DO $$ BEGIN
        ALTER TABLE "bookings" ADD CONSTRAINT "bookings_assigned_to_admin_user_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."admin_user"("id") ON DELETE no action ON UPDATE no action;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
        console.log("Done!");
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

main();
