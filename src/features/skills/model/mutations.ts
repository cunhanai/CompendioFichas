import type { Character } from '@/entities/character/model/types';

function withSkill(
  character: Character,
  key: string,
  mutate: (s: Character['skills'][number]) => Character['skills'][number],
): Character {
  return { ...character, skills: character.skills.map((s) => (s.key === key ? mutate(s) : s)) };
}

export function setSkillRanks(character: Character, key: string, ranks: number): Character {
  return withSkill(character, key, (s) => ({ ...s, ranks: Math.max(0, ranks) }));
}

export function toggleSkillClass(character: Character, key: string): Character {
  return withSkill(character, key, (s) => ({ ...s, classSkill: !s.classSkill }));
}

export function addSkillMod(character: Character, key: string): Character {
  return withSkill(character, key, (s) => ({
    ...s,
    mods: [...s.mods, { id: crypto.randomUUID(), label: 'Novo modificador', value: 0 }],
  }));
}

export function updateSkillMod(
  character: Character,
  key: string,
  modId: string,
  patch: { label?: string; value?: number },
): Character {
  return withSkill(character, key, (s) => ({
    ...s,
    mods: s.mods.map((m) => (m.id === modId ? { ...m, ...patch } : m)),
  }));
}

export function removeSkillMod(character: Character, key: string, modId: string): Character {
  return withSkill(character, key, (s) => ({ ...s, mods: s.mods.filter((m) => m.id !== modId) }));
}
