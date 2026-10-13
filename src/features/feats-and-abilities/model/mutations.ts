import type { Character } from '@/entities/character/model/types';
import type { FeatLibraryItem, SpecialLibraryItem } from '@/entities/library-item/model/types';

export function addFeatFromLibrary(character: Character, feat: FeatLibraryItem): Character {
  if (character.feats.some((f) => f.name === feat.name)) return character;
  return {
    ...character,
    feats: [
      ...character.feats,
      {
        id: crypto.randomUUID(),
        name: feat.name,
        tag: feat.tag || 'Talento',
        resumo: feat.resumo,
        prerequisite: feat.prerequisite,
        benefit: feat.benefit,
        fonte: feat.fonte,
        desc: feat.desc,
      },
    ],
  };
}

export function addSpecialFromLibrary(
  character: Character,
  special: SpecialLibraryItem,
): Character {
  if (character.specials.some((s) => s.name === special.name)) return character;
  return {
    ...character,
    specials: [
      ...character.specials,
      {
        id: crypto.randomUUID(),
        name: special.name,
        subtitle: special.subtitle,
        uses: special.uses,
        resumo: special.resumo,
        fonte: special.fonte,
        desc: special.desc,
      },
    ],
  };
}

export function addCustomSpecial(
  character: Character,
  id: string = crypto.randomUUID(),
): Character {
  return {
    ...character,
    specials: [
      ...character.specials,
      {
        id,
        name: 'Nova habilidade',
        subtitle: 'Avulsa',
        uses: '',
        resumo: '',
        fonte: '',
        desc: '',
      },
    ],
  };
}

export function updateFeat(
  character: Character,
  id: string,
  patch: Partial<Omit<Character['feats'][number], 'id'>>,
): Character {
  return {
    ...character,
    feats: character.feats.map((f) => (f.id === id ? { ...f, ...patch } : f)),
  };
}

export function removeFeat(character: Character, id: string): Character {
  return { ...character, feats: character.feats.filter((f) => f.id !== id) };
}

export function updateSpecial(
  character: Character,
  id: string,
  patch: Partial<Omit<Character['specials'][number], 'id'>>,
): Character {
  return {
    ...character,
    specials: character.specials.map((s) => (s.id === id ? { ...s, ...patch } : s)),
  };
}

export function removeSpecial(character: Character, id: string): Character {
  return { ...character, specials: character.specials.filter((s) => s.id !== id) };
}
