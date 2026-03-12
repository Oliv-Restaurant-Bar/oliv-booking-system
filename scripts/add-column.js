const postgres = require('postgres');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

async function addColumn() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ DATABASE_URL not set in .env file');
    process.exit(1);
  }

  const client = postgres(connectionString);

  try {
    console.log('🔄 Adding average_consumption column to menu_items table...\n');

    // Add the column
    console.log('Step 1: Adding column...');
    await client`
      ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS average_consumption integer;
    `;
    console.log('✅ Column added\n');

    // Create index
    console.log('Step 2: Creating index...');
    await client`
      CREATE INDEX IF NOT EXISTS menu_items_average_consumption_idx ON menu_items(average_consumption);
    `;
    console.log('✅ Index created\n');

    // Verify
    console.log('Step 3: Verifying...');
    const result = await client`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'menu_items' AND column_name = 'average_consumption'
    `;

    if (result.length > 0) {
      console.log('✅ Column verified!');
      console.log('\n🎉 SUCCESS! Column added successfully!');
    } else {
      console.log('⚠️  Column not found');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

addColumn();
