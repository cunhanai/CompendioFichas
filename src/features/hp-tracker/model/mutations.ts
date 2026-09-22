import type { Character, DrItem } from '@/entities/character/model/types';

function logHp(character: Character, delta: number, kind: 'letal' | 'nao-letal'): Character {
  return { ...character, hpLog: [{ id: crypto.randomUUID(), delta, kind }, ...character.hpLog] };
}

export function applyLethalDamage(character: Character, delta: number): Character {
  const hpCurrent = Math.max(0, Math.min(character.hpMax, character.hpCurrent + delta));
  return logHp({ ...character, hpCurrent }, delta, 'letal');
}

export function applyNonLethalDamage(character: Character, delta: number): Character {
  const hpNonLethal = Math.max(0, character.hpNonLethal + delta);
  return logHp({ ...character, hpNonLethal }, delta, 'nao-letal');
}

export function addTempHp(character: Character): Character {
  return { ...character, tempHp: character.tempHp + 1 };
}

export function clearTempHp(character: Character): Character {
  return { ...character, tempHp: 0 };
}

export function setHpCurrent(character: Character, value: number): Character {
  return { ...character, hpCurrent: Math.max(0, Math.min(character.hpMax, value)) };
}

/** Lowering max clamps current down with it, so current never exceeds the new max. */
export function setHpMax(character: Character, value: number): Character {
  const hpMax = Math.max(1, value);
  return { ...character, hpMax, hpCurrent: Math.min(character.hpCurrent, hpMax) };
}

/**
 * Undoes one HP log entry. Fixes a bug in the original mock, which always adjusted
 * hpCurrent regardless of entry kind — a "nao-letal" entry must undo against
 * hpNonLethal instead, or removing a non-lethal log line would corrupt real HP.
 */
export function removeHpLogEntry(character: Character, id: string): Character {
  const entry = character.hpLog.find((e) => e.id === id);
  if (!entry) return character;
  const hpLog = character.hpLog.filter((e) => e.id !== id);
  if (entry.kind === 'letal') {
    return {
      ...character,
      hpLog,
      hpCurrent: Math.max(0, Math.min(character.hpMax, character.hpCurrent - entry.delta)),
    };
  }
  return { ...character, hpLog, hpNonLethal: Math.max(0, character.hpNonLethal - entry.delta) };
}

export function addDrItem(character: Character, item: Omit<DrItem, 'id'>): Character {
  return { ...character, drItems: [...character.drItems, { ...item, id: crypto.randomUUID() }] };
}

export function removeDrItem(character: Character, id: string): Character {
  return { ...character, drItems: character.drItems.filter((d) => d.id !== id) };
}
