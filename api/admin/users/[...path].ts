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
 * This file is named `[...path].ts` (single bracket — mandatory catch-all), not
 * `[[...path]].ts` (double bracket — Next.js's "optional catch-all" syntax). It used to be the
 * double-bracket name; that turned out to be the actual cause of a long-standing bug where every
 * request under /api/admin/users/*, /api/characters/*, and /api/user/* with a real sub-path
 * (not just the bare base path) was served as if it had zero path segments, regardless of the
 * real sub-path or HTTP method. Root cause confirmed by reading Vercel's own
 * `packages/fs-detectors/src/detect-builders.ts` (github.com/vercel/vercel): its
 * `getSegmentName()` helper strips exactly one bracket character off each end of the filename's
 * param segment to get the query key to forward. For `[...path]` that correctly yields `path`.
 * For `[[...path]]` it only strips one layer and yields `[...path]` — still bracketed — so the
 * generated route's `dest` forwards the segment as `?[...path]=$1` instead of `?path=$1`, and
 * `req.query.path` is simply never populated, even though the route still matches and the
 * function is still invoked correctly (this is a distinct bug from the already-documented
 * zero-segment-routing gotcha below — that one is about whether the function gets invoked at
 * all; this one is about a mis-set query key on requests that already reached it fine).
 * Renaming to the single-bracket, genuinely-mandatory form fixed it. Never rename these
 * dispatcher files back to double brackets.
 *
 * It never matches the bare `/api/admin/users` path (zero segments), which instead hits Vercel's
 * synthesized `/api(/.*)?` 404 fallback before this function is ever invoked. vercel.json's
 * `rewrites` routes that bare path to `/api/admin/users/__root` so it lands here as one real
 * segment instead of zero.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const segments = ([] as string[]).concat(req.query.path ?? []);
  // TEMPORARY diagnostic — remove once the reported 404/405s on this dispatcher are explained.
  console.log('[diag admin/users]', req.method, req.url, JSON.stringify(req.query), segments);

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
