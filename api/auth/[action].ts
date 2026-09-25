import type { VercelRequest, VercelResponse } from '@vercel/node';
import { loginHandler, logoutHandler, meHandler, signupHandler } from '../_lib/routes/auth.js';

/**
 * One function serving /api/auth/login, /logout, /me, /signup — Vercel's Hobby plan caps
 * serverless functions at 12, so related routes are dispatched from a single file instead of
 * one file per endpoint.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  switch (req.query.action) {
    case 'login':
      return loginHandler(req, res);
    case 'logout':
      return logoutHandler(req, res);
    case 'me':
      return meHandler(req, res);
    case 'signup':
      return signupHandler(req, res);
    default:
      res.status(404).json({ error: 'Not found' });
  }
}
