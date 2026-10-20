import { describe, expect, it } from 'vitest';
import type { Skill } from './types';
import { MULTI_SKILL_CATEGORIES, reconcileSkills, SKILL_CATALOG } from './skillCatalog';

function baseSkills(overrides: Partial<Record<string, Partial<Skill>>> = {}): Skill[] {
  return SKILL_CATALOG.map((tpl) => ({
    key: tpl.key,
    name: tpl.name,
    ability: tpl.ability,
    trainedOnly: tpl.trainedOnly,
    classSkill: false,
    ranks: 0,
    mods: [],
    ...overrides[tpl.key],
  }));
}

describe('reconcileSkills', () => {
  it('leaves an already-current skill list untouched (same reference)', () => {
    const skills = baseSkills();
    expect(reconcileSkills(skills)).toBe(skills);
  });

  it('renames a legacy key to its current one, keeping ranks/classSkill/mods', () => {
    const skills = baseSkills().map((s) =>
      s.key === 'arte-da-fuga' ? { ...s, key: 'artefuga', classSkill: true, ranks: 3 } : s,
    );
    const result = reconcileSkills(skills);
    const fixed = result.find((s) => s.key === 'arte-da-fuga');
    expect(fixed).toBeDefined();
    expect(fixed!.name).toBe('Arte da Fuga');
    expect(fixed!.classSkill).toBe(true);
    expect(fixed!.ranks).toBe(3);
    expect(result.some((s) => s.key === 'artefuga')).toBe(false);
  });

  it('converts a legacy single-instance "oficio" into a named Ofícios specialization, extracting the parenthetical', () => {
    const skills = [
      ...baseSkills(),
      {
        key: 'oficio',
        name: 'Ofício (alquimia)',
        ability: 'int' as const,
        trainedOnly: false,
        classSkill: true,
        ranks: 2,
        mods: [],
      },
    ];
    const result = reconcileSkills(skills);
    const converted = result.find((s) => s.name === 'Ofícios (alquimia)');
    expect(converted).toBeDefined();
    expect(converted!.classSkill).toBe(true);
    expect(converted!.ranks).toBe(2);
    expect(result.some((s) => s.key === 'oficio')).toBe(false);
  });

  it('falls back to "Geral" when the legacy entry has no specialization in parentheses', () => {
    const skills = [
      ...baseSkills(),
      {
        key: 'atuacao',
        name: 'Atuação',
        ability: 'cha' as const,
        trainedOnly: false,
        classSkill: false,
        ranks: 1,
        mods: [],
      },
    ];
    const result = reconcileSkills(skills);
    expect(result.some((s) => s.name === 'Apresentação (Geral)')).toBe(true);
  });

  it('merges legacy "enganacao" into "blefar", keeping its ranks/classSkill/mods', () => {
    const skills = baseSkills().map((s) =>
      s.key === 'blefar'
        ? {
            key: 'enganacao',
            name: 'Enganação',
            ability: 'cha' as const,
            trainedOnly: false,
            classSkill: true,
            ranks: 4,
            mods: [],
          }
        : s,
    );
    const result = reconcileSkills(skills);
    const blefar = result.find((s) => s.key === 'blefar');
    expect(blefar).toBeDefined();
    expect(blefar!.name).toBe('Blefar');
    expect(blefar!.ranks).toBe(4);
    expect(blefar!.classSkill).toBe(true);
    expect(result.some((s) => s.key === 'enganacao')).toBe(false);
  });

  it('adds any catalog skill the character is missing entirely, at its default', () => {
    const skills = baseSkills().filter((s) => s.key !== 'voo');
    const result = reconcileSkills(skills);
    const voo = result.find((s) => s.key === 'voo');
    expect(voo).toBeDefined();
    expect(voo!.ranks).toBe(0);
    expect(voo!.classSkill).toBe(false);
  });

  it('keeps an existing player-added multi-specialization instance untouched', () => {
    const custom: Skill = {
      key: 'custom-1',
      name: 'Ofícios (Ferreiro)',
      ability: 'int',
      trainedOnly: false,
      classSkill: true,
      ranks: 5,
      mods: [],
    };
    const skills = [...baseSkills(), custom];
    const result = reconcileSkills(skills);
    expect(result).toContainEqual(custom);
  });

  it('result stays alphabetically sorted by name after any fix', () => {
    const skills = baseSkills().map((s) => (s.key === 'voo' ? { ...s, key: 'artefuga' } : s));
    const result = reconcileSkills(skills);
    const names = result.map((s) => s.name);
    const sorted = [...names].sort((a, b) => a.localeCompare(b, 'pt-BR'));
    expect(names).toEqual(sorted);
  });

  it('syncs ability/trainedOnly for an already-current key when the catalog definition changes, keeping ranks/classSkill/mods', () => {
    const skills = baseSkills().map((s) =>
      s.key === 'disfarce' ? { ...s, ability: 'cha' as const, classSkill: true, ranks: 2 } : s,
    );
    const result = reconcileSkills(skills);
    const disfarce = result.find((s) => s.key === 'disfarce');
    expect(disfarce).toBeDefined();
    expect(disfarce!.ability).toBe('dex');
    expect(disfarce!.classSkill).toBe(true);
    expect(disfarce!.ranks).toBe(2);
  });

  it('covers every multi-specialization category with a legacy conversion', () => {
    // Sanity check against drift: if a category is ever added/removed, this test forces the
    // legacy-conversion test cases above to be reconsidered.
    expect(MULTI_SKILL_CATEGORIES.map((c) => c.categoryKey).sort()).toEqual([
      'apresentacao',
      'conhecimento',
      'oficios',
      'profissao',
    ]);
  });
});
