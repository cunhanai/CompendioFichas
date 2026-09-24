import { inArray } from 'drizzle-orm';
import { db } from './client.js';
import type { SharedLibrary } from '../src/entities/library-item/model/types.js';
import type { LibraryCategory } from '../src/entities/library-item/model/types.js';
import {
  libraryCreatures,
  libraryFeats,
  libraryLanguages,
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
  };
}

/** Assembles one SharedLibrary per system id from the 7 category tables. */
export async function loadLibraries(systemIds: string[]): Promise<Record<string, SharedLibrary>> {
  const libraries: Record<string, SharedLibrary> = {};
  for (const systemId of systemIds) libraries[systemId] = emptyLibrary(systemId);
  if (systemIds.length === 0) return libraries;

  const [spells, weapons, specials, feats, skills, languages, creatures] = await Promise.all([
    db.select().from(librarySpells).where(inArray(librarySpells.systemId, systemIds)),
    db.select().from(libraryWeapons).where(inArray(libraryWeapons.systemId, systemIds)),
    db
      .select()
      .from(librarySpecialAbilities)
      .where(inArray(librarySpecialAbilities.systemId, systemIds)),
    db.select().from(libraryFeats).where(inArray(libraryFeats.systemId, systemIds)),
    db.select().from(librarySkills).where(inArray(librarySkills.systemId, systemIds)),
    db.select().from(libraryLanguages).where(inArray(libraryLanguages.systemId, systemIds)),
    db.select().from(libraryCreatures).where(inArray(libraryCreatures.systemId, systemIds)),
  ]);

  for (const { systemId, ...item } of spells) libraries[systemId]?.magias.push(item);
  for (const { systemId, ...item } of weapons) libraries[systemId]?.armas.push(item);
  for (const { systemId, ...item } of specials) libraries[systemId]?.habilidades.push(item);
  for (const { systemId, ...item } of feats) libraries[systemId]?.talentos.push(item);
  for (const { systemId, ...item } of skills) libraries[systemId]?.pericias.push(item);
  for (const { systemId, ...item } of languages) libraries[systemId]?.idiomas.push(item);
  for (const { systemId, ...item } of creatures) libraries[systemId]?.criaturas.push(item);

  return libraries;
}
