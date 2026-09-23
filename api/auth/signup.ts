import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq, or } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { users } from '../../db/schema.js';
import { signupBodySchema } from '../_lib/validation.js';
import { hashPassword } from '../_lib/auth.js';
import { toUserProfile } from '../_lib/mappers.js';
import { createSession, setSessionCookie } from '../_lib/session.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const parsed = signupBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' });
    return;
  }
  const { username, email, password } = parsed.data;

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(or(eq(users.email, email), eq(users.username, username)))
    .limit(1);
  if (existing) {
    res.status(409).json({ error: 'Já existe uma conta com esse e-mail ou nome de usuário.' });
    return;
  }

  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(users)
    .values({ name: username, username, email, passwordHash })
    .returning();

  const token = await createSession(user.id);
  setSessionCookie(res, token);
  res.status(201).json({ user: toUserProfile(user) });
}
