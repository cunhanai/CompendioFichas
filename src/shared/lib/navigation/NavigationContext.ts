import { createContext } from 'react';

export type Route =
  | { name: 'dashboard' }
  | { name: 'systems' }
  | { name: 'characters'; systemId: string }
  | { name: 'library'; systemId: string }
  | { name: 'profile' }
  | { name: 'sheet'; characterId: string; tab?: string };

export interface NavigationContextValue {
  route: Route;
  goDashboard: () => void;
  goSystems: () => void;
  goCharacters: (systemId: string) => void;
  goLibrary: (systemId: string) => void;
  goProfile: () => void;
  goSheet: (characterId: string, tab?: string) => void;
}

export const NavigationContext = createContext<NavigationContextValue | null>(null);
