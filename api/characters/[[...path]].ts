import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createCharacterHandler, updateCharacterHandler } from '../_lib/routes/characters.js';

/**
 * One function serving /api/characters (POST) and /api/characters/:id (PATCH) — keeps the
 * Hobby-plan serverless function count down.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const segments = ([] as string[]).concat(req.query.path ?? []);

  if (segments.length === 0) {
    return createCharacterHandler(req, res);
  }
  if (segments.length === 1) {
    return updateCharacterHandler(req, res, segments[0]);
  }

  res.status(404).json({ error: 'Not found' });
}
