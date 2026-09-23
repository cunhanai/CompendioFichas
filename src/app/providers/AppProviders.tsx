import type { ReactNode } from 'react';
import { SessionProvider } from '@/entities/session';
import { AppDataProvider } from './app-data';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <AppDataProvider>{children}</AppDataProvider>
    </SessionProvider>
  );
}
