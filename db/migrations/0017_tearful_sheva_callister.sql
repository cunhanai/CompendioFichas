ALTER TABLE "character_feats" ADD COLUMN "prerequisite" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "character_feats" ADD COLUMN "benefit" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "library_feats" ADD COLUMN "prerequisite" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "library_feats" ADD COLUMN "benefit" text DEFAULT '' NOT NULL;