import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPathSegments } from '../_lib/request.js';
import {
  updateProfileHandler,
  changePasswordHandler,
  listRosterHandler,
} from '../_lib/routes/user.js';

/**
 * One function serving /api/user (PATCH), /api/user/password (PATCH), /api/user/roster (GET).
 *
 * Path segments come from `getPathSegments()` (api/_lib/request.ts), NOT `req.query.path` — see
 * the doc comment in api/admin/users/[...path].ts for why: Vercel forwards this dynamic route's
 * segment under the literal query key `...path`, never `path`, so `req.query.path` was always
 * undefined in production regardless of file naming. vercel.json rewrites /api/user to
 * /api/user/__root so the bare base path reaches this function as one real segment, which
 * `getPathSegments()` folds back into an empty array.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const segments = getPathSegments(req, '/api/user/');

  if (segments.length === 0) {
    return updateProfileHandler(req, res);
  }
  if (segments.length === 1 && segments[0] === 'password') {
    return changePasswordHandler(req, res);
  }
  if (segments.length === 1 && segments[0] === 'roster') {
    return listRosterHandler(req, res);
  }

  res.status(404).json({ error: 'Not found' });
}
