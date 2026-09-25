import type { VercelRequest, VercelResponse } from '@vercel/node';
import { asc } from 'drizzle-orm';
import { db } from '../../../db/client.js';
import { users } from '../../../db/schema.js';
import { requireAdminId } from '../../_lib/auth.js';
import { toAdminUserView } from '../../_lib/mappers.js';
import { withErrorHandling } from '../../_lib/handler.js';

/** Admin-only: lists every account for the user-management screen. */
export default withErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const callerId = await requireAdminId(req, res);
  if (!callerId) return;

  const rows = await db.select().from(users).orderBy(asc(users.name));
  res.status(200).json({ users: rows.map(toAdminUserView) });
});
