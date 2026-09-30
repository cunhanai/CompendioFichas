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

  // Everything here only depends on userId (or nothing at all), so it all runs in one round of
  // parallel queries instead of several sequential stages — this used to be up to 5 stages deep
  // (user/systems/characters, then libraries, then alerts, then sharedWithMe, then myShareRows),
  // each adding a full Neon HTTP round trip to how long a reload takes. Security alerts are
  // fetched unconditionally here (cheap — a handful of rows at most) rather than gated on
  // `user[0].isAdmin`, specifically so this query doesn't have to wait on that first one to even
  // start; the response below still only exposes them to admins.
  const [user, systemRows, myCharacters, sharedWithMeRows, allAlerts] = await Promise.all([
    db.select().from(users).where(eq(users.id, userId)).limit(1),
    db.select().from(systems),
    loadCharactersForUser(userId),
    // Characters someone else shared with me — always view-only, never mixed into `characters`
    // (which the whole app treats as "mine, editable").
    loadSharedWithMe(userId),
    db
      .select()
      .from(securityAlerts)
      .where(eq(securityAlerts.dismissed, false))
      .orderBy(desc(securityAlerts.createdAt)),
  ]);

  if (!user[0]) {
    res.status(401).json({ error: 'Não autenticado.' });
    return;
  }

  const alerts = user[0].isAdmin ? allAlerts : [];
  const myCharacterIds = myCharacters.map((c) => c.id);

  // Both of these only depend on the results above, and not on each other, so they also run in
  // parallel rather than one after the other.
  const [libraries, myShareRows] = await Promise.all([
    loadLibraries(systemRows.map((s) => s.id)),
    // Who each of MY OWN characters is shared with, so the owner's UI can show/manage it.
    myCharacterIds.length > 0
      ? db
          .select({
            characterId: characterShares.characterId,
            userId: users.id,
            name: users.name,
            username: users.username,
          })
          .from(characterShares)
          .innerJoin(users, eq(characterShares.sharedWithUserId, users.id))
          .where(inArray(characterShares.characterId, myCharacterIds))
      : Promise.resolve([]),
  ]);
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
