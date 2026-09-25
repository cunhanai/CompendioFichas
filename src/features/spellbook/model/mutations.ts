import type { Character, SpellcastingBlock } from '@/entities/character/model/types';
import type { SpellLibraryItem } from '@/entities/library-item/model/types';

export interface NewSpellbookInput {
  className: string;
  abilityLabel: string;
  kind: SpellcastingBlock['kind'];
  circleCount: number;
}

/** Adds a fresh spellbook for a spellcasting class — every circle starts with 0 slots (set the
 * max per circle afterward, e.g. via setCircleMax, same as any other manually-tracked stat here). */
export function createSpellbook(character: Character, input: NewSpellbookInput): Character {
  const book: SpellcastingBlock = {
    className: input.className,
    abilityLabel: input.abilityLabel,
    kind: input.kind,
    cantrips: { label: 'Truques', spells: [] },
    circles: Array.from({ length: input.circleCount }, (_, i) => ({
      label: `${i + 1}º círculo`,
      used: 0,
      max: 0,
      spells: [],
    })),
  };
  return { ...character, spellbooks: [...character.spellbooks, book] };
}

export function removeSpellbook(character: Character, bookIndex: number): Character {
  return { ...character, spellbooks: character.spellbooks.filter((_, i) => i !== bookIndex) };
}

export function setCircleMax(
  character: Character,
  bookIndex: number,
  circleIndex: number,
  max: number,
): Character {
  return {
    ...character,
    spellbooks: character.spellbooks.map((book, i) => {
      if (i !== bookIndex) return book;
      return {
        ...book,
        circles: book.circles.map((circle, ci) =>
          ci === circleIndex ? { ...circle, max: Math.max(circle.used, max, 0) } : circle,
        ),
      };
    }),
  };
}

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
