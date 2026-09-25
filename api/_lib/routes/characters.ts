import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, eq } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import { characters, characterShares, users } from '../../../db/schema.js';
import { createCharacter, updateCharacterOwned } from '../characterRepo.js';
import { requireUserId } from '../auth.js';
import { withErrorHandling } from '../handler.js';
import { characterBodySchema, MAX_CHARACTER_JSON_LENGTH, shareBodySchema } from '../validation.js';
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
    res.status(400).json({ error: 'Personagem inválido.' });
    return;
  }
  const character = parsed.data as unknown as Character;

  await createCharacter(character, userId);

  res.status(201).json({ character });
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
    res.status(400).json({ error: 'Personagem inválido.' });
    return;
  }
  const character = parsed.data as unknown as Character;

  const updated = await updateCharacterOwned(id, character, userId);
  if (!updated) {
    res.status(404).json({ error: 'Personagem não encontrado.' });
    return;
  }

  res.status(200).json({ character });
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
