import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  updateProfileHandler,
  changePasswordHandler,
  listRosterHandler,
} from '../_lib/routes/user.js';

/**
 * One function serving /api/user (PATCH), /api/user/password (PATCH), /api/user/roster (GET).
 *
 * This file is named `[...path].ts` (single bracket, mandatory catch-all), not the Next.js
 * "optional catch-all" `[[...path]].ts` — see the doc comment in
 * api/admin/users/[...path].ts for why the double-bracket name silently broke
 * `req.query.path` in production. vercel.json rewrites /api/user to /api/user/__root so the
 * bare base path reaches this function as one real segment.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const segments = ([] as string[]).concat(req.query.path ?? []);

  if (segments.length === 0 || (segments.length === 1 && segments[0] === '__root')) {
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
