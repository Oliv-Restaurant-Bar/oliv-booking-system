-- Add average_consumption column to menu_items table
-- This column stores how many people one unit of a consumption-based item serves
-- For example: 1 bottle of wine serves 3 people

-- Add the column
ALTER TABLE "menu_items" ADD COLUMN IF NOT EXISTS "average_consumption" integer;

-- Create an index on this column for efficient querying
CREATE INDEX IF NOT EXISTS "menu_items_average_consumption_idx" ON "menu_items"("average_consumption");

-- Add comment for documentation
COMMENT ON COLUMN "menu_items"."average_consumption" IS 'Number of people served per unit for consumption-based pricing (e.g., 1 bottle serves 3 people)';

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'menu_items' AND column_name = 'average_consumption';
