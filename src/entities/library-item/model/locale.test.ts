import { describe, it, expect } from 'vitest';
import { resolveLibraryLocale } from './locale';
import type { LibraryItem, SharedLibrary } from './types';

function item(partial: Partial<LibraryItem> & { id: string; groupId: string }): LibraryItem {
  return { name: '', desc: '', tag: '', locale: 'pt', ...partial };
}

function library(talentos: LibraryItem[]): SharedLibrary {
  return {
    systemId: 'sys',
    magias: [],
    talentos: [],
    pericias: talentos,
    habilidades: [],
    armas: [],
    idiomas: [],
    criaturas: [],
    classes: [],
    racas: [],
    tipos: [],
  };
}

describe('resolveLibraryLocale', () => {
  it('keeps a lone item as-is regardless of preferred locale', () => {
    const solo = item({ id: '1', groupId: 'g1', name: 'Solo', locale: 'en' });
    const resolved = resolveLibraryLocale(library([solo]), 'pt');
    expect(resolved.pericias).toEqual([solo]);
  });

  it('picks the item matching the preferred locale within a group', () => {
    const pt = item({ id: '1', groupId: 'g1', name: 'PT version', locale: 'pt' });
    const en = item({ id: '2', groupId: 'g1', name: 'EN version', locale: 'en' });
    expect(resolveLibraryLocale(library([pt, en]), 'pt').pericias).toEqual([pt]);
    expect(resolveLibraryLocale(library([pt, en]), 'en').pericias).toEqual([en]);
  });

  it('falls back to whichever locale exists when the preferred one is missing from the group', () => {
    const en = item({ id: '2', groupId: 'g1', name: 'EN only', locale: 'en' });
    expect(resolveLibraryLocale(library([en]), 'pt').pericias).toEqual([en]);
  });

  it('resolves each group independently and preserves first-appearance order', () => {
    const aPt = item({ id: '1', groupId: 'a', name: 'A pt', locale: 'pt' });
    const bEn = item({ id: '2', groupId: 'b', name: 'B en', locale: 'en' });
    const aEn = item({ id: '3', groupId: 'a', name: 'A en', locale: 'en' });
    const resolved = resolveLibraryLocale(library([aPt, bEn, aEn]), 'pt');
    expect(resolved.pericias.map((i) => i.name)).toEqual(['A pt', 'B en']);
  });
});
