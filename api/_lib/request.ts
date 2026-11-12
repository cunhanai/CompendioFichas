import type { VercelRequest } from '@vercel/node';

/**
 * Best-effort client IP from Vercel's forwarded-for header, for per-IP rate limiting. Takes the
 * LAST entry in the comma-separated list, not the first: a client can send its own
 * `X-Forwarded-For` with any value it wants, and Vercel's edge *appends* the real connecting IP
 * to whatever the client sent rather than replacing it — so the first entry is attacker-
 * controlled and the last one is the one the platform itself vouches for. Taking the first entry
 * let anyone defeat the per-IP login rate limiter (api/_lib/routes/auth.ts) just by sending a
 * different fake value on every attempt.
 */
export function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const list = Array.isArray(forwarded) ? forwarded.join(',') : (forwarded ?? '');
  const parts = list
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  return parts[parts.length - 1] || req.socket.remoteAddress || 'unknown';
}

/**
 * Path segments after `basePath` in the request URL, for the catch-all dispatchers under
 * `api/*` /[...path].ts. Deliberately does NOT read `req.query.path` — confirmed in production
 * (Vercel Runtime Logs) that the query key Vercel actually forwards for these dynamic routes is
 * the literal string `...path` (dots included), not `path`, so `req.query.path` is always
 * undefined and every dispatcher was treating every request as the bare base path, regardless of
 * bracket count in the filename. Parsing segments directly out of the URL sidesteps whatever
 * Vercel-internal quirk causes that mismatch entirely, since it doesn't depend on Vercel's
 * dynamic-route query forwarding at all.
 */
export function getPathSegments(req: VercelRequest, basePath: string): string[] {
  const pathname = (req.url ?? '').split('?')[0];
  const rest = pathname.startsWith(basePath) ? pathname.slice(basePath.length) : '';
  const segments = rest
    .split('/')
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment));
  return segments.length === 1 && segments[0] === '__root' ? [] : segments;
}
