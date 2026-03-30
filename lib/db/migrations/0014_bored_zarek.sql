CREATE TABLE "booking_checkins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"has_changes" boolean NOT NULL,
	"guest_count_changed" boolean NOT NULL,
	"new_guest_count" integer,
	"vegetarian_count" integer,
	"vegan_count" integer,
	"non_vegetarian_count" integer,
	"menu_changes" text,
	"additional_details" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"language" text DEFAULT 'English' NOT NULL,
	"time_zone" text DEFAULT 'Europe/Zurich' NOT NULL,
	"date_format" text DEFAULT 'DD/MM/YYYY' NOT NULL,
	"currency" text DEFAULT 'CHF' NOT NULL,
	"show_currency_symbol" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"updated_by" text
);
--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'new';--> statement-breakpoint
ALTER TABLE "addons" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "billing_address" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "room" text;--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "room" text;--> statement-breakpoint
ALTER TABLE "menu_categories" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "menu_items" ADD COLUMN "average_consumption" integer;--> statement-breakpoint
ALTER TABLE "menu_items" ADD COLUMN "dietary_type" text DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "menu_items" ADD COLUMN "dietary_tags" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "menu_items" ADD COLUMN "ingredients" text;--> statement-breakpoint
ALTER TABLE "menu_items" ADD COLUMN "allergens" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "menu_items" ADD COLUMN "additives" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "menu_items" ADD COLUMN "nutritional_info" jsonb;--> statement-breakpoint
ALTER TABLE "menu_items" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "booking_checkins" ADD CONSTRAINT "booking_checkins_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booking_checkins_booking_id_idx" ON "booking_checkins" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "system_settings_id_idx" ON "system_settings" USING btree ("id");--> statement-breakpoint
ALTER TABLE "menu_items" DROP COLUMN "is_vegetarian";--> statement-breakpoint
ALTER TABLE "menu_items" DROP COLUMN "is_vegan";--> statement-breakpoint
ALTER TABLE "menu_items" DROP COLUMN "is_gluten_free";