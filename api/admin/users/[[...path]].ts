import type { VercelRequest, VercelResponse } from '@vercel/node';
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
 * NOTE: `[[...path]]` is Next.js filename syntax, but this isn't a Next.js app — Vercel's
 * generic (non-Next.js) Serverless Functions router treats it identically to `[...path]`
 * (mandatory catch-all: one or more segments; verified against Vercel's own fs-detectors
 * source). It never matches the bare `/api/admin/users` path (zero segments), which instead
 * hits Vercel's synthesized `/api(/.*)?` 404 fallback before this function is ever invoked.
 * vercel.json's `rewrites` routes that bare path to `/api/admin/users/__root` so it lands here
 * as one real segment instead of zero.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const segments = ([] as string[]).concat(req.query.path ?? []);

  if (segments.length === 0 || (segments.length === 1 && segments[0] === '__root')) {
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
