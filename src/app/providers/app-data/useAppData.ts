import { use } from 'react';
import type { Character } from '@/entities/character/model/types';
import type { SharedLibrary } from '@/entities/library-item/model/types';
import { AppDataContext, type AppDataContextValue } from './AppDataContext';

export function useAppData(): AppDataContextValue {
  const ctx = use(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within an AppDataProvider');
  return ctx;
}

/**
 * Convenience hook: the character with `id` + a bound updater. Throws if not found.
 *
 * Also resolves characters someone else shared with me (`sharedWithMe`), which are always
 * `readOnly: true` — `update` on those is a safe no-op rather than throwing, so a stray click
 * on an edit affordance a specific popup forgot to hide can never actually mutate anything or
 * reach the server. That backstop is what actually guarantees "never editable", not any single
 * popup's own UI gating.
 */
export function useCharacter(id: string) {
  const { characters, sharedWithMe, updateCharacter } = useAppData();
  const own = characters.find((c) => c.id === id);
  if (own) {
    return {
      character: own,
      readOnly: false,
      ownerName: undefined,
      ownerUsername: undefined,
      update: (updater: (c: Character) => Character) => updateCharacter(id, updater),
    };
  }

  const shared = sharedWithMe.find((s) => s.character.id === id);
  if (!shared) throw new Error(`Character not found: ${id}`);
  return {
    character: shared.character,
    readOnly: true,
    ownerName: shared.ownerName,
    ownerUsername: shared.ownerUsername,
    update: () => console.warn(`Ignored edit attempt on read-only shared character ${id}`),
  };
}

export function useLibrary(systemId: string): SharedLibrary | undefined {
  return useAppData().libraries[systemId];
}
