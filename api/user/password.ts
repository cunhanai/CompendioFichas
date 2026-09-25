import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { sessions, users } from '../../db/schema.js';
import { requireUserId, hashPassword, verifyPassword } from '../_lib/auth.js';
import { passwordChangeBodySchema } from '../_lib/validation.js';
import { withErrorHandling } from '../_lib/handler.js';
import { checkRateLimit } from '../_lib/rateLimit.js';
import { logAudit } from '../_lib/audit.js';
import { createSession, setSessionCookie } from '../_lib/session.js';

export default withErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const userId = await requireUserId(req, res);
  if (!userId) return;

  const parsed = passwordChangeBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' });
    return;
  }
  const { currentPassword, newPassword } = parsed.data;

  const limit = await checkRateLimit('password-change', userId, 5, '10 m');
  if (limit.limited) {
    res.status(429).json({ error: 'Muitas tentativas. Tente novamente em alguns minutos.' });
    return;
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user || !(await verifyPassword(currentPassword, user.passwordHash))) {
    res.status(401).json({ error: 'Senha atual incorreta.' });
    return;
  }

  const passwordHash = await hashPassword(newPassword);
  await db
    .update(users)
    .set({ passwordHash, mustChangePassword: false })
    .where(eq(users.id, userId));

  // A changed password should sign out every other device/browser — only this one stays in,
  // via a freshly issued session — in case the old password (and its cookie) had leaked.
  await db.delete(sessions).where(eq(sessions.userId, userId));
  const token = await createSession(userId);
  setSessionCookie(res, token);

  await logAudit({ id: user.id, username: user.username }, 'user.password_change');

  res.status(200).json({ ok: true });
});
