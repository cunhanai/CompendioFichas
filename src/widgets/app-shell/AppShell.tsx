import type { ReactNode } from 'react';
import { SecurityAlertBanner } from '@/features/user-management';
import { Sidebar } from './Sidebar';
import { BottomBar } from './BottomBar';

/** Desktop sidebar + mobile bottom bar shell wrapping every authenticated page. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
        <SecurityAlertBanner />
        {children}
      </div>
      <BottomBar />
    </div>
  );
}
