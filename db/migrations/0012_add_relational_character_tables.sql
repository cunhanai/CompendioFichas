CREATE TABLE "character_abilities" (
	"character_id" uuid NOT NULL,
	"key" text NOT NULL,
	"base" integer DEFAULT 10 NOT NULL,
	"damage" integer DEFAULT 0 NOT NULL,
	"drain" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "character_abilities_character_id_key_pk" PRIMARY KEY("character_id","key")
);
--> statement-breakpoint
CREATE TABLE "character_ability_log" (
	"id" uuid PRIMARY KEY NOT NULL,
	"character_id" uuid NOT NULL,
	"ability_key" text NOT NULL,
	"type" text NOT NULL,
	"delta" integer NOT NULL,
	"desc" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_ability_mods" (
	"id" uuid PRIMARY KEY NOT NULL,
	"character_id" uuid NOT NULL,
	"ability_key" text NOT NULL,
	"label" text NOT NULL,
	"value" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_ac_varied_mods" (
	"id" uuid PRIMARY KEY NOT NULL,
	"character_id" uuid NOT NULL,
	"label" text NOT NULL,
	"value" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_armor_items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"character_id" uuid NOT NULL,
	"name" text NOT NULL,
	"bonus" integer DEFAULT 0 NOT NULL,
	"check_penalty" integer DEFAULT 0 NOT NULL,
	"arcane_failure" integer DEFAULT 0 NOT NULL,
	"weight" real DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_classes" (
	"id" uuid PRIMARY KEY NOT NULL,
	"character_id" uuid NOT NULL,
	"name" text NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_conditional_mods" (
	"id" uuid PRIMARY KEY NOT NULL,
	"character_id" uuid NOT NULL,
	"text" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_dr_items" (
	"id" uuid PRIMARY KEY NOT NULL,
	"character_id" uuid NOT NULL,
	"type" text NOT NULL,
	"immune" boolean DEFAULT false NOT NULL,
	"amount" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_equipment" (
	"id" uuid PRIMARY KEY NOT NULL,
	"character_id" uuid NOT NULL,
	"name" text NOT NULL,
	"qty" integer DEFAULT 1 NOT NULL,
	"unit_weight" real DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_feats" (
	"id" uuid PRIMARY KEY NOT NULL,
	"character_id" uuid NOT NULL,
	"name" text NOT NULL,
	"tag" text DEFAULT '' NOT NULL,
	"desc" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_hp_log" (
	"id" uuid PRIMARY KEY NOT NULL,
	"character_id" uuid NOT NULL,
	"delta" integer NOT NULL,
	"kind" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_init_varied_mods" (
	"id" uuid PRIMARY KEY NOT NULL,
	"character_id" uuid NOT NULL,
	"label" text NOT NULL,
	"value" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_languages" (
	"id" uuid PRIMARY KEY NOT NULL,
	"character_id" uuid NOT NULL,
	"name" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_session_log" (
	"id" uuid PRIMARY KEY NOT NULL,
	"character_id" uuid NOT NULL,
	"title" text NOT NULL,
	"date" text NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_skill_mods" (
	"id" uuid PRIMARY KEY NOT NULL,
	"skill_id" uuid NOT NULL,
	"character_id" uuid NOT NULL,
	"label" text NOT NULL,
	"value" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_skills" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"ability" text NOT NULL,
	"class_skill" boolean DEFAULT false NOT NULL,
	"trained_only" boolean DEFAULT false NOT NULL,
	"ranks" integer DEFAULT 0 NOT NULL,
	"conditional" text,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_snapshots" (
	"id" uuid PRIMARY KEY NOT NULL,
	"character_id" uuid NOT NULL,
	"parent_id" uuid,
	"level" integer DEFAULT 1 NOT NULL,
	"kind" text NOT NULL,
	"label" text NOT NULL,
	"date" text NOT NULL,
	"deleted_at" timestamp with time zone,
	"data" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_special_abilities" (
	"id" uuid PRIMARY KEY NOT NULL,
	"character_id" uuid NOT NULL,
	"kind" text NOT NULL,
	"name" text NOT NULL,
	"subtitle" text DEFAULT '' NOT NULL,
	"uses" text DEFAULT '' NOT NULL,
	"desc" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_spell_circles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"spellbook_id" uuid NOT NULL,
	"character_id" uuid NOT NULL,
	"label" text NOT NULL,
	"used" integer DEFAULT 0 NOT NULL,
	"max" integer DEFAULT 0 NOT NULL,
	"spells" text[] DEFAULT '{}' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_spellbooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"class_name" text NOT NULL,
	"ability_label" text NOT NULL,
	"kind" text NOT NULL,
	"cantrip_label" text DEFAULT '' NOT NULL,
	"cantrip_spells" text[] DEFAULT '{}' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_weapon_ammo_log" (
	"id" uuid PRIMARY KEY NOT NULL,
	"weapon_id" uuid NOT NULL,
	"character_id" uuid NOT NULL,
	"delta" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_weapons" (
	"id" uuid PRIMARY KEY NOT NULL,
	"character_id" uuid NOT NULL,
	"name" text NOT NULL,
	"atk" text DEFAULT '' NOT NULL,
	"crit" text DEFAULT '' NOT NULL,
	"dmg" text DEFAULT '' NOT NULL,
	"type" text DEFAULT '' NOT NULL,
	"range" text DEFAULT '' NOT NULL,
	"desc" text DEFAULT '' NOT NULL,
	"has_ammo" boolean DEFAULT false NOT NULL,
	"ammo_current" integer DEFAULT 0 NOT NULL,
	"ammo_max" integer DEFAULT 0 NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "photo_url" text;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "favorited" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "raca" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "tamanho" text DEFAULT 'Médio' NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "sexo" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "idade_num" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "altura_num" real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "peso_num" real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "cabelo" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "olhos" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "divindade" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "terra_natal" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "alignment_law" text DEFAULT 'Neutro' NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "alignment_moral" text DEFAULT 'Neutro' NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "story" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "xp_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "xp_current" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "xp_max" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "hp_current" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "hp_max" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "temp_hp" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "hp_non_lethal" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "ac_armor" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "ac_shield" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "ac_natural" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "ac_deflection" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "bba_value" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "rm_value" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "favored_school" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "opposed_schools" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "speed_base" integer DEFAULT 9 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "speed_armor" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "speed_fly" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "speed_fly_maneuverability" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "speed_swim" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "speed_climb" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "speed_dig" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "fort_base" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "fort_magic" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "fort_misc" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "fort_temp" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "ref_base" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "ref_magic" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "ref_misc" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "ref_temp" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "will_base" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "will_magic" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "will_misc" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "will_temp" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "money_pc" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "money_pp" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "money_po" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "money_pl" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "load_light" real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "load_medium" real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "load_heavy" real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "load_overhead" real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "load_ground" real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "load_drag" real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "current_snapshot_id" uuid;--> statement-breakpoint
ALTER TABLE "characters" ADD COLUMN "last_accessed_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "character_abilities" ADD CONSTRAINT "character_abilities_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_ability_log" ADD CONSTRAINT "character_ability_log_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_ability_mods" ADD CONSTRAINT "character_ability_mods_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_ac_varied_mods" ADD CONSTRAINT "character_ac_varied_mods_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_armor_items" ADD CONSTRAINT "character_armor_items_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_classes" ADD CONSTRAINT "character_classes_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_conditional_mods" ADD CONSTRAINT "character_conditional_mods_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_dr_items" ADD CONSTRAINT "character_dr_items_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_equipment" ADD CONSTRAINT "character_equipment_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_feats" ADD CONSTRAINT "character_feats_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_hp_log" ADD CONSTRAINT "character_hp_log_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_init_varied_mods" ADD CONSTRAINT "character_init_varied_mods_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_languages" ADD CONSTRAINT "character_languages_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_session_log" ADD CONSTRAINT "character_session_log_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_skill_mods" ADD CONSTRAINT "character_skill_mods_skill_id_character_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."character_skills"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_skill_mods" ADD CONSTRAINT "character_skill_mods_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_skills" ADD CONSTRAINT "character_skills_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_snapshots" ADD CONSTRAINT "character_snapshots_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_snapshots" ADD CONSTRAINT "character_snapshots_parent_id_character_snapshots_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."character_snapshots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_special_abilities" ADD CONSTRAINT "character_special_abilities_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_spell_circles" ADD CONSTRAINT "character_spell_circles_spellbook_id_character_spellbooks_id_fk" FOREIGN KEY ("spellbook_id") REFERENCES "public"."character_spellbooks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_spell_circles" ADD CONSTRAINT "character_spell_circles_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_spellbooks" ADD CONSTRAINT "character_spellbooks_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_weapon_ammo_log" ADD CONSTRAINT "character_weapon_ammo_log_weapon_id_character_weapons_id_fk" FOREIGN KEY ("weapon_id") REFERENCES "public"."character_weapons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_weapon_ammo_log" ADD CONSTRAINT "character_weapon_ammo_log_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_weapons" ADD CONSTRAINT "character_weapons_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "character_ability_log_character_id_idx" ON "character_ability_log" USING btree ("character_id","sort_order");--> statement-breakpoint
CREATE INDEX "character_ability_mods_character_id_idx" ON "character_ability_mods" USING btree ("character_id","sort_order");--> statement-breakpoint
CREATE INDEX "character_ac_varied_mods_character_id_idx" ON "character_ac_varied_mods" USING btree ("character_id","sort_order");--> statement-breakpoint
CREATE INDEX "character_armor_items_character_id_idx" ON "character_armor_items" USING btree ("character_id","sort_order");--> statement-breakpoint
CREATE INDEX "character_classes_character_id_idx" ON "character_classes" USING btree ("character_id","sort_order");--> statement-breakpoint
CREATE INDEX "character_conditional_mods_character_id_idx" ON "character_conditional_mods" USING btree ("character_id","sort_order");--> statement-breakpoint
CREATE INDEX "character_dr_items_character_id_idx" ON "character_dr_items" USING btree ("character_id","sort_order");--> statement-breakpoint
CREATE INDEX "character_equipment_character_id_idx" ON "character_equipment" USING btree ("character_id","sort_order");--> statement-breakpoint
CREATE INDEX "character_feats_character_id_idx" ON "character_feats" USING btree ("character_id","sort_order");--> statement-breakpoint
CREATE INDEX "character_hp_log_character_id_idx" ON "character_hp_log" USING btree ("character_id","sort_order");--> statement-breakpoint
CREATE INDEX "character_init_varied_mods_character_id_idx" ON "character_init_varied_mods" USING btree ("character_id","sort_order");--> statement-breakpoint
CREATE INDEX "character_languages_character_id_idx" ON "character_languages" USING btree ("character_id","sort_order");--> statement-breakpoint
CREATE INDEX "character_session_log_character_id_idx" ON "character_session_log" USING btree ("character_id","sort_order");--> statement-breakpoint
CREATE INDEX "character_skill_mods_character_id_idx" ON "character_skill_mods" USING btree ("character_id","sort_order");--> statement-breakpoint
CREATE INDEX "character_skill_mods_skill_id_idx" ON "character_skill_mods" USING btree ("skill_id");--> statement-breakpoint
CREATE INDEX "character_skills_character_id_idx" ON "character_skills" USING btree ("character_id","sort_order");--> statement-breakpoint
CREATE INDEX "character_snapshots_character_id_idx" ON "character_snapshots" USING btree ("character_id","sort_order");--> statement-breakpoint
CREATE INDEX "character_snapshots_parent_id_idx" ON "character_snapshots" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "character_special_abilities_character_id_idx" ON "character_special_abilities" USING btree ("character_id","sort_order");--> statement-breakpoint
CREATE INDEX "character_spell_circles_character_id_idx" ON "character_spell_circles" USING btree ("character_id","sort_order");--> statement-breakpoint
CREATE INDEX "character_spell_circles_spellbook_id_idx" ON "character_spell_circles" USING btree ("spellbook_id");--> statement-breakpoint
CREATE INDEX "character_spellbooks_character_id_idx" ON "character_spellbooks" USING btree ("character_id","sort_order");--> statement-breakpoint
CREATE INDEX "character_weapon_ammo_log_character_id_idx" ON "character_weapon_ammo_log" USING btree ("character_id","sort_order");--> statement-breakpoint
CREATE INDEX "character_weapon_ammo_log_weapon_id_idx" ON "character_weapon_ammo_log" USING btree ("weapon_id");--> statement-breakpoint
CREATE INDEX "character_weapons_character_id_idx" ON "character_weapons" USING btree ("character_id","sort_order");