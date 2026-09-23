import type { VercelRequest, VercelResponse } from '@vercel/node';

type Handler = (req: VercelRequest, res: VercelResponse) => Promise<void> | void;

/**
 * Wraps an API handler so an unexpected exception (a bad DATABASE_URL, a
 * dropped Neon connection, a bug) is logged server-side and turned into a
 * clean JSON 500 instead of the platform's opaque crash page — the client
 * relies on getting JSON back to show a friendly error.
 */
export function withErrorHandling(handler: Handler): Handler {
  return async (req, res) => {
    try {
      await handler(req, res);
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
