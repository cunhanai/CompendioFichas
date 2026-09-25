import {
  boolean,
  index,
  integer,
  pgTable,
  primaryKey,
  real,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  avatarUrl: text('avatar_url'),
  isAdmin: boolean('is_admin').notNull().default(false),
  /** The one account (ana) allowed to grant/revoke admin from others — never settable through the API. */
  isMaster: boolean('is_master').notNull().default(false),
  /** Forces the change-password screen on next load — set when an admin resets this account's password. */
  mustChangePassword: boolean('must_change_password').notNull().default(false),
  active: boolean('active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

/** Append-only trail of account-management actions — who did what to whom, and when. */
export const auditLog = pgTable(
  'audit_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    actorId: uuid('actor_id').references(() => users.id, { onDelete: 'set null' }),
    actorUsername: text('actor_username').notNull(),
    action: text('action').notNull(),
    targetUserId: uuid('target_user_id').references(() => users.id, { onDelete: 'set null' }),
    targetUsername: text('target_username'),
    detail: text('detail'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  // maybeRaiseSecurityAlert() (api/_lib/securityAlerts.ts) runs this exact filter after every
  // failed/rate-limited login — without this, a brute-force burst causes repeated full scans
  // of an append-only table on the same DB already under attack.
  (table) => [index('audit_log_action_created_at_idx').on(table.action, table.createdAt)],
);

/**
 * Standing alerts raised when the login-failure/rate-limit rate in audit_log crosses a
 * threshold. Persists across logout/login and stays until an admin explicitly dismisses it —
 * it's a fact about something that happened, not a live computed value.
 */
export const securityAlerts = pgTable(
  'security_alerts',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    description: text('description').notNull(),
    dismissed: boolean('dismissed').notNull().default(false),
    dismissedAt: timestamp('dismissed_at', { withTimezone: true }),
    dismissedBy: uuid('dismissed_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  // At most one undismissed alert can exist at a time — enforced here (a partial unique index
  // on a constant expression), not just in application code, so concurrent threshold-crossing
  // requests can't each insert their own duplicate alert (see maybeRaiseSecurityAlert's
  // onConflictDoNothing()).
  (table) => [
    uniqueIndex('security_alerts_one_active')
      .on(sql`(true)`)
      .where(sql`${table.dismissed} = false`),
  ],
);

export const sessions = pgTable('sessions', {
  token: text('token').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
});

export const systems = pgTable('systems', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  implemented: boolean('implemented').notNull().default(false),
  favorited: boolean('favorited').notNull().default(false),
  playerCount: integer('player_count').notNull().default(0),
  logoUrl: text('logo_url'),
});

/**
 * Core character row — one per sheet. Every field here is a fixed 1:1 attribute of the
 * character itself (identity/speed/saves/money/load are flattened in as columns rather than
 * given their own 1:1 tables: there's no cardinality reason to split them out, a separate table
 * only earns its keep for the genuinely list-shaped sections below, which each get their own
 * table with a `character_id` FK). Nothing on a character is stored as JSON — see the child
 * tables below for every list/array field on `Character`.
 */
export const characters = pgTable('characters', {
  id: uuid('id').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  systemId: text('system_id')
    .notNull()
    .references(() => systems.id),
  name: text('name').notNull(),
  photoUrl: text('photo_url'),
  favorited: boolean('favorited').notNull().default(false),
  active: boolean('active').notNull().default(true),

  // Identity
  raca: text('raca').notNull().default(''),
  tamanho: text('tamanho').notNull().default('Médio'),
  sexo: text('sexo').notNull().default(''),
  idadeNum: integer('idade_num').notNull().default(0),
  alturaNum: real('altura_num').notNull().default(0),
  pesoNum: real('peso_num').notNull().default(0),
  cabelo: text('cabelo').notNull().default(''),
  olhos: text('olhos').notNull().default(''),
  divindade: text('divindade').notNull().default(''),
  terraNatal: text('terra_natal').notNull().default(''),
  alignmentLaw: text('alignment_law').notNull().default('Neutro'),
  alignmentMoral: text('alignment_moral').notNull().default('Neutro'),
  story: text('story').notNull().default(''),

  xpEnabled: boolean('xp_enabled').notNull().default(true),
  xpCurrent: integer('xp_current').notNull().default(0),
  xpMax: integer('xp_max').notNull().default(0),

  hpCurrent: integer('hp_current').notNull().default(0),
  hpMax: integer('hp_max').notNull().default(0),
  tempHp: integer('temp_hp').notNull().default(0),
  hpNonLethal: integer('hp_non_lethal').notNull().default(0),

  acArmor: integer('ac_armor').notNull().default(0),
  acShield: integer('ac_shield').notNull().default(0),
  acNatural: integer('ac_natural').notNull().default(0),
  acDeflection: integer('ac_deflection').notNull().default(0),
  bbaValue: integer('bba_value').notNull().default(0),
  rmValue: integer('rm_value').notNull().default(0),

  favoredSchool: text('favored_school').notNull().default(''),
  opposedSchools: text('opposed_schools').array().notNull().default([]),

  // Speed
  speedBase: integer('speed_base').notNull().default(9),
  speedArmor: integer('speed_armor').notNull().default(0),
  speedFly: integer('speed_fly').notNull().default(0),
  speedFlyManeuverability: text('speed_fly_maneuverability').notNull().default(''),
  speedSwim: integer('speed_swim').notNull().default(0),
  speedClimb: integer('speed_climb').notNull().default(0),
  speedDig: integer('speed_dig').notNull().default(0),

  // Saves
  fortBase: integer('fort_base').notNull().default(0),
  fortMagic: integer('fort_magic').notNull().default(0),
  fortMisc: integer('fort_misc').notNull().default(0),
  fortTemp: integer('fort_temp').notNull().default(0),
  refBase: integer('ref_base').notNull().default(0),
  refMagic: integer('ref_magic').notNull().default(0),
  refMisc: integer('ref_misc').notNull().default(0),
  refTemp: integer('ref_temp').notNull().default(0),
  willBase: integer('will_base').notNull().default(0),
  willMagic: integer('will_magic').notNull().default(0),
  willMisc: integer('will_misc').notNull().default(0),
  willTemp: integer('will_temp').notNull().default(0),

  // Money
  moneyPc: integer('money_pc').notNull().default(0),
  moneyPp: integer('money_pp').notNull().default(0),
  moneyPo: integer('money_po').notNull().default(0),
  moneyPl: integer('money_pl').notNull().default(0),

  // Load
  loadLight: real('load_light').notNull().default(0),
  loadMedium: real('load_medium').notNull().default(0),
  loadHeavy: real('load_heavy').notNull().default(0),
  loadOverhead: real('load_overhead').notNull().default(0),
  loadGround: real('load_ground').notNull().default(0),
  loadDrag: real('load_drag').notNull().default(0),

  /** Points at the snapshot the live character currently descends from (walk `parent_id` on
   * character_snapshots from here for the active lineage). Not a DB-level FK — it would form a
   * cycle with character_snapshots.character_id, and every write already replaces both tables
   * together in the same transaction, so the app layer is what keeps this consistent, exactly
   * like the in-memory Character type it mirrors. */
  currentSnapshotId: uuid('current_snapshot_id'),

  lastAccessedAt: timestamp('last_accessed_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

const characterId = () =>
  uuid('character_id')
    .notNull()
    .references(() => characters.id, { onDelete: 'cascade' });

/** Shared shape for every child list-table below: client-generated id as PK, a character_id FK
 * for cascade delete, and a sort_order column since Postgres row order isn't otherwise stable —
 * every read orders by it to preserve the array order the frontend expects. */
const sortOrder = () => integer('sort_order').notNull().default(0);

export const characterClasses = pgTable(
  'character_classes',
  {
    id: uuid('id').primaryKey(),
    characterId: characterId(),
    name: text('name').notNull(),
    level: integer('level').notNull().default(1),
    sortOrder: sortOrder(),
  },
  (table) => [index('character_classes_character_id_idx').on(table.characterId, table.sortOrder)],
);

export const characterLanguages = pgTable(
  'character_languages',
  {
    id: uuid('id').primaryKey(),
    characterId: characterId(),
    name: text('name').notNull(),
    sortOrder: sortOrder(),
  },
  (table) => [index('character_languages_character_id_idx').on(table.characterId, table.sortOrder)],
);

export const characterHpLog = pgTable(
  'character_hp_log',
  {
    id: uuid('id').primaryKey(),
    characterId: characterId(),
    delta: integer('delta').notNull(),
    kind: text('kind').notNull(),
    sortOrder: sortOrder(),
  },
  (table) => [index('character_hp_log_character_id_idx').on(table.characterId, table.sortOrder)],
);

export const characterDrItems = pgTable(
  'character_dr_items',
  {
    id: uuid('id').primaryKey(),
    characterId: characterId(),
    type: text('type').notNull(),
    immune: boolean('immune').notNull().default(false),
    amount: integer('amount').notNull().default(0),
    sortOrder: sortOrder(),
  },
  (table) => [index('character_dr_items_character_id_idx').on(table.characterId, table.sortOrder)],
);

/** One row per (character, ability key) — always exactly 6 rows per character. */
export const characterAbilities = pgTable(
  'character_abilities',
  {
    characterId: characterId(),
    key: text('key').notNull(),
    base: integer('base').notNull().default(10),
    damage: integer('damage').notNull().default(0),
    drain: integer('drain').notNull().default(0),
  },
  (table) => [primaryKey({ columns: [table.characterId, table.key] })],
);

export const characterAbilityMods = pgTable(
  'character_ability_mods',
  {
    id: uuid('id').primaryKey(),
    characterId: characterId(),
    abilityKey: text('ability_key').notNull(),
    label: text('label').notNull(),
    value: integer('value').notNull().default(0),
    sortOrder: sortOrder(),
  },
  (table) => [
    index('character_ability_mods_character_id_idx').on(table.characterId, table.sortOrder),
  ],
);

export const characterAbilityLog = pgTable(
  'character_ability_log',
  {
    id: uuid('id').primaryKey(),
    characterId: characterId(),
    abilityKey: text('ability_key').notNull(),
    type: text('type').notNull(),
    delta: integer('delta').notNull(),
    desc: text('desc').notNull().default(''),
    sortOrder: sortOrder(),
  },
  (table) => [
    index('character_ability_log_character_id_idx').on(table.characterId, table.sortOrder),
  ],
);

export const characterAcVariedMods = pgTable(
  'character_ac_varied_mods',
  {
    id: uuid('id').primaryKey(),
    characterId: characterId(),
    label: text('label').notNull(),
    value: integer('value').notNull().default(0),
    sortOrder: sortOrder(),
  },
  (table) => [
    index('character_ac_varied_mods_character_id_idx').on(table.characterId, table.sortOrder),
  ],
);

export const characterInitVariedMods = pgTable(
  'character_init_varied_mods',
  {
    id: uuid('id').primaryKey(),
    characterId: characterId(),
    label: text('label').notNull(),
    value: integer('value').notNull().default(0),
    sortOrder: sortOrder(),
  },
  (table) => [
    index('character_init_varied_mods_character_id_idx').on(table.characterId, table.sortOrder),
  ],
);

export const characterSpellbooks = pgTable(
  'character_spellbooks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    characterId: characterId(),
    className: text('class_name').notNull(),
    abilityLabel: text('ability_label').notNull(),
    kind: text('kind').notNull(),
    cantripLabel: text('cantrip_label').notNull().default(''),
    cantripSpells: text('cantrip_spells').array().notNull().default([]),
    sortOrder: sortOrder(),
  },
  (table) => [
    index('character_spellbooks_character_id_idx').on(table.characterId, table.sortOrder),
  ],
);

export const characterSpellCircles = pgTable(
  'character_spell_circles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    spellbookId: uuid('spellbook_id')
      .notNull()
      .references(() => characterSpellbooks.id, { onDelete: 'cascade' }),
    characterId: characterId(),
    label: text('label').notNull(),
    used: integer('used').notNull().default(0),
    max: integer('max').notNull().default(0),
    spells: text('spells').array().notNull().default([]),
    sortOrder: sortOrder(),
  },
  (table) => [
    index('character_spell_circles_character_id_idx').on(table.characterId, table.sortOrder),
    index('character_spell_circles_spellbook_id_idx').on(table.spellbookId),
  ],
);

export const characterSkills = pgTable(
  'character_skills',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    characterId: characterId(),
    key: text('key').notNull(),
    name: text('name').notNull(),
    ability: text('ability').notNull(),
    classSkill: boolean('class_skill').notNull().default(false),
    trainedOnly: boolean('trained_only').notNull().default(false),
    ranks: integer('ranks').notNull().default(0),
    conditional: text('conditional'),
    sortOrder: sortOrder(),
  },
  (table) => [index('character_skills_character_id_idx').on(table.characterId, table.sortOrder)],
);

export const characterSkillMods = pgTable(
  'character_skill_mods',
  {
    id: uuid('id').primaryKey(),
    skillId: uuid('skill_id')
      .notNull()
      .references(() => characterSkills.id, { onDelete: 'cascade' }),
    characterId: characterId(),
    label: text('label').notNull(),
    value: integer('value').notNull().default(0),
    sortOrder: sortOrder(),
  },
  (table) => [
    index('character_skill_mods_character_id_idx').on(table.characterId, table.sortOrder),
    index('character_skill_mods_skill_id_idx').on(table.skillId),
  ],
);

export const characterConditionalMods = pgTable(
  'character_conditional_mods',
  {
    id: uuid('id').primaryKey(),
    characterId: characterId(),
    text: text('text').notNull(),
    sortOrder: sortOrder(),
  },
  (table) => [
    index('character_conditional_mods_character_id_idx').on(table.characterId, table.sortOrder),
  ],
);

export const characterWeapons = pgTable(
  'character_weapons',
  {
    id: uuid('id').primaryKey(),
    characterId: characterId(),
    name: text('name').notNull(),
    atk: text('atk').notNull().default(''),
    crit: text('crit').notNull().default(''),
    dmg: text('dmg').notNull().default(''),
    type: text('type').notNull().default(''),
    range: text('range').notNull().default(''),
    desc: text('desc').notNull().default(''),
    hasAmmo: boolean('has_ammo').notNull().default(false),
    ammoCurrent: integer('ammo_current').notNull().default(0),
    ammoMax: integer('ammo_max').notNull().default(0),
    sortOrder: sortOrder(),
  },
  (table) => [index('character_weapons_character_id_idx').on(table.characterId, table.sortOrder)],
);

export const characterWeaponAmmoLog = pgTable(
  'character_weapon_ammo_log',
  {
    id: uuid('id').primaryKey(),
    weaponId: uuid('weapon_id')
      .notNull()
      .references(() => characterWeapons.id, { onDelete: 'cascade' }),
    characterId: characterId(),
    delta: integer('delta').notNull(),
    sortOrder: sortOrder(),
  },
  (table) => [
    index('character_weapon_ammo_log_character_id_idx').on(table.characterId, table.sortOrder),
    index('character_weapon_ammo_log_weapon_id_idx').on(table.weaponId),
  ],
);

export const characterFeats = pgTable(
  'character_feats',
  {
    id: uuid('id').primaryKey(),
    characterId: characterId(),
    name: text('name').notNull(),
    tag: text('tag').notNull().default(''),
    desc: text('desc').notNull().default(''),
    sortOrder: sortOrder(),
  },
  (table) => [index('character_feats_character_id_idx').on(table.characterId, table.sortOrder)],
);

/** Covers both `Character.spellLikeAbilities` and `Character.specials` — same shape, told apart
 * by `kind`. */
export const characterSpecialAbilities = pgTable(
  'character_special_abilities',
  {
    id: uuid('id').primaryKey(),
    characterId: characterId(),
    kind: text('kind').notNull(), // 'spell-like' | 'special'
    name: text('name').notNull(),
    subtitle: text('subtitle').notNull().default(''),
    uses: text('uses').notNull().default(''),
    desc: text('desc').notNull().default(''),
    sortOrder: sortOrder(),
  },
  (table) => [
    index('character_special_abilities_character_id_idx').on(table.characterId, table.sortOrder),
  ],
);

export const characterEquipment = pgTable(
  'character_equipment',
  {
    id: uuid('id').primaryKey(),
    characterId: characterId(),
    name: text('name').notNull(),
    qty: integer('qty').notNull().default(1),
    unitWeight: real('unit_weight').notNull().default(0),
    sortOrder: sortOrder(),
  },
  (table) => [index('character_equipment_character_id_idx').on(table.characterId, table.sortOrder)],
);

export const characterArmorItems = pgTable(
  'character_armor_items',
  {
    id: uuid('id').primaryKey(),
    characterId: characterId(),
    name: text('name').notNull(),
    bonus: integer('bonus').notNull().default(0),
    checkPenalty: integer('check_penalty').notNull().default(0),
    arcaneFailure: integer('arcane_failure').notNull().default(0),
    weight: real('weight').notNull().default(0),
    sortOrder: sortOrder(),
  },
  (table) => [
    index('character_armor_items_character_id_idx').on(table.characterId, table.sortOrder),
  ],
);

/**
 * A full point-in-time copy of the character, taken automatically on level-up or right before a
 * restore overwrites the live data — see LevelSnapshot/CharacterSnapshotData in
 * entities/character/model/types.ts. `parent_id` self-references to chain snapshots into a tree
 * (restoring an old snapshot forks the timeline rather than truncating it). Unlike every other
 * character table, `data` is a serialized (JSON.stringify) text blob rather than real columns:
 * a snapshot is immutable, point-in-time, and never queried field-by-field — it's read back
 * whole or not at all — so normalizing it into ~20 more snapshot-shaped tables would add pure
 * modeling overhead with no relational benefit, unlike the live character data above.
 */
export const characterSnapshots = pgTable(
  'character_snapshots',
  {
    id: uuid('id').primaryKey(),
    characterId: characterId(),
    parentId: uuid('parent_id').references((): AnyPgColumn => characterSnapshots.id, {
      onDelete: 'set null',
    }),
    level: integer('level').notNull().default(1),
    kind: text('kind').notNull(), // 'level-up' | 'restore-point'
    label: text('label').notNull(),
    date: text('date').notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    data: text('data').notNull(),
    sortOrder: sortOrder(),
  },
  (table) => [
    index('character_snapshots_character_id_idx').on(table.characterId, table.sortOrder),
    index('character_snapshots_parent_id_idx').on(table.parentId),
  ],
);

export const characterSessionLog = pgTable(
  'character_session_log',
  {
    id: uuid('id').primaryKey(),
    characterId: characterId(),
    title: text('title').notNull(),
    date: text('date').notNull(),
    summary: text('summary').notNull().default(''),
    sortOrder: sortOrder(),
  },
  (table) => [
    index('character_session_log_character_id_idx').on(table.characterId, table.sortOrder),
  ],
);

/**
 * Owner-to-user sharing grants — replaces the old public-link model. Not stored on the
 * character itself: the recipient isn't the character's owner, so this has to be queryable
 * across everyone's characters, which a value nested inside one owner's row can't do.
 * Always view-only for the recipient; enforced by never exposing a write endpoint the recipient
 * could call, not by a flag on this row.
 */
export const characterShares = pgTable(
  'character_shares',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    characterId: uuid('character_id')
      .notNull()
      .references(() => characters.id, { onDelete: 'cascade' }),
    sharedWithUserId: uuid('shared_with_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('character_shares_unique').on(table.characterId, table.sharedWithUserId),
    index('character_shares_shared_with_idx').on(table.sharedWithUserId),
  ],
);

/** Shared reference catalog, one table per library category — see entities/library-item/model/types.ts. */

const librarySystemId = () =>
  text('system_id')
    .notNull()
    .references(() => systems.id, { onDelete: 'cascade' });

export const librarySpells = pgTable('library_spells', {
  id: uuid('id').primaryKey(),
  systemId: librarySystemId(),
  name: text('name').notNull(),
  school: text('school').notNull(),
  circle: integer('circle').notNull(),
  castTime: text('cast_time').notNull(),
  range: text('range').notNull(),
  duration: text('duration').notNull(),
  resistance: text('resistance').notNull(),
  desc: text('desc').notNull(),
});

export const libraryWeapons = pgTable('library_weapons', {
  id: uuid('id').primaryKey(),
  systemId: librarySystemId(),
  name: text('name').notNull(),
  atk: text('atk').notNull(),
  crit: text('crit').notNull(),
  dmg: text('dmg').notNull(),
  type: text('type').notNull(),
  range: text('range').notNull(),
  desc: text('desc').notNull(),
  hasAmmo: boolean('has_ammo').notNull().default(false),
  ammoMax: integer('ammo_max').notNull().default(0),
});

export const librarySpecialAbilities = pgTable('library_special_abilities', {
  id: uuid('id').primaryKey(),
  systemId: librarySystemId(),
  name: text('name').notNull(),
  subtitle: text('subtitle').notNull(),
  uses: text('uses').notNull(),
  desc: text('desc').notNull(),
});

export const libraryFeats = pgTable('library_feats', {
  id: uuid('id').primaryKey(),
  systemId: librarySystemId(),
  name: text('name').notNull(),
  desc: text('desc').notNull(),
  tag: text('tag').notNull(),
});

export const librarySkills = pgTable('library_skills', {
  id: uuid('id').primaryKey(),
  systemId: librarySystemId(),
  name: text('name').notNull(),
  desc: text('desc').notNull(),
  tag: text('tag').notNull(),
});

export const libraryLanguages = pgTable('library_languages', {
  id: uuid('id').primaryKey(),
  systemId: librarySystemId(),
  name: text('name').notNull(),
  desc: text('desc').notNull(),
  tag: text('tag').notNull(),
});

export const libraryCreatures = pgTable('library_creatures', {
  id: uuid('id').primaryKey(),
  systemId: librarySystemId(),
  name: text('name').notNull(),
  desc: text('desc').notNull(),
  tag: text('tag').notNull(),
});
