ALTER TABLE "bookings" ADD COLUMN "street" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "plz" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "business" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "occasion" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "reference" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "payment_method" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "use_same_address_for_billing" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "billing_street" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "billing_plz" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "billing_location" text;--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN "billing_reference" text;