const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '.env' }); // Load from .env instead of .env

const db = neon(process.env.DATABASE_URL);

async function update() {
  try {
    console.log('Step 1: Dropping old constraint...');
    await db.sql`ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS menu_items_pricing_type_check`;
    console.log('✅ Old constraint dropped');

    console.log('Step 2: Adding new constraint with billed_by_consumption...');
    await db.sql`ALTER TABLE menu_items ADD CONSTRAINT menu_items_pricing_type_check CHECK (pricing_type IN ('per_person', 'flat_fee', 'billed_by_consumption'))`;
    console.log('✅ New constraint added');

    console.log('\n✅ Successfully updated pricing_type enum to include billed_by_consumption!');
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

update();
