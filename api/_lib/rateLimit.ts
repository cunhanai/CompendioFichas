import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Reads Upstash/Vercel KV credentials under either of the two common env var
 * pairings. If a custom storage prefix was set (as happened with the Neon
 * integration — see db/env.ts), those names will need adding here too.
 */
function getRedis(): Redis | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = getRedis();
if (!redis) {
  console.warn(
    '[rate-limit] No Redis credentials configured (KV_REST_API_URL/UPSTASH_REDIS_REST_URL) — rate limiting is disabled.',
  );
}

const limiters = new Map<string, Ratelimit>();

function getLimiter(
  name: string,
  limit: number,
  window: `${number} ${'s' | 'm' | 'h'}`,
): Ratelimit | null {
  if (!redis) return null;
  let limiter = limiters.get(name);
  if (!limiter) {
    limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, window),
      prefix: `ratelimit:${name}`,
    });
    limiters.set(name, limiter);
  }
  return limiter;
}

export interface RateLimitResult {
  limited: boolean;
  retryAfterSeconds?: number;
}

/**
 * Checks and consumes one attempt against a named limiter. Fails open (never
 * blocks) when Redis isn't configured or errors — availability wins over
 * this extra layer for a small app, since the DB-level checks stay in place.
 */
export async function checkRateLimit(
  name: string,
  key: string,
  limit: number,
  window: `${number} ${'s' | 'm' | 'h'}`,
): Promise<RateLimitResult> {
  const limiter = getLimiter(name, limit, window);
  if (!limiter) return { limited: false };

  try {
    const { success, reset } = await limiter.limit(key);
    if (success) return { limited: false };
    return {
      limited: true,
      retryAfterSeconds: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
    };
  } catch (err) {
    console.error('[rate-limit] Redis check failed, allowing request:', err);
    return { limited: false };
  }
}
