import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  createCharacterHandler,
  updateCharacterHandler,
  shareCharacterHandler,
  unshareCharacterHandler,
} from '../_lib/routes/characters.js';

/**
 * One function serving /api/characters (POST), /api/characters/:id (PATCH), and
 * /api/characters/:id/shares (POST to grant, DELETE to revoke) — keeps the Hobby-plan
 * serverless function count down.
 *
 * NOTE: `[[...path]]` doesn't match the bare base path outside Next.js (see the identical
 * comment in api/admin/users/[[...path]].ts) — vercel.json rewrites /api/characters to
 * /api/characters/__root so it reaches this function as one real segment.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const segments = ([] as string[]).concat(req.query.path ?? []);

  if (segments.length === 0 || (segments.length === 1 && segments[0] === '__root')) {
    return createCharacterHandler(req, res);
  }
  if (segments.length === 2 && segments[1] === 'shares') {
    return req.method === 'DELETE'
      ? unshareCharacterHandler(req, res, segments[0])
      : shareCharacterHandler(req, res, segments[0]);
  }
  if (segments.length === 1) {
    return updateCharacterHandler(req, res, segments[0]);
  }

  res.status(404).json({ error: 'Not found' });
}
