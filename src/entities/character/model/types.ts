export type AbilityKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

export type Size = 'Miúdo' | 'Diminuto' | 'Pequeno' | 'Médio' | 'Grande' | 'Enorme' | 'Colossal';

export type AlignmentLaw = 'Ordeiro' | 'Neutro' | 'Caótico';
export type AlignmentMoral = 'Bom' | 'Neutro' | 'Mau';

export interface VariedMod {
  id: string;
  label: string;
  value: number;
}

export interface AbilityLogEntry {
  id: string;
  type: 'dano' | 'dreno';
  delta: number;
  desc: string;
}

export interface Ability {
  base: number;
  mods: VariedMod[];
  damage: number;
  drain: number;
  log: AbilityLogEntry[];
}

export type Abilities = Record<AbilityKey, Ability>;

export interface CharacterClass {
  id: string;
  name: string;
  level: number;
}

export interface Identity {
  raca: string;
  tamanho: Size;
  sexo: string;
  idadeNum: number;
  alturaNum: number;
  pesoNum: number;
  cabelo: string;
  olhos: string;
  divindade: string;
  terraNatal: string;
}

export interface Speed {
  base: number;
  armor: number;
  fly: number;
  flyManeuverability: string;
  swim: number;
  climb: number;
  dig: number;
}

export interface SaveBlock {
  base: number;
  magic: number;
  misc: number;
  temp: number;
}

export interface Saves {
  fort: SaveBlock;
  ref: SaveBlock;
  will: SaveBlock;
}

export interface Skill {
  key: string;
  name: string;
  ability: AbilityKey;
  classSkill: boolean;
  trainedOnly: boolean;
  ranks: number;
  mods: VariedMod[];
  conditional?: string;
}

export interface AmmoLogEntry {
  id: string;
  delta: number;
}

export interface Weapon {
  id: string;
  name: string;
  atk: string;
  crit: string;
  dmg: string;
  type: string;
  range: string;
  desc: string;
  hasAmmo: boolean;
  ammoCurrent: number;
  ammoMax: number;
  ammoLog: AmmoLogEntry[];
}

export interface Feat {
  id: string;
  name: string;
  tag: string;
  desc: string;
}

export interface SpecialAbility {
  id: string;
  name: string;
  subtitle: string;
  uses: string;
  desc: string;
}

export interface ConditionalMod {
  id: string;
  text: string;
}

export interface DrItem {
  id: string;
  type: string;
  immune: boolean;
  amount: number;
}

export interface HpLogEntry {
  id: string;
  delta: number;
  kind: 'letal' | 'nao-letal';
}

export interface Language {
  id: string;
  name: string;
}

export interface Money {
  pc: number;
  pp: number;
  po: number;
  pl: number;
}

export interface Load {
  light: number;
  medium: number;
  heavy: number;
  overhead: number;
  ground: number;
  drag: number;
}

export interface EquipmentItem {
  id: string;
  name: string;
  qty: number;
  unitWeight: number;
}

/** Armor/shield items — tracked separately because they also carry AC-relevant stats. */
export interface ArmorItem {
  id: string;
  name: string;
  bonus: number;
  checkPenalty: number;
  arcaneFailure: number;
  weight: number;
}

export interface SessionLogEntry {
  id: string;
  title: string;
  date: string;
  summary: string;
}

/**
 * A full point-in-time copy of the character, taken automatically on level-up or right before a
 * restore overwrites the live data. `parentId` chains snapshots into a tree, not a flat list:
 * restoring to an older snapshot forks the timeline — new snapshots continue from the restored
 * node, while whatever came after the restore point on the old branch is preserved, just no
 * longer part of the active lineage. `data` deliberately excludes `levelSnapshots` and
 * `currentSnapshotId` themselves (nothing here nests a copy of the tree inside itself), and
 * `deletedAt` is a soft delete — nothing is ever actually removed, see model/mutations.ts for
 * which snapshots can be deleted.
 */
export interface LevelSnapshot {
  id: string;
  parentId: string | null;
  level: number;
  kind: 'level-up' | 'restore-point';
  label: string;
  date: string;
  deletedAt: string | null;
  data: CharacterSnapshotData;
}

/** Everything about a character except its own snapshot tree/pointer — see LevelSnapshot. */
export type CharacterSnapshotData = Omit<Character, 'levelSnapshots' | 'currentSnapshotId'>;

export interface SpellSlot {
  label: string;
  used: number;
  max: number;
  spells: string[];
}

export interface SpellcastingBlock {
  className: string;
  abilityLabel: string;
  kind: 'espontânea' | 'preparada';
  cantrips: { label: string; spells: string[] };
  circles: SpellSlot[];
}

export interface Character {
  id: string;
  systemId: string;
  name: string;
  photoUrl: string | null;
  favorited: boolean;
  active: boolean;

  identity: Identity;
  alignmentLaw: AlignmentLaw;
  alignmentMoral: AlignmentMoral;
  classes: CharacterClass[];
  speed: Speed;
  languages: Language[];
  story: string;

  xpEnabled: boolean;
  xpCurrent: number;
  xpMax: number;

  hpCurrent: number;
  hpMax: number;
  tempHp: number;
  hpNonLethal: number;
  hpLog: HpLogEntry[];
  drItems: DrItem[];

  abilities: Abilities;

  acArmor: number;
  acShield: number;
  acNatural: number;
  acDeflection: number;
  acVariedMods: VariedMod[];
  initVariedMods: VariedMod[];
  saves: Saves;
  bbaValue: number;
  rmValue: number;

  favoredSchool: string;
  opposedSchools: string[];
  spellbooks: SpellcastingBlock[];
  spellLikeAbilities: SpecialAbility[];

  skills: Skill[];
  conditionalMods: ConditionalMod[];

  weapons: Weapon[];

  feats: Feat[];
  specials: SpecialAbility[];

  money: Money;
  load: Load;
  equipment: EquipmentItem[];
  armorItems: ArmorItem[];

  /** All snapshots ever taken, active lineage and abandoned branches alike — see LevelSnapshot. */
  levelSnapshots: LevelSnapshot[];
  /** The snapshot the live character currently descends from — walking `parentId` from here
   * back to a root is "the active lineage"; anything else is an "other branch". Null until the
   * first level-up snapshot exists. */
  currentSnapshotId: string | null;
  sessionLog: SessionLogEntry[];

  lastAccessedAt: string;
}
