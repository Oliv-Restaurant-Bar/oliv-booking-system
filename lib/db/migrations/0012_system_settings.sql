-- Create system_settings table
CREATE TABLE IF NOT EXISTS "system_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"language" text NOT NULL DEFAULT 'English',
	"time_zone" text NOT NULL DEFAULT 'Europe/Zurich',
	"date_format" text NOT NULL DEFAULT 'DD/MM/YYYY',
	"currency" text NOT NULL DEFAULT 'CHF',
	"show_currency_symbol" boolean NOT NULL DEFAULT true,
	"updated_at" timestamp with time zone NOT NULL DEFAULT now(),
	"updated_by" text
);

-- Create index on system_settings.id
CREATE INDEX IF NOT EXISTS "system_settings_id_idx" ON "system_settings" ("id");
