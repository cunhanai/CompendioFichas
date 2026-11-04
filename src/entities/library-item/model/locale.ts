import type { LibraryItemLocale, LibraryItemLocaleFields, SharedLibrary } from './types';

/** Builds the `id`/`locale`/`groupId` triple for a brand-new, standalone library item (its own
 * group of one) — the repeated shape every "create" path (LibraryPage, TalentosTab, CombateTab)
 * needs alongside the category-specific fields. A translation of an EXISTING item doesn't use
 * this: it reuses that item's own `groupId` instead of generating a new one, so it joins the
 * same group rather than starting its own. */
export function freshLibraryItemIdentity(locale: LibraryItemLocale): LibraryItemLocaleFields & {
  id: string;
} {
  return { id: crypto.randomUUID(), locale, groupId: crypto.randomUUID() };
}

/** Groups a category array by `groupId`, preserving the order each group first appears in.
 * Exported for `LibraryPage`'s translation-management UI, which needs every language variant of
 * each group (to show a PT/EN toggle, offer "add translation", etc.) rather than the one-per-
 * group resolution `resolveLibraryLocale` below produces for every other consumer. */
export function groupLibraryItems<T extends LibraryItemLocaleFields>(items: T[]): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const group = groups.get(item.groupId);
    if (group) group.push(item);
    else groups.set(item.groupId, [item]);
  }
  return groups;
}

/** Picks one item per `groupId` from a category array — the one matching `preferredLocale`, or
 * whichever locale that group actually has if the preferred one isn't among them (e.g. a talento
 * only ever registered in English shows up in English even for a PT-preferred account, per the
 * explicit product decision — a missing translation isn't a missing item). */
function resolveCategory<T extends LibraryItemLocaleFields>(
  items: T[],
  preferredLocale: LibraryItemLocale,
): T[] {
  const resolved: T[] = [];
  for (const group of groupLibraryItems(items).values()) {
    resolved.push(group.find((item) => item.locale === preferredLocale) ?? group[0]);
  }
  return resolved;
}

/**
 * Resolves a raw `SharedLibrary` (which may hold more than one language variant per item, same
 * `groupId`, different `locale` — see LibraryItemLocaleFields) down to exactly one item per
 * group, in the account's preferred language. This is what `useLibrary()` (app/providers)
 * returns, so every existing consumer (every sheet picker, LibraryPage's own listing, etc.)
 * automatically shows the right language without needing to know translations exist at all —
 * only `LibraryPage`'s translation-management UI reads the raw, unresolved library directly
 * (`useAppData().libraries`) to show/manage every language variant.
 */
export function resolveLibraryLocale(
  library: SharedLibrary,
  preferredLocale: LibraryItemLocale,
): SharedLibrary {
  return {
    systemId: library.systemId,
    magias: resolveCategory(library.magias, preferredLocale),
    talentos: resolveCategory(library.talentos, preferredLocale),
    pericias: resolveCategory(library.pericias, preferredLocale),
    habilidades: resolveCategory(library.habilidades, preferredLocale),
    armas: resolveCategory(library.armas, preferredLocale),
    idiomas: resolveCategory(library.idiomas, preferredLocale),
    criaturas: resolveCategory(library.criaturas, preferredLocale),
    classes: resolveCategory(library.classes, preferredLocale),
    racas: resolveCategory(library.racas, preferredLocale),
    tipos: resolveCategory(library.tipos, preferredLocale),
  };
}
