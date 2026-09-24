import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../db/client.js';
import { systems } from '../../db/schema.js';
import { requireUserId } from '../_lib/auth.js';
import { withErrorHandling } from '../_lib/handler.js';

const patchSystemSchema = z.object({ favorited: z.boolean() });

/** Any authenticated user can favorite/unfavorite a system — it's a shared list, not per-user. */
export default withErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const userId = await requireUserId(req, res);
  if (!userId) return;

  const parsed = patchSystemSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos.' });
    return;
  }

  const id = req.query.id as string;
  const [system] = await db
    .update(systems)
    .set({ favorited: parsed.data.favorited })
    .where(eq(systems.id, id))
    .returning();

  if (!system) {
    res.status(404).json({ error: 'Sistema não encontrado.' });
    return;
  }

  res.status(200).json({ system });
});
