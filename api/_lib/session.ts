import { randomBytes } from 'node:crypto';
import { stringifySetCookie } from 'cookie';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { sessions } from '../../db/schema.js';

const COOKIE_NAME = 'session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString('hex');
  await db.insert(sessions).values({
    token,
    userId,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  });
  return token;
}

export function setSessionCookie(res: VercelResponse, token: string) {
  res.setHeader(
    'Set-Cookie',
    stringifySetCookie({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_TTL_MS / 1000,
    }),
  );
}

export function clearSessionCookie(res: VercelResponse) {
  res.setHeader(
    'Set-Cookie',
    stringifySetCookie({
      name: COOKIE_NAME,
      value: '',
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    }),
  );
}

/** Resolves the authenticated user id from the session cookie, or null if absent/expired. */
export async function getUserId(req: VercelRequest): Promise<string | null> {
  const token = req.cookies[COOKIE_NAME];
  if (!token) return null;

  const [session] = await db.select().from(sessions).where(eq(sessions.token, token)).limit(1);
  if (!session || session.expiresAt.getTime() < Date.now()) return null;

  return session.userId;
}

export async function deleteSession(req: VercelRequest) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) return;
  await db.delete(sessions).where(eq(sessions.token, token));
}
