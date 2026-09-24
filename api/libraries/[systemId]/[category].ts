import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../../db/client.js';
import {
  libraryCreatures,
  libraryFeats,
  libraryLanguages,
  librarySkills,
  librarySpecialAbilities,
  librarySpells,
  libraryWeapons,
} from '../../../db/schema.js';
import { isLibraryCategory } from '../../../db/library.js';
import { requireUserId } from '../../_lib/auth.js';
import { withErrorHandling } from '../../_lib/handler.js';
import {
  genericLibraryItemSchema,
  spellItemSchema,
  specialItemSchema,
  weaponItemSchema,
} from '../../_lib/validation.js';

/** Adds one item to a system's shared library. Any authenticated user may edit the shared catalog. */
export default withErrorHandling(async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const userId = await requireUserId(req, res);
  if (!userId) return;

  const systemId = req.query.systemId as string;
  const category = req.query.category as string;
  if (!isLibraryCategory(category)) {
    res.status(404).json({ error: 'Categoria de biblioteca inválida.' });
    return;
  }

  switch (category) {
    case 'magias': {
      const parsed = spellItemSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Dados inválidos.' });
        return;
      }
      const [row] = await db
        .insert(librarySpells)
        .values({ ...parsed.data, systemId })
        .returning();
      res.status(201).json({ item: row });
      return;
    }
    case 'armas': {
      const parsed = weaponItemSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Dados inválidos.' });
        return;
      }
      const [row] = await db
        .insert(libraryWeapons)
        .values({ ...parsed.data, systemId })
        .returning();
      res.status(201).json({ item: row });
      return;
    }
    case 'habilidades': {
      const parsed = specialItemSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Dados inválidos.' });
        return;
      }
      const [row] = await db
        .insert(librarySpecialAbilities)
        .values({ ...parsed.data, systemId })
        .returning();
      res.status(201).json({ item: row });
      return;
    }
    case 'talentos': {
      const parsed = genericLibraryItemSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Dados inválidos.' });
        return;
      }
      const [row] = await db
        .insert(libraryFeats)
        .values({ ...parsed.data, systemId })
        .returning();
      res.status(201).json({ item: row });
      return;
    }
    case 'pericias': {
      const parsed = genericLibraryItemSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Dados inválidos.' });
        return;
      }
      const [row] = await db
        .insert(librarySkills)
        .values({ ...parsed.data, systemId })
        .returning();
      res.status(201).json({ item: row });
      return;
    }
    case 'idiomas': {
      const parsed = genericLibraryItemSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Dados inválidos.' });
        return;
      }
      const [row] = await db
        .insert(libraryLanguages)
        .values({ ...parsed.data, systemId })
        .returning();
      res.status(201).json({ item: row });
      return;
    }
    case 'criaturas': {
      const parsed = genericLibraryItemSchema.safeParse(req.body);
      if (!parsed.success) {
        res.status(400).json({ error: 'Dados inválidos.' });
        return;
      }
      const [row] = await db
        .insert(libraryCreatures)
        .values({ ...parsed.data, systemId })
        .returning();
      res.status(201).json({ item: row });
      return;
    }
  }
});
