import { and, eq, inArray } from 'drizzle-orm';
import { db } from '../../db/client.js';
import {
  characters,
  characterShares,
  users,
  characterClasses,
  characterLanguages,
  characterHpLog,
  characterDrItems,
  characterAbilities,
  characterAbilityMods,
  characterAbilityLog,
  characterAcVariedMods,
  characterInitVariedMods,
  characterSpellbooks,
  characterSpellCircles,
  characterSkills,
  characterSkillMods,
  characterConditionalMods,
  characterWeapons,
  characterWeaponAmmoLog,
  characterFeats,
  characterSpecialAbilities,
  characterEquipment,
  characterArmorItems,
  characterSnapshots,
  characterSessionLog,
} from '../../db/schema.js';
import type {
  AbilityKey,
  Character,
  LevelSnapshot,
} from '../../src/entities/character/model/types.js';

type CharacterRow = typeof characters.$inferSelect;

const ABILITY_KEYS: AbilityKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

function groupBy<T>(rows: T[], key: (row: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const row of rows) {
    const k = key(row);
    const arr = map.get(k);
    if (arr) arr.push(row);
    else map.set(k, [row]);
  }
  return map;
}

/** Loads and hydrates every child table for the given character ids, batched (one query per
 * table, not one per character) and assembled in memory into the same `Character` shape the
 * frontend has always worked with — the relational storage below is an implementation detail
 * the API contract doesn't expose. */
async function assembleCharacters(coreRows: CharacterRow[]): Promise<Character[]> {
  const ids = coreRows.map((r) => r.id);
  if (ids.length === 0) return [];

  const [
    classes,
    languages,
    hpLog,
    drItems,
    abilities,
    abilityMods,
    abilityLog,
    acVariedMods,
    initVariedMods,
    spellbooks,
    spellCircles,
    skills,
    skillMods,
    conditionalMods,
    weapons,
    weaponAmmoLog,
    feats,
    specialAbilities,
    equipment,
    armorItems,
    snapshots,
    sessionLog,
  ] = await Promise.all([
    db
      .select()
      .from(characterClasses)
      .where(inArray(characterClasses.characterId, ids))
      .orderBy(characterClasses.sortOrder),
    db
      .select()
      .from(characterLanguages)
      .where(inArray(characterLanguages.characterId, ids))
      .orderBy(characterLanguages.sortOrder),
    db
      .select()
      .from(characterHpLog)
      .where(inArray(characterHpLog.characterId, ids))
      .orderBy(characterHpLog.sortOrder),
    db
      .select()
      .from(characterDrItems)
      .where(inArray(characterDrItems.characterId, ids))
      .orderBy(characterDrItems.sortOrder),
    db.select().from(characterAbilities).where(inArray(characterAbilities.characterId, ids)),
    db
      .select()
      .from(characterAbilityMods)
      .where(inArray(characterAbilityMods.characterId, ids))
      .orderBy(characterAbilityMods.sortOrder),
    db
      .select()
      .from(characterAbilityLog)
      .where(inArray(characterAbilityLog.characterId, ids))
      .orderBy(characterAbilityLog.sortOrder),
    db
      .select()
      .from(characterAcVariedMods)
      .where(inArray(characterAcVariedMods.characterId, ids))
      .orderBy(characterAcVariedMods.sortOrder),
    db
      .select()
      .from(characterInitVariedMods)
      .where(inArray(characterInitVariedMods.characterId, ids))
      .orderBy(characterInitVariedMods.sortOrder),
    db
      .select()
      .from(characterSpellbooks)
      .where(inArray(characterSpellbooks.characterId, ids))
      .orderBy(characterSpellbooks.sortOrder),
    db
      .select()
      .from(characterSpellCircles)
      .where(inArray(characterSpellCircles.characterId, ids))
      .orderBy(characterSpellCircles.sortOrder),
    db
      .select()
      .from(characterSkills)
      .where(inArray(characterSkills.characterId, ids))
      .orderBy(characterSkills.sortOrder),
    db
      .select()
      .from(characterSkillMods)
      .where(inArray(characterSkillMods.characterId, ids))
      .orderBy(characterSkillMods.sortOrder),
    db
      .select()
      .from(characterConditionalMods)
      .where(inArray(characterConditionalMods.characterId, ids))
      .orderBy(characterConditionalMods.sortOrder),
    db
      .select()
      .from(characterWeapons)
      .where(inArray(characterWeapons.characterId, ids))
      .orderBy(characterWeapons.sortOrder),
    db
      .select()
      .from(characterWeaponAmmoLog)
      .where(inArray(characterWeaponAmmoLog.characterId, ids))
      .orderBy(characterWeaponAmmoLog.sortOrder),
    db
      .select()
      .from(characterFeats)
      .where(inArray(characterFeats.characterId, ids))
      .orderBy(characterFeats.sortOrder),
    db
      .select()
      .from(characterSpecialAbilities)
      .where(inArray(characterSpecialAbilities.characterId, ids))
      .orderBy(characterSpecialAbilities.sortOrder),
    db
      .select()
      .from(characterEquipment)
      .where(inArray(characterEquipment.characterId, ids))
      .orderBy(characterEquipment.sortOrder),
    db
      .select()
      .from(characterArmorItems)
      .where(inArray(characterArmorItems.characterId, ids))
      .orderBy(characterArmorItems.sortOrder),
    db
      .select()
      .from(characterSnapshots)
      .where(inArray(characterSnapshots.characterId, ids))
      .orderBy(characterSnapshots.sortOrder),
    db
      .select()
      .from(characterSessionLog)
      .where(inArray(characterSessionLog.characterId, ids))
      .orderBy(characterSessionLog.sortOrder),
  ]);

  const byCharacter = groupBy(classes, (r) => r.characterId);
  const languagesByCharacter = groupBy(languages, (r) => r.characterId);
  const hpLogByCharacter = groupBy(hpLog, (r) => r.characterId);
  const drItemsByCharacter = groupBy(drItems, (r) => r.characterId);
  const abilitiesByCharacter = groupBy(abilities, (r) => r.characterId);
  const abilityModsByKey = groupBy(abilityMods, (r) => `${r.characterId}:${r.abilityKey}`);
  const abilityLogByKey = groupBy(abilityLog, (r) => `${r.characterId}:${r.abilityKey}`);
  const acVariedModsByCharacter = groupBy(acVariedMods, (r) => r.characterId);
  const initVariedModsByCharacter = groupBy(initVariedMods, (r) => r.characterId);
  const spellbooksByCharacter = groupBy(spellbooks, (r) => r.characterId);
  const spellCirclesBySpellbook = groupBy(spellCircles, (r) => r.spellbookId);
  const skillsByCharacter = groupBy(skills, (r) => r.characterId);
  const skillModsBySkill = groupBy(skillMods, (r) => r.skillId);
  const conditionalModsByCharacter = groupBy(conditionalMods, (r) => r.characterId);
  const weaponsByCharacter = groupBy(weapons, (r) => r.characterId);
  const weaponAmmoLogByWeapon = groupBy(weaponAmmoLog, (r) => r.weaponId);
  const featsByCharacter = groupBy(feats, (r) => r.characterId);
  const specialAbilitiesByCharacter = groupBy(specialAbilities, (r) => r.characterId);
  const equipmentByCharacter = groupBy(equipment, (r) => r.characterId);
  const armorItemsByCharacter = groupBy(armorItems, (r) => r.characterId);
  const snapshotsByCharacter = groupBy(snapshots, (r) => r.characterId);
  const sessionLogByCharacter = groupBy(sessionLog, (r) => r.characterId);

  return coreRows.map((row): Character => {
    const id = row.id;
    const specialsForCharacter = specialAbilitiesByCharacter.get(id) ?? [];

    return {
      id: row.id,
      systemId: row.systemId,
      name: row.name,
      photoUrl: row.photoUrl,
      favorited: row.favorited,
      active: row.active,

      identity: {
        raca: row.raca,
        tamanho: row.tamanho as Character['identity']['tamanho'],
        sexo: row.sexo,
        idadeNum: row.idadeNum,
        alturaNum: row.alturaNum,
        pesoNum: row.pesoNum,
        cabelo: row.cabelo,
        olhos: row.olhos,
        divindade: row.divindade,
        terraNatal: row.terraNatal,
      },
      alignmentLaw: row.alignmentLaw as Character['alignmentLaw'],
      alignmentMoral: row.alignmentMoral as Character['alignmentMoral'],
      classes: (byCharacter.get(id) ?? []).map((r) => ({ id: r.id, name: r.name, level: r.level })),
      speed: {
        base: row.speedBase,
        armor: row.speedArmor,
        fly: row.speedFly,
        flyManeuverability: row.speedFlyManeuverability,
        swim: row.speedSwim,
        climb: row.speedClimb,
        dig: row.speedDig,
      },
      languages: (languagesByCharacter.get(id) ?? []).map((r) => ({ id: r.id, name: r.name })),
      story: row.story,

      xpEnabled: row.xpEnabled,
      xpCurrent: row.xpCurrent,
      xpMax: row.xpMax,

      hpCurrent: row.hpCurrent,
      hpMax: row.hpMax,
      tempHp: row.tempHp,
      hpNonLethal: row.hpNonLethal,
      hpLog: (hpLogByCharacter.get(id) ?? []).map((r) => ({
        id: r.id,
        delta: r.delta,
        kind: r.kind as Character['hpLog'][number]['kind'],
      })),
      drItems: (drItemsByCharacter.get(id) ?? []).map((r) => ({
        id: r.id,
        type: r.type,
        immune: r.immune,
        amount: r.amount,
      })),

      abilities: Object.fromEntries(
        ABILITY_KEYS.map((key) => {
          const row2 = (abilitiesByCharacter.get(id) ?? []).find((r) => r.key === key);
          const mods = (abilityModsByKey.get(`${id}:${key}`) ?? []).map((m) => ({
            id: m.id,
            label: m.label,
            value: m.value,
          }));
          const log = (abilityLogByKey.get(`${id}:${key}`) ?? []).map((l) => ({
            id: l.id,
            type: l.type as 'dano' | 'dreno',
            delta: l.delta,
            desc: l.desc,
          }));
          return [
            key,
            {
              base: row2?.base ?? 10,
              mods,
              damage: row2?.damage ?? 0,
              drain: row2?.drain ?? 0,
              log,
            },
          ];
        }),
      ) as Character['abilities'],

      acArmor: row.acArmor,
      acShield: row.acShield,
      acNatural: row.acNatural,
      acDeflection: row.acDeflection,
      acVariedMods: (acVariedModsByCharacter.get(id) ?? []).map((r) => ({
        id: r.id,
        label: r.label,
        value: r.value,
      })),
      initVariedMods: (initVariedModsByCharacter.get(id) ?? []).map((r) => ({
        id: r.id,
        label: r.label,
        value: r.value,
      })),
      saves: {
        fort: { base: row.fortBase, magic: row.fortMagic, misc: row.fortMisc, temp: row.fortTemp },
        ref: { base: row.refBase, magic: row.refMagic, misc: row.refMisc, temp: row.refTemp },
        will: { base: row.willBase, magic: row.willMagic, misc: row.willMisc, temp: row.willTemp },
      },
      bbaValue: row.bbaValue,
      rmValue: row.rmValue,

      favoredSchool: row.favoredSchool,
      opposedSchools: row.opposedSchools,
      spellbooks: (spellbooksByCharacter.get(id) ?? []).map((sb) => ({
        className: sb.className,
        abilityLabel: sb.abilityLabel,
        kind: sb.kind as Character['spellbooks'][number]['kind'],
        cantrips: { label: sb.cantripLabel, spells: sb.cantripSpells },
        circles: (spellCirclesBySpellbook.get(sb.id) ?? []).map((c) => ({
          label: c.label,
          used: c.used,
          max: c.max,
          spells: c.spells,
        })),
      })),
      spellLikeAbilities: specialsForCharacter
        .filter((s) => s.kind === 'spell-like')
        .map((s) => ({ id: s.id, name: s.name, subtitle: s.subtitle, uses: s.uses, desc: s.desc })),

      skills: (skillsByCharacter.get(id) ?? []).map((s) => ({
        key: s.key,
        name: s.name,
        ability: s.ability as AbilityKey,
        classSkill: s.classSkill,
        trainedOnly: s.trainedOnly,
        ranks: s.ranks,
        mods: (skillModsBySkill.get(s.id) ?? []).map((m) => ({
          id: m.id,
          label: m.label,
          value: m.value,
        })),
        ...(s.conditional != null ? { conditional: s.conditional } : {}),
      })),
      conditionalMods: (conditionalModsByCharacter.get(id) ?? []).map((r) => ({
        id: r.id,
        text: r.text,
      })),

      weapons: (weaponsByCharacter.get(id) ?? []).map((w) => ({
        id: w.id,
        name: w.name,
        atk: w.atk,
        crit: w.crit,
        dmg: w.dmg,
        type: w.type,
        range: w.range,
        desc: w.desc,
        hasAmmo: w.hasAmmo,
        ammoCurrent: w.ammoCurrent,
        ammoMax: w.ammoMax,
        ammoLog: (weaponAmmoLogByWeapon.get(w.id) ?? []).map((l) => ({ id: l.id, delta: l.delta })),
      })),

      feats: (featsByCharacter.get(id) ?? []).map((f) => ({
        id: f.id,
        name: f.name,
        tag: f.tag,
        desc: f.desc,
      })),
      specials: specialsForCharacter
        .filter((s) => s.kind === 'special')
        .map((s) => ({ id: s.id, name: s.name, subtitle: s.subtitle, uses: s.uses, desc: s.desc })),

      money: { pc: row.moneyPc, pp: row.moneyPp, po: row.moneyPo, pl: row.moneyPl },
      load: {
        light: row.loadLight,
        medium: row.loadMedium,
        heavy: row.loadHeavy,
        overhead: row.loadOverhead,
        ground: row.loadGround,
        drag: row.loadDrag,
      },
      equipment: (equipmentByCharacter.get(id) ?? []).map((r) => ({
        id: r.id,
        name: r.name,
        qty: r.qty,
        unitWeight: r.unitWeight,
      })),
      armorItems: (armorItemsByCharacter.get(id) ?? []).map((r) => ({
        id: r.id,
        name: r.name,
        bonus: r.bonus,
        checkPenalty: r.checkPenalty,
        arcaneFailure: r.arcaneFailure,
        weight: r.weight,
      })),

      levelSnapshots: (snapshotsByCharacter.get(id) ?? []).map((s): LevelSnapshot => ({
        id: s.id,
        parentId: s.parentId,
        level: s.level,
        kind: s.kind as LevelSnapshot['kind'],
        label: s.label,
        date: s.date,
        deletedAt: s.deletedAt ? s.deletedAt.toISOString() : null,
        data: JSON.parse(s.data) as LevelSnapshot['data'],
      })),
      currentSnapshotId: row.currentSnapshotId,
      sessionLog: (sessionLogByCharacter.get(id) ?? []).map((r) => ({
        id: r.id,
        title: r.title,
        date: r.date,
        summary: r.summary,
      })),

      lastAccessedAt: row.lastAccessedAt.toISOString(),
    };
  });
}

export async function loadCharactersForUser(userId: string): Promise<Character[]> {
  const coreRows = await db.select().from(characters).where(eq(characters.userId, userId));
  return assembleCharacters(coreRows);
}

/** Re-reads a single character straight from the DB — used right after `createCharacter`/
 * `updateCharacterOwned` so a POST/PATCH response reflects what was actually committed (e.g. a
 * `real` column's float4 rounding) rather than echoing back the request body as if it were
 * confirmed saved verbatim. */
export async function loadCharacterById(id: string): Promise<Character | null> {
  const [row] = await db.select().from(characters).where(eq(characters.id, id)).limit(1);
  if (!row) return null;
  const [assembled] = await assembleCharacters([row]);
  return assembled ?? null;
}

/** Characters someone else shared with `userId` — always view-only, resolved separately from
 * "mine" (see character_shares in db/schema.ts). */
export async function loadSharedWithMe(
  userId: string,
): Promise<{ character: Character; ownerName: string; ownerUsername: string }[]> {
  const rows = await db
    .select({ core: characters, ownerName: users.name, ownerUsername: users.username })
    .from(characterShares)
    .innerJoin(characters, eq(characterShares.characterId, characters.id))
    .innerJoin(users, eq(characters.userId, users.id))
    .where(eq(characterShares.sharedWithUserId, userId));

  const hydrated = await assembleCharacters(rows.map((r) => r.core));
  const byId = new Map(hydrated.map((c) => [c.id, c]));
  return rows.map((r) => ({
    character: byId.get(r.core.id)!,
    ownerName: r.ownerName,
    ownerUsername: r.ownerUsername,
  }));
}

/** Everything below decomposes a full `Character` (as sent by the client on create/update) into
 * rows for every table above. Every save is a full replace — the same "send the whole object,
 * every time" contract the frontend has always used against the old JSONB column — so there's
 * no incremental diffing: delete this character's rows in every child table, then insert fresh
 * ones from the incoming object. All of it runs in one `db.batch` call (the neon-http driver has
 * no session-based `db.transaction`, but `batch` sends every statement as one atomic HTTP call),
 * and every row uses the client-generated id already on the nested object as its primary key, so
 * no statement in the batch needs another statement's result — the one exception is
 * character_spell_circles/character_skill_mods/character_weapon_ammo_log, whose parent row must
 * be inserted first in the same batch (enforced by array order below), and character_snapshots'
 * self-referencing parentId, set in a second pass so insert order never matters there. */

type BatchQuery = Parameters<typeof db.batch>[0][number];

function toSortedRows<T, R>(items: T[], map: (item: T, index: number) => R): R[] {
  return items.map((item, index) => map(item, index));
}

function buildDeletes(id: string): BatchQuery[] {
  return [
    db.delete(characterClasses).where(eq(characterClasses.characterId, id)),
    db.delete(characterLanguages).where(eq(characterLanguages.characterId, id)),
    db.delete(characterHpLog).where(eq(characterHpLog.characterId, id)),
    db.delete(characterDrItems).where(eq(characterDrItems.characterId, id)),
    db.delete(characterAbilities).where(eq(characterAbilities.characterId, id)),
    db.delete(characterAbilityMods).where(eq(characterAbilityMods.characterId, id)),
    db.delete(characterAbilityLog).where(eq(characterAbilityLog.characterId, id)),
    db.delete(characterAcVariedMods).where(eq(characterAcVariedMods.characterId, id)),
    db.delete(characterInitVariedMods).where(eq(characterInitVariedMods.characterId, id)),
    db.delete(characterSpellCircles).where(eq(characterSpellCircles.characterId, id)),
    db.delete(characterSpellbooks).where(eq(characterSpellbooks.characterId, id)),
    db.delete(characterSkillMods).where(eq(characterSkillMods.characterId, id)),
    db.delete(characterSkills).where(eq(characterSkills.characterId, id)),
    db.delete(characterConditionalMods).where(eq(characterConditionalMods.characterId, id)),
    db.delete(characterWeaponAmmoLog).where(eq(characterWeaponAmmoLog.characterId, id)),
    db.delete(characterWeapons).where(eq(characterWeapons.characterId, id)),
    db.delete(characterFeats).where(eq(characterFeats.characterId, id)),
    db.delete(characterSpecialAbilities).where(eq(characterSpecialAbilities.characterId, id)),
    db.delete(characterEquipment).where(eq(characterEquipment.characterId, id)),
    db.delete(characterArmorItems).where(eq(characterArmorItems.characterId, id)),
    db.delete(characterSnapshots).where(eq(characterSnapshots.characterId, id)),
    db.delete(characterSessionLog).where(eq(characterSessionLog.characterId, id)),
  ];
}

function buildInserts(character: Character): BatchQuery[] {
  const id = character.id;
  const queries: BatchQuery[] = [];

  if (character.classes.length > 0) {
    queries.push(
      db.insert(characterClasses).values(
        toSortedRows(character.classes, (c, i) => ({
          id: c.id,
          characterId: id,
          name: c.name,
          level: c.level,
          sortOrder: i,
        })),
      ),
    );
  }
  if (character.languages.length > 0) {
    queries.push(
      db.insert(characterLanguages).values(
        toSortedRows(character.languages, (l, i) => ({
          id: l.id,
          characterId: id,
          name: l.name,
          sortOrder: i,
        })),
      ),
    );
  }
  if (character.hpLog.length > 0) {
    queries.push(
      db.insert(characterHpLog).values(
        toSortedRows(character.hpLog, (h, i) => ({
          id: h.id,
          characterId: id,
          delta: h.delta,
          kind: h.kind,
          sortOrder: i,
        })),
      ),
    );
  }
  if (character.drItems.length > 0) {
    queries.push(
      db.insert(characterDrItems).values(
        toSortedRows(character.drItems, (d, i) => ({
          id: d.id,
          characterId: id,
          type: d.type,
          immune: d.immune,
          amount: d.amount,
          sortOrder: i,
        })),
      ),
    );
  }

  queries.push(
    db.insert(characterAbilities).values(
      ABILITY_KEYS.map((key) => ({
        characterId: id,
        key,
        base: character.abilities[key].base,
        damage: character.abilities[key].damage,
        drain: character.abilities[key].drain,
      })),
    ),
  );
  const abilityModRows = ABILITY_KEYS.flatMap((key) =>
    toSortedRows(character.abilities[key].mods, (m, i) => ({
      id: m.id,
      characterId: id,
      abilityKey: key,
      label: m.label,
      value: m.value,
      sortOrder: i,
    })),
  );
  if (abilityModRows.length > 0)
    queries.push(db.insert(characterAbilityMods).values(abilityModRows));
  const abilityLogRows = ABILITY_KEYS.flatMap((key) =>
    toSortedRows(character.abilities[key].log, (l, i) => ({
      id: l.id,
      characterId: id,
      abilityKey: key,
      type: l.type,
      delta: l.delta,
      desc: l.desc,
      sortOrder: i,
    })),
  );
  if (abilityLogRows.length > 0)
    queries.push(db.insert(characterAbilityLog).values(abilityLogRows));

  if (character.acVariedMods.length > 0) {
    queries.push(
      db.insert(characterAcVariedMods).values(
        toSortedRows(character.acVariedMods, (m, i) => ({
          id: m.id,
          characterId: id,
          label: m.label,
          value: m.value,
          sortOrder: i,
        })),
      ),
    );
  }
  if (character.initVariedMods.length > 0) {
    queries.push(
      db.insert(characterInitVariedMods).values(
        toSortedRows(character.initVariedMods, (m, i) => ({
          id: m.id,
          characterId: id,
          label: m.label,
          value: m.value,
          sortOrder: i,
        })),
      ),
    );
  }

  if (character.spellbooks.length > 0) {
    const spellbookIds = character.spellbooks.map(() => crypto.randomUUID());
    queries.push(
      db.insert(characterSpellbooks).values(
        character.spellbooks.map((sb, i) => ({
          id: spellbookIds[i],
          characterId: id,
          className: sb.className,
          abilityLabel: sb.abilityLabel,
          kind: sb.kind,
          cantripLabel: sb.cantrips.label,
          cantripSpells: sb.cantrips.spells,
          sortOrder: i,
        })),
      ),
    );
    const circleRows = character.spellbooks.flatMap((sb, sbIndex) =>
      toSortedRows(sb.circles, (c, i) => ({
        id: crypto.randomUUID(),
        spellbookId: spellbookIds[sbIndex],
        characterId: id,
        label: c.label,
        used: c.used,
        max: c.max,
        spells: c.spells,
        sortOrder: i,
      })),
    );
    if (circleRows.length > 0) queries.push(db.insert(characterSpellCircles).values(circleRows));
  }

  if (character.skills.length > 0) {
    const skillIds = character.skills.map(() => crypto.randomUUID());
    queries.push(
      db.insert(characterSkills).values(
        character.skills.map((s, i) => ({
          id: skillIds[i],
          characterId: id,
          key: s.key,
          name: s.name,
          ability: s.ability,
          classSkill: s.classSkill,
          trainedOnly: s.trainedOnly,
          ranks: s.ranks,
          conditional: s.conditional ?? null,
          sortOrder: i,
        })),
      ),
    );
    const skillModRows = character.skills.flatMap((s, sIndex) =>
      toSortedRows(s.mods, (m, i) => ({
        id: m.id,
        skillId: skillIds[sIndex],
        characterId: id,
        label: m.label,
        value: m.value,
        sortOrder: i,
      })),
    );
    if (skillModRows.length > 0) queries.push(db.insert(characterSkillMods).values(skillModRows));
  }

  if (character.conditionalMods.length > 0) {
    queries.push(
      db.insert(characterConditionalMods).values(
        toSortedRows(character.conditionalMods, (m, i) => ({
          id: m.id,
          characterId: id,
          text: m.text,
          sortOrder: i,
        })),
      ),
    );
  }

  if (character.weapons.length > 0) {
    queries.push(
      db.insert(characterWeapons).values(
        toSortedRows(character.weapons, (w, i) => ({
          id: w.id,
          characterId: id,
          name: w.name,
          atk: w.atk,
          crit: w.crit,
          dmg: w.dmg,
          type: w.type,
          range: w.range,
          desc: w.desc,
          hasAmmo: w.hasAmmo,
          ammoCurrent: w.ammoCurrent,
          ammoMax: w.ammoMax,
          sortOrder: i,
        })),
      ),
    );
    const ammoLogRows = character.weapons.flatMap((w) =>
      toSortedRows(w.ammoLog, (l, i) => ({
        id: l.id,
        weaponId: w.id,
        characterId: id,
        delta: l.delta,
        sortOrder: i,
      })),
    );
    if (ammoLogRows.length > 0) queries.push(db.insert(characterWeaponAmmoLog).values(ammoLogRows));
  }

  if (character.feats.length > 0) {
    queries.push(
      db.insert(characterFeats).values(
        toSortedRows(character.feats, (f, i) => ({
          id: f.id,
          characterId: id,
          name: f.name,
          tag: f.tag,
          desc: f.desc,
          sortOrder: i,
        })),
      ),
    );
  }

  const specialRows = [
    ...toSortedRows(character.spellLikeAbilities, (s, i) => ({
      id: s.id,
      characterId: id,
      kind: 'spell-like',
      name: s.name,
      subtitle: s.subtitle,
      uses: s.uses,
      desc: s.desc,
      sortOrder: i,
    })),
    ...toSortedRows(character.specials, (s, i) => ({
      id: s.id,
      characterId: id,
      kind: 'special',
      name: s.name,
      subtitle: s.subtitle,
      uses: s.uses,
      desc: s.desc,
      sortOrder: i,
    })),
  ];
  if (specialRows.length > 0)
    queries.push(db.insert(characterSpecialAbilities).values(specialRows));

  if (character.equipment.length > 0) {
    queries.push(
      db.insert(characterEquipment).values(
        toSortedRows(character.equipment, (e, i) => ({
          id: e.id,
          characterId: id,
          name: e.name,
          qty: e.qty,
          unitWeight: e.unitWeight,
          sortOrder: i,
        })),
      ),
    );
  }
  if (character.armorItems.length > 0) {
    queries.push(
      db.insert(characterArmorItems).values(
        toSortedRows(character.armorItems, (a, i) => ({
          id: a.id,
          characterId: id,
          name: a.name,
          bonus: a.bonus,
          checkPenalty: a.checkPenalty,
          arcaneFailure: a.arcaneFailure,
          weight: a.weight,
          sortOrder: i,
        })),
      ),
    );
  }

  const snapshots = character.levelSnapshots ?? [];
  if (snapshots.length > 0) {
    queries.push(
      db.insert(characterSnapshots).values(
        toSortedRows(snapshots, (s, i) => ({
          id: s.id,
          characterId: id,
          parentId: null,
          level: s.level,
          kind: s.kind,
          label: s.label,
          date: s.date,
          deletedAt: s.deletedAt ? new Date(s.deletedAt) : null,
          data: JSON.stringify(s.data),
          sortOrder: i,
        })),
      ),
    );
    for (const s of snapshots) {
      if (s.parentId) {
        queries.push(
          db
            .update(characterSnapshots)
            .set({ parentId: s.parentId })
            .where(eq(characterSnapshots.id, s.id)),
        );
      }
    }
  }

  if (character.sessionLog.length > 0) {
    queries.push(
      db.insert(characterSessionLog).values(
        toSortedRows(character.sessionLog, (s, i) => ({
          id: s.id,
          characterId: id,
          title: s.title,
          date: s.date,
          summary: s.summary,
          sortOrder: i,
        })),
      ),
    );
  }

  return queries;
}

function coreRowValues(character: Character, userId: string) {
  return {
    id: character.id,
    userId,
    systemId: character.systemId,
    name: character.name,
    photoUrl: character.photoUrl,
    favorited: character.favorited,
    active: character.active,
    raca: character.identity.raca,
    tamanho: character.identity.tamanho,
    sexo: character.identity.sexo,
    idadeNum: character.identity.idadeNum,
    alturaNum: character.identity.alturaNum,
    pesoNum: character.identity.pesoNum,
    cabelo: character.identity.cabelo,
    olhos: character.identity.olhos,
    divindade: character.identity.divindade,
    terraNatal: character.identity.terraNatal,
    alignmentLaw: character.alignmentLaw,
    alignmentMoral: character.alignmentMoral,
    story: character.story,
    xpEnabled: character.xpEnabled,
    xpCurrent: character.xpCurrent,
    xpMax: character.xpMax,
    hpCurrent: character.hpCurrent,
    hpMax: character.hpMax,
    tempHp: character.tempHp,
    hpNonLethal: character.hpNonLethal,
    acArmor: character.acArmor,
    acShield: character.acShield,
    acNatural: character.acNatural,
    acDeflection: character.acDeflection,
    bbaValue: character.bbaValue,
    rmValue: character.rmValue,
    favoredSchool: character.favoredSchool,
    opposedSchools: character.opposedSchools,
    speedBase: character.speed.base,
    speedArmor: character.speed.armor,
    speedFly: character.speed.fly,
    speedFlyManeuverability: character.speed.flyManeuverability,
    speedSwim: character.speed.swim,
    speedClimb: character.speed.climb,
    speedDig: character.speed.dig,
    fortBase: character.saves.fort.base,
    fortMagic: character.saves.fort.magic,
    fortMisc: character.saves.fort.misc,
    fortTemp: character.saves.fort.temp,
    refBase: character.saves.ref.base,
    refMagic: character.saves.ref.magic,
    refMisc: character.saves.ref.misc,
    refTemp: character.saves.ref.temp,
    willBase: character.saves.will.base,
    willMagic: character.saves.will.magic,
    willMisc: character.saves.will.misc,
    willTemp: character.saves.will.temp,
    moneyPc: character.money.pc,
    moneyPp: character.money.pp,
    moneyPo: character.money.po,
    moneyPl: character.money.pl,
    loadLight: character.load.light,
    loadMedium: character.load.medium,
    loadHeavy: character.load.heavy,
    loadOverhead: character.load.overhead,
    loadGround: character.load.ground,
    loadDrag: character.load.drag,
    currentSnapshotId: character.currentSnapshotId,
    lastAccessedAt: new Date(character.lastAccessedAt),
    updatedAt: new Date(),
  };
}

export async function createCharacter(character: Character, userId: string): Promise<void> {
  const core = coreRowValues(character, userId);
  await db.batch([db.insert(characters).values(core), ...buildInserts(character)] as [
    BatchQuery,
    ...BatchQuery[],
  ]);
}

/** Returns false (no write performed) if `id` isn't owned by `userId`. */
export async function updateCharacterOwned(
  id: string,
  character: Character,
  userId: string,
): Promise<boolean> {
  const [owned] = await db
    .select({ id: characters.id })
    .from(characters)
    .where(and(eq(characters.id, id), eq(characters.userId, userId)))
    .limit(1);
  if (!owned) return false;

  const core = coreRowValues(character, userId);
  await db.batch([
    // Re-asserts ownership in the write itself (not just the SELECT above) — a future caller
    // of this function that skips re-deriving that check still can't move another user's row.
    db
      .update(characters)
      .set(core)
      .where(and(eq(characters.id, id), eq(characters.userId, userId))),
    ...buildDeletes(id),
    ...buildInserts(character),
  ] as [BatchQuery, ...BatchQuery[]]);
  return true;
}
