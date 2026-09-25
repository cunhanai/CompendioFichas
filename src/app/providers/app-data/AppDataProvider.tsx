import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useSession } from '@/entities/session';
import { api } from '@/shared/lib/api';
import type { Character } from '@/entities/character/model/types';
import { normalizeCharacter } from '@/entities/character/model/factory';
import type { RpgSystem } from '@/entities/system/model/types';
import type { SharedLibrary } from '@/entities/library-item/model/types';
import type { UserProfile } from '@/entities/user/model/types';
import type { SecurityAlert } from '@/features/user-management/model/types';
import type {
  CharacterShareEntry,
  SharedCharacterEntry,
} from '@/features/sheet-sharing/model/types';
import { ForceChangePasswordPage } from '@/pages/auth/ForceChangePasswordPage';
import { AppDataContext, type AppDataContextValue } from './AppDataContext';

interface AppData {
  user: UserProfile;
  systems: RpgSystem[];
  characters: Character[];
  libraries: Record<string, SharedLibrary>;
  securityAlerts: SecurityAlert[];
  sharedWithMe: SharedCharacterEntry[];
  mySharesByCharacterId: Record<string, CharacterShareEntry[]>;
}

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useSession();
  const [data, setData] = useState<AppData | null>(null);
  // Tracks the latest share/unshare request per character so an out-of-order response from an
  // older request can't overwrite the state left by a newer one that resolved first.
  const shareRequestSeq = useRef<Record<string, number>>({});

  useEffect(() => {
    if (!isAuthenticated) return;

    let cancelled = false;
    api.get<AppData>('/bootstrap').then(
      (loaded) => {
        if (!cancelled)
          setData({
            ...loaded,
            characters: loaded.characters.map(normalizeCharacter),
            sharedWithMe: loaded.sharedWithMe.map((s) => ({
              ...s,
              character: normalizeCharacter(s.character),
            })),
          });
      },
      (err: unknown) => console.error('Failed to load app data', err),
    );

    return () => {
      cancelled = true;
      setData(null);
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) return <>{children}</>;
  if (!data) return <div className="min-h-screen bg-neutral-950" />;

  if (data.user.mustChangePassword) {
    return (
      <ForceChangePasswordPage
        onChanged={() =>
          setData((d) => (d ? { ...d, user: { ...d.user, mustChangePassword: false } } : d))
        }
      />
    );
  }

  const updateUser: AppDataContextValue['updateUser'] = (updater) => {
    setData((d) => {
      if (!d) return d;
      const user = updater(d.user);
      api
        .patch('/user', user)
        .catch((err: unknown) => console.error('Failed to save profile', err));
      return { ...d, user };
    });
  };

  const updateCharacter: AppDataContextValue['updateCharacter'] = (id, updater) => {
    setData((d) => {
      if (!d) return d;
      const characters = d.characters.map((c) => (c.id === id ? updater(c) : c));
      const updated = characters.find((c) => c.id === id);
      if (updated) {
        api
          .patch(`/characters/${id}`, updated)
          .catch((err: unknown) => console.error('Failed to save character', err));
      }
      return { ...d, characters };
    });
  };

  const addCharacter: AppDataContextValue['addCharacter'] = (character) => {
    setData((d) => (d ? { ...d, characters: [...d.characters, character] } : d));
    api
      .post('/characters', character)
      .catch((err: unknown) => console.error('Failed to create character', err));
  };

  // Not optimistic like the rest of this file: the server is the only source of truth for who a
  // character is shared with (it also dedupes/validates the target), and the picker only has
  // the target's id, not their name/username to show locally in the meantime.
  const shareCharacter: AppDataContextValue['shareCharacter'] = (characterId, userId) => {
    const seq = (shareRequestSeq.current[characterId] ?? 0) + 1;
    shareRequestSeq.current[characterId] = seq;
    api
      .post<{ shares: CharacterShareEntry[] }>(`/characters/${characterId}/shares`, { userId })
      .then(({ shares }) => {
        if (shareRequestSeq.current[characterId] !== seq) return;
        setData((d) =>
          d
            ? { ...d, mySharesByCharacterId: { ...d.mySharesByCharacterId, [characterId]: shares } }
            : d,
        );
      })
      .catch((err: unknown) => console.error('Failed to share character', err));
  };

  const unshareCharacter: AppDataContextValue['unshareCharacter'] = (characterId, userId) => {
    const seq = (shareRequestSeq.current[characterId] ?? 0) + 1;
    shareRequestSeq.current[characterId] = seq;
    api
      .delete<{ shares: CharacterShareEntry[] }>(`/characters/${characterId}/shares`, { userId })
      .then(({ shares }) => {
        if (shareRequestSeq.current[characterId] !== seq) return;
        setData((d) =>
          d
            ? { ...d, mySharesByCharacterId: { ...d.mySharesByCharacterId, [characterId]: shares } }
            : d,
        );
      })
      .catch((err: unknown) => console.error('Failed to unshare character', err));
  };

  /** Optimistically appends one item to a system's library category, then persists it to its own table. */
  const postLibraryItem = <C extends keyof SharedLibrary>(
    systemId: string,
    category: C,
    item: SharedLibrary[C][number],
  ) => {
    setData((d) => {
      if (!d) return d;
      const lib = d.libraries[systemId];
      if (!lib) return d;
      const nextLib = { ...lib, [category]: [...lib[category], item] };
      return { ...d, libraries: { ...d.libraries, [systemId]: nextLib } };
    });
    api
      .post(`/libraries/${systemId}/${category}`, item)
      .catch((err: unknown) => console.error('Failed to save library item', err));
  };

  const addLibraryItem: AppDataContextValue['addLibraryItem'] = (
    systemId,
    category,
    { name, desc },
  ) => {
    const id = crypto.randomUUID();
    switch (category) {
      case 'talentos':
      case 'pericias':
      case 'idiomas':
      case 'criaturas':
        return postLibraryItem(systemId, category, { id, name, desc, tag: '' });
      case 'habilidades':
        return postLibraryItem(systemId, 'habilidades', {
          id,
          name,
          subtitle: desc,
          uses: '',
          desc,
        });
      case 'magias':
        return postLibraryItem(systemId, 'magias', {
          id,
          name,
          school: '',
          circle: 0,
          castTime: '',
          range: '',
          duration: '',
          resistance: '',
          desc,
        });
      case 'armas':
        return postLibraryItem(systemId, 'armas', {
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
        });
    }
  };

  const addWeaponToLibrary: AppDataContextValue['addWeaponToLibrary'] = (systemId, weapon) =>
    postLibraryItem(systemId, 'armas', weapon);

  const addSpecialToLibrary: AppDataContextValue['addSpecialToLibrary'] = (systemId, special) =>
    postLibraryItem(systemId, 'habilidades', special);

  const toggleSystemFavorite: AppDataContextValue['toggleSystemFavorite'] = (systemId) => {
    setData((d) => {
      if (!d) return d;
      const systems = d.systems.map((s) =>
        s.id === systemId ? { ...s, favorited: !s.favorited } : s,
      );
      const next = systems.find((s) => s.id === systemId);
      if (next) {
        api
          .patch(`/systems/${systemId}`, { favorited: next.favorited })
          .catch((err: unknown) => console.error('Failed to save system', err));
      }
      return { ...d, systems };
    });
  };

  const dismissSecurityAlert: AppDataContextValue['dismissSecurityAlert'] = (id) => {
    const previous = data.securityAlerts;
    setData((d) => (d ? { ...d, securityAlerts: d.securityAlerts.filter((a) => a.id !== id) } : d));
    api.patch(`/admin/users/security-alerts/${id}`, { dismissed: true }).catch((err: unknown) => {
      console.error('Failed to dismiss security alert', err);
      setData((d) => (d ? { ...d, securityAlerts: previous } : d));
    });
  };

  const value: AppDataContextValue = {
    user: data.user,
    systems: data.systems,
    characters: data.characters,
    libraries: data.libraries,
    securityAlerts: data.securityAlerts,
    sharedWithMe: data.sharedWithMe,
    mySharesByCharacterId: data.mySharesByCharacterId,
    shareCharacter,
    unshareCharacter,
    dismissSecurityAlert,
    updateUser,
    updateCharacter,
    addCharacter,
    addLibraryItem,
    addWeaponToLibrary,
    addSpecialToLibrary,
    toggleSystemFavorite,
  };

  return <AppDataContext value={value}>{children}</AppDataContext>;
}
