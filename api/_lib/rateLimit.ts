import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * Reads Upstash/Vercel KV credentials under the names the Vercel Marketplace
 * integration actually creates for this project (UPSTASH_DB_KV_REST_API_*),
 * falling back to the generic names in case a future/renamed integration uses
 * those instead.
 */
function getRedis(): Redis | null {
  const url =
    process.env.UPSTASH_DB_KV_REST_API_URL ??
    process.env.KV_REST_API_URL ??
    process.env.UPSTASH_REDIS_REST_URL;
  const token =
    process.env.UPSTASH_DB_KV_REST_API_TOKEN ??
    process.env.KV_REST_API_TOKEN ??
    process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = getRedis();
const configured = redis !== null;
if (!configured) {
  console.warn(
    '[rate-limit] No Redis credentials configured — rate limiting is disabled (fails open).',
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
 * Checks and consumes one attempt against a named limiter.
 *
 * - Not configured at all (no Redis credentials): fails OPEN. This is a deliberate "feature
 *   isn't turned on yet" state — mainly local dev, before Upstash is connected — never never
 *   locking anyone out because a step was skipped.
 * - Configured but erroring right now (outage, quota exceeded, network blip): fails CLOSED.
 *   The limiter was supposed to be protecting this endpoint, so a broken Redis should behave
 *   like "rate limited", not silently turn protection off.
 */
export async function checkRateLimit(
  name: string,
  key: string,
  limit: number,
  window: `${number} ${'s' | 'm' | 'h'}`,
): Promise<RateLimitResult> {
  if (!configured) return { limited: false };

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
    console.error('[rate-limit] Redis check failed — blocking this attempt (fail closed):', err);
    return { limited: true, retryAfterSeconds: 60 };
  }
}
