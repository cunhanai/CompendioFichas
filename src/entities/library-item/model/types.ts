export type LibraryCategory =
  | 'magias'
  | 'talentos'
  | 'pericias'
  | 'habilidades'
  | 'armas'
  | 'idiomas'
  | 'criaturas'
  | 'classes'
  | 'racas'
  | 'tipos';

/** Which language this library item's text is written in. Every item has exactly one — a second
 * language is a second item (same `groupId`, different `locale`), never a field that holds both
 * at once (see `groupId` below). */
export type LibraryItemLocale = 'pt' | 'en';

/** Links every language variant of "the same conceptual item" together — a lone item (the
 * common case, no translation yet) is simply a group of one, with a `groupId` nothing else
 * shares. `resolveLibraryLocale` (./locale.ts) is what actually groups items by this and picks
 * one per group to show. */
export interface LibraryItemLocaleFields {
  locale: LibraryItemLocale;
  groupId: string;
}

export interface LibraryItem extends LibraryItemLocaleFields {
  id: string;
  name: string;
  desc: string;
  tag: string;
}

export interface SpellLibraryItem extends LibraryItemLocaleFields {
  id: string;
  name: string;
  school: string;
  circle: number;
  castTime: string;
  range: string;
  duration: string;
  resistance: string;
  desc: string;
}

export interface WeaponLibraryItem extends LibraryItemLocaleFields {
  id: string;
  name: string;
  atk: string;
  crit: string;
  dmg: string;
  type: string;
  range: string;
  desc: string;
  hasAmmo: boolean;
  ammoMax: number;
}

export interface SpecialLibraryItem extends LibraryItemLocaleFields {
  id: string;
  name: string;
  subtitle: string;
  uses: string;
  resumo: string;
  fonte: string;
  desc: string;
}

export interface FeatLibraryItem extends LibraryItemLocaleFields {
  id: string;
  name: string;
  tag: string;
  resumo: string;
  prerequisite: string;
  benefit: string;
  fonte: string;
  desc: string;
}

export interface SharedLibrary {
  systemId: string;
  magias: SpellLibraryItem[];
  talentos: FeatLibraryItem[];
  pericias: LibraryItem[];
  habilidades: SpecialLibraryItem[];
  armas: WeaponLibraryItem[];
  idiomas: LibraryItem[];
  criaturas: LibraryItem[];
  classes: LibraryItem[];
  racas: LibraryItem[];
  tipos: LibraryItem[];
}
