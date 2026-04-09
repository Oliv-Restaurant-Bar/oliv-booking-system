CREATE TABLE "category_visibility_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" uuid,
	"visibility_schedule_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item_visibility_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid,
	"visibility_schedule_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "visibility_schedules" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "category_visibility_schedules" ADD CONSTRAINT "category_visibility_schedules_category_id_menu_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."menu_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category_visibility_schedules" ADD CONSTRAINT "category_visibility_schedules_visibility_schedule_id_visibility_schedules_id_fk" FOREIGN KEY ("visibility_schedule_id") REFERENCES "public"."visibility_schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_visibility_schedules" ADD CONSTRAINT "item_visibility_schedules_item_id_menu_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."menu_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_visibility_schedules" ADD CONSTRAINT "item_visibility_schedules_visibility_schedule_id_visibility_schedules_id_fk" FOREIGN KEY ("visibility_schedule_id") REFERENCES "public"."visibility_schedules"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "category_visibility_schedules_category_id_idx" ON "category_visibility_schedules" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "category_visibility_schedules_schedule_id_idx" ON "category_visibility_schedules" USING btree ("visibility_schedule_id");--> statement-breakpoint
CREATE INDEX "item_visibility_schedules_item_id_idx" ON "item_visibility_schedules" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "item_visibility_schedules_schedule_id_idx" ON "item_visibility_schedules" USING btree ("visibility_schedule_id");