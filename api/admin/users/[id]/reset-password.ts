import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { db } from '../../../../db/client.js';
import { sessions, users } from '../../../../db/schema.js';
import { requireAdminId, hashPassword } from '../../../_lib/auth.js';
import { generateTempPassword } from '../../../_lib/password.js';
import { withErrorHandling } from '../../../_lib/handler.js';

/**
 * Admin-only: sets a random temporary password on another account and signs it out
 * everywhere. The plaintext is returned once in the response and never stored —
 * the admin relays it to the user, who should change it on next login.
 */
export default withErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const callerId = await requireAdminId(req, res);
  if (!callerId) return;

  const id = req.query.id as string;
  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  const [user] = await db
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, id))
    .returning({ id: users.id });
  if (!user) {
    res.status(404).json({ error: 'Usuário não encontrado.' });
    return;
  }

  await db.delete(sessions).where(eq(sessions.userId, id));

  res.status(200).json({ tempPassword });
});
