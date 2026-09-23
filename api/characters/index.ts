import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../db/client.js';
import { characters } from '../../db/schema.js';
import { requireUserId } from '../_lib/auth.js';
import { withErrorHandling } from '../_lib/handler.js';
import type { Character } from '../../src/entities/character/model/types.js';

export default withErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const userId = await requireUserId(req, res);
  if (!userId) return;

  const character = req.body as Character;
  if (!character?.id || !character.systemId) {
    res.status(400).json({ error: 'Personagem inválido.' });
    return;
  }

  const [row] = await db
    .insert(characters)
    .values({ id: character.id, userId, systemId: character.systemId, data: character })
    .returning();

  res.status(201).json({ character: row.data });
});
