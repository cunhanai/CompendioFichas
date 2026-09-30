import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import { characterPhotos, characters, characterShares, users } from '../../../db/schema.js';
import { createCharacter, loadCharacterById, updateCharacterOwned } from '../characterRepo.js';
import { requireUserId } from '../auth.js';
import { withErrorHandling } from '../handler.js';
import {
  characterBodySchema,
  MAX_CHARACTER_JSON_LENGTH,
  photoBodySchema,
  shareBodySchema,
} from '../validation.js';
import type { Character } from '../../../src/entities/character/model/types.js';

/** POST /api/characters — creates a character owned by the caller. */
export const createCharacterHandler = withErrorHandling(async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const userId = await requireUserId(req, res);
  if (!userId) return;

  if (JSON.stringify(req.body ?? {}).length > MAX_CHARACTER_JSON_LENGTH) {
    res.status(413).json({ error: 'Ficha muito grande.' });
    return;
  }
  const parsed = characterBodySchema.safeParse(req.body);
  if (!parsed.success) {
    console.error('Invalid character payload on create', parsed.error.issues);
    res.status(400).json({ error: 'Personagem inválido.' });
    return;
  }
  const character = parsed.data as unknown as Character;

  await createCharacter(character, userId);
  const saved = await loadCharacterById(character.id);

  res.status(201).json({ character: saved });
});

/** PATCH /api/characters/:id — updates a character owned by the caller. */
export const updateCharacterHandler = withErrorHandling(async function handler(
  req: VercelRequest,
  res: VercelResponse,
  id: string,
) {
  if (req.method !== 'PATCH') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const userId = await requireUserId(req, res);
  if (!userId) return;

  if (JSON.stringify(req.body ?? {}).length > MAX_CHARACTER_JSON_LENGTH) {
    res.status(413).json({ error: 'Ficha muito grande.' });
    return;
  }
  const parsed = characterBodySchema.safeParse(req.body);
  if (!parsed.success) {
    console.error('Invalid character payload on update', parsed.error.issues);
    res.status(400).json({ error: 'Personagem inválido.' });
    return;
  }
  const character = parsed.data as unknown as Character;
  if (character.id !== id) {
    res.status(400).json({ error: 'O id do personagem não corresponde à rota.' });
    return;
  }

  const updated = await updateCharacterOwned(id, character, userId);
  if (!updated) {
    res.status(404).json({ error: 'Personagem não encontrado.' });
    return;
  }
  const saved = await loadCharacterById(id);

  res.status(200).json({ character: saved });
});

async function listShares(characterId: string) {
  return db
    .select({ userId: users.id, name: users.name, username: users.username })
    .from(characterShares)
    .innerJoin(users, eq(characterShares.sharedWithUserId, users.id))
    .where(eq(characterShares.characterId, characterId));
}

/** POST /api/characters/:id/shares — grants another account view-only access. Owner-only;
 * the recipient never gets a write endpoint for this character, so the grant can't become
 * editable by any client-side bug. */
export const shareCharacterHandler = withErrorHandling(async function handler(
  req: VercelRequest,
  res: VercelResponse,
  id: string,
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const userId = await requireUserId(req, res);
  if (!userId) return;

  const parsed = shareBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos.' });
    return;
  }
  if (parsed.data.userId === userId) {
    res.status(400).json({ error: 'Você já tem acesso à sua própria ficha.' });
    return;
  }

  const [owned] = await db
    .select({ id: characters.id })
    .from(characters)
    .where(and(eq(characters.id, id), eq(characters.userId, userId)))
    .limit(1);
  if (!owned) {
    res.status(404).json({ error: 'Personagem não encontrado.' });
    return;
  }

  const [targetUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, parsed.data.userId), eq(users.active, true)))
    .limit(1);
  if (!targetUser) {
    res.status(404).json({ error: 'Usuário não encontrado.' });
    return;
  }

  await db
    .insert(characterShares)
    .values({ characterId: id, sharedWithUserId: parsed.data.userId })
    .onConflictDoNothing();

  res.status(200).json({ shares: await listShares(id) });
});

/** DELETE /api/characters/:id/shares — revokes a previously granted view-only access. Owner-only. */
export const unshareCharacterHandler = withErrorHandling(async function handler(
  req: VercelRequest,
  res: VercelResponse,
  id: string,
) {
  if (req.method !== 'DELETE') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const userId = await requireUserId(req, res);
  if (!userId) return;

  const parsed = shareBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos.' });
    return;
  }

  const [owned] = await db
    .select({ id: characters.id })
    .from(characters)
    .where(and(eq(characters.id, id), eq(characters.userId, userId)))
    .limit(1);
  if (!owned) {
    res.status(404).json({ error: 'Personagem não encontrado.' });
    return;
  }

  await db
    .delete(characterShares)
    .where(
      and(
        eq(characterShares.characterId, id),
        eq(characterShares.sharedWithUserId, parsed.data.userId),
      ),
    );

  res.status(200).json({ shares: await listShares(id) });
});

async function listPhotos(characterId: string) {
  return db
    .select({ id: characterPhotos.id, dataUrl: characterPhotos.dataUrl })
    .from(characterPhotos)
    .where(eq(characterPhotos.characterId, characterId))
    .orderBy(asc(characterPhotos.sortOrder));
}

/** Whether `userId` may at least look at `characterId` — owns it, or it's been shared with them
 * (always view-only for the latter, enforced by which handlers call this vs. `assertOwner`). */
async function canView(characterId: string, userId: string): Promise<boolean> {
  const [owned] = await db
    .select({ id: characters.id })
    .from(characters)
    .where(and(eq(characters.id, characterId), eq(characters.userId, userId)))
    .limit(1);
  if (owned) return true;

  const [shared] = await db
    .select({ characterId: characterShares.characterId })
    .from(characterShares)
    .where(
      and(
        eq(characterShares.characterId, characterId),
        eq(characterShares.sharedWithUserId, userId),
      ),
    )
    .limit(1);
  return !!shared;
}

async function isOwner(characterId: string, userId: string): Promise<boolean> {
  const [owned] = await db
    .select({ id: characters.id })
    .from(characters)
    .where(and(eq(characters.id, characterId), eq(characters.userId, userId)))
    .limit(1);
  return !!owned;
}

// Not a real-world gallery size — a generous ceiling against a runaway upload loop or abuse,
// consistent with how MAX_CHARACTER_JSON_LENGTH/MAX_PHOTO_DATA_URL_LENGTH cap the other
// dimensions of this same concern.
const MAX_PHOTOS_PER_CHARACTER = 60;

/** GET /api/characters/:id/photos — a character's photo gallery. Loaded lazily, only when the
 * gallery is actually opened, specifically so it never rides along with bootstrap or an ordinary
 * character PATCH (see the comment on CharacterPhoto in entities/character/model/types.ts).
 * Owner or a view-only share may read it. */
export const listCharacterPhotosHandler = withErrorHandling(async function handler(
  req: VercelRequest,
  res: VercelResponse,
  id: string,
) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const userId = await requireUserId(req, res);
  if (!userId) return;

  if (!(await canView(id, userId))) {
    res.status(404).json({ error: 'Personagem não encontrado.' });
    return;
  }

  res.status(200).json({ photos: await listPhotos(id) });
});

/** POST /api/characters/:id/photos — adds one photo to the gallery. Owner-only. */
export const addCharacterPhotoHandler = withErrorHandling(async function handler(
  req: VercelRequest,
  res: VercelResponse,
  id: string,
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const userId = await requireUserId(req, res);
  if (!userId) return;

  if (!(await isOwner(id, userId))) {
    res.status(404).json({ error: 'Personagem não encontrado.' });
    return;
  }

  const parsed = photoBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos.' });
    return;
  }

  const existing = await listPhotos(id);
  if (existing.length >= MAX_PHOTOS_PER_CHARACTER) {
    res.status(400).json({ error: `Limite de ${MAX_PHOTOS_PER_CHARACTER} fotos por personagem.` });
    return;
  }

  await db.insert(characterPhotos).values({
    id: crypto.randomUUID(),
    characterId: id,
    dataUrl: parsed.data.dataUrl,
    sortOrder: existing.length,
  });

  res.status(201).json({ photos: await listPhotos(id) });
});

/** DELETE /api/characters/:id/photos/:photoId — removes one photo from the gallery. Owner-only. */
export const removeCharacterPhotoHandler = withErrorHandling(async function handler(
  req: VercelRequest,
  res: VercelResponse,
  id: string,
  photoId: string,
) {
  if (req.method !== 'DELETE') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const userId = await requireUserId(req, res);
  if (!userId) return;

  if (!(await isOwner(id, userId))) {
    res.status(404).json({ error: 'Personagem não encontrado.' });
    return;
  }

  await db
    .delete(characterPhotos)
    .where(and(eq(characterPhotos.id, photoId), eq(characterPhotos.characterId, id)));

  res.status(200).json({ photos: await listPhotos(id) });
});
