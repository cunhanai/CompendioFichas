export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  isMaster: boolean;
  mustChangePassword: boolean;
}

/** Lightweight listing of another account — used by the character-sharing user picker, never
 * carries admin/auth fields. */
export interface RosterUser {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
}
