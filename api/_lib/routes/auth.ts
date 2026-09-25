import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq, lt } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import { sessions, users } from '../../../db/schema.js';
import { loginBodySchema, signupBodySchema } from '../validation.js';
import { hashPassword, requireAdminUser, verifyPassword } from '../auth.js';
import { toUserProfile } from '../mappers.js';
import {
  createSession,
  setSessionCookie,
  clearSessionCookie,
  deleteSession,
  getUserId,
} from '../session.js';
import { withErrorHandling } from '../handler.js';
import { checkRateLimit } from '../rateLimit.js';
import { getClientIp } from '../request.js';
import { logAudit } from '../audit.js';
import { maybeRaiseSecurityAlert } from '../securityAlerts.js';

export const loginHandler = withErrorHandling(async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
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
    await maybeRaiseSecurityAlert();
    res.status(429).json({ error: 'Muitas tentativas. Tente novamente em alguns minutos.' });
    return;
  }
  const userLimit = await checkRateLimit('login-user', username.toLowerCase(), 5, '10 m');
  if (userLimit.limited) {
    await logAudit({ username }, 'auth.rate_limited', undefined, `IP ${ip} (limite por usuário)`);
    await maybeRaiseSecurityAlert();
    res
      .status(429)
      .json({ error: 'Muitas tentativas para este usuário. Tente novamente em alguns minutos.' });
    return;
  }

  const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    await logAudit({ id: user?.id, username }, 'auth.login_failed', undefined, `IP ${ip}`);
    await maybeRaiseSecurityAlert();
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
    await maybeRaiseSecurityAlert();
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

export const logoutHandler = withErrorHandling(async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  await deleteSession(req);
  clearSessionCookie(res);
  res.status(200).json({ ok: true });
});

export const meHandler = withErrorHandling(async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
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

/** Creating accounts is an admin action, not public self-registration — it never touches the caller's own session. */
export const signupHandler = withErrorHandling(async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const caller = await requireAdminUser(req, res);
  if (!caller) return;

  const parsed = signupBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' });
    return;
  }
  const { username, password } = parsed.data;

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  if (existing) {
    res.status(409).json({ error: 'Já existe uma conta com esse nome de usuário.' });
    return;
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(users)
    .values({ name: username, username, passwordHash })
    .returning();

  await logAudit({ id: caller.id, username: caller.username }, 'user.create', {
    id: user.id,
    username: user.username,
  });

  res.status(201).json({ user: toUserProfile(user) });
});
