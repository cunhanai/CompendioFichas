import type { AbilityKey, Character } from '@/entities/character/model/types';

function withAbility(
  character: Character,
  key: AbilityKey,
  mutate: (a: Character['abilities'][AbilityKey]) => Character['abilities'][AbilityKey],
): Character {
  return {
    ...character,
    abilities: { ...character.abilities, [key]: mutate(character.abilities[key]) },
  };
}

export function addAbilityMod(character: Character, key: AbilityKey): Character {
  return withAbility(character, key, (a) => ({
    ...a,
    mods: [...a.mods, { id: crypto.randomUUID(), label: 'Novo modificador', value: 1 }],
  }));
}

export function updateAbilityMod(
  character: Character,
  key: AbilityKey,
  modId: string,
  patch: { label?: string; value?: number },
): Character {
  return withAbility(character, key, (a) => ({
    ...a,
    mods: a.mods.map((m) => (m.id === modId ? { ...m, ...patch } : m)),
  }));
}

export function removeAbilityMod(character: Character, key: AbilityKey, modId: string): Character {
  return withAbility(character, key, (a) => ({ ...a, mods: a.mods.filter((m) => m.id !== modId) }));
}

export function setAbilityBase(character: Character, key: AbilityKey, base: number): Character {
  return withAbility(character, key, (a) => ({ ...a, base }));
}

export function applyAbilityDamage(
  character: Character,
  key: AbilityKey,
  delta: number,
  desc: string,
): Character {
  return withAbility(character, key, (a) => ({
    ...a,
    damage: Math.max(0, a.damage + delta),
    log: [{ id: crypto.randomUUID(), type: 'dano', delta, desc }, ...a.log],
  }));
}

export function applyAbilityDrain(
  character: Character,
  key: AbilityKey,
  delta: number,
  desc: string,
): Character {
  return withAbility(character, key, (a) => ({
    ...a,
    drain: Math.max(0, a.drain + delta),
    log: [{ id: crypto.randomUUID(), type: 'dreno', delta, desc }, ...a.log],
  }));
}

export function removeAbilityLogEntry(
  character: Character,
  key: AbilityKey,
  entryId: string,
): Character {
  return withAbility(character, key, (a) => {
    const entry = a.log.find((e) => e.id === entryId);
    if (!entry) return a;
    const field = entry.type === 'dano' ? 'damage' : 'drain';
    return {
      ...a,
      [field]: Math.max(0, a[field] - entry.delta),
      log: a.log.filter((e) => e.id !== entryId),
    };
  });
}
