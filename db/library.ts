import { and, desc, eq, inArray, isNotNull, isNull } from 'drizzle-orm';
import { db } from './client.js';
import type {
  FeatLibraryItem,
  LibraryCategory,
  LibraryItem,
  SharedLibrary,
  SpecialLibraryItem,
  SpellLibraryItem,
  WeaponLibraryItem,
} from '../src/entities/library-item/model/types.js';
import {
  libraryClasses,
  libraryCreatures,
  libraryCreatureTypes,
  libraryFeats,
  libraryLanguages,
  libraryRaces,
  librarySkills,
  librarySpecialAbilities,
  librarySpells,
  libraryWeapons,
} from './schema.js';

/** Maps each shared-library category to the table holding it — one table per category, no shared blob. */
export const LIBRARY_TABLES = {
  magias: librarySpells,
  armas: libraryWeapons,
  habilidades: librarySpecialAbilities,
  talentos: libraryFeats,
  pericias: librarySkills,
  idiomas: libraryLanguages,
  criaturas: libraryCreatures,
  classes: libraryClasses,
  racas: libraryRaces,
  tipos: libraryCreatureTypes,
} satisfies Record<LibraryCategory, unknown>;

export function isLibraryCategory(value: string): value is LibraryCategory {
  return Object.hasOwn(LIBRARY_TABLES, value);
}

function emptyLibrary(systemId: string): SharedLibrary {
  return {
    systemId,
    magias: [],
    talentos: [],
    pericias: [],
    habilidades: [],
    armas: [],
    idiomas: [],
    criaturas: [],
    classes: [],
    racas: [],
    tipos: [],
  };
}

/** Assembles one SharedLibrary per system id from the category tables. */
export async function loadLibraries(systemIds: string[]): Promise<Record<string, SharedLibrary>> {
  const libraries: Record<string, SharedLibrary> = {};
  for (const systemId of systemIds) libraries[systemId] = emptyLibrary(systemId);
  if (systemIds.length === 0) return libraries;

  const [spells, weapons, specials, feats, skills, languages, creatures, classes, races, types] =
    await Promise.all([
      db
        .select()
        .from(librarySpells)
        .where(and(inArray(librarySpells.systemId, systemIds), isNull(librarySpells.deletedAt))),
      db
        .select()
        .from(libraryWeapons)
        .where(and(inArray(libraryWeapons.systemId, systemIds), isNull(libraryWeapons.deletedAt))),
      db
        .select()
        .from(librarySpecialAbilities)
        .where(
          and(
            inArray(librarySpecialAbilities.systemId, systemIds),
            isNull(librarySpecialAbilities.deletedAt),
          ),
        ),
      db
        .select()
        .from(libraryFeats)
        .where(and(inArray(libraryFeats.systemId, systemIds), isNull(libraryFeats.deletedAt))),
      db
        .select()
        .from(librarySkills)
        .where(and(inArray(librarySkills.systemId, systemIds), isNull(librarySkills.deletedAt))),
      db
        .select()
        .from(libraryLanguages)
        .where(
          and(inArray(libraryLanguages.systemId, systemIds), isNull(libraryLanguages.deletedAt)),
        ),
      db
        .select()
        .from(libraryCreatures)
        .where(
          and(inArray(libraryCreatures.systemId, systemIds), isNull(libraryCreatures.deletedAt)),
        ),
      db
        .select()
        .from(libraryClasses)
        .where(and(inArray(libraryClasses.systemId, systemIds), isNull(libraryClasses.deletedAt))),
      db
        .select()
        .from(libraryRaces)
        .where(and(inArray(libraryRaces.systemId, systemIds), isNull(libraryRaces.deletedAt))),
      db
        .select()
        .from(libraryCreatureTypes)
        .where(
          and(
            inArray(libraryCreatureTypes.systemId, systemIds),
            isNull(libraryCreatureTypes.deletedAt),
          ),
        ),
    ]);

  // `locale` comes back from drizzle typed as plain `string` (a text column) — cast to the
  // narrower `LibraryItemLocale` ('pt' | 'en') trusting the zod validation already done at
  // write time (libraryLocaleSchema, api/_lib/validation.ts), same pattern as toUserProfile's
  // libraryLocale cast in api/_lib/mappers.ts.
  for (const { systemId, deletedAt, ...item } of spells)
    libraries[systemId]?.magias.push(item as SpellLibraryItem);
  for (const { systemId, deletedAt, ...item } of weapons)
    libraries[systemId]?.armas.push(item as WeaponLibraryItem);
  for (const { systemId, deletedAt, ...item } of specials)
    libraries[systemId]?.habilidades.push(item as SpecialLibraryItem);
  for (const { systemId, deletedAt, ...item } of feats)
    libraries[systemId]?.talentos.push(item as FeatLibraryItem);
  for (const { systemId, deletedAt, ...item } of skills)
    libraries[systemId]?.pericias.push(item as LibraryItem);
  for (const { systemId, deletedAt, ...item } of languages)
    libraries[systemId]?.idiomas.push(item as LibraryItem);
  for (const { systemId, deletedAt, ...item } of creatures)
    libraries[systemId]?.criaturas.push(item as LibraryItem);
  for (const { systemId, deletedAt, ...item } of classes)
    libraries[systemId]?.classes.push(item as LibraryItem);
  for (const { systemId, deletedAt, ...item } of races)
    libraries[systemId]?.racas.push(item as LibraryItem);
  for (const { systemId, deletedAt, ...item } of types)
    libraries[systemId]?.tipos.push(item as LibraryItem);

  return libraries;
}

/** Soft-deletes or restores one library item — admin-only (enforced by the route handler, not
 * here). Scoped by BOTH `category` and `systemId`: without the `systemId` check, a crafted `id`
 * belonging to a different system's item would still match (it's a globally-unique uuid) and
 * get deleted/restored through the wrong system's endpoint — create and update already scope by
 * `systemId`, this closes the same gap for delete/restore. Returns `'not_found'` if no row
 * matched in the expected prior state (already deleted/not deleted, or wrong system). Restoring
 * additionally checks for a `(groupId, locale)` conflict first — if a *different*, still-active
 * row already occupies the same language slot in the same group (e.g. a translation was added
 * in that locale after this row was soft-deleted), restoring would silently create two active
 * rows `resolveLibraryLocale` can't tell apart, so that's reported as `'conflict'` and refused
 * instead. Explicit switch per category rather than a generic lookup through `LIBRARY_TABLES`,
 * matching the style the POST handler this file backs already uses — drizzle's per-table column
 * types don't unify cleanly across a `Record<LibraryCategory, PgTable>` value once you start
 * calling `.update()/.where()` on it. One switch (not two) covers both directions, picked by
 * `deleted`, so each category only has to be special-cased once instead of twice. */
export async function setLibraryItemDeleted(
  category: LibraryCategory,
  systemId: string,
  id: string,
  deleted: boolean,
): Promise<'ok' | 'not_found' | 'conflict'> {
  switch (category) {
    case 'magias':
      return setDeletedSpells(systemId, id, deleted);
    case 'armas':
      return setDeletedWeapons(systemId, id, deleted);
    case 'habilidades':
      return setDeletedSpecialAbilities(systemId, id, deleted);
    case 'talentos':
      return setDeletedFeats(systemId, id, deleted);
    case 'pericias':
      return setDeletedSkills(systemId, id, deleted);
    case 'idiomas':
      return setDeletedLanguages(systemId, id, deleted);
    case 'criaturas':
      return setDeletedCreatures(systemId, id, deleted);
    case 'classes':
      return setDeletedClasses(systemId, id, deleted);
    case 'racas':
      return setDeletedRaces(systemId, id, deleted);
    case 'tipos':
      return setDeletedCreatureTypes(systemId, id, deleted);
  }
}

// One function per category, each repeating the same delete-or-restore-with-conflict-check
// shape — kept separate (not a single generic over `LIBRARY_TABLES`) for the same reason the
// POST/PATCH handlers in api/_lib/routes/libraries.ts already are: drizzle's per-table column
// types don't unify cleanly once `.update()/.where()`/`.select()` are involved (confirmed by
// trying the generic version here first — it doesn't type-check). At least the 20-case split
// across two functions (soft-delete, restore) collapses to 10 single-function cases.

async function setDeletedSpells(
  systemId: string,
  id: string,
  deleted: boolean,
): Promise<'ok' | 'not_found' | 'conflict'> {
  if (deleted) {
    const rows = await db
      .update(librarySpells)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(librarySpells.id, id),
          eq(librarySpells.systemId, systemId),
          isNull(librarySpells.deletedAt),
        ),
      )
      .returning({ id: librarySpells.id });
    return rows.length > 0 ? 'ok' : 'not_found';
  }
  const [target] = await db
    .select({ groupId: librarySpells.groupId, locale: librarySpells.locale })
    .from(librarySpells)
    .where(
      and(
        eq(librarySpells.id, id),
        eq(librarySpells.systemId, systemId),
        isNotNull(librarySpells.deletedAt),
      ),
    )
    .limit(1);
  if (!target) return 'not_found';
  const [conflict] = await db
    .select({ id: librarySpells.id })
    .from(librarySpells)
    .where(
      and(
        eq(librarySpells.systemId, systemId),
        eq(librarySpells.groupId, target.groupId),
        eq(librarySpells.locale, target.locale),
        isNull(librarySpells.deletedAt),
      ),
    )
    .limit(1);
  if (conflict) return 'conflict';
  const rows = await db
    .update(librarySpells)
    .set({ deletedAt: null })
    .where(
      and(
        eq(librarySpells.id, id),
        eq(librarySpells.systemId, systemId),
        isNotNull(librarySpells.deletedAt),
      ),
    )
    .returning({ id: librarySpells.id });
  return rows.length > 0 ? 'ok' : 'not_found';
}

async function setDeletedWeapons(
  systemId: string,
  id: string,
  deleted: boolean,
): Promise<'ok' | 'not_found' | 'conflict'> {
  if (deleted) {
    const rows = await db
      .update(libraryWeapons)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(libraryWeapons.id, id),
          eq(libraryWeapons.systemId, systemId),
          isNull(libraryWeapons.deletedAt),
        ),
      )
      .returning({ id: libraryWeapons.id });
    return rows.length > 0 ? 'ok' : 'not_found';
  }
  const [target] = await db
    .select({ groupId: libraryWeapons.groupId, locale: libraryWeapons.locale })
    .from(libraryWeapons)
    .where(
      and(
        eq(libraryWeapons.id, id),
        eq(libraryWeapons.systemId, systemId),
        isNotNull(libraryWeapons.deletedAt),
      ),
    )
    .limit(1);
  if (!target) return 'not_found';
  const [conflict] = await db
    .select({ id: libraryWeapons.id })
    .from(libraryWeapons)
    .where(
      and(
        eq(libraryWeapons.systemId, systemId),
        eq(libraryWeapons.groupId, target.groupId),
        eq(libraryWeapons.locale, target.locale),
        isNull(libraryWeapons.deletedAt),
      ),
    )
    .limit(1);
  if (conflict) return 'conflict';
  const rows = await db
    .update(libraryWeapons)
    .set({ deletedAt: null })
    .where(
      and(
        eq(libraryWeapons.id, id),
        eq(libraryWeapons.systemId, systemId),
        isNotNull(libraryWeapons.deletedAt),
      ),
    )
    .returning({ id: libraryWeapons.id });
  return rows.length > 0 ? 'ok' : 'not_found';
}

async function setDeletedSpecialAbilities(
  systemId: string,
  id: string,
  deleted: boolean,
): Promise<'ok' | 'not_found' | 'conflict'> {
  if (deleted) {
    const rows = await db
      .update(librarySpecialAbilities)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(librarySpecialAbilities.id, id),
          eq(librarySpecialAbilities.systemId, systemId),
          isNull(librarySpecialAbilities.deletedAt),
        ),
      )
      .returning({ id: librarySpecialAbilities.id });
    return rows.length > 0 ? 'ok' : 'not_found';
  }
  const [target] = await db
    .select({ groupId: librarySpecialAbilities.groupId, locale: librarySpecialAbilities.locale })
    .from(librarySpecialAbilities)
    .where(
      and(
        eq(librarySpecialAbilities.id, id),
        eq(librarySpecialAbilities.systemId, systemId),
        isNotNull(librarySpecialAbilities.deletedAt),
      ),
    )
    .limit(1);
  if (!target) return 'not_found';
  const [conflict] = await db
    .select({ id: librarySpecialAbilities.id })
    .from(librarySpecialAbilities)
    .where(
      and(
        eq(librarySpecialAbilities.systemId, systemId),
        eq(librarySpecialAbilities.groupId, target.groupId),
        eq(librarySpecialAbilities.locale, target.locale),
        isNull(librarySpecialAbilities.deletedAt),
      ),
    )
    .limit(1);
  if (conflict) return 'conflict';
  const rows = await db
    .update(librarySpecialAbilities)
    .set({ deletedAt: null })
    .where(
      and(
        eq(librarySpecialAbilities.id, id),
        eq(librarySpecialAbilities.systemId, systemId),
        isNotNull(librarySpecialAbilities.deletedAt),
      ),
    )
    .returning({ id: librarySpecialAbilities.id });
  return rows.length > 0 ? 'ok' : 'not_found';
}

async function setDeletedFeats(
  systemId: string,
  id: string,
  deleted: boolean,
): Promise<'ok' | 'not_found' | 'conflict'> {
  if (deleted) {
    const rows = await db
      .update(libraryFeats)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(libraryFeats.id, id),
          eq(libraryFeats.systemId, systemId),
          isNull(libraryFeats.deletedAt),
        ),
      )
      .returning({ id: libraryFeats.id });
    return rows.length > 0 ? 'ok' : 'not_found';
  }
  const [target] = await db
    .select({ groupId: libraryFeats.groupId, locale: libraryFeats.locale })
    .from(libraryFeats)
    .where(
      and(
        eq(libraryFeats.id, id),
        eq(libraryFeats.systemId, systemId),
        isNotNull(libraryFeats.deletedAt),
      ),
    )
    .limit(1);
  if (!target) return 'not_found';
  const [conflict] = await db
    .select({ id: libraryFeats.id })
    .from(libraryFeats)
    .where(
      and(
        eq(libraryFeats.systemId, systemId),
        eq(libraryFeats.groupId, target.groupId),
        eq(libraryFeats.locale, target.locale),
        isNull(libraryFeats.deletedAt),
      ),
    )
    .limit(1);
  if (conflict) return 'conflict';
  const rows = await db
    .update(libraryFeats)
    .set({ deletedAt: null })
    .where(
      and(
        eq(libraryFeats.id, id),
        eq(libraryFeats.systemId, systemId),
        isNotNull(libraryFeats.deletedAt),
      ),
    )
    .returning({ id: libraryFeats.id });
  return rows.length > 0 ? 'ok' : 'not_found';
}

async function setDeletedSkills(
  systemId: string,
  id: string,
  deleted: boolean,
): Promise<'ok' | 'not_found' | 'conflict'> {
  if (deleted) {
    const rows = await db
      .update(librarySkills)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(librarySkills.id, id),
          eq(librarySkills.systemId, systemId),
          isNull(librarySkills.deletedAt),
        ),
      )
      .returning({ id: librarySkills.id });
    return rows.length > 0 ? 'ok' : 'not_found';
  }
  const [target] = await db
    .select({ groupId: librarySkills.groupId, locale: librarySkills.locale })
    .from(librarySkills)
    .where(
      and(
        eq(librarySkills.id, id),
        eq(librarySkills.systemId, systemId),
        isNotNull(librarySkills.deletedAt),
      ),
    )
    .limit(1);
  if (!target) return 'not_found';
  const [conflict] = await db
    .select({ id: librarySkills.id })
    .from(librarySkills)
    .where(
      and(
        eq(librarySkills.systemId, systemId),
        eq(librarySkills.groupId, target.groupId),
        eq(librarySkills.locale, target.locale),
        isNull(librarySkills.deletedAt),
      ),
    )
    .limit(1);
  if (conflict) return 'conflict';
  const rows = await db
    .update(librarySkills)
    .set({ deletedAt: null })
    .where(
      and(
        eq(librarySkills.id, id),
        eq(librarySkills.systemId, systemId),
        isNotNull(librarySkills.deletedAt),
      ),
    )
    .returning({ id: librarySkills.id });
  return rows.length > 0 ? 'ok' : 'not_found';
}

async function setDeletedLanguages(
  systemId: string,
  id: string,
  deleted: boolean,
): Promise<'ok' | 'not_found' | 'conflict'> {
  if (deleted) {
    const rows = await db
      .update(libraryLanguages)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(libraryLanguages.id, id),
          eq(libraryLanguages.systemId, systemId),
          isNull(libraryLanguages.deletedAt),
        ),
      )
      .returning({ id: libraryLanguages.id });
    return rows.length > 0 ? 'ok' : 'not_found';
  }
  const [target] = await db
    .select({ groupId: libraryLanguages.groupId, locale: libraryLanguages.locale })
    .from(libraryLanguages)
    .where(
      and(
        eq(libraryLanguages.id, id),
        eq(libraryLanguages.systemId, systemId),
        isNotNull(libraryLanguages.deletedAt),
      ),
    )
    .limit(1);
  if (!target) return 'not_found';
  const [conflict] = await db
    .select({ id: libraryLanguages.id })
    .from(libraryLanguages)
    .where(
      and(
        eq(libraryLanguages.systemId, systemId),
        eq(libraryLanguages.groupId, target.groupId),
        eq(libraryLanguages.locale, target.locale),
        isNull(libraryLanguages.deletedAt),
      ),
    )
    .limit(1);
  if (conflict) return 'conflict';
  const rows = await db
    .update(libraryLanguages)
    .set({ deletedAt: null })
    .where(
      and(
        eq(libraryLanguages.id, id),
        eq(libraryLanguages.systemId, systemId),
        isNotNull(libraryLanguages.deletedAt),
      ),
    )
    .returning({ id: libraryLanguages.id });
  return rows.length > 0 ? 'ok' : 'not_found';
}

async function setDeletedCreatures(
  systemId: string,
  id: string,
  deleted: boolean,
): Promise<'ok' | 'not_found' | 'conflict'> {
  if (deleted) {
    const rows = await db
      .update(libraryCreatures)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(libraryCreatures.id, id),
          eq(libraryCreatures.systemId, systemId),
          isNull(libraryCreatures.deletedAt),
        ),
      )
      .returning({ id: libraryCreatures.id });
    return rows.length > 0 ? 'ok' : 'not_found';
  }
  const [target] = await db
    .select({ groupId: libraryCreatures.groupId, locale: libraryCreatures.locale })
    .from(libraryCreatures)
    .where(
      and(
        eq(libraryCreatures.id, id),
        eq(libraryCreatures.systemId, systemId),
        isNotNull(libraryCreatures.deletedAt),
      ),
    )
    .limit(1);
  if (!target) return 'not_found';
  const [conflict] = await db
    .select({ id: libraryCreatures.id })
    .from(libraryCreatures)
    .where(
      and(
        eq(libraryCreatures.systemId, systemId),
        eq(libraryCreatures.groupId, target.groupId),
        eq(libraryCreatures.locale, target.locale),
        isNull(libraryCreatures.deletedAt),
      ),
    )
    .limit(1);
  if (conflict) return 'conflict';
  const rows = await db
    .update(libraryCreatures)
    .set({ deletedAt: null })
    .where(
      and(
        eq(libraryCreatures.id, id),
        eq(libraryCreatures.systemId, systemId),
        isNotNull(libraryCreatures.deletedAt),
      ),
    )
    .returning({ id: libraryCreatures.id });
  return rows.length > 0 ? 'ok' : 'not_found';
}

async function setDeletedClasses(
  systemId: string,
  id: string,
  deleted: boolean,
): Promise<'ok' | 'not_found' | 'conflict'> {
  if (deleted) {
    const rows = await db
      .update(libraryClasses)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(libraryClasses.id, id),
          eq(libraryClasses.systemId, systemId),
          isNull(libraryClasses.deletedAt),
        ),
      )
      .returning({ id: libraryClasses.id });
    return rows.length > 0 ? 'ok' : 'not_found';
  }
  const [target] = await db
    .select({ groupId: libraryClasses.groupId, locale: libraryClasses.locale })
    .from(libraryClasses)
    .where(
      and(
        eq(libraryClasses.id, id),
        eq(libraryClasses.systemId, systemId),
        isNotNull(libraryClasses.deletedAt),
      ),
    )
    .limit(1);
  if (!target) return 'not_found';
  const [conflict] = await db
    .select({ id: libraryClasses.id })
    .from(libraryClasses)
    .where(
      and(
        eq(libraryClasses.systemId, systemId),
        eq(libraryClasses.groupId, target.groupId),
        eq(libraryClasses.locale, target.locale),
        isNull(libraryClasses.deletedAt),
      ),
    )
    .limit(1);
  if (conflict) return 'conflict';
  const rows = await db
    .update(libraryClasses)
    .set({ deletedAt: null })
    .where(
      and(
        eq(libraryClasses.id, id),
        eq(libraryClasses.systemId, systemId),
        isNotNull(libraryClasses.deletedAt),
      ),
    )
    .returning({ id: libraryClasses.id });
  return rows.length > 0 ? 'ok' : 'not_found';
}

async function setDeletedRaces(
  systemId: string,
  id: string,
  deleted: boolean,
): Promise<'ok' | 'not_found' | 'conflict'> {
  if (deleted) {
    const rows = await db
      .update(libraryRaces)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(libraryRaces.id, id),
          eq(libraryRaces.systemId, systemId),
          isNull(libraryRaces.deletedAt),
        ),
      )
      .returning({ id: libraryRaces.id });
    return rows.length > 0 ? 'ok' : 'not_found';
  }
  const [target] = await db
    .select({ groupId: libraryRaces.groupId, locale: libraryRaces.locale })
    .from(libraryRaces)
    .where(
      and(
        eq(libraryRaces.id, id),
        eq(libraryRaces.systemId, systemId),
        isNotNull(libraryRaces.deletedAt),
      ),
    )
    .limit(1);
  if (!target) return 'not_found';
  const [conflict] = await db
    .select({ id: libraryRaces.id })
    .from(libraryRaces)
    .where(
      and(
        eq(libraryRaces.systemId, systemId),
        eq(libraryRaces.groupId, target.groupId),
        eq(libraryRaces.locale, target.locale),
        isNull(libraryRaces.deletedAt),
      ),
    )
    .limit(1);
  if (conflict) return 'conflict';
  const rows = await db
    .update(libraryRaces)
    .set({ deletedAt: null })
    .where(
      and(
        eq(libraryRaces.id, id),
        eq(libraryRaces.systemId, systemId),
        isNotNull(libraryRaces.deletedAt),
      ),
    )
    .returning({ id: libraryRaces.id });
  return rows.length > 0 ? 'ok' : 'not_found';
}

async function setDeletedCreatureTypes(
  systemId: string,
  id: string,
  deleted: boolean,
): Promise<'ok' | 'not_found' | 'conflict'> {
  if (deleted) {
    const rows = await db
      .update(libraryCreatureTypes)
      .set({ deletedAt: new Date() })
      .where(
        and(
          eq(libraryCreatureTypes.id, id),
          eq(libraryCreatureTypes.systemId, systemId),
          isNull(libraryCreatureTypes.deletedAt),
        ),
      )
      .returning({ id: libraryCreatureTypes.id });
    return rows.length > 0 ? 'ok' : 'not_found';
  }
  const [target] = await db
    .select({ groupId: libraryCreatureTypes.groupId, locale: libraryCreatureTypes.locale })
    .from(libraryCreatureTypes)
    .where(
      and(
        eq(libraryCreatureTypes.id, id),
        eq(libraryCreatureTypes.systemId, systemId),
        isNotNull(libraryCreatureTypes.deletedAt),
      ),
    )
    .limit(1);
  if (!target) return 'not_found';
  const [conflict] = await db
    .select({ id: libraryCreatureTypes.id })
    .from(libraryCreatureTypes)
    .where(
      and(
        eq(libraryCreatureTypes.systemId, systemId),
        eq(libraryCreatureTypes.groupId, target.groupId),
        eq(libraryCreatureTypes.locale, target.locale),
        isNull(libraryCreatureTypes.deletedAt),
      ),
    )
    .limit(1);
  if (conflict) return 'conflict';
  const rows = await db
    .update(libraryCreatureTypes)
    .set({ deletedAt: null })
    .where(
      and(
        eq(libraryCreatureTypes.id, id),
        eq(libraryCreatureTypes.systemId, systemId),
        isNotNull(libraryCreatureTypes.deletedAt),
      ),
    )
    .returning({ id: libraryCreatureTypes.id });
  return rows.length > 0 ? 'ok' : 'not_found';
}

/** Lists every soft-deleted item in one system's category — admin-only (enforced by the route
 * handler), newest-deleted first. Used by the library trash view in `LibraryPage`. */
export async function loadDeletedLibraryItems(systemId: string, category: LibraryCategory) {
  switch (category) {
    case 'magias':
      return db
        .select()
        .from(librarySpells)
        .where(and(eq(librarySpells.systemId, systemId), isNotNull(librarySpells.deletedAt)))
        .orderBy(desc(librarySpells.deletedAt));
    case 'armas':
      return db
        .select()
        .from(libraryWeapons)
        .where(and(eq(libraryWeapons.systemId, systemId), isNotNull(libraryWeapons.deletedAt)))
        .orderBy(desc(libraryWeapons.deletedAt));
    case 'habilidades':
      return db
        .select()
        .from(librarySpecialAbilities)
        .where(
          and(
            eq(librarySpecialAbilities.systemId, systemId),
            isNotNull(librarySpecialAbilities.deletedAt),
          ),
        )
        .orderBy(desc(librarySpecialAbilities.deletedAt));
    case 'talentos':
      return db
        .select()
        .from(libraryFeats)
        .where(and(eq(libraryFeats.systemId, systemId), isNotNull(libraryFeats.deletedAt)))
        .orderBy(desc(libraryFeats.deletedAt));
    case 'pericias':
      return db
        .select()
        .from(librarySkills)
        .where(and(eq(librarySkills.systemId, systemId), isNotNull(librarySkills.deletedAt)))
        .orderBy(desc(librarySkills.deletedAt));
    case 'idiomas':
      return db
        .select()
        .from(libraryLanguages)
        .where(and(eq(libraryLanguages.systemId, systemId), isNotNull(libraryLanguages.deletedAt)))
        .orderBy(desc(libraryLanguages.deletedAt));
    case 'criaturas':
      return db
        .select()
        .from(libraryCreatures)
        .where(and(eq(libraryCreatures.systemId, systemId), isNotNull(libraryCreatures.deletedAt)))
        .orderBy(desc(libraryCreatures.deletedAt));
    case 'classes':
      return db
        .select()
        .from(libraryClasses)
        .where(and(eq(libraryClasses.systemId, systemId), isNotNull(libraryClasses.deletedAt)))
        .orderBy(desc(libraryClasses.deletedAt));
    case 'racas':
      return db
        .select()
        .from(libraryRaces)
        .where(and(eq(libraryRaces.systemId, systemId), isNotNull(libraryRaces.deletedAt)))
        .orderBy(desc(libraryRaces.deletedAt));
    case 'tipos':
      return db
        .select()
        .from(libraryCreatureTypes)
        .where(
          and(
            eq(libraryCreatureTypes.systemId, systemId),
            isNotNull(libraryCreatureTypes.deletedAt),
          ),
        )
        .orderBy(desc(libraryCreatureTypes.deletedAt));
  }
}
