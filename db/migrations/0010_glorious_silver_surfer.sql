CREATE TABLE "character_shares" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"shared_with_user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "character_shares" ADD CONSTRAINT "character_shares_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_shares" ADD CONSTRAINT "character_shares_shared_with_user_id_users_id_fk" FOREIGN KEY ("shared_with_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "character_shares_unique" ON "character_shares" USING btree ("character_id","shared_with_user_id");--> statement-breakpoint
CREATE INDEX "character_shares_shared_with_idx" ON "character_shares" USING btree ("shared_with_user_id");