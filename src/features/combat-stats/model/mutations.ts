import type { Character, Saves } from '@/entities/character/model/types';

export function addAcVariedMod(character: Character): Character {
  return {
    ...character,
    acVariedMods: [
      ...character.acVariedMods,
      { id: crypto.randomUUID(), label: 'Novo modificador', value: 1 },
    ],
  };
}
export function updateAcVariedMod(
  character: Character,
  id: string,
  patch: { label?: string; value?: number },
): Character {
  return {
    ...character,
    acVariedMods: character.acVariedMods.map((m) => (m.id === id ? { ...m, ...patch } : m)),
  };
}
export function removeAcVariedMod(character: Character, id: string): Character {
  return { ...character, acVariedMods: character.acVariedMods.filter((m) => m.id !== id) };
}
export function setAcField(
  character: Character,
  field: 'acArmor' | 'acShield' | 'acNatural' | 'acDeflection',
  value: number,
): Character {
  return { ...character, [field]: value };
}

export function addInitVariedMod(character: Character): Character {
  return {
    ...character,
    initVariedMods: [
      ...character.initVariedMods,
      { id: crypto.randomUUID(), label: 'Novo modificador', value: 1 },
    ],
  };
}
export function updateInitVariedMod(
  character: Character,
  id: string,
  patch: { label?: string; value?: number },
): Character {
  return {
    ...character,
    initVariedMods: character.initVariedMods.map((m) => (m.id === id ? { ...m, ...patch } : m)),
  };
}
export function removeInitVariedMod(character: Character, id: string): Character {
  return { ...character, initVariedMods: character.initVariedMods.filter((m) => m.id !== id) };
}

export function setSaveField(
  character: Character,
  save: keyof Saves,
  field: keyof Saves['fort'],
  value: number,
): Character {
  return {
    ...character,
    saves: { ...character.saves, [save]: { ...character.saves[save], [field]: value } },
  };
}

export function setBbaValue(character: Character, value: number): Character {
  return { ...character, bbaValue: value };
}

export function setRmValue(character: Character, value: number): Character {
  return { ...character, rmValue: value };
}
