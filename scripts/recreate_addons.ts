import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function main() {
    console.log("Recreating addons table...");
    await db.execute(sql`
    CREATE TABLE IF NOT EXISTS addons (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name TEXT NOT NULL,
      name_de TEXT NOT NULL,
      description TEXT,
      description_de TEXT,
      price NUMERIC(10, 2) NOT NULL,
      pricing_type TEXT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

    await db.execute(sql`
    CREATE INDEX IF NOT EXISTS addons_pricing_type_idx ON addons(pricing_type);
  `);

    console.log("Addons table recreated successfully!");
    process.exit(0);
}

main().catch(e => {
    console.error("Error creating table:", e);
    process.exit(1);
});
