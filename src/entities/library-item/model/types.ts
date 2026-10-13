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

export interface LibraryItem {
  id: string;
  name: string;
  desc: string;
  tag: string;
}

export interface SpellLibraryItem {
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

export interface WeaponLibraryItem {
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

export interface SpecialLibraryItem {
  id: string;
  name: string;
  subtitle: string;
  uses: string;
  desc: string;
}

export interface FeatLibraryItem {
  id: string;
  name: string;
  tag: string;
  prerequisite: string;
  benefit: string;
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
