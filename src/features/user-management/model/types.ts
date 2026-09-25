export interface SecurityAlert {
  id: string;
  description: string;
  dismissed: boolean;
  dismissedAt: string | null;
  dismissedBy: string | null;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  actorId: string | null;
  actorUsername: string;
  action: string;
  targetUserId: string | null;
  targetUsername: string | null;
  detail: string | null;
  createdAt: string;
}

export interface AdminUserView {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  isAdmin: boolean;
  isMaster: boolean;
  mustChangePassword: boolean;
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}
