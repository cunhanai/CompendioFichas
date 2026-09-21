import { describe, expect, it } from 'vitest';
import {
  abilityMod,
  computeAc,
  computeAllAbilities,
  computeCarriedWeight,
  computeInitiative,
  computeManobras,
  computeSave,
  computeSkills,
  effectiveLevel,
  loadState,
  moneyTotalInPo,
  signed,
  xpProgress,
} from './calculations';
import { SEED_CHARACTERS } from './seed';

const elyndra = SEED_CHARACTERS.find((c) => c.id === 'elyndra')!;

describe('signed', () => {
  it('formats positive, negative and zero with an explicit sign', () => {
    expect(signed(3)).toBe('+3');
    expect(signed(-2)).toBe('-2');
    expect(signed(0)).toBe('+0');
  });
});

describe('abilityMod', () => {
  it('follows the Pathfinder 1e table', () => {
    expect(abilityMod(10)).toBe(0);
    expect(abilityMod(6)).toBe(-2);
    expect(abilityMod(13)).toBe(1);
    expect(abilityMod(14)).toBe(2);
    expect(abilityMod(9)).toBe(-1);
  });
});

describe('computeAllAbilities (Elyndra)', () => {
  const ab = computeAllAbilities(elyndra.abilities);

  it('str: base 10, no mods -> total 10, mod +0', () => {
    expect(ab.str.total).toBe(10);
    expect(ab.str.mod).toBe(0);
  });

  it('dex: base 16 -> total 16, mod +3', () => {
    expect(ab.dex.total).toBe(16);
    expect(ab.dex.mod).toBe(3);
  });

  it('con: base 13 + mod 2 - damage 2 -> total 13, mod +1', () => {
    expect(ab.con.total).toBe(13);
    expect(ab.con.mod).toBe(1);
  });

  it('cha: base 18 -> total 18, mod +4', () => {
    expect(ab.cha.total).toBe(18);
    expect(ab.cha.mod).toBe(4);
  });

  it('never drops the total below 0', () => {
    const ability = { base: 2, mods: [], damage: 5, drain: 3, log: [] };
    expect(computeAllAbilities({ ...elyndra.abilities, str: ability }).str.total).toBe(0);
  });
});

describe('computeAc (Elyndra)', () => {
  const ab = computeAllAbilities(elyndra.abilities);
  const ac = computeAc(elyndra, ab);

  it('totals 10 + armor 2 + dex 3 + varied 2 = 17', () => {
    expect(ac.total).toBe(17);
  });

  it('touch drops armor/shield/natural: 10 + dex 3 + varied 2 = 15', () => {
    expect(ac.touch).toBe(15);
  });

  it('flat-footed drops dex/varied: 10 + armor 2 = 12', () => {
    expect(ac.flat).toBe(12);
  });
});

describe('computeSave (Elyndra)', () => {
  const ab = computeAllAbilities(elyndra.abilities);

  it('fortitude = base 1 + con mod 1 = +2', () => {
    expect(computeSave('fort', elyndra, ab).total).toBe(2);
  });
  it('reflex = base 1 + dex mod 3 = +4', () => {
    expect(computeSave('ref', elyndra, ab).total).toBe(4);
  });
  it('will = base 4 + wis mod 2 = +6', () => {
    expect(computeSave('will', elyndra, ab).total).toBe(6);
  });
});

describe('computeInitiative (Elyndra)', () => {
  it('dex mod +3 + varied +4 = +7', () => {
    const ab = computeAllAbilities(elyndra.abilities);
    expect(computeInitiative(elyndra, ab)).toBe(7);
  });
});

describe('computeManobras (Elyndra)', () => {
  const ab = computeAllAbilities(elyndra.abilities);
  const m = computeManobras(elyndra, ab);

  it('BMC = bba 3 + str mod 0 + size mod 0 = 3', () => {
    expect(m.bmc).toBe(3);
  });
  it('DMC = 10 + bba 3 + str mod 0 + dex mod 3 = 16', () => {
    expect(m.dmc).toBe(16);
  });
});

describe('computeSkills (Elyndra)', () => {
  const ab = computeAllAbilities(elyndra.abilities);
  const skills = computeSkills(elyndra.skills, ab);

  it('acrobacia: class skill w/ ranks gets +3 class bonus', () => {
    const acrobacia = skills.find((s) => s.key === 'acrobacia')!;
    // dex mod +3, ranks 2, class bonus +3 => 8
    expect(acrobacia.total).toBe(8);
  });

  it('non-class skill with ranks gets no class bonus', () => {
    const percepcao = skills.find((s) => s.key === 'percepcao')!;
    // wis mod +2, ranks 2, no class bonus => 4
    expect(percepcao.total).toBe(4);
    expect(percepcao.classBonus).toBe(0);
  });

  it('class skill with 0 ranks does not get the class bonus', () => {
    const intimidacao = skills.find((s) => s.key === 'intimidacao')!;
    expect(intimidacao.classSkill).toBe(true);
    expect(intimidacao.ranks).toBe(0);
    expect(intimidacao.classBonus).toBe(0);
  });
});

describe('effectiveLevel', () => {
  it('sums every class level', () => {
    expect(effectiveLevel(elyndra.classes)).toBe(5);
  });
});

describe('xpProgress', () => {
  it('computes percentage and remaining', () => {
    const { pct, remaining } = xpProgress(12500, 15000);
    expect(pct).toBe(83);
    expect(remaining).toBe(2500);
  });
});

describe('computeCarriedWeight / loadState', () => {
  it('sums equipment + armor item weight', () => {
    const weight = computeCarriedWeight(elyndra);
    // 1*4.5 + 1*0.5 + 5*0.5 + 10*0.05 + 6.8 (armor) = 14.8
    expect(weight).toBeCloseTo(14.8);
    expect(loadState(weight, elyndra.load)).toBe('leve');
  });
});

describe('moneyTotalInPo', () => {
  it('converts pc/pp/pl into po', () => {
    expect(moneyTotalInPo({ pc: 100, pp: 10, po: 5, pl: 1 })).toBeCloseTo(17);
  });
});
