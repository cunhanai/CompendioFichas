import type { VercelRequest, VercelResponse } from '@vercel/node';
import { asc, desc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '../../../db/client.js';
import { auditLog, securityAlerts, sessions, users } from '../../../db/schema.js';
import { requireAdminUser, hashPassword } from '../auth.js';
import { adminUpdateUserBodySchema } from '../validation.js';
import { toAdminUserView } from '../mappers.js';
import { generateTempPassword } from '../password.js';
import { logAudit } from '../audit.js';
import { withErrorHandling } from '../handler.js';
import {
  MIGRATION_0011_SQL,
  MIGRATION_0011_HASH,
  MIGRATION_0011_FOLDER_MILLIS,
  MIGRATION_0012_SQL,
  MIGRATION_0012_HASH,
  MIGRATION_0012_FOLDER_MILLIS,
} from '../migrationSql.js';

/** GET /api/admin/users — lists every account for the user-management screen. */
export const listUsersHandler = withErrorHandling(async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const caller = await requireAdminUser(req, res);
  if (!caller) return;

  const rows = await db.select().from(users).orderBy(asc(users.name));
  res.status(200).json({ users: rows.map(toAdminUserView) });
});

/** PATCH /api/admin/users/:id — toggles active/admin status on another account. */
export const updateUserHandler = withErrorHandling(async function handler(
  req: VercelRequest,
  res: VercelResponse,
  id: string,
) {
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

/**
 * POST /api/admin/users/:id/reset-password — sets a random temporary password on another
 * account, forces a change on next login, and signs it out everywhere. The plaintext is
 * returned once in the response and never stored.
 */
export const resetPasswordHandler = withErrorHandling(async function handler(
  req: VercelRequest,
  res: VercelResponse,
  id: string,
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const caller = await requireAdminUser(req, res);
  if (!caller) return;

  const [target] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!target) {
    res.status(404).json({ error: 'Usuário não encontrado.' });
    return;
  }
  // Only the master account can reset its own password this way — nobody else should be
  // able to lock the master out or take it over by resetting its credentials.
  if (target.isMaster && target.id !== caller.id) {
    res
      .status(400)
      .json({ error: 'A senha do administrador master só pode ser redefinida por ele mesmo.' });
    return;
  }

  const tempPassword = generateTempPassword();
  const passwordHash = await hashPassword(tempPassword);

  await db.update(users).set({ passwordHash, mustChangePassword: true }).where(eq(users.id, id));
  await db.delete(sessions).where(eq(sessions.userId, id));

  await logAudit({ id: caller.id, username: caller.username }, 'user.password_reset', {
    id: target.id,
    username: target.username,
  });

  res.status(200).json({ tempPassword });
});

/** GET /api/admin/users/activity — recent audit log entries, newest first. */
export const listActivityHandler = withErrorHandling(async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const caller = await requireAdminUser(req, res);
  if (!caller) return;

  const rows = await db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(100);
  res.status(200).json({ entries: rows });
});

/** GET /api/admin/users/security-alerts — every undismissed alert. */
export const listSecurityAlertsHandler = withErrorHandling(async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const caller = await requireAdminUser(req, res);
  if (!caller) return;

  const rows = await db
    .select()
    .from(securityAlerts)
    .where(eq(securityAlerts.dismissed, false))
    .orderBy(desc(securityAlerts.createdAt));
  res.status(200).json({ alerts: rows });
});

const dismissSchema = z.object({ dismissed: z.literal(true) });

/** PATCH /api/admin/users/security-alerts/:id — dismisses one alert for good. */
export const dismissSecurityAlertHandler = withErrorHandling(async function handler(
  req: VercelRequest,
  res: VercelResponse,
  id: string,
) {
  if (req.method !== 'PATCH') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const caller = await requireAdminUser(req, res);
  if (!caller) return;

  const parsed = dismissSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos.' });
    return;
  }

  const [alert] = await db
    .update(securityAlerts)
    .set({ dismissed: true, dismissedAt: new Date(), dismissedBy: caller.id })
    .where(eq(securityAlerts.id, id))
    .returning();
  if (!alert) {
    res.status(404).json({ error: 'Alerta não encontrado.' });
    return;
  }

  res.status(200).json({ alert });
});

const PENDING_CHARACTER_SCHEMA_MIGRATIONS = [
  {
    sql: MIGRATION_0011_SQL,
    hash: MIGRATION_0011_HASH,
    folderMillis: MIGRATION_0011_FOLDER_MILLIS,
  },
  {
    sql: MIGRATION_0012_SQL,
    hash: MIGRATION_0012_HASH,
    folderMillis: MIGRATION_0012_FOLDER_MILLIS,
  },
];

/**
 * TEMPORARY, one-time-use endpoint. Runs the 0011/0012 migrations (JSONB -> relational character
 * schema) against whatever DB this deployment is connected to — added specifically because
 * nobody has local shell access to run `npm run db:migrate` against production themselves.
 * Master-only.
 *
 * The migration SQL is embedded in migrationSql.ts (not read from db/migrations/*.sql at
 * runtime): a first version of this handler used `fs.readFileSync`/Drizzle's own file-based
 * migrator, which needed a `vercel.json` `functions.includeFiles` entry to guarantee the .sql
 * files were bundled — that entry turned out to break this dispatcher's route-segment parsing in
 * production (every request under /api/admin/users/* was landing on the bare-path branch
 * regardless of the actual sub-path or HTTP method). Embedding the SQL as plain string constants
 * needs no filesystem access at all, so there's nothing for vercel.json to special-case.
 *
 * Tracking applied migrations replicates exactly what Drizzle's own migrator does (same
 * `drizzle.__drizzle_migrations` table, same hash/created_at bookkeeping) so (a) calling this
 * more than once is a safe no-op once everything's applied, and (b) a real `npm run db:migrate`
 * run later — once someone does have shell access — recognizes 0011/0012 as already done instead
 * of re-applying them.
 *
 * Delete this handler, its dispatcher wiring, and migrationSql.ts once the migration is confirmed
 * applied — none of it has a reason to exist afterward.
 */
export const runCharacterSchemaMigrationHandler = withErrorHandling(async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const caller = await requireAdminUser(req, res);
  if (!caller) return;
  if (!caller.isMaster) {
    res.status(403).json({ error: 'Apenas o administrador master pode fazer isso.' });
    return;
  }

  await db.execute(sql`CREATE SCHEMA IF NOT EXISTS "drizzle"`);
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `);
  const lastApplied = await db.execute(
    sql`select created_at from "drizzle"."__drizzle_migrations" order by created_at desc limit 1`,
  );
  const lastAppliedMillis = lastApplied.rows[0]
    ? Number((lastApplied.rows[0] as { created_at: string | number }).created_at)
    : 0;

  let migrationsApplied = 0;
  for (const migration of PENDING_CHARACTER_SCHEMA_MIGRATIONS) {
    if (migration.folderMillis <= lastAppliedMillis) continue;

    const statements = migration.sql
      .split('--> statement-breakpoint')
      .map((statement) => statement.trim())
      .filter(Boolean);
    for (const statement of statements) {
      await db.execute(sql.raw(statement));
    }
    await db.execute(
      sql`insert into "drizzle"."__drizzle_migrations" ("hash", "created_at") values (${migration.hash}, ${migration.folderMillis})`,
    );
    migrationsApplied += 1;
  }

  res.status(200).json({ ok: true, migrationsApplied });
});
