import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { db } from '../../../../db/client.js';
import { sessions, users } from '../../../../db/schema.js';
import { requireAdminUser, hashPassword } from '../../../_lib/auth.js';
import { generateTempPassword } from '../../../_lib/password.js';
import { logAudit } from '../../../_lib/audit.js';
import { withErrorHandling } from '../../../_lib/handler.js';

/**
 * Admin-only: sets a random temporary password on another account, forces a
 * change on next login, and signs it out everywhere. The plaintext is
 * returned once in the response and never stored — the admin relays it to
 * the user.
 */
export default withErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const caller = await requireAdminUser(req, res);
  if (!caller) return;

  const id = req.query.id as string;
  const [target] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!target) {
    res.status(404).json({ error: 'Usuário não encontrado.' });
    return;
  }
  // Only the master account can reset its own password this way — nobody else should be
  // able to lock the master out or take it over by resetting its credentials.
  if (target.isMaster && target.id !== caller.id) {
    res
      .status(400)
      .json({ error: 'A senha do administrador master só pode ser redefinida por ele mesmo.' });
    return;
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  await db.update(users).set({ passwordHash, mustChangePassword: true }).where(eq(users.id, id));
  await db.delete(sessions).where(eq(sessions.userId, id));

  await logAudit({ id: caller.id, username: caller.username }, 'user.password_reset', {
    id: target.id,
    username: target.username,
  });

  res.status(200).json({ tempPassword });
});
