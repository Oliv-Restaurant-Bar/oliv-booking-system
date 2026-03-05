import { config } from "dotenv";
config({ path: ".env" });

import { neon } from '@neondatabase/serverless';

const sql = `
  ALTER TABLE "menu_items"
  DROP CONSTRAINT IF EXISTS "menu_items_pricing_type_check";

  ALTER TABLE "menu_items"
  ADD CONSTRAINT "menu_items_pricing_type_check"
  CHECK ("pricing_type" IN ('per_person', 'flat_fee', 'billed_by_consumption'));
`;

async function updateEnum() {
  console.log('Updating pricing_type enum...');
  const database = neon(process.env.DATABASE_URL!);

  try {
    await (database as any).sql(sql);
    console.log('✅ Successfully updated pricing_type enum');
  } catch (error) {
    console.error('❌ Error updating enum:', error);
    throw error;
  }
}

updateEnum()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
