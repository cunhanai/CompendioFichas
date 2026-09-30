import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPathSegments } from '../../_lib/request.js';
import {
  listUsersHandler,
  updateUserHandler,
  resetPasswordHandler,
  listActivityHandler,
  listSecurityAlertsHandler,
  dismissSecurityAlertHandler,
} from '../../_lib/routes/adminUsers.js';

/**
 * One function serving every /api/admin/users/... route — Vercel's Hobby plan caps
 * serverless functions at 12, so this whole area is dispatched from a single catch-all file.
 *
 *   GET    /api/admin/users                       -> list users
 *   GET    /api/admin/users/activity               -> recent audit log entries
 *   GET    /api/admin/users/security-alerts        -> undismissed security alerts
 *   PATCH  /api/admin/users/security-alerts/:id    -> dismiss one alert
 *   PATCH  /api/admin/users/:id                    -> update active/admin status
 *   POST   /api/admin/users/:id/reset-password     -> reset a user's password
 *
 * Path segments come from `getPathSegments()` (api/_lib/request.ts), NOT `req.query.path`.
 * Confirmed in production Runtime Logs that Vercel forwards this dynamic route's segment under
 * the literal query key `...path` (dots included), never `path` — so `req.query.path` was always
 * undefined and every request with a real sub-path was silently treated as the bare base path,
 * regardless of file naming (`[...path].ts` vs the earlier, also-broken `[[...path]].ts`) or HTTP
 * method. Parsing segments straight out of `req.url` instead sidesteps that Vercel-internal quirk
 * entirely. Do not go back to reading `req.query.path` here.
 *
 * The bare `/api/admin/users` path (zero segments) never reaches a dynamic-route function on its
 * own — Vercel's synthesized `/api(/.*)?` 404 fallback catches it first. vercel.json's `rewrites`
 * routes that bare path to `/api/admin/users/__root` so it lands here as one real segment
 * instead, which `getPathSegments()` folds back into an empty array.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const segments = getPathSegments(req, '/api/admin/users/');

  if (segments.length === 0) {
    return listUsersHandler(req, res);
  }
  if (segments.length === 1 && segments[0] === 'activity') {
    return listActivityHandler(req, res);
  }
  if (segments.length === 1 && segments[0] === 'security-alerts') {
    return listSecurityAlertsHandler(req, res);
  }
  if (segments.length === 2 && segments[0] === 'security-alerts') {
    return dismissSecurityAlertHandler(req, res, segments[1]);
  }
  if (segments.length === 1) {
    return updateUserHandler(req, res, segments[0]);
  }
  if (segments.length === 2 && segments[1] === 'reset-password') {
    return resetPasswordHandler(req, res, segments[0]);
  }

  res.status(404).json({ error: 'Not found' });
}
