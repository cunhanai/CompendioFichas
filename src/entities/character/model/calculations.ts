import { signed } from '@/shared/lib/format';
import { ABILITY_KEYS, SIZE_MODIFIER } from './constants';
import type {
  Abilities,
  Ability,
  AbilityKey,
  ArmorItem,
  Character,
  EquipmentItem,
  Saves,
  Size,
  Skill,
  VariedMod,
} from './types';

export { signed };

export function sumMods(mods: VariedMod[]): number {
  return mods.reduce((acc, m) => acc + (Number(m.value) || 0), 0);
}

/** Pathfinder 1e ability modifier: floor((total - 10) / 2). */
export function abilityMod(total: number): number {
  return Math.floor((total - 10) / 2);
}

export interface ComputedAbility {
  base: number;
  tempSum: number;
  total: number;
  mod: number;
  damage: number;
  drain: number;
}

/** Total = base + sum(varied mods) - damage - drain, floored at 0. */
export function computeAbility(a: Ability): ComputedAbility {
  const tempSum = sumMods(a.mods);
  const total = Math.max(0, a.base + tempSum - (a.damage || 0) - (a.drain || 0));
  return {
    base: a.base,
    tempSum,
    total,
    mod: abilityMod(total),
    damage: a.damage || 0,
    drain: a.drain || 0,
  };
}

export type ComputedAbilities = Record<AbilityKey, ComputedAbility>;

export function computeAllAbilities(abilities: Abilities): ComputedAbilities {
  const out = {} as ComputedAbilities;
  for (const key of ABILITY_KEYS) {
    out[key] = computeAbility(abilities[key]);
  }
  return out;
}

export function effectiveLevel(classes: Character['classes']): number {
  return classes.reduce((acc, c) => acc + c.level, 0);
}

export function classesSummary(classes: Character['classes']): string {
  return classes.map((c) => `${c.name} ${c.level}`).join(' / ');
}

export const sizeModifier = (size: Size): number => SIZE_MODIFIER[size];

export interface AcRow {
  label: string;
  value: string;
  varied: boolean;
}

export interface AcBreakdown {
  total: number;
  touch: number;
  flat: number;
  rows: { total: AcRow[]; touch: AcRow[]; flat: AcRow[] };
}

/** Classe de Armadura: 10 + armadura + escudo + Destreza + tamanho + natural + deflexão + variado. */
export function computeAc(character: Character, abilities: ComputedAbilities): AcBreakdown {
  const dexMod = abilities.dex.mod;
  const sizeMod = sizeModifier(character.identity.tamanho);
  const variedSum = sumMods(character.acVariedMods);
  const total =
    10 +
    character.acArmor +
    character.acShield +
    dexMod +
    sizeMod +
    character.acNatural +
    character.acDeflection +
    variedSum;
  const touch = 10 + dexMod + sizeMod + character.acDeflection + variedSum;
  const flat = 10 + character.acArmor + character.acShield + sizeMod + character.acNatural;

  const fixed = (label: string, value: number): AcRow => ({
    label,
    value: signed(value),
    varied: false,
  });
  const variedRows: AcRow[] = character.acVariedMods.map((m) => ({
    label: m.label,
    value: signed(Number(m.value) || 0),
    varied: true,
  }));

  return {
    total,
    touch,
    flat,
    rows: {
      total: [
        { label: 'Base', value: '10', varied: false },
        fixed('Armadura', character.acArmor),
        fixed('Escudo', character.acShield),
        fixed('Destreza', dexMod),
        fixed('Tamanho', sizeMod),
        fixed('Armadura natural', character.acNatural),
        fixed('Deflexão', character.acDeflection),
        ...variedRows,
      ],
      touch: [
        { label: 'Base', value: '10', varied: false },
        fixed('Destreza', dexMod),
        fixed('Tamanho', sizeMod),
        fixed('Deflexão', character.acDeflection),
        ...variedRows,
      ],
      flat: [
        { label: 'Base', value: '10', varied: false },
        fixed('Armadura', character.acArmor),
        fixed('Escudo', character.acShield),
        fixed('Tamanho', sizeMod),
        fixed('Armadura natural', character.acNatural),
      ],
    },
  };
}

export interface SaveResult {
  total: number;
  abilityMod: number;
}

const SAVE_ABILITY: Record<keyof Saves, AbilityKey> = { fort: 'con', ref: 'dex', will: 'wis' };
export const SAVE_LABEL: Record<keyof Saves, string> = {
  fort: 'Fortitude',
  ref: 'Reflexo',
  will: 'Vontade',
};
export const SAVE_ABILITY_LABEL: Record<keyof Saves, string> = {
  fort: 'Constituição',
  ref: 'Destreza',
  will: 'Sabedoria',
};

/** Jogada de resistência = base + mod. do atributo + mágico + variado + temporário. */
export function computeSave(
  saveKey: keyof Saves,
  character: Character,
  abilities: ComputedAbilities,
): SaveResult {
  const block = character.saves[saveKey];
  const mod = abilities[SAVE_ABILITY[saveKey]].mod;
  return {
    total: block.base + mod + (block.magic || 0) + (block.misc || 0) + (block.temp || 0),
    abilityMod: mod,
  };
}

/** Iniciativa = modificador de Destreza + modificadores variados. */
export function computeInitiative(character: Character, abilities: ComputedAbilities): number {
  return abilities.dex.mod + sumMods(character.initVariedMods);
}

export interface ManobraBreakdown {
  bba: number;
  bmc: number;
  dmc: number;
}

/** BMC = BBA + mod. Força + mod. tamanho. DMC = 10 + BBA + mod. Força + mod. Destreza. */
export function computeManobras(
  character: Character,
  abilities: ComputedAbilities,
): ManobraBreakdown {
  const bba = Number(character.bbaValue) || 0;
  const sizeMod = sizeModifier(character.identity.tamanho);
  const bmc = bba + abilities.str.mod + sizeMod;
  const dmc = 10 + bba + abilities.str.mod + abilities.dex.mod;
  return { bba, bmc, dmc };
}

export interface ComputedSkill extends Skill {
  abilityMod: number;
  miscTotal: number;
  classBonus: number;
  total: number;
}

/**
 * Perícia = mod. do atributo + graduação + variado (+3 se for de classe e tiver ao menos 1
 * graduação). Modificadores condicionais ficam fora da soma, numa lista separada.
 */
export function computeSkill(skill: Skill, abilities: ComputedAbilities): ComputedSkill {
  const abMod = abilities[skill.ability].mod;
  const miscTotal = sumMods(skill.mods);
  const classBonus = skill.classSkill && skill.ranks > 0 ? 3 : 0;
  const total = abMod + (skill.ranks || 0) + miscTotal + classBonus;
  return { ...skill, abilityMod: abMod, miscTotal, classBonus, total };
}

export function computeSkills(skills: Skill[], abilities: ComputedAbilities): ComputedSkill[] {
  return skills.map((s) => computeSkill(s, abilities));
}

export function xpProgress(xpCurrent: number, xpMax: number) {
  const pct = xpMax > 0 ? Math.min(100, Math.round((xpCurrent / xpMax) * 100)) : 0;
  const remaining = Math.max(0, xpMax - xpCurrent);
  return { pct, remaining };
}

/** 1 quadrado = 1,5 m. */
export function metersToSquares(meters: number): number {
  return Math.round((Number(meters) || 0) / 1.5);
}

export function formatSpeed(meters: number): string {
  const n = Number(meters) || 0;
  return `${n.toLocaleString('pt-BR')} m (${metersToSquares(n)} q.)`;
}

export function equipmentWeight(equipment: EquipmentItem[]): number {
  return equipment.reduce((acc, item) => acc + item.qty * item.unitWeight, 0);
}

export function armorItemsWeight(items: ArmorItem[]): number {
  return items.reduce((acc, item) => acc + item.weight, 0);
}

/** Carga carregada = soma do peso de equipamentos + itens de CA (armadura/escudo). */
export function computeCarriedWeight(character: Character): number {
  return equipmentWeight(character.equipment) + armorItemsWeight(character.armorItems ?? []);
}

export type LoadState = 'leve' | 'média' | 'pesada' | 'sobrecarregado';

export function loadState(carried: number, load: Character['load']): LoadState {
  if (carried <= load.light) return 'leve';
  if (carried <= load.medium) return 'média';
  if (carried <= load.heavy) return 'pesada';
  return 'sobrecarregado';
}

export function moneyTotalInPo(money: Character['money']): number {
  return money.po + money.pl * 10 + money.pp / 10 + money.pc / 100;
}
