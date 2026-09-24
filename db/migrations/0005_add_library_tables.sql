CREATE TABLE "library_creatures" (
	"id" uuid PRIMARY KEY NOT NULL,
	"system_id" text NOT NULL,
	"name" text NOT NULL,
	"desc" text NOT NULL,
	"tag" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "library_feats" (
	"id" uuid PRIMARY KEY NOT NULL,
	"system_id" text NOT NULL,
	"name" text NOT NULL,
	"desc" text NOT NULL,
	"tag" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "library_languages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"system_id" text NOT NULL,
	"name" text NOT NULL,
	"desc" text NOT NULL,
	"tag" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "library_skills" (
	"id" uuid PRIMARY KEY NOT NULL,
	"system_id" text NOT NULL,
	"name" text NOT NULL,
	"desc" text NOT NULL,
	"tag" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "library_special_abilities" (
	"id" uuid PRIMARY KEY NOT NULL,
	"system_id" text NOT NULL,
	"name" text NOT NULL,
	"subtitle" text NOT NULL,
	"uses" text NOT NULL,
	"desc" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "library_spells" (
	"id" uuid PRIMARY KEY NOT NULL,
	"system_id" text NOT NULL,
	"name" text NOT NULL,
	"school" text NOT NULL,
	"circle" integer NOT NULL,
	"cast_time" text NOT NULL,
	"range" text NOT NULL,
	"duration" text NOT NULL,
	"resistance" text NOT NULL,
	"desc" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "library_weapons" (
	"id" uuid PRIMARY KEY NOT NULL,
	"system_id" text NOT NULL,
	"name" text NOT NULL,
	"atk" text NOT NULL,
	"crit" text NOT NULL,
	"dmg" text NOT NULL,
	"type" text NOT NULL,
	"range" text NOT NULL,
	"desc" text NOT NULL,
	"has_ammo" boolean DEFAULT false NOT NULL,
	"ammo_max" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "library_creatures" ADD CONSTRAINT "library_creatures_system_id_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."systems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "library_feats" ADD CONSTRAINT "library_feats_system_id_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."systems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "library_languages" ADD CONSTRAINT "library_languages_system_id_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."systems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "library_skills" ADD CONSTRAINT "library_skills_system_id_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."systems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "library_special_abilities" ADD CONSTRAINT "library_special_abilities_system_id_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."systems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "library_spells" ADD CONSTRAINT "library_spells_system_id_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."systems"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "library_weapons" ADD CONSTRAINT "library_weapons_system_id_systems_id_fk" FOREIGN KEY ("system_id") REFERENCES "public"."systems"("id") ON DELETE cascade ON UPDATE no action;