/** The character photo gallery's cap — shared between the client (FotosTab's "N of
 * MAX_CHARACTER_PHOTOS" label/limit check) and the server (api/_lib/routes/characters.ts's own
 * enforcement), so the two can't quietly drift apart the way the product limit already changed
 * once (60 → 3). Deliberately its own leaf file with zero imports, not added to constants.ts:
 * that file imports from types.ts/calculations.ts without file extensions (the frontend's own
 * convention), which breaks under the backend's NodeNext module resolution the moment anything
 * in api/** imports it — a leaf file with nothing to resolve avoids that entirely. */
export const MAX_CHARACTER_PHOTOS = 3;
