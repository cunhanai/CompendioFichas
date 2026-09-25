import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, eq } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import { characters } from '../../../db/schema.js';
import { requireUserId } from '../auth.js';
import { withErrorHandling } from '../handler.js';
import { characterBodySchema, MAX_CHARACTER_JSON_LENGTH } from '../validation.js';
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

  const [row] = await db
    .insert(characters)
    .values({ id: character.id, userId, systemId: character.systemId, data: character })
    .returning();

  res.status(201).json({ character: row.data });
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

  const [row] = await db
    .update(characters)
    .set({ data: character, updatedAt: new Date() })
    .where(and(eq(characters.id, id), eq(characters.userId, userId)))
    .returning();

  if (!row) {
    res.status(404).json({ error: 'Personagem não encontrado.' });
    return;
  }

  res.status(200).json({ character: row.data });
});
