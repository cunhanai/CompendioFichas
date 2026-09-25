import { describe, expect, it } from 'vitest';
import { revertChangedKeys } from './useEditableSection';

describe('revertChangedKeys', () => {
  it('reverts a changed key back to the snapshot value, and leaves an already-matching key exactly as `current` has it', () => {
    const snapshot = { name: 'Original', hpCurrent: 10, story: 'Old story' };
    const current = { name: 'Original', hpCurrent: 10, story: 'Edited story' };

    const reverted = revertChangedKeys(current, snapshot);

    expect(reverted.story).toBe('Old story'); // the field this popup edited — discarded
    expect(reverted.hpCurrent).toBe(10); // never differed — passed through as-is, not reassigned
    expect(reverted.name).toBe('Original'); // never differed either
  });

  it('never replaces the whole object — a key absent from the diff keeps its `current` identity', () => {
    const shared = { nested: true };
    const snapshot = { name: 'A', shared };
    const current = { name: 'B', shared };

    const reverted = revertChangedKeys(current, snapshot);

    expect(reverted.name).toBe('A');
    expect(reverted.shared).toBe(shared); // same reference — not stomped by a full-object swap
  });

  it('is a no-op when nothing changed', () => {
    const snapshot = { a: 1, b: 2 };
    const current = { a: 1, b: 2 };
    expect(revertChangedKeys(current, snapshot)).toEqual({ a: 1, b: 2 });
  });
});
