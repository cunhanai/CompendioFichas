import bcrypt from 'bcryptjs';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { eq } from 'drizzle-orm';
import { db } from '../../db/client.js';
import { users } from '../../db/schema.js';
import { getUserId } from './session.js';

const SALT_ROUNDS = 10;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Resolves the authenticated user id or writes a 401 and returns null. */
export async function requireUserId(
  req: VercelRequest,
  res: VercelResponse,
): Promise<string | null> {
  const userId = await getUserId(req);
  if (!userId) {
    res.status(401).json({ error: 'Não autenticado.' });
    return null;
  }
  return userId;
}

/** Resolves the authenticated user id, requiring it to belong to an admin — writes 401/403 and returns null otherwise. */
export async function requireAdminId(
  req: VercelRequest,
  res: VercelResponse,
): Promise<string | null> {
  const userId = await requireUserId(req, res);
  if (!userId) return null;

  const [caller] = await db
    .select({ isAdmin: users.isAdmin })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!caller?.isAdmin) {
    res.status(403).json({ error: 'Apenas administradores podem fazer isso.' });
    return null;
  }
  return userId;
}
