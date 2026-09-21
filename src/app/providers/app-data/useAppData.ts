import { use } from 'react';
import type { Character } from '@/entities/character/model/types';
import type { SharedLibrary } from '@/entities/library-item/model/types';
import { AppDataContext, type AppDataContextValue } from './AppDataContext';

export function useAppData(): AppDataContextValue {
  const ctx = use(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used within an AppDataProvider');
  return ctx;
}

/** Convenience hook: the character with `id` + a bound updater. Throws if not found. */
export function useCharacter(id: string) {
  const { characters, updateCharacter } = useAppData();
  const character = characters.find((c) => c.id === id);
  if (!character) throw new Error(`Character not found: ${id}`);
  return {
    character,
    update: (updater: (c: Character) => Character) => updateCharacter(id, updater),
  };
}

export function useLibrary(systemId: string): SharedLibrary | undefined {
  return useAppData().libraries[systemId];
}
