import type { AnyLibraryItem, LibraryCategory, SharedLibrary } from './types';

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
    case 'classes':
      return library.classes.map((c) => ({ ...c, tag: c.tag || 'Classe' }));
    case 'racas':
      return library.racas;
    case 'tipos':
      return library.tipos;
  }
}

export interface LibraryItemField {
  label: string;
  value: string;
}

/** Every one of a library item's own fields, labeled in PT-BR, for a full read-only view (the
 * trash view's "ver item", LibraryPage) — unlike `toDisplayItems` above, which flattens every
 * category down to the same {name, desc, tag} shape for the main listing, this keeps every
 * category-specific field (a spell's círculo, a weapon's dano, etc.) instead of summarizing it
 * into `desc`. `name` and `desc` are listed first/last respectively for every category, same
 * reading order the category's own create/edit form already uses. */
export function libraryItemFields(
  category: LibraryCategory,
  item: AnyLibraryItem,
): LibraryItemField[] {
  switch (category) {
    case 'magias': {
      const i = item as SharedLibrary['magias'][number];
      return [
        { label: 'Nome', value: i.name },
        { label: 'Escola', value: i.school },
        { label: 'Círculo', value: i.circle === 0 ? 'Truque' : `${i.circle}º círculo` },
        { label: 'Tempo de conjuração', value: i.castTime },
        { label: 'Alcance', value: i.range },
        { label: 'Duração', value: i.duration },
        { label: 'Resistência', value: i.resistance },
        { label: 'Descrição', value: i.desc },
      ];
    }
    case 'armas': {
      const i = item as SharedLibrary['armas'][number];
      return [
        { label: 'Nome', value: i.name },
        { label: 'Bônus de ataque', value: i.atk },
        { label: 'Crítico', value: i.crit },
        { label: 'Dano', value: i.dmg },
        { label: 'Tipo de dano', value: i.type },
        { label: 'Alcance', value: i.range },
        { label: 'Usa munição', value: i.hasAmmo ? `Sim (máx. ${i.ammoMax})` : 'Não' },
        { label: 'Descrição', value: i.desc },
      ];
    }
    case 'habilidades': {
      const i = item as SharedLibrary['habilidades'][number];
      return [
        { label: 'Nome', value: i.name },
        { label: 'Origem', value: i.subtitle },
        { label: 'Usos', value: i.uses },
        { label: 'Resumo', value: i.resumo },
        { label: 'Fonte', value: i.fonte },
        { label: 'Descrição', value: i.desc },
      ];
    }
    case 'talentos': {
      const i = item as SharedLibrary['talentos'][number];
      return [
        { label: 'Nome', value: i.name },
        { label: 'Tag', value: i.tag },
        { label: 'Resumo', value: i.resumo },
        { label: 'Pré-requisito', value: i.prerequisite },
        { label: 'Benefício', value: i.benefit },
        { label: 'Fonte', value: i.fonte },
        { label: 'Descrição', value: i.desc },
      ];
    }
    case 'pericias':
    case 'idiomas':
    case 'criaturas':
    case 'classes':
    case 'racas':
    case 'tipos': {
      const i = item as SharedLibrary['pericias'][number];
      return [
        { label: 'Nome', value: i.name },
        { label: 'Tag', value: i.tag },
        { label: 'Descrição', value: i.desc },
      ];
    }
  }
}
