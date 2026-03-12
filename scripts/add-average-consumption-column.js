import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from '../lib/db/schema';
import { sql } from 'drizzle-orm';

async function addAverageConsumptionColumn() {
  console.log('🔄 Adding average_consumption column to menu_items table...\n');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable is not set!');
    console.log('Please set DATABASE_URL in your .env file, for example:');
    console.log('DATABASE_URL=postgresql://user:password@localhost:5432/your_database');
    process.exit(1);
  }

  const client = postgres(connectionString);

  try {
    console.log('📋 Step 1: Adding average_consumption column...');
    await client.unsafe(`
      ALTER TABLE "menu_items" ADD COLUMN IF NOT EXISTS "average_consumption" integer;
    `);
    console.log('✅ Column added successfully!\n');

    console.log('📋 Step 2: Creating index on average_consumption...');
    await client.unsafe(`
      CREATE INDEX IF NOT EXISTS "menu_items_average_consumption_idx" ON "menu_items"("average_consumption");
    `);
    console.log('✅ Index created successfully!\n');

    console.log('📋 Step 3: Adding comment for documentation...');
    await client.unsafe(`
      COMMENT ON COLUMN "menu_items"."average_consumption" IS 'Number of people served per unit for consumption-based pricing (e.g., 1 bottle serves 3 people)';
    `);
    console.log('✅ Comment added successfully!\n');

    console.log('📋 Step 4: Verifying the column...');
    const result = await client.unsafe(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'menu_items' AND column_name = 'average_consumption';
    `);

    if (result.length > 0) {
      console.log('✅ Column verified successfully!');
      console.log('\n📊 Column details:');
      console.table(result);
    } else {
      console.log('⚠️  Warning: Column not found in information_schema');
    }

    console.log('\n🎉 SUCCESS! average_consumption column has been added to the menu_items table!');
    console.log('\n💡 Next steps:');
    console.log('1. Restart your development server');
    console.log('2. Test the beverage quantity recommendation feature');
    console.log('3. Create a "Bill by Consumption" menu item with average consumption set');

  } catch (error) {
    console.error('\n❌ ERROR: Failed to add column:', error.message);
    console.error('\n📝 Full error details:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run the migration
addAverageConsumptionColumn();
