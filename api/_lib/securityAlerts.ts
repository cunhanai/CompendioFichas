import { and, count, eq, gte, inArray } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { auditLog, securityAlerts } from '../../db/schema.js';

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const THRESHOLD = 8; // failed logins + rate-limit hits in the window

/**
 * Called after every failed/rate-limited login attempt. If the last hour crossed the
 * threshold and there's no still-undismissed alert already covering it, raises one. This
 * only checks — it never blocks the request it's called from.
 */
export async function maybeRaiseSecurityAlert(): Promise<void> {
  try {
    const since = new Date(Date.now() - WINDOW_MS);

    const [existing] = await db
      .select({ id: securityAlerts.id })
      .from(securityAlerts)
      .where(and(eq(securityAlerts.dismissed, false), gte(securityAlerts.createdAt, since)))
      .limit(1);
    if (existing) return; // already have a live alert covering this window

    const [{ value }] = await db
      .select({ value: count() })
      .from(auditLog)
      .where(
        and(
          inArray(auditLog.action, ['auth.login_failed', 'auth.rate_limited']),
          gte(auditLog.createdAt, since),
        ),
      );
    if (value < THRESHOLD) return;

    await db.insert(securityAlerts).values({
      description: `${value} tentativas de login falhas ou bloqueadas na última hora — pode ser um ataque de força bruta.`,
    });
  } catch (err) {
    console.error('[security-alerts] Failed to evaluate threshold:', err);
  }
}
