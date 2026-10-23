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
/** Every character field backed by a Postgres `integer` column (as opposed to `real`) is
 * validated with this instead of a bare `z.number()` — matches int4's actual range/precision,
 * so an out-of-range or non-integer value 400s here instead of crashing the DB write with a 500. */
const int4 = z.number().int().min(-2147483648).max(2147483647);

export const shareBodySchema = z.object({ userId: uuid });

// A single resized/compressed photo comfortably fits in a few hundred KB as a data URL; this is
// a generous ceiling against abuse, not a real-world size — same reasoning as
// MAX_CHARACTER_JSON_LENGTH below, just scoped to one photo instead of the whole character.
export const MAX_PHOTO_DATA_URL_LENGTH = 2_000_000;

const BASE64_IMAGE_DATA_URL_RE = /^data:image\/(png|jpe?g|gif|webp);base64,([A-Za-z0-9+/]+=*)$/i;

/** Magic-byte signatures for the four raster formats the app actually produces and accepts (see
 * the client-side extension allowlists and `shared/lib/image.ts`), checked against the
 * *decoded* bytes — not the data URL's own declared MIME subtype, which the caller fully
 * controls and which `startsWith('data:image/')` alone never verified. Without this,
 * `data:image/png;base64,<actually SVG/HTML/anything>` sails straight through: SVG in
 * particular can carry a `<script>`, and while browsers block script execution for an SVG
 * rendered via `<img>`, it still runs if that data URL is ever opened directly (e.g. "open
 * image in new tab"). Rejecting anything that isn't a real PNG/JPEG/GIF/WEBP closes that off at
 * the boundary instead of relying on how every current and future caller happens to render it. */
function hasKnownImageSignature(bytes: Buffer): boolean {
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return true; // PNG
  }
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return true; // JPEG
  }
  if (
    bytes.length >= 6 &&
    bytes.toString('ascii', 0, 3) === 'GIF' &&
    (bytes.toString('ascii', 3, 6) === '87a' || bytes.toString('ascii', 3, 6) === '89a')
  ) {
    return true; // GIF
  }
  if (
    bytes.length >= 12 &&
    bytes.toString('ascii', 0, 4) === 'RIFF' &&
    bytes.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return true; // WEBP
  }
  return false;
}

/** A `data:` URL holding one of PNG/JPEG/GIF/WEBP, verified against the decoded bytes' own magic
 * number (see `hasKnownImageSignature`) rather than just the string's declared MIME type. Used
 * everywhere an image gets persisted: the character photo gallery, the character's mirrored
 * `photoUrl`, and the account avatar (`updateProfileBodySchema.avatarUrl` below) — exported so
 * every one of those call sites shares the same check instead of each inventing (or skipping)
 * its own. */
export function imageDataUrl(maxLength: number) {
  return z
    .string()
    .min(1)
    .max(maxLength)
    .refine((value) => {
      const match = BASE64_IMAGE_DATA_URL_RE.exec(value);
      if (!match) return false;
      return hasKnownImageSignature(Buffer.from(match[2], 'base64'));
    }, 'Arquivo não é uma imagem válida (PNG, JPEG, GIF ou WEBP).');
}

export const photoBodySchema = z.object({
  dataUrl: imageDataUrl(MAX_PHOTO_DATA_URL_LENGTH),
});

/** PATCH /api/user — self-service profile update. `avatarUrl` goes through the same
 * `imageDataUrl` check as every other persisted image (previously `z.string().max(500_000)`,
 * with no content validation at all — this account avatar is shown to every admin in
 * `UsersManagementPanel` and to anyone picked in `SharePickerDialog`, so a forged payload here
 * had the same reach as the character photo gap this file's `imageDataUrl` was built to close). */
export const updateProfileBodySchema = z.object({
  name: z.string().min(1),
  username: z.string().min(3),
  avatarUrl: imageDataUrl(500_000).nullable().optional(),
});

export const MAX_CHARACTER_JSON_LENGTH = 2_000_000;

/**
 * The character sheet's full shape, modeled field-for-field against
 * `src/entities/character/model/types.ts`. Storage is now relational (see
 * `api/_lib/characterRepo.ts`), not a JSONB passthrough — a payload missing a required nested
 * object or array used to just get stored as-is; now it would crash `characterRepo`'s
 * decomposition into rows (a `TypeError` from a missing field access), so the shape has to be
 * validated at the boundary instead.
 */
const variedModSchema = z.object({ id: uuid, label: z.string(), value: int4 });
const abilityLogEntrySchema = z.object({
  id: uuid,
  type: z.enum(['dano', 'dreno']),
  delta: int4,
  desc: z.string(),
});
const abilitySchema = z.object({
  base: int4,
  mods: z.array(variedModSchema),
  damage: int4,
  drain: int4,
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
const characterClassSchema = z.object({ id: uuid, name: z.string(), level: int4 });
const identitySchema = z.object({
  raca: z.string(),
  tipoCriatura: z.string(),
  subtipoCriatura: z.string(),
  tamanho: z.enum(['', 'Miúdo', 'Diminuto', 'Pequeno', 'Médio', 'Grande', 'Enorme', 'Colossal']),
  sexo: z.string(),
  idadeNum: int4,
  alturaNum: z.number(),
  pesoNum: z.number(),
  cabelo: z.string(),
  olhos: z.string(),
  divindade: z.string(),
  terraNatal: z.string(),
});
const speedSchema = z.object({
  base: int4,
  armor: int4,
  fly: int4,
  flyManeuverability: z.string(),
  swim: int4,
  climb: int4,
  dig: int4,
});
const saveBlockSchema = z.object({
  base: int4,
  magic: int4,
  misc: int4,
  temp: int4,
});
const savesSchema = z.object({
  fort: saveBlockSchema,
  ref: saveBlockSchema,
  will: saveBlockSchema,
});
const languageSchema = z.object({ id: uuid, name: z.string() });
const hpLogEntrySchema = z.object({
  id: uuid,
  delta: int4,
  kind: z.enum(['letal', 'nao-letal']),
});
const drItemSchema = z.object({
  id: uuid,
  type: z.string(),
  immune: z.boolean(),
  amount: int4,
});
const skillSchema = z.object({
  key: z.string(),
  name: z.string(),
  ability: abilityKeySchema,
  classSkill: z.boolean(),
  trainedOnly: z.boolean(),
  ranks: int4,
  mods: z.array(variedModSchema),
  conditional: z.string().optional(),
});
const ammoLogEntrySchema = z.object({ id: uuid, delta: int4 });
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
  ammoCurrent: int4,
  ammoMax: int4,
  ammoLog: z.array(ammoLogEntrySchema),
});
const characterFeatSchema = z.object({
  id: uuid,
  name: z.string(),
  tag: z.string(),
  resumo: z.string(),
  prerequisite: z.string(),
  benefit: z.string(),
  fonte: z.string(),
  desc: z.string(),
});
const characterSpecialAbilitySchema = z.object({
  id: uuid,
  name: z.string(),
  subtitle: z.string(),
  uses: z.string(),
  resumo: z.string(),
  fonte: z.string(),
  desc: z.string(),
});
const characterSpellLikeAbilitySchema = z.object({
  id: uuid,
  name: z.string(),
  spells: z.string(),
  usesPerDay: z.string(),
  casterLevel: z.string(),
  desc: z.string(),
});
const conditionalModSchema = z.object({ id: uuid, text: z.string() });
const moneySchema = z.object({ pc: int4, pp: int4, po: int4, pl: int4 });
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
  qty: int4,
  unitWeight: z.number(),
});
const armorItemSchema = z.object({
  id: uuid,
  name: z.string(),
  bonus: int4,
  checkPenalty: int4,
  arcaneFailure: int4,
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
  used: int4,
  max: int4,
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
  photoUrl: imageDataUrl(MAX_PHOTO_DATA_URL_LENGTH).nullable(),
  favorited: z.boolean(),
  active: z.boolean(),
  identity: identitySchema,
  alignmentLaw: z.enum(['', 'Ordeiro', 'Neutro', 'Caótico']),
  alignmentMoral: z.enum(['', 'Bom', 'Neutro', 'Mau']),
  classes: z.array(characterClassSchema),
  speed: speedSchema,
  languages: z.array(languageSchema),
  story: z.string(),
  xpEnabled: z.boolean(),
  xpCurrent: int4,
  xpMax: int4,
  hpCurrent: int4,
  hpMax: int4,
  tempHp: int4,
  hpNonLethal: int4,
  hpLog: z.array(hpLogEntrySchema),
  drItems: z.array(drItemSchema),
  abilities: abilitiesSchema,
  acArmor: int4,
  acShield: int4,
  acNatural: int4,
  acDeflection: int4,
  acVariedMods: z.array(variedModSchema),
  initVariedMods: z.array(variedModSchema),
  saves: savesSchema,
  bbaValue: int4,
  rmValue: int4,
  favoredSchool: z.string(),
  opposedSchools: z.array(z.string()),
  spellbooks: z.array(spellcastingBlockSchema),
  spellLikeAbilities: z.array(characterSpellLikeAbilitySchema),
  skills: z.array(skillSchema),
  conditionalMods: z.array(conditionalModSchema),
  weapons: z.array(characterWeaponSchema),
  notasAdicionais: z.string(),
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
  level: int4,
  kind: z.enum(['level-up', 'restore-point', 'start', 'manual']),
  label: z.string(),
  date: z.string(),
  deletedAt: z.string().nullable(),
  // Deliberately not `characterSnapshotDataSchema`: a snapshot's `data` is only ever written via
  // `JSON.stringify` and read back via `JSON.parse` (see characterRepo.ts) — nothing in the write
  // path dereferences a field on it, so pinning it to the *current* Character shape would reject
  // every save of a character with snapshot history the day a required field is ever added to
  // Character, not just going forward. Still required to be a real object (not null/an array/a
  // primitive), just not shape-checked against today's schema.
  data: z.record(z.string(), z.unknown()),
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
  resumo: z.string(),
  fonte: z.string(),
  desc: z.string(),
});

export const genericLibraryItemSchema = z.object({
  id: uuid,
  name: z.string().min(1),
  desc: z.string(),
  tag: z.string(),
});

export const featItemSchema = z.object({
  id: uuid,
  name: z.string().min(1),
  tag: z.string(),
  resumo: z.string(),
  prerequisite: z.string(),
  benefit: z.string(),
  fonte: z.string(),
  desc: z.string(),
});
