import type { LibraryItemLocale } from '../../library-item/model/types.js';

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  isMaster: boolean;
  mustChangePassword: boolean;
  lastSeenChangelogVersion: string | null;
  /** Which language variant to show by default when a library item has more than one — see
   * LibraryItemLocale, entities/library-item/model/types.ts. */
  libraryLocale: LibraryItemLocale;
}

/** Lightweight listing of another account — used by the character-sharing user picker, never
 * carries admin/auth fields. */
export interface RosterUser {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
}
