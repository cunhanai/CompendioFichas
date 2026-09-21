import { useState } from 'react';
import { useSession } from '@/entities/session';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { AppScreens } from './AppScreens';

/** Top-level switch: unauthenticated (login/signup) vs the authenticated app shell + routes. */
export function AppRoot() {
  const { isAuthenticated } = useSession();
  const [authScreen, setAuthScreen] = useState<'login' | 'signup'>('login');

  if (!isAuthenticated) {
    return authScreen === 'login' ? (
      <LoginPage onGoSignup={() => setAuthScreen('signup')} />
    ) : (
      <SignupPage onGoLogin={() => setAuthScreen('login')} />
    );
  }

  return <AppScreens />;
}
