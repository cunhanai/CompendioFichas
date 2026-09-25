import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import { sessions, users } from '../../../db/schema.js';
import { requireAdminId } from '../../_lib/auth.js';
import { adminUpdateUserBodySchema } from '../../_lib/validation.js';
import { toAdminUserView } from '../../_lib/mappers.js';
import { withErrorHandling } from '../../_lib/handler.js';

/** Admin-only: toggles active/admin status on another account. */
export default withErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const callerId = await requireAdminId(req, res);
  if (!callerId) return;

  const parsed = adminUpdateUserBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' });
    return;
  }

  const id = req.query.id as string;
  if (id === callerId && (parsed.data.active === false || parsed.data.isAdmin === false)) {
    res
      .status(400)
      .json({ error: 'Você não pode desativar ou remover seu próprio acesso de administrador.' });
    return;
  }

  const [user] = await db.update(users).set(parsed.data).where(eq(users.id, id)).returning();
  if (!user) {
    res.status(404).json({ error: 'Usuário não encontrado.' });
    return;
  }

  if (parsed.data.active === false) {
    await db.delete(sessions).where(eq(sessions.userId, id));
  }

  res.status(200).json({ user: toAdminUserView(user) });
});
