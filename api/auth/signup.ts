import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { users } from '../../db/schema.js';
import { signupBodySchema } from '../_lib/validation.js';
import { hashPassword, requireAdminUser } from '../_lib/auth.js';
import { toUserProfile } from '../_lib/mappers.js';
import { logAudit } from '../_lib/audit.js';
import { withErrorHandling } from '../_lib/handler.js';

/** Creating accounts is an admin action, not public self-registration — it never touches the caller's own session. */
export default withErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
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
