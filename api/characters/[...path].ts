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
 * This file is named `[...path].ts` (single bracket, mandatory catch-all), not the Next.js
 * "optional catch-all" `[[...path]].ts` — see the doc comment in
 * api/admin/users/[...path].ts for why the double-bracket name silently broke
 * `req.query.path` in production. vercel.json rewrites /api/characters to
 * /api/characters/__root so the bare base path reaches this function as one real segment.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const segments = ([] as string[]).concat(req.query.path ?? []);
  // TEMPORARY diagnostic — remove once the reported 404/405s on this dispatcher are explained.
  console.log('[diag characters]', req.method, req.url, JSON.stringify(req.query), segments);

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
