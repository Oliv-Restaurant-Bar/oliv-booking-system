/**
 * Direct database migration script for soft delete
 * Run with: node scripts/migrate-soft-delete.js
 */

// Load environment variables
require('dotenv').config();

const postgres = require('postgres');

async function migrate() {
  const sql = postgres(process.env.DATABASE_URL);

  try {
    console.log('✅ Connected to database\n');

    // Add deleted_at to menu_categories
    console.log('1. Adding deleted_at to menu_categories...');
    await sql`ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP`;
    console.log('   ✅ Done\n');

    // Add deleted_at to menu_items
    console.log('2. Adding deleted_at to menu_items...');
    await sql`ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP`;
    console.log('   ✅ Done\n');

    // Add deleted_at to addons
    console.log('3. Adding deleted_at to addons...');
    await sql`ALTER TABLE addons ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP`;
    console.log('   ✅ Done\n');

    // Create indexes
    console.log('4. Creating indexes...');
    await sql`CREATE INDEX IF NOT EXISTS menu_categories_deleted_at_idx ON menu_categories(deleted_at)`;
    await sql`CREATE INDEX IF NOT EXISTS menu_items_deleted_at_idx ON menu_items(deleted_at)`;
    await sql`CREATE INDEX IF NOT EXISTS addons_deleted_at_idx ON addons(deleted_at)`;
    console.log('   ✅ Done\n');

    // Add comments
    console.log('5. Adding comments...');
    await sql`COMMENT ON COLUMN menu_categories.deleted_at IS 'Timestamp for soft delete. Set to NOW() when item is deleted, NULL means active.'`;
    await sql`COMMENT ON COLUMN menu_items.deleted_at IS 'Timestamp for soft delete. Set to NOW() when item is deleted, NULL means active.'`;
    await sql`COMMENT ON COLUMN addons.deleted_at IS 'Timestamp for soft delete. Set to NOW() when item is deleted, NULL means active.'`;
    console.log('   ✅ Done\n');

    console.log('🎉 Migration completed successfully!');
    console.log('\nSoft delete columns added:');
    console.log('  • menu_categories.deleted_at ✅');
    console.log('  • menu_items.deleted_at ✅');
    console.log('  • addons.deleted_at ✅');
    console.log('\nIndexes created for performance ✅');

    await sql.end();

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

migrate();
