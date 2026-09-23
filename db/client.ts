import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema.js';

type Db = ReturnType<typeof drizzle<typeof schema>>;

function createDb(): Db {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL is not set');
  }
  return drizzle(neon(url), { schema });
}

let instance: Db | undefined;

/**
 * Lazily created: a missing/invalid DATABASE_URL only throws once a request
 * handler actually touches the database, so the error is caught (and
 * reported as a clean 500) by that handler's try/catch instead of crashing
 * the whole module during a cold start, which Vercel surfaces as an opaque
 * non-JSON error page.
 */
export const db: Db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    instance ??= createDb();
    return Reflect.get(instance, prop, receiver);
  },
});
