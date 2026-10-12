import type { AbilityKey } from './types';

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
  { key: 'disfarce', name: 'Disfarce', ability: 'cha', trainedOnly: false },
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
  { categoryKey: 'oficios', label: 'Ofícios', ability: 'int', trainedOnly: false },
  { categoryKey: 'profissao', label: 'Profissão', ability: 'wis', trainedOnly: false },
];
