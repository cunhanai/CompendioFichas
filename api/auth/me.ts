import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { users } from '../../db/schema.js';
import { getUserId } from '../_lib/session.js';
import { toUserProfile } from '../_lib/mappers.js';
import { withErrorHandling } from '../_lib/handler.js';

export default withErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const userId = await getUserId(req);
  if (!userId) {
    res.status(401).json({ error: 'Não autenticado.' });
    return;
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) {
    res.status(401).json({ error: 'Não autenticado.' });
    return;
  }

  res.status(200).json({ user: toUserProfile(user) });
});
