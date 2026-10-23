import type { AbilityKey, Skill } from './types';

export interface SkillTemplate {
  key: string;
  name: string;
  ability: AbilityKey;
  trainedOnly: boolean;
}

/**
 * Default Pathfinder 1e skill catalog, used to seed a brand new character sheet — the official
 * full skill list, kept in alphabetical order by display name (including each Conhecimento
 * subtype, alphabetized by its own qualifier). Apresentação, Ofícios and Profissão aren't here:
 * each covers multiple named specializations (e.g. "Ofícios (Ferreiro)"), added per-character on
 * demand instead of being fixed rows — see MULTI_SKILL_CATEGORIES.
 */
export const SKILL_CATALOG: SkillTemplate[] = [
  { key: 'acrobacia', name: 'Acrobacia', ability: 'dex', trainedOnly: false },
  { key: 'adestrar-animais', name: 'Adestrar Animais', ability: 'cha', trainedOnly: true },
  { key: 'arte-da-fuga', name: 'Arte da Fuga', ability: 'dex', trainedOnly: false },
  { key: 'artes-magicas', name: 'Artes Mágicas', ability: 'int', trainedOnly: true },
  { key: 'avaliacao', name: 'Avaliação', ability: 'int', trainedOnly: false },
  { key: 'blefar', name: 'Blefar', ability: 'cha', trainedOnly: false },
  { key: 'cavalgar', name: 'Cavalgar', ability: 'dex', trainedOnly: false },
  { key: 'conhec-arcano', name: 'Conhecimento (arcano)', ability: 'int', trainedOnly: true },
  {
    key: 'conhec-engenharia',
    name: 'Conhecimento (engenharia)',
    ability: 'int',
    trainedOnly: true,
  },
  {
    key: 'conhec-exploracao',
    name: 'Conhecimento (exploração)',
    ability: 'int',
    trainedOnly: true,
  },
  { key: 'conhec-geografia', name: 'Conhecimento (geografia)', ability: 'int', trainedOnly: true },
  { key: 'conhec-historia', name: 'Conhecimento (história)', ability: 'int', trainedOnly: true },
  { key: 'conhec-local', name: 'Conhecimento (local)', ability: 'int', trainedOnly: true },
  { key: 'conhec-natureza', name: 'Conhecimento (natureza)', ability: 'int', trainedOnly: true },
  { key: 'conhec-nobreza', name: 'Conhecimento (nobreza)', ability: 'int', trainedOnly: true },
  { key: 'conhec-planos', name: 'Conhecimento (planos)', ability: 'int', trainedOnly: true },
  { key: 'conhec-religiao', name: 'Conhecimento (religião)', ability: 'int', trainedOnly: true },
  { key: 'cura', name: 'Cura', ability: 'wis', trainedOnly: false },
  { key: 'diplomacia', name: 'Diplomacia', ability: 'cha', trainedOnly: false },
  { key: 'disfarce', name: 'Disfarce', ability: 'dex', trainedOnly: false },
  { key: 'escalar', name: 'Escalar', ability: 'str', trainedOnly: false },
  { key: 'furtividade', name: 'Furtividade', ability: 'dex', trainedOnly: false },
  { key: 'intimidacao', name: 'Intimidação', ability: 'cha', trainedOnly: false },
  { key: 'linguistica', name: 'Linguística', ability: 'int', trainedOnly: true },
  { key: 'natacao', name: 'Natação', ability: 'str', trainedOnly: false },
  { key: 'operar-mecanismos', name: 'Operar Mecanismos', ability: 'dex', trainedOnly: true },
  { key: 'percepcao', name: 'Percepção', ability: 'wis', trainedOnly: false },
  { key: 'prestidigitacao', name: 'Prestidigitação', ability: 'dex', trainedOnly: true },
  { key: 'sentir-motivacao', name: 'Sentir Motivação', ability: 'wis', trainedOnly: false },
  { key: 'sobrevivencia', name: 'Sobrevivência', ability: 'wis', trainedOnly: false },
  {
    key: 'usar-instrumento-magico',
    name: 'Usar Instrumento Mágico',
    ability: 'cha',
    trainedOnly: true,
  },
  { key: 'voo', name: 'Voo', ability: 'dex', trainedOnly: false },
];

export interface MultiSkillCategory {
  /** Stable id for this category — not a Skill.key itself (each added instance gets its own). */
  categoryKey: string;
  /** Display prefix each added instance's name is built from: "{label} ({specialization})". */
  label: string;
  ability: AbilityKey;
  trainedOnly: boolean;
}

/** Skills covering multiple named specializations instead of one fixed row — the player adds as
 * many as their character actually has (e.g. "Ofícios (Ferreiro)", "Apresentação (Dança)"). */
export const MULTI_SKILL_CATEGORIES: MultiSkillCategory[] = [
  { categoryKey: 'apresentacao', label: 'Apresentação', ability: 'cha', trainedOnly: false },
  { categoryKey: 'conhecimento', label: 'Conhecimento', ability: 'int', trainedOnly: true },
  { categoryKey: 'oficios', label: 'Ofícios', ability: 'int', trainedOnly: false },
  { categoryKey: 'profissao', label: 'Profissão', ability: 'wis', trainedOnly: false },
];

/** Keys from the pre-rewrite catalog that just moved to a new key (same skill, same concept) —
 * old data keeps the old key forever unless reconciled, so a character saved before the catalog
 * rewrite silently drifts out of sync with it (missing new skills, and the renamed ones failing
 * every `CATALOG_KEYS.has(key)` check downstream, e.g. wrongly offering to remove a fixed skill —
 * see DESIGN_NOTES.md). */
const LEGACY_KEY_RENAMES: Record<string, string> = {
  artefuga: 'arte-da-fuga',
  conhecarcano: 'conhec-arcano',
  conhecreligiao: 'conhec-religiao',
  conhecnatureza: 'conhec-natureza',
  nadar: 'natacao',
};

/** Old fixed-row keys with no 1:1 replacement anymore — each becomes a named instance of its
 * closest new multi-specialization category (see MULTI_SKILL_CATEGORIES), carrying over whatever
 * specialization the player had already typed in parentheses (or "Geral" if there was none). */
const LEGACY_KEY_TO_MULTI_CATEGORY: Record<string, string> = {
  oficio: 'oficios',
  atuacao: 'apresentacao',
};

/** Old fixed-row key with a straight 1:1 replacement under a different key *and* name (unlike
 * LEGACY_KEY_RENAMES, where the name stays the same) — Enganação became Blefar. */
const LEGACY_KEY_MERGE_TARGET: Record<string, string> = { enganacao: 'blefar' };

function extractSpecialization(name: string): string {
  return /\(([^)]+)\)/.exec(name)?.[1] ?? 'Geral';
}

/**
 * Brings a character's skill list in line with the current SKILL_CATALOG/MULTI_SKILL_CATEGORIES —
 * called on every character coming from the API (see normalizeCharacter) so a sheet saved before
 * the catalog rewrite heals itself the moment it's opened, same as any other character:
 * - Renamed fixed skills (LEGACY_KEY_RENAMES) get their new key/name, keeping ranks/classSkill/mods.
 * - Retired fixed skills with a multi-specialization replacement (LEGACY_KEY_TO_MULTI_CATEGORY)
 *   become a named instance of that category, keeping the player's ranks/classSkill/mods and
 *   whatever specialization text they'd already written.
 * - Enganação's data merges into Blefar (LEGACY_KEY_MERGE_TARGET).
 * - Any catalog skill the character doesn't have at all yet (new ones added in the rewrite, or
 *   simply never seeded for very old data) is added at its default (0 ranks, not a class skill).
 * - Everything else (an already-current fixed key, or an existing multi-specialization instance)
 *   passes through untouched.
 * Returns the same array reference when nothing needed fixing, so normalizeCharacter's own
 * "already normalized" fast path keeps working once a character has been reconciled and saved.
 */
export function reconcileSkills(skills: Skill[]): Skill[] {
  const presentKeys = new Set(skills.map((s) => s.key));
  const catalogByKey = new Map(SKILL_CATALOG.map((tpl) => [tpl.key, tpl]));
  const needsFix =
    skills.some(
      (s) =>
        LEGACY_KEY_RENAMES[s.key] ||
        LEGACY_KEY_TO_MULTI_CATEGORY[s.key] ||
        LEGACY_KEY_MERGE_TARGET[s.key] ||
        (() => {
          const tpl = catalogByKey.get(s.key);
          return tpl ? tpl.ability !== s.ability || tpl.trainedOnly !== s.trainedOnly : false;
        })(),
    ) || SKILL_CATALOG.some((tpl) => !presentKeys.has(tpl.key));
  if (!needsFix) return skills;

  const categoryByKey = new Map(MULTI_SKILL_CATEGORIES.map((c) => [c.categoryKey, c]));
  const result: Skill[] = [];
  let mergeIntoBlefar: Skill | null = null;

  for (const skill of skills) {
    const renamedKey = LEGACY_KEY_RENAMES[skill.key];
    if (renamedKey) {
      const tpl = catalogByKey.get(renamedKey)!;
      result.push({
        ...skill,
        key: tpl.key,
        name: tpl.name,
        ability: tpl.ability,
        trainedOnly: tpl.trainedOnly,
      });
      continue;
    }
    const multiCategoryKey = LEGACY_KEY_TO_MULTI_CATEGORY[skill.key];
    if (multiCategoryKey) {
      const category = categoryByKey.get(multiCategoryKey)!;
      result.push({
        ...skill,
        key: crypto.randomUUID(),
        name: `${category.label} (${extractSpecialization(skill.name)})`,
        ability: category.ability,
        trainedOnly: category.trainedOnly,
      });
      continue;
    }
    if (LEGACY_KEY_MERGE_TARGET[skill.key]) {
      mergeIntoBlefar = skill;
      continue;
    }
    const tpl = catalogByKey.get(skill.key);
    if (tpl && (tpl.ability !== skill.ability || tpl.trainedOnly !== skill.trainedOnly)) {
      result.push({ ...skill, ability: tpl.ability, trainedOnly: tpl.trainedOnly });
      continue;
    }
    result.push(skill);
  }

  if (mergeIntoBlefar) {
    const existing = result.findIndex((s) => s.key === 'blefar');
    if (existing === -1) {
      const tpl = catalogByKey.get('blefar')!;
      result.push({
        ...mergeIntoBlefar,
        key: tpl.key,
        name: tpl.name,
        ability: tpl.ability,
        trainedOnly: tpl.trainedOnly,
      });
    } else {
      result[existing] = {
        ...result[existing],
        ranks: mergeIntoBlefar.ranks,
        classSkill: mergeIntoBlefar.classSkill,
        mods: mergeIntoBlefar.mods,
      };
    }
  }

  const resultKeys = new Set(result.map((s) => s.key));
  for (const tpl of SKILL_CATALOG) {
    if (!resultKeys.has(tpl.key)) {
      result.push({
        key: tpl.key,
        name: tpl.name,
        ability: tpl.ability,
        trainedOnly: tpl.trainedOnly,
        classSkill: false,
        ranks: 0,
        mods: [],
      });
    }
  }

  result.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  return result;
}
