CREATE TABLE "item_addon_groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"item_id" uuid,
	"addon_group_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "menu_categories" ADD COLUMN "guest_count" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "item_addon_groups" ADD CONSTRAINT "item_addon_groups_item_id_menu_items_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."menu_items"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_addon_groups" ADD CONSTRAINT "item_addon_groups_addon_group_id_addon_groups_id_fk" FOREIGN KEY ("addon_group_id") REFERENCES "public"."addon_groups"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "item_addon_groups_item_id_idx" ON "item_addon_groups" USING btree ("item_id");--> statement-breakpoint
CREATE INDEX "item_addon_groups_addon_group_id_idx" ON "item_addon_groups" USING btree ("addon_group_id");