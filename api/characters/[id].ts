import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, eq } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { characters } from '../../db/schema.js';
import { requireUserId } from '../_lib/auth.js';
import type { Character } from '../../src/entities/character/model/types.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const userId = await requireUserId(req, res);
  if (!userId) return;

  const id = req.query.id as string;
  const character = req.body as Character;

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
}
