import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, eq, ne, or } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../db/client.js';
import { users } from '../db/schema.js';
import { requireUserId } from './_lib/auth.js';
import { toUserProfile } from './_lib/mappers.js';

const updateUserSchema = z.object({
  name: z.string().min(1),
  username: z.string().min(3),
  email: z.email(),
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
  const { name, username, email } = parsed.data;

  const [conflict] = await db
    .select({ id: users.id })
    .from(users)
    .where(and(ne(users.id, userId), or(eq(users.email, email), eq(users.username, username))))
    .limit(1);
  if (conflict) {
    res.status(409).json({ error: 'Já existe uma conta com esse e-mail ou nome de usuário.' });
    return;
  }

  const [user] = await db
    .update(users)
    .set({ name, username, email })
    .where(eq(users.id, userId))
    .returning();

  res.status(200).json({ user: toUserProfile(user) });
}
