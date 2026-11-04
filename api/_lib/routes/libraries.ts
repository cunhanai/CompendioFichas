import type { VercelRequest, VercelResponse } from '@vercel/node';
import { and, eq, isNull } from 'drizzle-orm';
import { db } from '../../../db/client.js';
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
} from '../../../db/schema.js';
import {
  isLibraryCategory,
  loadDeletedLibraryItems,
  setLibraryItemDeleted,
} from '../../../db/library.js';
import type { LibraryCategory } from '../../../src/entities/library-item/model/types.js';
import { requireAdminId, requireUserId } from '../auth.js';
import { withErrorHandling } from '../handler.js';
import {
  featItemSchema,
  genericLibraryItemSchema,
  libraryItemIdSchema,
  specialItemSchema,
  spellItemSchema,
  weaponItemSchema,
} from '../validation.js';

function categoryFromQuery(req: VercelRequest, res: VercelResponse): LibraryCategory | null {
  const category = req.query.category as string;
  if (!isLibraryCategory(category)) {
    res.status(404).json({ error: 'Categoria de biblioteca inválida.' });
    return null;
  }
  return category;
}

/** POST /api/libraries/:systemId/:category — adds one item to a system's shared library. Any
 * authenticated user may add to the shared catalog. */
export const addLibraryItemHandler = withErrorHandling(async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const userId = await requireUserId(req, res);
  if (!userId) return;

  const systemId = req.query.systemId as string;
  const category = categoryFromQuery(req, res);
  if (!category) return;

  switch (category) {
    case 'magias': {
      const parsed = spellItemSchema.safeParse(req.body);
      if (!parsed.success) return void res.status(400).json({ error: 'Dados inválidos.' });
      const [row] = await db
        .insert(librarySpells)
        .values({ ...parsed.data, systemId })
        .returning();
      res.status(201).json({ item: row });
      return;
    }
    case 'armas': {
      const parsed = weaponItemSchema.safeParse(req.body);
      if (!parsed.success) return void res.status(400).json({ error: 'Dados inválidos.' });
      const [row] = await db
        .insert(libraryWeapons)
        .values({ ...parsed.data, systemId })
        .returning();
      res.status(201).json({ item: row });
      return;
    }
    case 'habilidades': {
      const parsed = specialItemSchema.safeParse(req.body);
      if (!parsed.success) return void res.status(400).json({ error: 'Dados inválidos.' });
      const [row] = await db
        .insert(librarySpecialAbilities)
        .values({ ...parsed.data, systemId })
        .returning();
      res.status(201).json({ item: row });
      return;
    }
    case 'talentos': {
      const parsed = featItemSchema.safeParse(req.body);
      if (!parsed.success) return void res.status(400).json({ error: 'Dados inválidos.' });
      const [row] = await db
        .insert(libraryFeats)
        .values({ ...parsed.data, systemId })
        .returning();
      res.status(201).json({ item: row });
      return;
    }
    case 'pericias': {
      const parsed = genericLibraryItemSchema.safeParse(req.body);
      if (!parsed.success) return void res.status(400).json({ error: 'Dados inválidos.' });
      const [row] = await db
        .insert(librarySkills)
        .values({ ...parsed.data, systemId })
        .returning();
      res.status(201).json({ item: row });
      return;
    }
    case 'idiomas': {
      const parsed = genericLibraryItemSchema.safeParse(req.body);
      if (!parsed.success) return void res.status(400).json({ error: 'Dados inválidos.' });
      const [row] = await db
        .insert(libraryLanguages)
        .values({ ...parsed.data, systemId })
        .returning();
      res.status(201).json({ item: row });
      return;
    }
    case 'criaturas': {
      const parsed = genericLibraryItemSchema.safeParse(req.body);
      if (!parsed.success) return void res.status(400).json({ error: 'Dados inválidos.' });
      const [row] = await db
        .insert(libraryCreatures)
        .values({ ...parsed.data, systemId })
        .returning();
      res.status(201).json({ item: row });
      return;
    }
    case 'classes': {
      const parsed = genericLibraryItemSchema.safeParse(req.body);
      if (!parsed.success) return void res.status(400).json({ error: 'Dados inválidos.' });
      const [row] = await db
        .insert(libraryClasses)
        .values({ ...parsed.data, systemId })
        .returning();
      res.status(201).json({ item: row });
      return;
    }
    case 'racas': {
      const parsed = genericLibraryItemSchema.safeParse(req.body);
      if (!parsed.success) return void res.status(400).json({ error: 'Dados inválidos.' });
      const [row] = await db
        .insert(libraryRaces)
        .values({ ...parsed.data, systemId })
        .returning();
      res.status(201).json({ item: row });
      return;
    }
    case 'tipos': {
      const parsed = genericLibraryItemSchema.safeParse(req.body);
      if (!parsed.success) return void res.status(400).json({ error: 'Dados inválidos.' });
      const [row] = await db
        .insert(libraryCreatureTypes)
        .values({ ...parsed.data, systemId })
        .returning();
      res.status(201).json({ item: row });
      return;
    }
  }
});

/** Splits a validated update payload into its `id` and everything else minus `locale`/`groupId`
 * — shared by every category's PATCH case below, since excluding those two fields from `.set()`
 * is plain object destructuring (no Drizzle table type involved), unlike the `.update()` calls
 * themselves, which stay one per category for the reason explained at `setLibraryItemDeleted`
 * (db/library.ts). */
function omitLocaleIdentity<T extends { id: string; locale: unknown; groupId: unknown }>(
  data: T,
): { id: string; fields: Omit<T, 'id' | 'locale' | 'groupId'> } {
  const { id, locale: _locale, groupId: _groupId, ...fields } = data;
  return { id, fields };
}

/** PATCH /api/libraries/:systemId/:category — two actions share this verb+path, told apart by
 * body shape (keeps this area at one Vercel function per the Hobby-plan function cap this
 * project already hit once — see CLAUDE.md — instead of a new path segment per action):
 * `{ id, restore: true }` restores a soft-deleted item (admin-only); any other body is a full
 * replace of an existing item's fields (any authenticated user — same openness as POST/create).
 * The full-replace branch validates `locale`/`groupId` (they're part of each category's zod
 * schema, since POST needs them) but deliberately never writes them — `locale`/`groupId` aren't
 * user-editable fields, they're bookkeeping that only `setLibraryItemDeleted`'s restore path and
 * the "add translation" create path are allowed to set. Letting a generic edit move an item into
 * a different group, or collide two rows on the same (groupId, locale), would silently corrupt
 * `resolveLibraryLocale`'s one-per-group assumption. Every `.where()` also excludes
 * soft-deleted rows (`isNull(deletedAt)`) — without it, this same-verb-same-path edit could
 * reach a trashed item directly, silently changing its fields while it sits in the trash
 * instead of 404ing like it does for the main (non-trash) list. */
export const updateLibraryItemHandler = withErrorHandling(async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'PATCH') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const category = categoryFromQuery(req, res);
  if (!category) return;

  const systemId = req.query.systemId as string;

  if (
    req.body &&
    typeof req.body === 'object' &&
    (req.body as Record<string, unknown>).restore === true
  ) {
    const adminId = await requireAdminId(req, res);
    if (!adminId) return;

    const parsedId = libraryItemIdSchema.safeParse(req.body);
    if (!parsedId.success) {
      res.status(400).json({ error: 'Dados inválidos.' });
      return;
    }

    const result = await setLibraryItemDeleted(category, systemId, parsedId.data.id, false);
    if (result.status === 'not_found') {
      res.status(404).json({ error: 'Item não encontrado na lixeira.' });
      return;
    }
    if (result.status === 'conflict') {
      res.status(409).json({
        error:
          'Já existe outro item ativo neste mesmo idioma para este grupo — não é possível restaurar.',
      });
      return;
    }
    res.status(200).json({ item: result.item });
    return;
  }

  const userId = await requireUserId(req, res);
  if (!userId) return;

  switch (category) {
    case 'magias': {
      const parsed = spellItemSchema.safeParse(req.body);
      if (!parsed.success) return void res.status(400).json({ error: 'Dados inválidos.' });
      const { id, fields } = omitLocaleIdentity(parsed.data);
      const [row] = await db
        .update(librarySpells)
        .set(fields)
        .where(
          and(
            eq(librarySpells.id, id),
            eq(librarySpells.systemId, systemId),
            isNull(librarySpells.deletedAt),
          ),
        )
        .returning();
      if (!row) return void res.status(404).json({ error: 'Item não encontrado.' });
      res.status(200).json({ item: row });
      return;
    }
    case 'armas': {
      const parsed = weaponItemSchema.safeParse(req.body);
      if (!parsed.success) return void res.status(400).json({ error: 'Dados inválidos.' });
      const { id, fields } = omitLocaleIdentity(parsed.data);
      const [row] = await db
        .update(libraryWeapons)
        .set(fields)
        .where(
          and(
            eq(libraryWeapons.id, id),
            eq(libraryWeapons.systemId, systemId),
            isNull(libraryWeapons.deletedAt),
          ),
        )
        .returning();
      if (!row) return void res.status(404).json({ error: 'Item não encontrado.' });
      res.status(200).json({ item: row });
      return;
    }
    case 'habilidades': {
      const parsed = specialItemSchema.safeParse(req.body);
      if (!parsed.success) return void res.status(400).json({ error: 'Dados inválidos.' });
      const { id, fields } = omitLocaleIdentity(parsed.data);
      const [row] = await db
        .update(librarySpecialAbilities)
        .set(fields)
        .where(
          and(
            eq(librarySpecialAbilities.id, id),
            eq(librarySpecialAbilities.systemId, systemId),
            isNull(librarySpecialAbilities.deletedAt),
          ),
        )
        .returning();
      if (!row) return void res.status(404).json({ error: 'Item não encontrado.' });
      res.status(200).json({ item: row });
      return;
    }
    case 'talentos': {
      const parsed = featItemSchema.safeParse(req.body);
      if (!parsed.success) return void res.status(400).json({ error: 'Dados inválidos.' });
      const { id, fields } = omitLocaleIdentity(parsed.data);
      const [row] = await db
        .update(libraryFeats)
        .set(fields)
        .where(
          and(
            eq(libraryFeats.id, id),
            eq(libraryFeats.systemId, systemId),
            isNull(libraryFeats.deletedAt),
          ),
        )
        .returning();
      if (!row) return void res.status(404).json({ error: 'Item não encontrado.' });
      res.status(200).json({ item: row });
      return;
    }
    case 'pericias': {
      const parsed = genericLibraryItemSchema.safeParse(req.body);
      if (!parsed.success) return void res.status(400).json({ error: 'Dados inválidos.' });
      const { id, fields } = omitLocaleIdentity(parsed.data);
      const [row] = await db
        .update(librarySkills)
        .set(fields)
        .where(
          and(
            eq(librarySkills.id, id),
            eq(librarySkills.systemId, systemId),
            isNull(librarySkills.deletedAt),
          ),
        )
        .returning();
      if (!row) return void res.status(404).json({ error: 'Item não encontrado.' });
      res.status(200).json({ item: row });
      return;
    }
    case 'idiomas': {
      const parsed = genericLibraryItemSchema.safeParse(req.body);
      if (!parsed.success) return void res.status(400).json({ error: 'Dados inválidos.' });
      const { id, fields } = omitLocaleIdentity(parsed.data);
      const [row] = await db
        .update(libraryLanguages)
        .set(fields)
        .where(
          and(
            eq(libraryLanguages.id, id),
            eq(libraryLanguages.systemId, systemId),
            isNull(libraryLanguages.deletedAt),
          ),
        )
        .returning();
      if (!row) return void res.status(404).json({ error: 'Item não encontrado.' });
      res.status(200).json({ item: row });
      return;
    }
    case 'criaturas': {
      const parsed = genericLibraryItemSchema.safeParse(req.body);
      if (!parsed.success) return void res.status(400).json({ error: 'Dados inválidos.' });
      const { id, fields } = omitLocaleIdentity(parsed.data);
      const [row] = await db
        .update(libraryCreatures)
        .set(fields)
        .where(
          and(
            eq(libraryCreatures.id, id),
            eq(libraryCreatures.systemId, systemId),
            isNull(libraryCreatures.deletedAt),
          ),
        )
        .returning();
      if (!row) return void res.status(404).json({ error: 'Item não encontrado.' });
      res.status(200).json({ item: row });
      return;
    }
    case 'classes': {
      const parsed = genericLibraryItemSchema.safeParse(req.body);
      if (!parsed.success) return void res.status(400).json({ error: 'Dados inválidos.' });
      const { id, fields } = omitLocaleIdentity(parsed.data);
      const [row] = await db
        .update(libraryClasses)
        .set(fields)
        .where(
          and(
            eq(libraryClasses.id, id),
            eq(libraryClasses.systemId, systemId),
            isNull(libraryClasses.deletedAt),
          ),
        )
        .returning();
      if (!row) return void res.status(404).json({ error: 'Item não encontrado.' });
      res.status(200).json({ item: row });
      return;
    }
    case 'racas': {
      const parsed = genericLibraryItemSchema.safeParse(req.body);
      if (!parsed.success) return void res.status(400).json({ error: 'Dados inválidos.' });
      const { id, fields } = omitLocaleIdentity(parsed.data);
      const [row] = await db
        .update(libraryRaces)
        .set(fields)
        .where(
          and(
            eq(libraryRaces.id, id),
            eq(libraryRaces.systemId, systemId),
            isNull(libraryRaces.deletedAt),
          ),
        )
        .returning();
      if (!row) return void res.status(404).json({ error: 'Item não encontrado.' });
      res.status(200).json({ item: row });
      return;
    }
    case 'tipos': {
      const parsed = genericLibraryItemSchema.safeParse(req.body);
      if (!parsed.success) return void res.status(400).json({ error: 'Dados inválidos.' });
      const { id, fields } = omitLocaleIdentity(parsed.data);
      const [row] = await db
        .update(libraryCreatureTypes)
        .set(fields)
        .where(
          and(
            eq(libraryCreatureTypes.id, id),
            eq(libraryCreatureTypes.systemId, systemId),
            isNull(libraryCreatureTypes.deletedAt),
          ),
        )
        .returning();
      if (!row) return void res.status(404).json({ error: 'Item não encontrado.' });
      res.status(200).json({ item: row });
      return;
    }
  }
});

/** DELETE /api/libraries/:systemId/:category — soft-deletes one item (body: `{ id }`).
 * Admin-only: unlike add/edit (open to any authenticated user), removing something from the
 * shared catalog everyone sees is reserved for admins. */
export const deleteLibraryItemHandler = withErrorHandling(async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'DELETE') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const adminId = await requireAdminId(req, res);
  if (!adminId) return;

  const category = categoryFromQuery(req, res);
  if (!category) return;

  const systemId = req.query.systemId as string;
  const parsed = libraryItemIdSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Dados inválidos.' });
    return;
  }

  const result = await setLibraryItemDeleted(category, systemId, parsed.data.id, true);
  if (result.status === 'not_found') {
    res.status(404).json({ error: 'Item não encontrado.' });
    return;
  }
  res.status(200).json({ ok: true });
});

/** GET /api/libraries/:systemId/:category — lists this category's soft-deleted items (the
 * library trash view). Admin-only, same reasoning as DELETE above. */
export const listDeletedLibraryItemsHandler = withErrorHandling(async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const adminId = await requireAdminId(req, res);
  if (!adminId) return;

  const systemId = req.query.systemId as string;
  const category = categoryFromQuery(req, res);
  if (!category) return;

  const deleted = await loadDeletedLibraryItems(systemId, category);
  res.status(200).json({ deleted });
});
