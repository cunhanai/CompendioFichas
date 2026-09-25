import { describe, expect, it } from 'vitest';
import { createBlankCharacter } from './factory';
import type { Character } from './types';
import {
  activeLineage,
  deleteSnapshot,
  isSnapshotProtected,
  otherBranches,
  restoreSnapshot,
  withLevelUpSnapshot,
} from './snapshots';

/** Minimal stand-in for a real level-up mutation — bumps a single class's level by one. */
function bumpLevel(character: Character, delta = 1): Character {
  const cls = character.classes[0];
  const classes = cls
    ? [{ ...cls, level: cls.level + delta }]
    : [{ id: 'cls-1', name: 'Guerreiro', level: delta }];
  return { ...character, classes };
}

describe('level snapshots', () => {
  it('takes no snapshot when the mutation does not raise the effective level', () => {
    const character = createBlankCharacter('pathfinder-1e', 'Teste');
    const next = withLevelUpSnapshot((c) => ({ ...c, name: 'Renomeado' }))(character);
    expect(next.levelSnapshots).toHaveLength(0);
    expect(next.currentSnapshotId).toBeNull();
  });

  it('takes a snapshot when the effective level increases, and points currentSnapshotId at it', () => {
    const character = createBlankCharacter('pathfinder-1e', 'Teste');
    const next = withLevelUpSnapshot((c) => bumpLevel(c, 1))(character);
    expect(next.levelSnapshots).toHaveLength(1);
    expect(next.currentSnapshotId).toBe(next.levelSnapshots[0].id);
    expect(next.levelSnapshots[0].kind).toBe('level-up');
    expect(next.levelSnapshots[0].parentId).toBeNull();
    expect(next.levelSnapshots[0].level).toBe(1);
  });

  it('builds a linear active lineage across multiple level-ups', () => {
    let character = createBlankCharacter('pathfinder-1e', 'Teste');
    character = withLevelUpSnapshot((c) => bumpLevel(c, 1))(character);
    character = withLevelUpSnapshot((c) => bumpLevel(c, 1))(character);
    character = withLevelUpSnapshot((c) => bumpLevel(c, 1))(character);

    const lineage = activeLineage(character);
    expect(lineage.map((s) => s.level)).toEqual([1, 2, 3]);
    expect(otherBranches(character)).toHaveLength(0);
    for (const snap of lineage) {
      expect(isSnapshotProtected(character, snap.id)).toBe(true);
    }
  });

  it('refuses to delete a snapshot on the active lineage', () => {
    let character = createBlankCharacter('pathfinder-1e', 'Teste');
    character = withLevelUpSnapshot((c) => bumpLevel(c, 1))(character);
    const snapshotId = character.levelSnapshots[0].id;

    const afterDelete = deleteSnapshot(character, snapshotId);
    expect(afterDelete.levelSnapshots[0].deletedAt).toBeNull();
  });

  it('restore forks the timeline: old branch preserved, new branch continues from the target', () => {
    let character = createBlankCharacter('pathfinder-1e', 'Teste');
    character = withLevelUpSnapshot((c) => bumpLevel(c, 1))(character); // level 1
    const level1Id = character.currentSnapshotId!;
    character = withLevelUpSnapshot((c) => bumpLevel(c, 1))(character); // level 2
    character = withLevelUpSnapshot((c) => bumpLevel(c, 1))(character); // level 3

    character = restoreSnapshot(character, level1Id);

    // Live state now matches the level-1 snapshot's data.
    expect(character.classes[0].level).toBe(1);
    expect(character.currentSnapshotId).toBe(level1Id);

    // A restore-point was appended, capturing what was live right before the restore (level 3).
    const restorePoint = character.levelSnapshots.find((s) => s.kind === 'restore-point');
    expect(restorePoint).toBeDefined();
    expect(restorePoint!.level).toBe(3);
    expect(restorePoint!.data.classes[0].level).toBe(3);

    // The active lineage is now just [level 1] — levels 2/3 and the restore-point are all on an
    // abandoned branch.
    expect(activeLineage(character).map((s) => s.level)).toEqual([1]);
    expect(isSnapshotProtected(character, level1Id)).toBe(true);

    const branchLevels = otherBranches(character)
      .map((s) => s.level)
      .sort();
    expect(branchLevels).toEqual([2, 3, 3]); // level 2, level 3, and the level-3 restore-point

    // The old level-2/level-3 snapshots, and the restore-point, are no longer protected — they
    // can be deleted now that they're off the active lineage.
    for (const snap of otherBranches(character)) {
      expect(isSnapshotProtected(character, snap.id)).toBe(false);
    }
  });

  it('leveling up again after a restore continues the new branch, not the old one', () => {
    let character = createBlankCharacter('pathfinder-1e', 'Teste');
    character = withLevelUpSnapshot((c) => bumpLevel(c, 1))(character); // level 1
    const level1Id = character.currentSnapshotId!;
    character = withLevelUpSnapshot((c) => bumpLevel(c, 1))(character); // level 2

    character = restoreSnapshot(character, level1Id);
    character = withLevelUpSnapshot((c) => bumpLevel(c, 1))(character); // level 2 again, new branch

    const lineage = activeLineage(character);
    expect(lineage.map((s) => s.level)).toEqual([1, 2]);
    // The new level-2 snapshot's parent is the restored level-1 node, not the old level-2 or the
    // restore-point.
    expect(lineage[1].parentId).toBe(level1Id);
  });

  it('a deleted snapshot is excluded from otherBranches but its row is only soft-deleted', () => {
    let character = createBlankCharacter('pathfinder-1e', 'Teste');
    character = withLevelUpSnapshot((c) => bumpLevel(c, 1))(character);
    const level1Id = character.currentSnapshotId!;
    character = withLevelUpSnapshot((c) => bumpLevel(c, 1))(character);
    character = restoreSnapshot(character, level1Id);

    const [abandoned] = otherBranches(character);
    character = deleteSnapshot(character, abandoned.id);

    expect(otherBranches(character).some((s) => s.id === abandoned.id)).toBe(false);
    const row = character.levelSnapshots.find((s) => s.id === abandoned.id)!;
    expect(row.deletedAt).not.toBeNull();
  });
});
