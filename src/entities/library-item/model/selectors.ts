import type { LibraryCategory, SharedLibrary } from './types';

export interface DisplayItem {
  id: string;
  name: string;
  desc: string;
  tag: string;
}

/** Normalizes every category's differently-shaped items into a common {name, desc, tag} view. */
export function toDisplayItems(library: SharedLibrary, category: LibraryCategory): DisplayItem[] {
  switch (category) {
    case 'magias':
      return library.magias.map((s) => ({
        id: s.id,
        name: s.name,
        desc: `${s.school} · ${s.circle === 0 ? 'truque' : `${s.circle}º círculo`}`,
        tag: 'Magia',
      }));
    case 'armas':
      return library.armas.map((w) => ({
        id: w.id,
        name: w.name,
        desc: [
          w.type,
          w.dmg,
          w.crit && `crítico ${w.crit}`,
          w.range !== '—' && `alcance ${w.range}`,
        ]
          .filter(Boolean)
          .join(' · '),
        tag: 'Arma',
      }));
    case 'habilidades':
      return library.habilidades.map((h) => ({
        id: h.id,
        name: h.name,
        desc: h.subtitle,
        tag: 'Habilidade',
      }));
    case 'talentos':
      return library.talentos.map((t) => ({ ...t, tag: t.tag || 'Talento' }));
    case 'pericias':
      return library.pericias;
    case 'idiomas':
      return library.idiomas;
    case 'criaturas':
      return library.criaturas;
  }
}
