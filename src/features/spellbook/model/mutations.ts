import type { Character } from '@/entities/character/model/types';
import type { SpellLibraryItem } from '@/entities/library-item/model/types';

/** Adds a spell into the given spellbook, matching it to the circle slot (or cantrips) by number. */
export function addSpellToBook(
  character: Character,
  bookIndex: number,
  spell: SpellLibraryItem,
): Character {
  return {
    ...character,
    spellbooks: character.spellbooks.map((book, i) => {
      if (i !== bookIndex) return book;
      if (spell.circle === 0) {
        if (book.cantrips.spells.includes(spell.name)) return book;
        return {
          ...book,
          cantrips: { ...book.cantrips, spells: [...book.cantrips.spells, spell.name] },
        };
      }
      return {
        ...book,
        circles: book.circles.map((circle, idx) => {
          if (idx !== spell.circle - 1) return circle;
          if (circle.spells.includes(spell.name) || circle.used >= circle.max) return circle;
          return { ...circle, used: circle.used + 1, spells: [...circle.spells, spell.name] };
        }),
      };
    }),
  };
}
