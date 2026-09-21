import { useEffect, useState, type ReactNode } from 'react';
import { readJson, writeJson } from '@/shared/lib/storage';
import { SessionContext, type SessionContextValue } from './SessionContext';

const STORAGE_KEY = 'compendio:session';

interface SessionState {
  isAuthenticated: boolean;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => readJson<SessionState>(STORAGE_KEY, { isAuthenticated: false }).isAuthenticated,
  );

  useEffect(() => {
    writeJson<SessionState>(STORAGE_KEY, { isAuthenticated });
  }, [isAuthenticated]);

  const value: SessionContextValue = {
    isAuthenticated,
    login: () => setIsAuthenticated(true),
    signup: () => setIsAuthenticated(true),
    logout: () => setIsAuthenticated(false),
  };

  return <SessionContext value={value}>{children}</SessionContext>;
}
