import { useState, type ReactNode } from 'react';
import { NavigationContext, type NavigationContextValue, type Route } from './NavigationContext';

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>({ name: 'dashboard' });

  const value: NavigationContextValue = {
    route,
    goDashboard: () => setRoute({ name: 'dashboard' }),
    goSystems: () => setRoute({ name: 'systems' }),
    goCharacters: (systemId) => setRoute({ name: 'characters', systemId }),
    goLibrary: (systemId) => setRoute({ name: 'library', systemId }),
    goProfile: () => setRoute({ name: 'profile' }),
    goSheet: (characterId, tab) => setRoute({ name: 'sheet', characterId, tab }),
  };

  return <NavigationContext value={value}>{children}</NavigationContext>;
}
