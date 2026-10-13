CREATE TABLE IF NOT EXISTS "library_creature_types" (
	"id" uuid PRIMARY KEY NOT NULL,
	"system_id" text NOT NULL,
	"name" text NOT NULL,
	"desc" text NOT NULL,
	"tag" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "library_races" (
	"id" uuid PRIMARY KEY NOT NULL,
	"system_id" text NOT NULL,
	"name" text NOT NULL,
	"desc" text NOT NULL,
	"tag" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "tipo_criatura" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN IF NOT EXISTS "subtipo_criatura" text DEFAULT '' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "library_creature_types" ADD CONSTRAINT "library_creature_types_system_id_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."systems"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "library_races" ADD CONSTRAINT "library_races_system_id_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."systems"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN NULL;
END $$;
