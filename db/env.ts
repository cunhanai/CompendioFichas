/**
 * The Vercel Storage integration for Neon was connected with a custom
 * "COMPENDIO_DB_" prefix, so the connection string lands in
 * COMPENDIO_DB_DATABASE_URL rather than the plain DATABASE_URL that
 * `drizzle-kit` and most guides assume. Prefer the conventional name (used
 * by local scripts run against a pulled .env file) and fall back to the
 * prefixed one actually set in Vercel.
 */
export function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL ?? process.env.COMPENDIO_DB_DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL (or COMPENDIO_DB_DATABASE_URL) is not set');
  }
  return url;
}
