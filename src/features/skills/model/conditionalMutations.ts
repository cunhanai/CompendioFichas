import type { Character } from '@/entities/character/model/types';

export function addConditionalMod(character: Character): Character {
  return {
    ...character,
    conditionalMods: [
      ...character.conditionalMods,
      { id: crypto.randomUUID(), text: 'Novo modificador condicional' },
    ],
  };
}

export function updateConditionalMod(character: Character, id: string, text: string): Character {
  return {
    ...character,
    conditionalMods: character.conditionalMods.map((m) => (m.id === id ? { ...m, text } : m)),
  };
}

export function removeConditionalMod(character: Character, id: string): Character {
  return { ...character, conditionalMods: character.conditionalMods.filter((m) => m.id !== id) };
}
