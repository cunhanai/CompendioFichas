import { describe, expect, it } from 'vitest';
import { revertKeys } from './useEditableSection';

describe('revertKeys', () => {
  it('reverts only the given keys back to the snapshot value, leaving every other key exactly as `current` has it', () => {
    const snapshot = { name: 'Original', hpCurrent: 10, story: 'Old story' };
    // Another section (e.g. HpDialog, open at the same time as this one) concurrently changed
    // hpCurrent — this section only ever touched `story`, so only `story` should be reverted.
    const current = { name: 'Original', hpCurrent: 7, story: 'Edited story' };

    const reverted = revertKeys(current, snapshot, ['story']);

    expect(reverted.story).toBe('Old story'); // the field this section edited — discarded
    expect(reverted.hpCurrent).toBe(7); // changed by a different section — preserved
    expect(reverted.name).toBe('Original'); // untouched either way
  });

  it('is a no-op when no keys are given', () => {
    const snapshot = { a: 1, b: 2 };
    const current = { a: 5, b: 2 };
    expect(revertKeys(current, snapshot, [])).toEqual({ a: 5, b: 2 });
  });

  it('never replaces the whole object — an untouched key keeps its `current` identity', () => {
    const shared = { nested: true };
    const snapshot = { name: 'A', shared };
    const current = { name: 'B', shared };

    const reverted = revertKeys(current, snapshot, ['name']);

    expect(reverted.name).toBe('A');
    expect(reverted.shared).toBe(shared); // same reference — not stomped by a full-object swap
  });
});
