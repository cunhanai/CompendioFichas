import { use } from 'react';
import { NavigationContext, type NavigationContextValue } from './NavigationContext';

export function useNavigation(): NavigationContextValue {
  const ctx = use(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used within a NavigationProvider');
  return ctx;
}
