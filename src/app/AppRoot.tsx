import { useSession } from '@/entities/session';
import { LoginPage } from '@/pages/auth/LoginPage';
import { AppScreens } from './AppScreens';

/** Top-level switch: session check → login vs the authenticated app. */
export function AppRoot() {
  const { status } = useSession();

  if (status === 'loading') {
    return <div className="min-h-screen bg-neutral-950" />;
  }

  if (status === 'anonymous') {
    return <LoginPage />;
  }

  return <AppScreens />;
}
