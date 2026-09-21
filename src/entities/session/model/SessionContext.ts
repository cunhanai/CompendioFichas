import { createContext } from 'react';

export interface SessionContextValue {
  isAuthenticated: boolean;
  login: () => void;
  signup: () => void;
  logout: () => void;
}

export const SessionContext = createContext<SessionContextValue | null>(null);
