import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  addLibraryItemHandler,
  updateLibraryItemHandler,
  deleteLibraryItemHandler,
  listDeletedLibraryItemsHandler,
} from '../../_lib/routes/libraries.js';

/** One function serving every verb on /api/libraries/:systemId/:category — see
 * api/_lib/routes/libraries.ts for what each verb does (create/update-or-restore/soft-delete/
 * list-deleted) and why PATCH carries two actions instead of a new path segment. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  switch (req.method) {
    case 'GET':
      return listDeletedLibraryItemsHandler(req, res);
    case 'POST':
      return addLibraryItemHandler(req, res);
    case 'PATCH':
      return updateLibraryItemHandler(req, res);
    case 'DELETE':
      return deleteLibraryItemHandler(req, res);
    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}
