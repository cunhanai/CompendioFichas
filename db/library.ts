import { and, desc, eq, inArray, isNotNull, isNull } from 'drizzle-orm';
import { db } from './client.js';
import type { SharedLibrary } from '../src/entities/library-item/model/types.js';
import type { LibraryCategory } from '../src/entities/library-item/model/types.js';
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

  for (const { systemId, deletedAt, ...item } of spells) libraries[systemId]?.magias.push(item);
  for (const { systemId, deletedAt, ...item } of weapons) libraries[systemId]?.armas.push(item);
  for (const { systemId, deletedAt, ...item } of specials)
    libraries[systemId]?.habilidades.push(item);
  for (const { systemId, deletedAt, ...item } of feats) libraries[systemId]?.talentos.push(item);
  for (const { systemId, deletedAt, ...item } of skills) libraries[systemId]?.pericias.push(item);
  for (const { systemId, deletedAt, ...item } of languages) libraries[systemId]?.idiomas.push(item);
  for (const { systemId, deletedAt, ...item } of creatures)
    libraries[systemId]?.criaturas.push(item);
  for (const { systemId, deletedAt, ...item } of classes) libraries[systemId]?.classes.push(item);
  for (const { systemId, deletedAt, ...item } of races) libraries[systemId]?.racas.push(item);
  for (const { systemId, deletedAt, ...item } of types) libraries[systemId]?.tipos.push(item);

  return libraries;
}

/** Soft-deletes one library item — admin-only (enforced by the route handler, not here).
 * Returns false if no matching, not-already-deleted row was found. Explicit switch per category
 * rather than a generic lookup through `LIBRARY_TABLES`, matching the style the POST handler
 * this file backs already uses — drizzle's per-table column types don't unify cleanly across a
 * `Record<LibraryCategory, PgTable>` value once you start calling `.update()/.where()` on it. */
export async function softDeleteLibraryItem(
  category: LibraryCategory,
  id: string,
): Promise<boolean> {
  switch (category) {
    case 'magias': {
      const rows = await db
        .update(librarySpells)
        .set({ deletedAt: new Date() })
        .where(and(eq(librarySpells.id, id), isNull(librarySpells.deletedAt)))
        .returning({ id: librarySpells.id });
      return rows.length > 0;
    }
    case 'armas': {
      const rows = await db
        .update(libraryWeapons)
        .set({ deletedAt: new Date() })
        .where(and(eq(libraryWeapons.id, id), isNull(libraryWeapons.deletedAt)))
        .returning({ id: libraryWeapons.id });
      return rows.length > 0;
    }
    case 'habilidades': {
      const rows = await db
        .update(librarySpecialAbilities)
        .set({ deletedAt: new Date() })
        .where(and(eq(librarySpecialAbilities.id, id), isNull(librarySpecialAbilities.deletedAt)))
        .returning({ id: librarySpecialAbilities.id });
      return rows.length > 0;
    }
    case 'talentos': {
      const rows = await db
        .update(libraryFeats)
        .set({ deletedAt: new Date() })
        .where(and(eq(libraryFeats.id, id), isNull(libraryFeats.deletedAt)))
        .returning({ id: libraryFeats.id });
      return rows.length > 0;
    }
    case 'pericias': {
      const rows = await db
        .update(librarySkills)
        .set({ deletedAt: new Date() })
        .where(and(eq(librarySkills.id, id), isNull(librarySkills.deletedAt)))
        .returning({ id: librarySkills.id });
      return rows.length > 0;
    }
    case 'idiomas': {
      const rows = await db
        .update(libraryLanguages)
        .set({ deletedAt: new Date() })
        .where(and(eq(libraryLanguages.id, id), isNull(libraryLanguages.deletedAt)))
        .returning({ id: libraryLanguages.id });
      return rows.length > 0;
    }
    case 'criaturas': {
      const rows = await db
        .update(libraryCreatures)
        .set({ deletedAt: new Date() })
        .where(and(eq(libraryCreatures.id, id), isNull(libraryCreatures.deletedAt)))
        .returning({ id: libraryCreatures.id });
      return rows.length > 0;
    }
    case 'classes': {
      const rows = await db
        .update(libraryClasses)
        .set({ deletedAt: new Date() })
        .where(and(eq(libraryClasses.id, id), isNull(libraryClasses.deletedAt)))
        .returning({ id: libraryClasses.id });
      return rows.length > 0;
    }
    case 'racas': {
      const rows = await db
        .update(libraryRaces)
        .set({ deletedAt: new Date() })
        .where(and(eq(libraryRaces.id, id), isNull(libraryRaces.deletedAt)))
        .returning({ id: libraryRaces.id });
      return rows.length > 0;
    }
    case 'tipos': {
      const rows = await db
        .update(libraryCreatureTypes)
        .set({ deletedAt: new Date() })
        .where(and(eq(libraryCreatureTypes.id, id), isNull(libraryCreatureTypes.deletedAt)))
        .returning({ id: libraryCreatureTypes.id });
      return rows.length > 0;
    }
  }
}

/** Restores a soft-deleted library item — admin-only (enforced by the route handler). Returns
 * false if no matching, currently-deleted row was found. */
export async function restoreLibraryItem(category: LibraryCategory, id: string): Promise<boolean> {
  switch (category) {
    case 'magias': {
      const rows = await db
        .update(librarySpells)
        .set({ deletedAt: null })
        .where(and(eq(librarySpells.id, id), isNotNull(librarySpells.deletedAt)))
        .returning({ id: librarySpells.id });
      return rows.length > 0;
    }
    case 'armas': {
      const rows = await db
        .update(libraryWeapons)
        .set({ deletedAt: null })
        .where(and(eq(libraryWeapons.id, id), isNotNull(libraryWeapons.deletedAt)))
        .returning({ id: libraryWeapons.id });
      return rows.length > 0;
    }
    case 'habilidades': {
      const rows = await db
        .update(librarySpecialAbilities)
        .set({ deletedAt: null })
        .where(
          and(eq(librarySpecialAbilities.id, id), isNotNull(librarySpecialAbilities.deletedAt)),
        )
        .returning({ id: librarySpecialAbilities.id });
      return rows.length > 0;
    }
    case 'talentos': {
      const rows = await db
        .update(libraryFeats)
        .set({ deletedAt: null })
        .where(and(eq(libraryFeats.id, id), isNotNull(libraryFeats.deletedAt)))
        .returning({ id: libraryFeats.id });
      return rows.length > 0;
    }
    case 'pericias': {
      const rows = await db
        .update(librarySkills)
        .set({ deletedAt: null })
        .where(and(eq(librarySkills.id, id), isNotNull(librarySkills.deletedAt)))
        .returning({ id: librarySkills.id });
      return rows.length > 0;
    }
    case 'idiomas': {
      const rows = await db
        .update(libraryLanguages)
        .set({ deletedAt: null })
        .where(and(eq(libraryLanguages.id, id), isNotNull(libraryLanguages.deletedAt)))
        .returning({ id: libraryLanguages.id });
      return rows.length > 0;
    }
    case 'criaturas': {
      const rows = await db
        .update(libraryCreatures)
        .set({ deletedAt: null })
        .where(and(eq(libraryCreatures.id, id), isNotNull(libraryCreatures.deletedAt)))
        .returning({ id: libraryCreatures.id });
      return rows.length > 0;
    }
    case 'classes': {
      const rows = await db
        .update(libraryClasses)
        .set({ deletedAt: null })
        .where(and(eq(libraryClasses.id, id), isNotNull(libraryClasses.deletedAt)))
        .returning({ id: libraryClasses.id });
      return rows.length > 0;
    }
    case 'racas': {
      const rows = await db
        .update(libraryRaces)
        .set({ deletedAt: null })
        .where(and(eq(libraryRaces.id, id), isNotNull(libraryRaces.deletedAt)))
        .returning({ id: libraryRaces.id });
      return rows.length > 0;
    }
    case 'tipos': {
      const rows = await db
        .update(libraryCreatureTypes)
        .set({ deletedAt: null })
        .where(and(eq(libraryCreatureTypes.id, id), isNotNull(libraryCreatureTypes.deletedAt)))
        .returning({ id: libraryCreatureTypes.id });
      return rows.length > 0;
    }
  }
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
