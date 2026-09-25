ALTER TABLE "characters" DROP COLUMN "data";--> statement-breakpoint
-- The PR that introduces the relational schema (0012) explicitly does not preserve existing
-- character data (see DESIGN_NOTES.md) — the JSONB blob was the only place that data lived, and
-- it's gone as of the statement above. Existing rows in "characters" are now empty shells with
-- no way to backfill the required columns 0012 adds (several as NOT NULL with no default, e.g.
-- "name"), so they're cleared here rather than left to fail that migration with a NOT NULL
-- violation. CASCADE also clears character_shares rows pointing at them.
TRUNCATE TABLE "characters" CASCADE;