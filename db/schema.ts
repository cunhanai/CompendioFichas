import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import type { Character } from '../src/entities/character/model/types.js';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  avatarUrl: text('avatar_url'),
  isAdmin: boolean('is_admin').notNull().default(false),
  /** The one account (ana) allowed to grant/revoke admin from others — never settable through the API. */
  isMaster: boolean('is_master').notNull().default(false),
  /** Forces the change-password screen on next load — set when an admin resets this account's password. */
  mustChangePassword: boolean('must_change_password').notNull().default(false),
  active: boolean('active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Append-only trail of account-management actions — who did what to whom, and when. */
export const auditLog = pgTable(
  'audit_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
    actorUsername: text('actor_username').notNull(),
    action: text('action').notNull(),
    targetUserId: uuid('target_user_id').references(() => users.id, { onDelete: 'set null' }),
    targetUsername: text('target_username'),
    detail: text('detail'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  // maybeRaiseSecurityAlert() (api/_lib/securityAlerts.ts) runs this exact filter after every
  // failed/rate-limited login — without this, a brute-force burst causes repeated full scans
  // of an append-only table on the same DB already under attack.
  (table) => [index('audit_log_action_created_at_idx').on(table.action, table.createdAt)],
);

/**
 * Standing alerts raised when the login-failure/rate-limit rate in audit_log crosses a
 * threshold. Persists across logout/login and stays until an admin explicitly dismisses it —
 * it's a fact about something that happened, not a live computed value.
 */
export const securityAlerts = pgTable(
  'security_alerts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    description: text('description').notNull(),
    dismissed: boolean('dismissed').notNull().default(false),
    dismissedAt: timestamp('dismissed_at', { withTimezone: true }),
    dismissedBy: uuid('dismissed_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  // At most one undismissed alert can exist at a time — enforced here (a partial unique index
  // on a constant expression), not just in application code, so concurrent threshold-crossing
  // requests can't each insert their own duplicate alert (see maybeRaiseSecurityAlert's
  // onConflictDoNothing()).
  (table) => [
    uniqueIndex('security_alerts_one_active')
      .on(sql`(true)`)
      .where(sql`${table.dismissed} = false`),
  ],
);

export const sessions = pgTable('sessions', {
  token: text('token').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});

export const systems = pgTable('systems', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  implemented: boolean('implemented').notNull().default(false),
  favorited: boolean('favorited').notNull().default(false),
  playerCount: integer('player_count').notNull().default(0),
  logoUrl: text('logo_url'),
});

export const characters = pgTable('characters', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  systemId: text('system_id')
    .notNull()
    .references(() => systems.id),
  data: jsonb('data').$type<Character>().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Owner-to-user sharing grants — replaces the old public-link model. Not stored in
 * `characters.data`: the recipient isn't the character's owner, so this has to be queryable
 * across everyone's characters, which a value nested inside one owner's JSONB blob can't do.
 * Always view-only for the recipient; enforced by never exposing a write endpoint the recipient
 * could call, not by a flag on this row.
 */
export const characterShares = pgTable(
  'character_shares',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    characterId: uuid('character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade' }),
    sharedWithUserId: uuid('shared_with_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('character_shares_unique').on(table.characterId, table.sharedWithUserId),
    index('character_shares_shared_with_idx').on(table.sharedWithUserId),
  ],
);

/** Shared reference catalog, one table per library category — see entities/library-item/model/types.ts. */

const librarySystemId = () =>
  text('system_id')
    .notNull()
    .references(() => systems.id, { onDelete: 'cascade' });

export const librarySpells = pgTable('library_spells', {
  id: uuid('id').primaryKey(),
  systemId: librarySystemId(),
  name: text('name').notNull(),
  school: text('school').notNull(),
  circle: integer('circle').notNull(),
  castTime: text('cast_time').notNull(),
  range: text('range').notNull(),
  duration: text('duration').notNull(),
  resistance: text('resistance').notNull(),
  desc: text('desc').notNull(),
});

export const libraryWeapons = pgTable('library_weapons', {
  id: uuid('id').primaryKey(),
  systemId: librarySystemId(),
  name: text('name').notNull(),
  atk: text('atk').notNull(),
  crit: text('crit').notNull(),
  dmg: text('dmg').notNull(),
  type: text('type').notNull(),
  range: text('range').notNull(),
  desc: text('desc').notNull(),
  hasAmmo: boolean('has_ammo').notNull().default(false),
  ammoMax: integer('ammo_max').notNull().default(0),
});

export const librarySpecialAbilities = pgTable('library_special_abilities', {
  id: uuid('id').primaryKey(),
  systemId: librarySystemId(),
  name: text('name').notNull(),
  subtitle: text('subtitle').notNull(),
  uses: text('uses').notNull(),
  desc: text('desc').notNull(),
});

export const libraryFeats = pgTable('library_feats', {
  id: uuid('id').primaryKey(),
  systemId: librarySystemId(),
  name: text('name').notNull(),
  desc: text('desc').notNull(),
  tag: text('tag').notNull(),
});

export const librarySkills = pgTable('library_skills', {
  id: uuid('id').primaryKey(),
  systemId: librarySystemId(),
  name: text('name').notNull(),
  desc: text('desc').notNull(),
  tag: text('tag').notNull(),
});

export const libraryLanguages = pgTable('library_languages', {
  id: uuid('id').primaryKey(),
  systemId: librarySystemId(),
  name: text('name').notNull(),
  desc: text('desc').notNull(),
  tag: text('tag').notNull(),
});

export const libraryCreatures = pgTable('library_creatures', {
  id: uuid('id').primaryKey(),
  systemId: librarySystemId(),
  name: text('name').notNull(),
  desc: text('desc').notNull(),
  tag: text('tag').notNull(),
});
