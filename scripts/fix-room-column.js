const postgres = require('postgres');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

async function run() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not found in .env');
    process.exit(1);
  }

  const sql = postgres(process.env.DATABASE_URL);

  try {
    console.log('🔧 Adding room column to leads and bookings...');
    
    await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS room text;`;
    console.log('✅ Added room to leads.');

    await sql`ALTER TABLE bookings ADD COLUMN IF NOT EXISTS room text;`;
    console.log('✅ Added room to bookings.');

    console.log('🎉 Migration successful!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

run();
