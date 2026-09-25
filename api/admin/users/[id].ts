import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import { sessions, users } from '../../../db/schema.js';
import { requireAdminUser } from '../../_lib/auth.js';
import { adminUpdateUserBodySchema } from '../../_lib/validation.js';
import { toAdminUserView } from '../../_lib/mappers.js';
import { logAudit } from '../../_lib/audit.js';
import { withErrorHandling } from '../../_lib/handler.js';

/** Admin-only: toggles active/admin status on another account. */
export default withErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const caller = await requireAdminUser(req, res);
  if (!caller) return;

  const parsed = adminUpdateUserBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' });
    return;
  }

  const id = req.query.id as string;
  if (id === caller.id && (parsed.data.active === false || parsed.data.isAdmin === false)) {
    res.status(400).json({
      error: 'Você não pode desativar ou remover seu próprio acesso de administrador.',
    });
    return;
  }

  // Only the master admin can grant or revoke admin access from anyone else — this is the
  // one thing a compromised regular-admin account can't do to escalate or shuffle privilege.
  if (parsed.data.isAdmin !== undefined && !caller.isMaster) {
    res.status(403).json({
      error: 'Apenas o administrador master pode conceder ou remover acesso de administrador.',
    });
    return;
  }

  const [target] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!target) {
    res.status(404).json({ error: 'Usuário não encontrado.' });
    return;
  }
  if (target.isMaster) {
    res
      .status(400)
      .json({ error: 'A conta do administrador master não pode ser alterada por aqui.' });
    return;
  }

  const [updated] = await db.update(users).set(parsed.data).where(eq(users.id, id)).returning();

  if (parsed.data.active === false) {
    await db.delete(sessions).where(eq(sessions.userId, id));
  }

  const actor = { id: caller.id, username: caller.username };
  const targetRef = { id: target.id, username: target.username };
  if (parsed.data.isAdmin !== undefined) {
    await logAudit(actor, parsed.data.isAdmin ? 'user.promote' : 'user.demote', targetRef);
  }
  if (parsed.data.active !== undefined) {
    await logAudit(actor, parsed.data.active ? 'user.activate' : 'user.deactivate', targetRef);
  }

  res.status(200).json({ user: toAdminUserView(updated) });
});
