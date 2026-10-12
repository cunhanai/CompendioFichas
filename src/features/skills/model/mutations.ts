import type { Character, Skill } from '@/entities/character/model/types';
import type { MultiSkillCategory } from '@/entities/character/model/skillCatalog';

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

/** Adds one named instance of a multi-specialization skill (Apresentação/Ofícios/Profissão —
 * see MULTI_SKILL_CATEGORIES), inserted alphabetically by its full name so the perícia list stays
 * sorted without needing a separate sort step at render time. */
export function addMultiSkill(
  character: Character,
  category: MultiSkillCategory,
  specialization: string,
): Character {
  const name = `${category.label} (${specialization.trim()})`;
  const newSkill: Skill = {
    key: crypto.randomUUID(),
    name,
    ability: category.ability,
    trainedOnly: category.trainedOnly,
    classSkill: false,
    ranks: 0,
    mods: [],
  };
  const insertAt = character.skills.findIndex((s) => s.name.localeCompare(name, 'pt-BR') > 0);
  const skills =
    insertAt === -1
      ? [...character.skills, newSkill]
      : [...character.skills.slice(0, insertAt), newSkill, ...character.skills.slice(insertAt)];
  return { ...character, skills };
}

/** Removes a skill entirely — only meant for player-added multi-instance skills (see
 * addMultiSkill); the fixed SKILL_CATALOG rows have no removal entry point in the UI. */
export function removeSkill(character: Character, key: string): Character {
  return { ...character, skills: character.skills.filter((s) => s.key !== key) };
}
