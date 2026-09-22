import type { Character } from '@/entities/character/model/types';

export function toggleFavorite(character: Character): Character {
  return { ...character, favorited: !character.favorited };
}

export function toggleActive(character: Character): Character {
  return { ...character, active: !character.active };
}
