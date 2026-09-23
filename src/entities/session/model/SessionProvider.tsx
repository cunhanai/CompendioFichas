import { useEffect, useState, type ReactNode } from 'react';
import { api, ApiError } from '@/shared/lib/api';
import {
  SessionContext,
  type AuthResult,
  type LoginCredentials,
  type SessionContextValue,
  type SessionStatus,
  type SignupCredentials,
} from './SessionContext';

export function SessionProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<SessionStatus>('loading');

  useEffect(() => {
    api
      .get('/auth/me')
      .then(() => setStatus('authenticated'))
      .catch(() => setStatus('anonymous'));
  }, []);

  const login = async (values: LoginCredentials): Promise<AuthResult> => {
    try {
      await api.post('/auth/login', values);
      setStatus('authenticated');
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof ApiError ? err.message : 'Não foi possível entrar.',
      };
    }
  };

  const signup = async (values: SignupCredentials): Promise<AuthResult> => {
    try {
      await api.post('/auth/signup', values);
      setStatus('authenticated');
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error: err instanceof ApiError ? err.message : 'Não foi possível criar a conta.',
      };
    }
  };

  const logout = async () => {
    await api.post('/auth/logout').catch(() => {});
    setStatus('anonymous');
  };

  const value: SessionContextValue = {
    status,
    isAuthenticated: status === 'authenticated',
    login,
    signup,
    logout,
  };

  return <SessionContext value={value}>{children}</SessionContext>;
}
