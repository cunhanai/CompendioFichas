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

-- The other half of the backfill: a character whose photo_url happens to exactly match a row
-- already in character_photos (both old flows could independently end up with the identical
-- data URL) hits the NOT EXISTS guard above and gets no new row inserted — but without this,
-- that existing row was never flagged is_profile, so the gallery would show no star at all even
-- though photo_url is set and matches one of the visible photos. Picks the lowest sort_order
-- match per character so this stays deterministic (and a no-op on re-run) even in the unlikely
-- case of more than one identical-byte duplicate.
UPDATE "character_photos" cp
SET is_profile = true
WHERE cp.id = (
  SELECT cp2.id
  FROM "character_photos" cp2
  INNER JOIN "characters" c ON c.id = cp2.character_id
  WHERE cp2.character_id = cp.character_id
    AND cp2.data_url = c.photo_url
  ORDER BY cp2.sort_order
  LIMIT 1
);
