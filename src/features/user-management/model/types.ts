export interface AdminUserView {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}
