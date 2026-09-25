import { describe, expect, it } from 'vitest';
import { createBlankCharacter, normalizeCharacter } from './factory';
import type { Character } from './types';

describe('normalizeCharacter', () => {
  it('fills in levelSnapshots/currentSnapshotId for a character stored before that feature existed', () => {
    const character = createBlankCharacter('pathfinder-1e', 'Teste');
    const legacy = { ...character } as Partial<Character>;
    delete legacy.levelSnapshots;
    delete legacy.currentSnapshotId;

    const normalized = normalizeCharacter(legacy as Character);

    expect(normalized.levelSnapshots).toEqual([]);
    expect(normalized.currentSnapshotId).toBeNull();
  });

  it('leaves an already well-formed character untouched (same reference)', () => {
    const character = createBlankCharacter('pathfinder-1e', 'Teste');
    expect(normalizeCharacter(character)).toBe(character);
  });
});
