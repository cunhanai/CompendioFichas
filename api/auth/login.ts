import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { users } from '../../db/schema.js';
import { loginBodySchema } from '../_lib/validation.js';
import { verifyPassword } from '../_lib/auth.js';
import { toUserProfile } from '../_lib/mappers.js';
import { createSession, setSessionCookie } from '../_lib/session.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const parsed = loginBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' });
    return;
  }
  const { email, password } = parsed.data;

  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    return;
  }

  const token = await createSession(user.id);
  setSessionCookie(res, token);
  res.status(200).json({ user: toUserProfile(user) });
}
