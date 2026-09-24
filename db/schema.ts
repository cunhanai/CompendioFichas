import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import type { Character } from '../src/entities/character/model/types.js';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  avatarUrl: text('avatar_url'),
  isAdmin: boolean('is_admin').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

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
