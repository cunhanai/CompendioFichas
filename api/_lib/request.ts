import type { VercelRequest } from '@vercel/node';

/** Best-effort client IP from Vercel's forwarded-for header, for per-IP rate limiting. */
export function getClientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const first = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0];
  return first?.trim() || req.socket.remoteAddress || 'unknown';
}
