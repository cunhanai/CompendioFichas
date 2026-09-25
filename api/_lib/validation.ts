import { z } from 'zod';

export const signupBodySchema = z.object({
  username: z.string().min(3, 'Escolha um nome de usuário com ao menos 3 caracteres'),
  password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres'),
});

export const loginBodySchema = z.object({
  username: z.string().min(1, 'Digite seu nome de usuário'),
  password: z.string().min(6, 'A senha deve ter ao menos 6 caracteres'),
});

export const passwordChangeBodySchema = z.object({
  currentPassword: z.string().min(1, 'Informe a senha atual'),
  newPassword: z.string().min(6, 'A nova senha deve ter ao menos 6 caracteres'),
});

export const adminUpdateUserBodySchema = z
  .object({
    active: z.boolean().optional(),
    isAdmin: z.boolean().optional(),
  })
  .refine((data) => data.active !== undefined || data.isAdmin !== undefined, {
    message: 'Nada para atualizar.',
  });

const uuid = z.uuid();

export const shareBodySchema = z.object({ userId: uuid });

export const MAX_CHARACTER_JSON_LENGTH = 2_000_000;

/**
 * The character sheet's full shape, modeled field-for-field against
 * `src/entities/character/model/types.ts`. Storage is now relational (see
 * `api/_lib/characterRepo.ts`), not a JSONB passthrough — a payload missing a required nested
 * object or array used to just get stored as-is; now it would crash `characterRepo`'s
 * decomposition into rows (a `TypeError` from a missing field access), so the shape has to be
 * validated at the boundary instead.
 */
const variedModSchema = z.object({ id: uuid, label: z.string(), value: z.number() });
const abilityLogEntrySchema = z.object({
  id: uuid,
  type: z.enum(['dano', 'dreno']),
  delta: z.number(),
  desc: z.string(),
});
const abilitySchema = z.object({
  base: z.number(),
  mods: z.array(variedModSchema),
  damage: z.number(),
  drain: z.number(),
  log: z.array(abilityLogEntrySchema),
});
const abilityKeySchema = z.enum(['str', 'dex', 'con', 'int', 'wis', 'cha']);
const abilitiesSchema = z.object({
  str: abilitySchema,
  dex: abilitySchema,
  con: abilitySchema,
  int: abilitySchema,
  wis: abilitySchema,
  cha: abilitySchema,
});
const characterClassSchema = z.object({ id: uuid, name: z.string(), level: z.number().int() });
const identitySchema = z.object({
  raca: z.string(),
  tamanho: z.enum(['Miúdo', 'Diminuto', 'Pequeno', 'Médio', 'Grande', 'Enorme', 'Colossal']),
  sexo: z.string(),
  idadeNum: z.number(),
  alturaNum: z.number(),
  pesoNum: z.number(),
  cabelo: z.string(),
  olhos: z.string(),
  divindade: z.string(),
  terraNatal: z.string(),
});
const speedSchema = z.object({
  base: z.number(),
  armor: z.number(),
  fly: z.number(),
  flyManeuverability: z.string(),
  swim: z.number(),
  climb: z.number(),
  dig: z.number(),
});
const saveBlockSchema = z.object({
  base: z.number(),
  magic: z.number(),
  misc: z.number(),
  temp: z.number(),
});
const savesSchema = z.object({
  fort: saveBlockSchema,
  ref: saveBlockSchema,
  will: saveBlockSchema,
});
const languageSchema = z.object({ id: uuid, name: z.string() });
const hpLogEntrySchema = z.object({
  id: uuid,
  delta: z.number(),
  kind: z.enum(['letal', 'nao-letal']),
});
const drItemSchema = z.object({
  id: uuid,
  type: z.string(),
  immune: z.boolean(),
  amount: z.number(),
});
const skillSchema = z.object({
  key: z.string(),
  name: z.string(),
  ability: abilityKeySchema,
  classSkill: z.boolean(),
  trainedOnly: z.boolean(),
  ranks: z.number(),
  mods: z.array(variedModSchema),
  conditional: z.string().optional(),
});
const ammoLogEntrySchema = z.object({ id: uuid, delta: z.number() });
const characterWeaponSchema = z.object({
  id: uuid,
  name: z.string(),
  atk: z.string(),
  crit: z.string(),
  dmg: z.string(),
  type: z.string(),
  range: z.string(),
  desc: z.string(),
  hasAmmo: z.boolean(),
  ammoCurrent: z.number(),
  ammoMax: z.number(),
  ammoLog: z.array(ammoLogEntrySchema),
});
const characterFeatSchema = z.object({
  id: uuid,
  name: z.string(),
  tag: z.string(),
  desc: z.string(),
});
const characterSpecialAbilitySchema = z.object({
  id: uuid,
  name: z.string(),
  subtitle: z.string(),
  uses: z.string(),
  desc: z.string(),
});
const conditionalModSchema = z.object({ id: uuid, text: z.string() });
const moneySchema = z.object({ pc: z.number(), pp: z.number(), po: z.number(), pl: z.number() });
const loadSchema = z.object({
  light: z.number(),
  medium: z.number(),
  heavy: z.number(),
  overhead: z.number(),
  ground: z.number(),
  drag: z.number(),
});
const equipmentItemSchema = z.object({
  id: uuid,
  name: z.string(),
  qty: z.number(),
  unitWeight: z.number(),
});
const armorItemSchema = z.object({
  id: uuid,
  name: z.string(),
  bonus: z.number(),
  checkPenalty: z.number(),
  arcaneFailure: z.number(),
  weight: z.number(),
});
const sessionLogEntrySchema = z.object({
  id: uuid,
  title: z.string(),
  date: z.string(),
  summary: z.string(),
});
const spellSlotSchema = z.object({
  label: z.string(),
  used: z.number(),
  max: z.number(),
  spells: z.array(z.string()),
});
const spellcastingBlockSchema = z.object({
  className: z.string(),
  abilityLabel: z.string(),
  kind: z.enum(['espontânea', 'preparada']),
  cantrips: z.object({ label: z.string(), spells: z.array(z.string()) }),
  circles: z.array(spellSlotSchema),
});

/** Everything about a character except its own snapshot tree/pointer — mirrors
 * `CharacterSnapshotData` (`Omit<Character, 'levelSnapshots' | 'currentSnapshotId'>`). */
const characterSnapshotDataSchema = z.object({
  id: uuid,
  systemId: z.string().min(1),
  name: z.string(),
  photoUrl: z.string().nullable(),
  favorited: z.boolean(),
  active: z.boolean(),
  identity: identitySchema,
  alignmentLaw: z.enum(['Ordeiro', 'Neutro', 'Caótico']),
  alignmentMoral: z.enum(['Bom', 'Neutro', 'Mau']),
  classes: z.array(characterClassSchema),
  speed: speedSchema,
  languages: z.array(languageSchema),
  story: z.string(),
  xpEnabled: z.boolean(),
  xpCurrent: z.number(),
  xpMax: z.number(),
  hpCurrent: z.number(),
  hpMax: z.number(),
  tempHp: z.number(),
  hpNonLethal: z.number(),
  hpLog: z.array(hpLogEntrySchema),
  drItems: z.array(drItemSchema),
  abilities: abilitiesSchema,
  acArmor: z.number(),
  acShield: z.number(),
  acNatural: z.number(),
  acDeflection: z.number(),
  acVariedMods: z.array(variedModSchema),
  initVariedMods: z.array(variedModSchema),
  saves: savesSchema,
  bbaValue: z.number(),
  rmValue: z.number(),
  favoredSchool: z.string(),
  opposedSchools: z.array(z.string()),
  spellbooks: z.array(spellcastingBlockSchema),
  spellLikeAbilities: z.array(characterSpecialAbilitySchema),
  skills: z.array(skillSchema),
  conditionalMods: z.array(conditionalModSchema),
  weapons: z.array(characterWeaponSchema),
  feats: z.array(characterFeatSchema),
  specials: z.array(characterSpecialAbilitySchema),
  money: moneySchema,
  load: loadSchema,
  equipment: z.array(equipmentItemSchema),
  armorItems: z.array(armorItemSchema),
  sessionLog: z.array(sessionLogEntrySchema),
  lastAccessedAt: z.string(),
});

const levelSnapshotSchema = z.object({
  id: uuid,
  parentId: uuid.nullable(),
  level: z.number(),
  kind: z.enum(['level-up', 'restore-point']),
  label: z.string(),
  date: z.string(),
  deletedAt: z.string().nullable(),
  data: characterSnapshotDataSchema,
});

export const characterBodySchema = characterSnapshotDataSchema.extend({
  levelSnapshots: z.array(levelSnapshotSchema),
  currentSnapshotId: uuid.nullable(),
});

export const spellItemSchema = z.object({
  id: uuid,
  name: z.string().min(1),
  school: z.string(),
  circle: z.number().int().min(0),
  castTime: z.string(),
  range: z.string(),
  duration: z.string(),
  resistance: z.string(),
  desc: z.string(),
});

export const weaponItemSchema = z.object({
  id: uuid,
  name: z.string().min(1),
  atk: z.string(),
  crit: z.string(),
  dmg: z.string(),
  type: z.string(),
  range: z.string(),
  desc: z.string(),
  hasAmmo: z.boolean(),
  ammoMax: z.number().int().min(0),
});

export const specialItemSchema = z.object({
  id: uuid,
  name: z.string().min(1),
  subtitle: z.string(),
  uses: z.string(),
  desc: z.string(),
});

export const genericLibraryItemSchema = z.object({
  id: uuid,
  name: z.string().min(1),
  desc: z.string(),
  tag: z.string(),
});
