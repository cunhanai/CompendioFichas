import { db } from '../../db/client.js';
import { auditLog } from '../../db/schema.js';

export type AuditAction =
  | 'user.create'
  | 'user.activate'
  | 'user.deactivate'
  | 'user.promote'
  | 'user.demote'
  | 'user.password_reset'
  | 'user.password_change'
  | 'auth.login_success'
  | 'auth.login_failed'
  | 'auth.rate_limited';

interface AuditActor {
  /** Omitted when the attempt never resolved to a real account (e.g. a failed login for an unknown username). */
  id?: string;
  username: string;
}

/**
 * Records an account-management event. Never throws — a logging failure
 * shouldn't turn an otherwise-successful admin action into a 500.
 */
export async function logAudit(
  actor: AuditActor,
  action: AuditAction,
  target?: AuditActor,
  detail?: string,
): Promise<void> {
  try {
    await db.insert(auditLog).values({
      actorId: actor.id,
      actorUsername: actor.username,
      action,
      targetUserId: target?.id,
      targetUsername: target?.username,
      detail,
    });
  } catch (err) {
    console.error('[audit] Failed to record audit log entry:', action, err);
  }
}
