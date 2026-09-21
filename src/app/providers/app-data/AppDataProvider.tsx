import { useEffect, useState, type ReactNode } from 'react';
import { readJson, writeJson } from '@/shared/lib/storage';
import type { Character } from '@/entities/character/model/types';
import { SEED_CHARACTERS } from '@/entities/character/model/seed';
import type { RpgSystem } from '@/entities/system/model/types';
import { SEED_SYSTEMS } from '@/entities/system/model/seed';
import type { SharedLibrary } from '@/entities/library-item/model/types';
import { SEED_LIBRARY } from '@/entities/library-item/model/seed';
import type { UserProfile } from '@/entities/user/model/types';
import { SEED_USER } from '@/entities/user/model/seed';
import { AppDataContext, type AppDataContextValue } from './AppDataContext';

const STORAGE_KEY = 'compendio:data';

interface AppData {
  user: UserProfile;
  systems: RpgSystem[];
  characters: Character[];
  libraries: Record<string, SharedLibrary>;
}

const SEED_DATA: AppData = {
  user: SEED_USER,
  systems: SEED_SYSTEMS,
  characters: SEED_CHARACTERS,
  libraries: { [SEED_LIBRARY.systemId]: SEED_LIBRARY },
};

export function AppDataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => readJson(STORAGE_KEY, SEED_DATA));

  useEffect(() => {
    writeJson(STORAGE_KEY, data);
  }, [data]);

  const updateUser: AppDataContextValue['updateUser'] = (updater) =>
    setData((d) => ({ ...d, user: updater(d.user) }));

  const updateCharacter: AppDataContextValue['updateCharacter'] = (id, updater) =>
    setData((d) => ({ ...d, characters: d.characters.map((c) => (c.id === id ? updater(c) : c)) }));

  const addCharacter: AppDataContextValue['addCharacter'] = (character) =>
    setData((d) => ({ ...d, characters: [...d.characters, character] }));

  const withLibrary = (systemId: string, mutate: (lib: SharedLibrary) => SharedLibrary) =>
    setData((d) => {
      const lib = d.libraries[systemId];
      if (!lib) return d;
      return { ...d, libraries: { ...d.libraries, [systemId]: mutate(lib) } };
    });

  const addLibraryItem: AppDataContextValue['addLibraryItem'] = (
    systemId,
    category,
    { name, desc },
  ) =>
    withLibrary(systemId, (lib) => {
      const id = `${category}-${crypto.randomUUID()}`;
      switch (category) {
        case 'talentos':
        case 'pericias':
        case 'idiomas':
        case 'criaturas':
          return { ...lib, [category]: [...lib[category], { id, name, desc, tag: '' }] };
        case 'habilidades':
          return {
            ...lib,
            habilidades: [...lib.habilidades, { id, name, subtitle: desc, uses: '', desc }],
          };
        case 'magias':
          return {
            ...lib,
            magias: [
              ...lib.magias,
              {
                id,
                name,
                school: '',
                circle: 0,
                castTime: '',
                range: '',
                duration: '',
                resistance: '',
                desc,
              },
            ],
          };
        case 'armas':
          return {
            ...lib,
            armas: [
              ...lib.armas,
              {
                id,
                name,
                atk: '+0',
                crit: 'x2',
                dmg: '1d6',
                type: '',
                range: '—',
                desc,
                hasAmmo: false,
                ammoMax: 0,
              },
            ],
          };
        default:
          return lib;
      }
    });

  const addWeaponToLibrary: AppDataContextValue['addWeaponToLibrary'] = (systemId, weapon) =>
    withLibrary(systemId, (lib) => ({ ...lib, armas: [...lib.armas, weapon] }));

  const addSpecialToLibrary: AppDataContextValue['addSpecialToLibrary'] = (systemId, special) =>
    withLibrary(systemId, (lib) => ({ ...lib, habilidades: [...lib.habilidades, special] }));

  const value: AppDataContextValue = {
    user: data.user,
    systems: data.systems,
    characters: data.characters,
    libraries: data.libraries,
    updateUser,
    updateCharacter,
    addCharacter,
    addLibraryItem,
    addWeaponToLibrary,
    addSpecialToLibrary,
  };

  return <AppDataContext value={value}>{children}</AppDataContext>;
}
