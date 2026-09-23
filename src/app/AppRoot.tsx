import { useState } from 'react';
import { useSession } from '@/entities/session';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { AppScreens } from './AppScreens';

/** Top-level switch: session check → unauthenticated (login/signup) vs the authenticated app. */
export function AppRoot() {
  const { status } = useSession();
  const [authScreen, setAuthScreen] = useState<'login' | 'signup'>('login');

  if (status === 'loading') {
    return <div className="min-h-screen bg-neutral-950" />;
  }

  if (status === 'anonymous') {
    return authScreen === 'login' ? (
      <LoginPage onGoSignup={() => setAuthScreen('signup')} />
    ) : (
      <SignupPage onGoLogin={() => setAuthScreen('login')} />
    );
  }

  return <AppScreens />;
}
