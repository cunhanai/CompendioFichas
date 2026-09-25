import type { VercelRequest, VercelResponse } from '@vercel/node';
import { updateProfileHandler, changePasswordHandler } from '../_lib/routes/user.js';

/**
 * One function serving /api/user (PATCH) and /api/user/password (PATCH).
 *
 * NOTE: `[[...path]]` doesn't match the bare base path outside Next.js (see the identical
 * comment in api/admin/users/[[...path]].ts) — vercel.json rewrites /api/user to
 * /api/user/__root so it reaches this function as one real segment.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const segments = ([] as string[]).concat(req.query.path ?? []);

  if (segments.length === 0 || (segments.length === 1 && segments[0] === '__root')) {
    return updateProfileHandler(req, res);
  }
  if (segments.length === 1 && segments[0] === 'password') {
    return changePasswordHandler(req, res);
  }

  res.status(404).json({ error: 'Not found' });
}
