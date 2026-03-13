-- Run this directly against your database using psql or your database client
-- Or use: node -e "require('dotenv').config(); require('./lib/db'); (async () => { const { db } = require('./lib/db'); const sql = require('drizzle-orm'); /* execute SQL */ })();"

-- Add deleted_at column to menu_categories
ALTER TABLE menu_categories ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Add deleted_at column to menu_items
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Add deleted_at column to addons
ALTER TABLE addons ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS menu_categories_deleted_at_idx ON menu_categories(deleted_at);
CREATE INDEX IF NOT EXISTS menu_items_deleted_at_idx ON menu_items(deleted_at);
CREATE INDEX IF NOT EXISTS addons_deleted_at_idx ON addons(deleted_at);

-- Add comments
COMMENT ON COLUMN menu_categories.deleted_at IS 'Timestamp for soft delete. Set to NOW() when item is deleted, NULL means active.';
COMMENT ON COLUMN menu_items.deleted_at IS 'Timestamp for soft delete. Set to NOW() when item is deleted, NULL means active.';
COMMENT ON COLUMN addons.deleted_at IS 'Timestamp for soft delete. Set to NOW() when item is deleted, NULL means active.';
