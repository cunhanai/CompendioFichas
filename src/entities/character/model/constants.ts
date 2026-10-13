import type { AbilityKey, AlignmentLaw, AlignmentMoral, Size } from './types';
import type { LoadState } from './calculations';

export const ABILITY_KEYS: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

export const ABILITY_SHORT: Record<AbilityKey, string> = {
  str: 'For',
  dex: 'Des',
  con: 'Con',
  int: 'Int',
  wis: 'Sab',
  cha: 'Car',
};

export const ABILITY_LONG: Record<AbilityKey, string> = {
  str: 'Força',
  dex: 'Destreza',
  con: 'Constituição',
  int: 'Inteligência',
  wis: 'Sabedoria',
  cha: 'Carisma',
};

export const ABILITY_DESCRIPTION: Record<AbilityKey, string> = {
  str: 'Mede poder físico bruto — afeta dano corpo a corpo, testes de Atletismo e a carga que o personagem pode carregar.',
  dex: 'Mede agilidade e reflexos — afeta CA, Reflexo, iniciativa e ataques à distância.',
  con: 'Mede vigor físico — afeta pontos de vida e Fortitude.',
  int: 'Mede raciocínio e memória — afeta perícias baseadas em Inteligência e magias de Mago.',
  wis: 'Mede percepção e força de vontade — afeta Vontade e magias de Clériga.',
  cha: 'Mede força de personalidade — afeta magias de Feiticeira e perícias sociais.',
};

/** Tailwind text color class per ability, used consistently across the sheet. */
export const ABILITY_COLOR_CLASS: Record<AbilityKey, string> = {
  str: 'text-rose-400',
  dex: 'text-emerald-400',
  con: 'text-orange-400',
  int: 'text-sky-400',
  wis: 'text-violet-400',
  cha: 'text-pink-400',
};

/** Tailwind background class for the load bar fill, per carried-weight state — green while
 * under medium, orange at medium, red at heavy or beyond. */
export const LOAD_STATE_BAR_COLOR: Record<LoadState, string> = {
  leve: 'bg-emerald-500',
  média: 'bg-orange-500',
  pesada: 'bg-rose-500',
  sobrecarregado: 'bg-rose-500',
};

/** Pill badge classes for the current load state — same green/orange/red as the bar, applied to
 * a small label instead of a fill. */
export const LOAD_STATE_BADGE_CLASS: Record<LoadState, string> = {
  leve: 'bg-emerald-900/40 text-emerald-400',
  média: 'bg-orange-900/40 text-orange-400',
  pesada: 'bg-rose-950/50 text-rose-300',
  sobrecarregado: 'bg-rose-950/50 text-rose-300',
};

/** Highlight classes for whichever load-threshold tile (Leve/Média/Pesada) matches the current
 * state, same color family as the bar/badge. */
export const LOAD_STATE_HIGHLIGHT_CLASS: Record<LoadState, string> = {
  leve: 'border border-emerald-700/50 bg-emerald-950/40',
  média: 'border border-orange-700/50 bg-orange-950/40',
  pesada: 'border border-rose-700/50 bg-rose-950/40',
  sobrecarregado: 'border border-rose-700/50 bg-rose-950/40',
};

export const SIZES: Size[] = [
  'Miúdo',
  'Diminuto',
  'Pequeno',
  'Médio',
  'Grande',
  'Enorme',
  'Colossal',
];

/** Pathfinder 1e size modifier to AC/CMB/CMD, for the sizes offered in this app. Unset ('') is
 * treated the same as Médio (0) — the default before the player picks a size shouldn't skew AC. */
export const SIZE_MODIFIER: Record<Size, number> = {
  '': 0,
  Miúdo: 8,
  Diminuto: 4,
  Pequeno: 1,
  Médio: 0,
  Grande: -1,
  Enorme: -2,
  Colossal: -8,
};

export const ALIGNMENT_LAWS: Exclude<AlignmentLaw, ''>[] = ['Ordeiro', 'Neutro', 'Caótico'];
export const ALIGNMENT_MORALS: Exclude<AlignmentMoral, ''>[] = ['Bom', 'Neutro', 'Mau'];

export const ALIGNMENT_LAW_INITIAL: Record<AlignmentLaw, string> = {
  '': '?',
  Ordeiro: 'O',
  Neutro: 'N',
  Caótico: 'C',
};
export const ALIGNMENT_MORAL_INITIAL: Record<AlignmentMoral, string> = {
  '': '?',
  Bom: 'B',
  Neutro: 'N',
  Mau: 'M',
};
export const ALIGNMENT_LAW_LABEL_F: Record<AlignmentLaw, string> = {
  '': '',
  Ordeiro: 'Ordeira',
  Neutro: 'Neutra',
  Caótico: 'Caótica',
};
export const ALIGNMENT_MORAL_LABEL_F: Record<AlignmentMoral, string> = {
  '': '',
  Bom: 'Boa',
  Neutro: 'Neutra',
  Mau: 'Má',
};

export const WEAPON_DAMAGE_TYPES = ['Cortante', 'Perfurante', 'Concussão', 'Cortante/Perfurante'];

export const SHEET_TABS = [
  { id: 'geral', label: 'Geral' },
  { id: 'combate', label: 'Combate' },
  { id: 'pericias', label: 'Perícias' },
  { id: 'magias', label: 'Magias' },
  { id: 'talentos', label: 'Talentos' },
  { id: 'inventario', label: 'Itens' },
  { id: 'criaturas', label: 'Criaturas' },
  { id: 'plano', label: 'Plano' },
  { id: 'historico', label: 'Histórico' },
] as const;

export type SheetTabId = (typeof SHEET_TABS)[number]['id'];
