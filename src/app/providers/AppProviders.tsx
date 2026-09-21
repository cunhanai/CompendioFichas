import type { ReactNode } from 'react';
import { SessionProvider } from '@/entities/session';
import { NavigationProvider } from '@/shared/lib/navigation';
import { AppDataProvider } from './app-data';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AppDataProvider>
        <NavigationProvider>{children}</NavigationProvider>
      </AppDataProvider>
    </SessionProvider>
  );
}
