export interface UserProfile {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  isMaster: boolean;
  mustChangePassword: boolean;
}
