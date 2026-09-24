import { createContext } from 'react';
import type { Character } from '@/entities/character/model/types';
import type { RpgSystem } from '@/entities/system/model/types';
import type {
  LibraryCategory,
  SharedLibrary,
  SpecialLibraryItem,
  WeaponLibraryItem,
} from '@/entities/library-item/model/types';
import type { UserProfile } from '@/entities/user/model/types';

export interface AppDataContextValue {
  user: UserProfile;
  systems: RpgSystem[];
  characters: Character[];
  libraries: Record<string, SharedLibrary>;
  updateUser: (updater: (u: UserProfile) => UserProfile) => void;
  updateCharacter: (id: string, updater: (c: Character) => Character) => void;
  addCharacter: (character: Character) => void;
  /** Generic "Novo item" add — builds the right shape per category from just a name+description. */
  addLibraryItem: (
    systemId: string,
    category: LibraryCategory,
    values: { name: string; desc: string },
  ) => void;
  addWeaponToLibrary: (systemId: string, weapon: WeaponLibraryItem) => void;
  addSpecialToLibrary: (systemId: string, special: SpecialLibraryItem) => void;
  toggleSystemFavorite: (systemId: string) => void;
}

export const AppDataContext = createContext<AppDataContextValue | null>(null);
