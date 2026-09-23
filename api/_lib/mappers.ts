import type { users } from '../../db/schema.js';
import type { UserProfile } from '../../src/entities/user/model/types.js';

type UserRow = typeof users.$inferSelect;

/** Never leak passwordHash to the client. */
export function toUserProfile(row: UserRow): UserProfile {
  return { id: row.id, name: row.name, username: row.username, email: row.email };
}
