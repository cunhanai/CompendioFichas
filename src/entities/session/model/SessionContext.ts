import { createContext } from 'react';

export type SessionStatus = 'loading' | 'authenticated' | 'anonymous';

export type AuthResult = { ok: true } | { ok: false; error: string };

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  username: string;
  email: string;
  password: string;
}

export interface SessionContextValue {
  status: SessionStatus;
  isAuthenticated: boolean;
  login: (values: LoginCredentials) => Promise<AuthResult>;
  signup: (values: SignupCredentials) => Promise<AuthResult>;
  logout: () => Promise<void>;
}

export const SessionContext = createContext<SessionContextValue | null>(null);
