CREATE TABLE "character_photos" (
	"id" uuid PRIMARY KEY NOT NULL,
	"character_id" uuid NOT NULL,
	"data_url" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "character_photos" ADD CONSTRAINT "character_photos_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "character_photos_character_id_idx" ON "character_photos" USING btree ("character_id","sort_order");