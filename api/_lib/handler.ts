import type { VercelRequest, VercelResponse } from '@vercel/node';

type Handler<Args extends unknown[] = []> = (
  req: VercelRequest,
  res: VercelResponse,
  ...args: Args
) => Promise<void> | void;

/**
 * Wraps an API handler so an unexpected exception (a bad DATABASE_URL, a
 * dropped Neon connection, a bug) is logged server-side and turned into a
 * clean JSON 500 instead of the platform's opaque crash page — the client
 * relies on getting JSON back to show a friendly error. `Args` lets a
 * consolidated route (see api/_lib/routes/*) pass extra context, like a
 * path-derived id, straight through to the wrapped handler.
 */
export function withErrorHandling<Args extends unknown[] = []>(
  handler: Handler<Args>,
): Handler<Args> {
  return async (req, res, ...args) => {
    try {
      await handler(req, res, ...args);
    } catch (err) {
      console.error(`[api] ${req.method} ${req.url} failed:`, err);
      if (!res.headersSent) {
        res.status(500).json({
          error: 'Ocorreu um erro no servidor. Tente novamente em instantes.',
        });
      }
    }
  };
}
