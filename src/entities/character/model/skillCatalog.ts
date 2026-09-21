import type { AbilityKey } from './types';

export interface SkillTemplate {
  key: string;
  name: string;
  ability: AbilityKey;
  trainedOnly: boolean;
}

/** Default Pathfinder 1e skill catalog, used to seed a brand new character sheet. */
export const SKILL_CATALOG: SkillTemplate[] = [
  { key: 'acrobacia', name: 'Acrobacia', ability: 'dex', trainedOnly: false },
  { key: 'adestrar-animais', name: 'Adestrar Animais', ability: 'cha', trainedOnly: true },
  { key: 'artefuga', name: 'Arte da Fuga', ability: 'dex', trainedOnly: false },
  { key: 'atuacao', name: 'Atuação', ability: 'cha', trainedOnly: false },
  { key: 'avaliacao', name: 'Avaliação', ability: 'int', trainedOnly: false },
  { key: 'cavalgar', name: 'Cavalgar', ability: 'dex', trainedOnly: false },
  { key: 'conhecarcano', name: 'Conhecimento (arcano)', ability: 'int', trainedOnly: true },
  { key: 'conhecreligiao', name: 'Conhecimento (religião)', ability: 'int', trainedOnly: true },
  { key: 'conhecnatureza', name: 'Conhecimento (natureza)', ability: 'int', trainedOnly: true },
  { key: 'cura', name: 'Cura', ability: 'wis', trainedOnly: false },
  { key: 'diplomacia', name: 'Diplomacia', ability: 'cha', trainedOnly: false },
  { key: 'disfarce', name: 'Disfarce', ability: 'cha', trainedOnly: false },
  { key: 'enganacao', name: 'Enganação', ability: 'cha', trainedOnly: false },
  { key: 'escalar', name: 'Escalar', ability: 'str', trainedOnly: false },
  { key: 'furtividade', name: 'Furtividade', ability: 'dex', trainedOnly: false },
  { key: 'intimidacao', name: 'Intimidação', ability: 'cha', trainedOnly: false },
  { key: 'nadar', name: 'Nadar', ability: 'str', trainedOnly: false },
  { key: 'oficio', name: 'Ofício', ability: 'int', trainedOnly: true },
  { key: 'percepcao', name: 'Percepção', ability: 'wis', trainedOnly: false },
  { key: 'sobrevivencia', name: 'Sobrevivência', ability: 'wis', trainedOnly: false },
];
