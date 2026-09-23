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

/** Status codes the auth endpoints use for something the user can fix by editing the form. */
const EXPECTED_AUTH_STATUSES = [400, 401, 409];

/** Anything outside the expected set (network failure, 404, 500, ...) is the server's fault. */
function authFailure(err: unknown, fallback: string): AuthResult {
  const apiErr = err instanceof ApiError ? err : null;
  return {
    ok: false,
    error: apiErr?.message ?? fallback,
    unexpected: !apiErr?.status || !EXPECTED_AUTH_STATUSES.includes(apiErr.status),
  };
}

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
      return authFailure(err, 'Não foi possível entrar.');
    }
  };

  const signup = async (values: SignupCredentials): Promise<AuthResult> => {
    try {
      await api.post('/auth/signup', values);
      setStatus('authenticated');
      return { ok: true };
    } catch (err) {
      return authFailure(err, 'Não foi possível criar a conta.');
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
