import type { Character } from '@/entities/character/model/types';
import type { LibraryItem, SpecialLibraryItem } from '@/entities/library-item/model/types';

export function addFeatFromLibrary(character: Character, feat: LibraryItem): Character {
  if (character.feats.some((f) => f.name === feat.name)) return character;
  return {
    ...character,
    feats: [
      ...character.feats,
      { id: crypto.randomUUID(), name: feat.name, tag: feat.tag || 'Talento', desc: feat.desc },
    ],
  };
}

export function addSpecialFromLibrary(
  character: Character,
  special: SpecialLibraryItem,
): Character {
  return {
    ...character,
    specials: [
      ...character.specials,
      {
        id: crypto.randomUUID(),
        name: special.name,
        subtitle: special.subtitle,
        uses: special.uses,
        desc: special.desc,
      },
    ],
  };
}

export function addCustomSpecial(character: Character): Character {
  return {
    ...character,
    specials: [
      ...character.specials,
      { id: crypto.randomUUID(), name: 'Nova habilidade', subtitle: 'Avulsa', uses: '', desc: '' },
    ],
  };
}
