import type { VercelRequest, VercelResponse } from '@vercel/node';
import { desc, eq, inArray } from 'drizzle-orm';
import { db } from '../db/client.js';
import { characterShares, securityAlerts, systems, users } from '../db/schema.js';
import { loadLibraries } from '../db/library.js';
import { loadCharactersForUser, loadSharedWithMe } from './_lib/characterRepo.js';
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

  const [user, systemRows, myCharacters] = await Promise.all([
    db.select().from(users).where(eq(users.id, userId)).limit(1),
    db.select().from(systems),
    loadCharactersForUser(userId),
  ]);

  if (!user[0]) {
    res.status(401).json({ error: 'Não autenticado.' });
    return;
  }

  const libraries = await loadLibraries(systemRows.map((s) => s.id));

  // Only admins need to know about this, and only admins are allowed to dismiss it.
  const alerts = user[0].isAdmin
    ? await db
        .select()
        .from(securityAlerts)
        .where(eq(securityAlerts.dismissed, false))
        .orderBy(desc(securityAlerts.createdAt))
    : [];

  // Characters someone else shared with me — always view-only, never mixed into `characters`
  // (which the whole app treats as "mine, editable").
  const sharedWithMeRows = await loadSharedWithMe(userId);

  // Who each of MY OWN characters is shared with, so the owner's UI can show/manage it.
  const myCharacterIds = myCharacters.map((c) => c.id);
  const myShareRows =
    myCharacterIds.length > 0
      ? await db
          .select({
            characterId: characterShares.characterId,
            userId: users.id,
            name: users.name,
            username: users.username,
          })
          .from(characterShares)
          .innerJoin(users, eq(characterShares.sharedWithUserId, users.id))
          .where(inArray(characterShares.characterId, myCharacterIds))
      : [];
  const mySharesByCharacterId: Record<
    string,
    { userId: string; name: string; username: string }[]
  > = {};
  for (const row of myShareRows) {
    (mySharesByCharacterId[row.characterId] ??= []).push({
      userId: row.userId,
      name: row.name,
      username: row.username,
    });
  }

  res.status(200).json({
    user: toUserProfile(user[0]),
    systems: systemRows,
    characters: myCharacters,
    libraries,
    securityAlerts: alerts,
    sharedWithMe: sharedWithMeRows,
    mySharesByCharacterId,
  });
});
