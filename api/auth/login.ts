import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq, lt } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { sessions, users } from '../../db/schema.js';
import { loginBodySchema } from '../_lib/validation.js';
import { verifyPassword } from '../_lib/auth.js';
import { toUserProfile } from '../_lib/mappers.js';
import { createSession, setSessionCookie } from '../_lib/session.js';
import { withErrorHandling } from '../_lib/handler.js';
import { checkRateLimit } from '../_lib/rateLimit.js';
import { getClientIp } from '../_lib/request.js';
import { logAudit } from '../_lib/audit.js';

export default withErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const parsed = loginBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' });
    return;
  }
  const { username, password } = parsed.data;
  const ip = getClientIp(req);

  // Two limiters: one per username (stops guessing a single account's password)
  // and one per IP (slows a single source guessing across many usernames).
  const ipLimit = await checkRateLimit('login-ip', ip, 20, '10 m');
  if (ipLimit.limited) {
    await logAudit({ username }, 'auth.rate_limited', undefined, `IP ${ip} (limite por IP)`);
    res.status(429).json({ error: 'Muitas tentativas. Tente novamente em alguns minutos.' });
    return;
  }
  const userLimit = await checkRateLimit('login-user', username.toLowerCase(), 5, '10 m');
  if (userLimit.limited) {
    await logAudit({ username }, 'auth.rate_limited', undefined, `IP ${ip} (limite por usuário)`);
    res
      .status(429)
      .json({ error: 'Muitas tentativas para este usuário. Tente novamente em alguns minutos.' });
    return;
  }

  const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    await logAudit({ id: user?.id, username }, 'auth.login_failed', undefined, `IP ${ip}`);
    res.status(401).json({ error: 'Usuário ou senha incorretos.' });
    return;
  }
  if (!user.active) {
    await logAudit(
      { id: user.id, username },
      'auth.login_failed',
      undefined,
      `IP ${ip} (conta inativa)`,
    );
    res.status(403).json({ error: 'Esta conta foi desativada. Fale com um administrador.' });
    return;
  }

  // Opportunistic cleanup: expired session rows are never usable (getUserId checks expiresAt),
  // but nothing else was deleting them — this keeps the sessions table from growing forever.
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));

  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
  await logAudit({ id: user.id, username }, 'auth.login_success', undefined, `IP ${ip}`);

  const token = await createSession(user.id);
  setSessionCookie(res, token);
  res.status(200).json({ user: toUserProfile(user) });
});
