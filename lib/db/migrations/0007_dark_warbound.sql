CREATE TABLE "kitchen_pdf_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"booking_id" integer NOT NULL,
	"document_name" text NOT NULL,
	"sent_at" timestamp NOT NULL,
	"sent_by" text NOT NULL,
	"recipient_email" text NOT NULL,
	"status" text NOT NULL,
	"error_message" text,
	"idempotency_key" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "kitchen_pdf_logs_idempotency_key_unique" UNIQUE("idempotency_key")
);
--> statement-breakpoint
ALTER TABLE "kitchen_pdf_logs" ADD CONSTRAINT "kitchen_pdf_logs_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "kitchen_pdf_logs_booking_id_idx" ON "kitchen_pdf_logs" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "kitchen_pdf_logs_idempotency_key_idx" ON "kitchen_pdf_logs" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "kitchen_pdf_logs_sent_at_idx" ON "kitchen_pdf_logs" USING btree ("sent_at");