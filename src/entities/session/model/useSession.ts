import { use } from 'react';
import { SessionContext, type SessionContextValue } from './SessionContext';

export function useSession(): SessionContextValue {
  const ctx = use(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}
