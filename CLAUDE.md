# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

"Compêndio de Fichas" — a multi-user, multi-system tabletop RPG character sheet SPA. Only
**Pathfinder 1ª Edição** is actually implemented; other systems exist only as "em breve"
placeholders in navigation/seed data. See `DESIGN_NOTES.md` for the full product spec and a
running log of every design decision made in this project (see "Process rule" below).

The README is stale — it still describes a `localStorage`-only mockup. The app has a real
backend (see Architecture); don't trust the README's "Estado do projeto" section.

## Commands

```bash
npm run dev         # Vite dev server
npm run build       # tsc -b (typecheck both tsconfig projects) + vite build — this IS the typecheck command, there is no separate `typecheck` script
npm run lint         # ESLint (flat config, eslint.config.js)
npm run format       # Prettier --write
npm test             # Vitest, single run
npm run test:watch  # Vitest watch mode
npm run db:migrate  # drizzle-kit migrate, using .env.development.local
npm run db:seed     # tsx db/seed.ts, using .env.development.local
```

Run a single test file: `npx vitest run path/to/file.test.ts` (or `npx vitest run -t "name"` to
filter by test name). Tests live next to the code they cover (e.g.
`src/entities/character/model/calculations.test.ts`,
`src/shared/ui/organisms/Popup.test.tsx`), not in a separate `__tests__` tree.

`npm run build` type-checks via TypeScript project references: `tsconfig.app.json` covers
`src/**` (browser code), `tsconfig.node.json` covers `api/**` and `db/**` (server code). Run
`npx tsc -b` directly for a typecheck-only pass.

### Generating a DB migration

`drizzle-kit generate` needs `DATABASE_URL` (or `COMPENDIO_DB_DATABASE_URL`, see below) resolvable
even though it never connects to the DB — in an environment with no real one set, pass a
placeholder: `DATABASE_URL="postgres://x:x@localhost:5432/x" npx drizzle-kit generate`.

`drizzle-kit generate` also needs a TTY when a single schema diff contains both a dropped and an
added table/column that look like a rename — it can't be answered non-interactively, and hangs/errors
in a sandboxed shell. If a schema change both drops something and adds something, split it into
multiple sequential `generate` calls, each an unambiguous pure add or pure drop.

## Architecture

### Frontend: Feature-Sliced Design + Atomic Design

`src/` is layered `app → pages → widgets → features → entities → shared`; each layer may only
import from itself or a layer below. `shared/ui` is further organized Atomic-Design style
(`atoms/`, `molecules/`, `organisms/`) — most are thin wrappers around Base UI primitives
(`@base-ui/react`) with Tailwind styling via `class-variance-authority`.

- `app/providers/AppProviders.tsx` nests `SessionProvider` (auth state) inside
  `AppDataProvider` (everything else). `AppDataProvider` fetches `GET /api/bootstrap` once
  after login and holds `user`/`systems`/`characters`/`libraries`/`securityAlerts` in one
  React state object; every mutation in the app is an optimistic local update + a fire-and-forget
  API call, not a refetch. `AppDataProvider` is also where the mandatory
  password-change gate lives (renders `ForceChangePasswordPage` instead of children when
  `user.mustChangePassword`).
- Routing is real URL-based (`react-router-dom` v7), not an in-memory route enum. Route paths
  are centralized in `src/shared/lib/routes.ts`; use those builders instead of hardcoding paths.
- `app/AppScreens.tsx` lazy-loads every page (`React.lazy`) — the character sheet page alone is
  a large chunk (~10 tabs, ~35 popups across many `features/*` slices), so keep new heavy pages
  lazy too rather than adding to the eagerly-loaded bundle.
- A `Character` is one big typed JSONB blob (`src/entities/character/model/types.ts`, ~250
  lines covering every tab) stored as a single `characters.data` column — deliberately not
  normalized into relational tables, since the whole app already treats it as one object. The
  shared library (spells/weapons/feats/skills/languages/creatures/special abilities) **is**
  normalized, one Postgres table per category with a plain `system_id` FK — that split happened
  because a system→item relationship is one-to-many, not because character data needed the same
  treatment. Don't assume the two follow the same pattern.

### Backend: Vercel serverless functions + Drizzle/Neon

`api/**/*.ts` files are Vercel Serverless Functions; `db/**` holds the Drizzle schema/client/migrations.
`api/_lib/` is framework code, not routes (leading underscore excludes it from Vercel's file-based
routing).

**Vercel's Hobby plan caps a deployment at 12 serverless functions.** This project already hit
that limit once and had to consolidate. The pattern going forward: put the actual handler logic
in `api/_lib/routes/<area>.ts` as named exports (each independently `withErrorHandling`-wrapped),
and make the file under `api/` a thin dispatcher that routes by HTTP method and/or path segments
to the right handler — see `api/auth/[action].ts`, `api/admin/users/[[...path]].ts`,
`api/characters/[[...path]].ts`, `api/user/[[...path]].ts` for the pattern. **Do not add a new
top-level file under `api/` for a new endpoint** — extend an existing dispatcher/routes module, or
create a new dispatcher only if none of the existing areas fit. `withErrorHandling` is generic
over extra handler args (`Handler<Args>`) specifically so a dispatcher can forward a
path-derived id straight through to the wrapped handler.

**`[[...path]].ts` gotcha (verified against Vercel's own `fs-detectors` source — this is not
Next.js docs behavior, which differs):** the double-bracket "optional catch-all" filename only
behaves that way inside Next.js's own router. For a plain Serverless Function like these, it's
treated identically to `[...path].ts` — a mandatory catch-all (one or more segments; multi-segment
routes like `security-alerts/:id` work fine) that **never matches the bare base path with zero
segments** (`GET /api/admin/users` with nothing after it 404s at Vercel's edge before the
function is even invoked; `GET /api/admin/users/activity` works fine). Every dispatcher that
needs to handle a bare-path route works around this with a `vercel.json` rewrite from the bare
path to a synthetic `/…/__root` segment, which the dispatcher treats the same as zero segments —
see the rewrites array and the matching `segments[0] === '__root'` check in each of
`api/admin/users/[[...path]].ts`, `api/characters/[[...path]].ts`, `api/user/[[...path]].ts`. A
new dispatcher that needs a bare-path route must add the same pair (rewrite + `__root` check) —
don't assume the bare path just works without it.

- **Character sharing**: `character_shares` (`character_id`, `shared_with_user_id`) is a real
  table, not a field inside `characters.data` — unlike everything else about a character, "who
  else can see this" needs to be queryable from the *recipient's* side (their bootstrap needs
  "what's been shared with me"), which a value nested in the owner's JSONB blob can't support.
  Always view-only: the recipient never gets a write endpoint for someone else's character.
  `useCharacter()` (`app/providers/app-data/useAppData.ts`) resolves both owned and
  shared-with-me characters, and for the latter returns a no-op `update` — that's the actual
  enforcement (every editing popup receives the same `update` reference), not each popup's own
  UI gating, which doesn't yet check `readOnly` everywhere (see DESIGN_NOTES.md).
- **Auth**: cookie-based sessions in a `sessions` table (`api/_lib/session.ts`), not JWT —
  chosen because a DB-backed session can be revoked immediately (used when deactivating a user,
  resetting a password, or a user changing their own password). Cookie is `httpOnly`, `secure`,
  `sameSite=lax`, 7-day TTL. Passwords are bcrypt (`bcryptjs`, 10 rounds) — never swap this for a
  fast hash like SHA-256.
- **No public signup.** `POST /api/auth/signup` requires an authenticated admin caller
  (`requireAdminUser` / `requireAdminId` in `api/_lib/auth.ts`) and never sets a session cookie
  for the account it creates.
- **Two admin tiers**: `users.isAdmin` (can manage active/inactive state, reset passwords,
  create users) and `users.isMaster` (exactly one account; only it can grant/revoke `isAdmin` on
  other accounts, and it's the only account whose own active/admin/password state can't be
  touched by anyone else through the admin API). `isMaster` is never settable through any
  endpoint — it only exists as a direct DB value.
- **Rate limiting** (`api/_lib/rateLimit.ts`) uses Upstash Redis via `@upstash/ratelimit`.
  Behavior is asymmetric on purpose: if Redis credentials were never configured, it fails open
  (treats every attempt as allowed — the "not turned on yet" state, e.g. local dev); if Redis
  is configured but a call to it errors (outage, quota exceeded), it fails closed (blocks the
  attempt) — a configured protection breaking shouldn't silently turn itself off. Env var names
  it checks: `UPSTASH_DB_KV_REST_API_URL`/`_TOKEN` (this project's actual Upstash Marketplace
  integration), falling back to `KV_REST_API_URL`/`UPSTASH_REDIS_REST_URL` and their tokens.
- **Audit trail**: `api/_lib/audit.ts` (`logAudit`) writes to `audit_log` for every
  account-management action and every login attempt (success/failure/rate-limited) — it never
  throws, so a logging failure can't turn a successful action into a 500. `api/_lib/securityAlerts.ts`
  (`maybeRaiseSecurityAlert`) is called after failed/rate-limited logins and raises a standing,
  admin-dismissible `security_alerts` row when the last hour crosses a threshold; it's throttled
  to at most one live (undismissed) alert per rolling window.
- **DB env var**: `db/env.ts`'s `getDatabaseUrl()` checks `DATABASE_URL` first, then
  `COMPENDIO_DB_DATABASE_URL` — the Neon Vercel integration on this project was connected with a
  custom variable prefix, so the plain name doesn't exist there. If a future integration
  (e.g. Upstash) turns out to use yet another prefix, add the fallback the same way rather than
  asking the user to rename anything in Vercel.
- `db/client.ts` wraps the Drizzle instance in a `Proxy` that only calls `createDb()` (and thus
  only throws on a bad/missing `DATABASE_URL`) on first property access — this keeps a
  misconfigured DB from crashing the whole module at cold start with Vercel's opaque
  non-JSON error page; the error surfaces inside a request handler's own try/catch instead.

### Deployment

Vercel, deploying from GitHub. `vercel.json`'s `git.deploymentEnabled` restricts deployments to
the `main` branch only — other branches/PRs should not trigger a Vercel build or preview.
**Development now goes through a feature branch + PR, not direct pushes to `main`.**

### Process rule (from `DESIGN_NOTES.md`)

Every requested product/design change must be logged in `DESIGN_NOTES.md` as it's made, without
the user needing to ask each time — this is a standing instruction from the project owner, not
a one-off ask. Read `DESIGN_NOTES.md` before starting nontrivial work in this repo; it's the
canonical record of product decisions and their reasoning, and is longer and more authoritative
than this file for anything product-shaped.
