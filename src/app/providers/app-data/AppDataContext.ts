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
import type { SecurityAlert } from '@/features/user-management/model/types';
import type {
  CharacterShareEntry,
  SharedCharacterEntry,
} from '@/features/sheet-sharing/model/types';

export interface AppDataContextValue {
  user: UserProfile;
  systems: RpgSystem[];
  characters: Character[];
  libraries: Record<string, SharedLibrary>;
  securityAlerts: SecurityAlert[];
  /** Characters other people shared with me — always view-only, kept separate from `characters`
   * (which the whole app treats as mine and editable). */
  sharedWithMe: SharedCharacterEntry[];
  /** Who each of MY OWN characters is currently shared with, keyed by character id. */
  mySharesByCharacterId: Record<string, CharacterShareEntry[]>;
  shareCharacter: (characterId: string, userId: string) => void;
  unshareCharacter: (characterId: string, userId: string) => void;
  dismissSecurityAlert: (id: string) => void;
  updateUser: (updater: (u: UserProfile) => UserProfile) => void;
  /** Syncs local state with a profile already confirmed saved by the server — unlike
   * `updateUser`, this never itself calls the API (the caller already did, and needs the local
   * state to reflect exactly what the server accepted, not an optimistic guess). */
  setUser: (user: UserProfile) => void;
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
