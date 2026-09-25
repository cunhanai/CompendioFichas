import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, asc, eq, ne } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../../db/client.js';
import { sessions, users } from '../../../db/schema.js';
import { requireUserId, hashPassword, verifyPassword } from '../auth.js';
import { passwordChangeBodySchema } from '../validation.js';
import { toRosterUser, toUserProfile } from '../mappers.js';
import { withErrorHandling } from '../handler.js';
import { checkRateLimit } from '../rateLimit.js';
import { logAudit } from '../audit.js';
import { createSession, setSessionCookie } from '../session.js';

const updateUserSchema = z.object({
  name: z.string().min(1),
  username: z.string().min(3),
  // A data: URL for a client-resized avatar image; capped well above what a small
  // compressed JPEG/PNG needs, to keep an abusive payload from reaching the database.
  avatarUrl: z.string().max(500_000).nullable().optional(),
});

/** PATCH /api/user — updates the caller's own name/username/avatar. */
export const updateProfileHandler = withErrorHandling(async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'PATCH') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const userId = await requireUserId(req, res);
  if (!userId) return;

  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' });
    return;
  }
  const { name, username, avatarUrl } = parsed.data;

  const [conflict] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(ne(users.id, userId), eq(users.username, username)))
    .limit(1);
  if (conflict) {
    res.status(409).json({ error: 'Já existe uma conta com esse nome de usuário.' });
    return;
  }

  const [user] = await db
    .update(users)
    .set({ name, username, ...(avatarUrl !== undefined && { avatarUrl }) })
    .where(eq(users.id, userId))
    .returning();

  res.status(200).json({ user: toUserProfile(user) });
});

/** PATCH /api/user/password — changes the caller's own password. */
export const changePasswordHandler = withErrorHandling(async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
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

/** GET /api/user/roster — every other active account, for the character-sharing user picker. */
export const listRosterHandler = withErrorHandling(async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const userId = await requireUserId(req, res);
  if (!userId) return;

  const rows = await db
    .select()
    .from(users)
    .where(and(ne(users.id, userId), eq(users.active, true)))
    .orderBy(asc(users.name));

  res.status(200).json({ users: rows.map(toRosterUser) });
});
