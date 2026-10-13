ALTER TABLE "character_special_abilities" ADD COLUMN IF NOT EXISTS "spells" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "character_special_abilities" ADD COLUMN IF NOT EXISTS "caster_level" text DEFAULT '' NOT NULL;
