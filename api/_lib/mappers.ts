import type { users } from '../../db/schema.js';
import type { RosterUser, UserProfile } from '../../src/entities/user/model/types.js';
import type { AdminUserView } from '../../src/features/user-management/model/types.js';

type UserRow = typeof users.$inferSelect;

/** Never leak passwordHash to the client. */
export function toUserProfile(row: UserRow): UserProfile {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    avatarUrl: row.avatarUrl,
    isAdmin: row.isAdmin,
    isMaster: row.isMaster,
    mustChangePassword: row.mustChangePassword,
  };
}

/** Minimal shape for the character-sharing user picker — no admin/auth fields. */
export function toRosterUser(row: UserRow): RosterUser {
  return { id: row.id, name: row.name, username: row.username, avatarUrl: row.avatarUrl };
}

/** Admin-only listing shape — adds the account-management fields regular profiles don't need. */
export function toAdminUserView(row: UserRow): AdminUserView {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    avatarUrl: row.avatarUrl,
    isAdmin: row.isAdmin,
    isMaster: row.isMaster,
    mustChangePassword: row.mustChangePassword,
    active: row.active,
    lastLoginAt: row.lastLoginAt ? row.lastLoginAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}
