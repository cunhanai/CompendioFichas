import type { VercelRequest, VercelResponse } from '@vercel/node';
import { clearSessionCookie, deleteSession } from '../_lib/session.js';
import { withErrorHandling } from '../_lib/handler.js';

export default withErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  await deleteSession(req);
  clearSessionCookie(res);
  res.status(200).json({ ok: true });
});
