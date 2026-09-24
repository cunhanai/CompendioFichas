import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { characters, systems, users } from '../db/schema.js';
import { loadLibraries } from '../db/library.js';
import { toUserProfile } from './_lib/mappers.js';
import { requireUserId } from './_lib/auth.js';
import { withErrorHandling } from './_lib/handler.js';

export default withErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const userId = await requireUserId(req, res);
  if (!userId) return;

  const [user, systemRows, characterRows] = await Promise.all([
    db.select().from(users).where(eq(users.id, userId)).limit(1),
    db.select().from(systems),
    db.select().from(characters).where(eq(characters.userId, userId)),
  ]);

  if (!user[0]) {
    res.status(401).json({ error: 'Não autenticado.' });
    return;
  }

  const libraries = await loadLibraries(systemRows.map((s) => s.id));

  res.status(200).json({
    user: toUserProfile(user[0]),
    systems: systemRows,
    characters: characterRows.map((row) => row.data),
    libraries,
  });
});
