import { useEffect, useState, type ReactNode } from 'react';
import { NavigationContext, type NavigationContextValue, type Route } from './NavigationContext';

const DASHBOARD_ROUTE: Route = { name: 'dashboard' };

function isRoute(value: unknown): value is Route {
  return typeof value === 'object' && value !== null && 'name' in value;
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(() =>
    isRoute(history.state) ? history.state : DASHBOARD_ROUTE,
  );

  useEffect(() => {
    if (!isRoute(history.state)) {
      history.replaceState(route, '');
    }

    const onPopState = (event: PopStateEvent) => {
      setRoute(isRoute(event.state) ? event.state : DASHBOARD_ROUTE);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-x/exhaustive-deps -- runs once to attach the initial history entry
  }, []);

  const navigate = (next: Route) => {
    history.pushState(next, '');
    setRoute(next);
  };

  const value: NavigationContextValue = {
    route,
    goDashboard: () => navigate({ name: 'dashboard' }),
    goSystems: () => navigate({ name: 'systems' }),
    goCharacters: (systemId) => navigate({ name: 'characters', systemId }),
    goLibrary: (systemId) => navigate({ name: 'library', systemId }),
    goProfile: () => navigate({ name: 'profile' }),
    goSheet: (characterId, tab) => navigate({ name: 'sheet', characterId, tab }),
  };

  return <NavigationContext value={value}>{children}</NavigationContext>;
}
