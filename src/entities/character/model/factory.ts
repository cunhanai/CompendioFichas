import { reconcileSkills, SKILL_CATALOG } from './skillCatalog';
import type { Character } from './types';

function blankAbility() {
  return { base: 0, mods: [], damage: 0, drain: 0, log: [] };
}

/** A fresh level-1 character with sane Pathfinder 1e defaults — used by "Novo personagem". */
export function createBlankCharacter(systemId: string, name: string): Character {
  // Must be a real UUID, not a prefixed string — it's stored as a Postgres `uuid` column and
  // validated server-side with z.uuid(); a "char-..." id gets silently rejected (POST /characters
  // fails validation, and the optimistic local update masks it — see DESIGN_NOTES.md).
  const id = crypto.randomUUID();
  return {
    id,
    systemId,
    name,
    photoUrl: null,
    favorited: false,
    active: true,

    identity: {
      raca: '',
      tamanho: '',
      sexo: '',
      idadeNum: 0,
      alturaNum: 0,
      pesoNum: 0,
      cabelo: '',
      olhos: '',
      divindade: '',
      terraNatal: '',
    },
    alignmentLaw: '',
    alignmentMoral: '',
    classes: [],
    speed: { base: 0, armor: 0, fly: 0, flyManeuverability: '', swim: 0, climb: 0, dig: 0 },
    languages: [],
    story: '',

    xpEnabled: true,
    xpCurrent: 0,
    xpMax: 2000,

    hpCurrent: 0,
    hpMax: 0,
    tempHp: 0,
    hpNonLethal: 0,
    hpLog: [],
    drItems: [],

    abilities: {
      str: blankAbility(),
      dex: blankAbility(),
      con: blankAbility(),
      int: blankAbility(),
      wis: blankAbility(),
      cha: blankAbility(),
    },

    acArmor: 0,
    acShield: 0,
    acNatural: 0,
    acDeflection: 0,
    acVariedMods: [],
    initVariedMods: [],
    saves: {
      fort: { base: 0, magic: 0, misc: 0, temp: 0 },
      ref: { base: 0, magic: 0, misc: 0, temp: 0 },
      will: { base: 0, magic: 0, misc: 0, temp: 0 },
    },
    bbaValue: 0,
    rmValue: 0,

    favoredSchool: '',
    opposedSchools: [],
    spellbooks: [],
    spellLikeAbilities: [],

    skills: SKILL_CATALOG.map((tpl) => ({
      key: tpl.key,
      name: tpl.name,
      ability: tpl.ability,
      trainedOnly: tpl.trainedOnly,
      classSkill: false,
      ranks: 0,
      mods: [],
    })),
    conditionalMods: [],

    weapons: [],
    feats: [],
    specials: [],

    money: { pc: 0, pp: 0, po: 0, pl: 0 },
    load: { light: 0, medium: 0, heavy: 0, overhead: 0, ground: 0, drag: 0 },
    equipment: [],
    armorItems: [],

    // No snapshot yet — a blank character starts empty like everything else here, and the first
    // one is taken automatically the first time the player levels up (see features/level-snapshots).
    levelSnapshots: [],
    currentSnapshotId: null,
    sessionLog: [],

    lastAccessedAt: new Date().toISOString(),
  };
}

/**
 * Fills in defaults for fields that didn't exist yet when a character was first saved —
 * `levelSnapshots`/`currentSnapshotId` were added after real characters were already in the DB,
 * so a character predating this feature simply doesn't have them — and brings `skills` in line
 * with the current SKILL_CATALOG (see reconcileSkills), since a character saved before a catalog
 * rewrite keeps whatever keys/names it had at the time forever otherwise. Every character coming
 * in from the API goes through this before the rest of the app ever touches it, so nothing
 * downstream needs to treat either as possibly out of date.
 */
export function normalizeCharacter(character: Character): Character {
  const skills = reconcileSkills(character.skills);
  const hasSnapshotFields =
    Array.isArray(character.levelSnapshots) && character.currentSnapshotId !== undefined;
  if (hasSnapshotFields && skills === character.skills) {
    return character;
  }
  return {
    ...character,
    levelSnapshots: character.levelSnapshots ?? [],
    currentSnapshotId: character.currentSnapshotId ?? null,
    skills,
  };
}
