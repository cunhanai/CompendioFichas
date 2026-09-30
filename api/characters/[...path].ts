import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPathSegments } from '../_lib/request.js';
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
 * Path segments come from `getPathSegments()` (api/_lib/request.ts), NOT `req.query.path` — see
 * the doc comment in api/admin/users/[...path].ts for why: Vercel forwards this dynamic route's
 * segment under the literal query key `...path`, never `path`, so `req.query.path` was always
 * undefined in production regardless of file naming. vercel.json rewrites /api/characters to
 * /api/characters/__root so the bare base path reaches this function as one real segment, which
 * `getPathSegments()` folds back into an empty array.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const segments = getPathSegments(req, '/api/characters/');

  if (segments.length === 0) {
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
