import { boolean, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import type { Character } from '../src/entities/character/model/types.js';
import type { SharedLibrary } from '../src/entities/library-item/model/types.js';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
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

export const sharedLibraries = pgTable('shared_libraries', {
  systemId: text('system_id')
    .primaryKey()
    .references(() => systems.id, { onDelete: 'cascade' }),
  data: jsonb('data').$type<SharedLibrary>().notNull(),
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
