ALTER TABLE "character_feats" ADD COLUMN IF NOT EXISTS "resumo" text DEFAULT '' NOT NULL;
ALTER TABLE "character_feats" ADD COLUMN IF NOT EXISTS "fonte" text DEFAULT '' NOT NULL;
ALTER TABLE "character_special_abilities" ADD COLUMN IF NOT EXISTS "resumo" text DEFAULT '' NOT NULL;
ALTER TABLE "character_special_abilities" ADD COLUMN IF NOT EXISTS "fonte" text DEFAULT '' NOT NULL;
ALTER TABLE "library_feats" ADD COLUMN IF NOT EXISTS "resumo" text DEFAULT '' NOT NULL;
ALTER TABLE "library_feats" ADD COLUMN IF NOT EXISTS "fonte" text DEFAULT '' NOT NULL;
ALTER TABLE "library_special_abilities" ADD COLUMN IF NOT EXISTS "resumo" text DEFAULT '' NOT NULL;
ALTER TABLE "library_special_abilities" ADD COLUMN IF NOT EXISTS "fonte" text DEFAULT '' NOT NULL;
