ALTER TABLE "character_photos" ADD COLUMN IF NOT EXISTS "is_profile" boolean DEFAULT false NOT NULL;

-- Backfill: the character/avatar flow (PhotoUploadDialog) and the gallery (character_photos)
-- used to be separate — every character with a photo_url already set but no matching gallery
-- row gets one created now, flagged as the profile photo, so it shows up in the merged gallery
-- instead of being orphaned. Matched by exact data_url so re-running this is a no-op.
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
  );
