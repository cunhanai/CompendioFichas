ALTER TABLE "character_photos" ADD COLUMN IF NOT EXISTS "is_profile" boolean DEFAULT false NOT NULL;

-- Backfill: the character/avatar flow (PhotoUploadDialog) and the gallery (character_photos)
-- used to be separate — every character with a photo_url already set but no matching gallery
-- row gets one created now, flagged as the profile photo, so it shows up in the merged gallery
-- instead of being orphaned. Matched by exact data_url so re-running this is a no-op.
-- Also respects the app's new 3-photos-per-character cap: a character that already has 3 (or
-- more — the old cap was 60) gallery rows from before this migration is skipped rather than
-- pushed over the limit the rest of the feature now assumes can never be exceeded. Its photo_url
-- stays set (so the avatar everyone already sees keeps working) but won't show up as a pickable
-- gallery slot until the owner frees one up — an edge case only possible for a character whose
-- avatar and gallery diverged before this PR, since nothing previously linked the two.
INSERT INTO "character_photos" (id, character_id, data_url, sort_order, is_profile)
SELECT
  gen_random_uuid(),
  c.id,
  c.photo_url,
  COALESCE((SELECT MAX(sort_order) + 1 FROM "character_photos" WHERE character_id = c.id), 0),
  true
FROM "characters" c
WHERE c.photo_url IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "character_photos" cp
    WHERE cp.character_id = c.id AND cp.data_url = c.photo_url
  )
  AND (SELECT COUNT(*) FROM "character_photos" cp WHERE cp.character_id = c.id) < 3;
