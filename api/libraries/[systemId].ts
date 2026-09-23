import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../db/client.js';
import { sharedLibraries } from '../../db/schema.js';
import { requireUserId } from '../_lib/auth.js';
import { withErrorHandling } from '../_lib/handler.js';
import type { SharedLibrary } from '../../src/entities/library-item/model/types.js';

export default withErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PATCH') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const userId = await requireUserId(req, res);
  if (!userId) return;

  const systemId = req.query.systemId as string;
  const library = req.body as SharedLibrary;

  const [row] = await db
    .insert(sharedLibraries)
    .values({ systemId, data: library })
    .onConflictDoUpdate({ target: sharedLibraries.systemId, set: { data: library } })
    .returning();

  res.status(200).json({ library: row.data });
});
