import type { Character, LevelSnapshot } from '@/entities/character/model/types';
import { effectiveLevel } from '@/entities/character/model/calculations';

/** Strips a Character down to what a snapshot actually stores — see CharacterSnapshotData. */
function toSnapshotData(character: Character): LevelSnapshot['data'] {
  const data: Partial<Character> = { ...character };
  delete data.levelSnapshots;
  delete data.currentSnapshotId;
  return data as LevelSnapshot['data'];
}

function appendSnapshot(
  character: Character,
  kind: LevelSnapshot['kind'],
  label: string,
  data: LevelSnapshot['data'],
): Character {
  const snapshot: LevelSnapshot = {
    id: crypto.randomUUID(),
    parentId: character.currentSnapshotId ?? null,
    level: effectiveLevel(data.classes),
    kind,
    label,
    date: new Date().toISOString(),
    deletedAt: null,
    data,
  };
  return {
    ...character,
    levelSnapshots: [...(character.levelSnapshots ?? []), snapshot],
    currentSnapshotId: snapshot.id,
  };
}

/**
 * Wraps a mutator so that, if it actually raises the character's effective level (leveling up a
 * class, or adding a new one), a snapshot of the resulting state is taken automatically —
 * snapshots are never a separate step the player has to remember. A mutator that doesn't change
 * the level (most of them) is a no-op here.
 */
export function withLevelUpSnapshot(
  mutate: (c: Character) => Character,
): (c: Character) => Character {
  return (character) => {
    const before = effectiveLevel(character.classes);
    const after = mutate(character);
    const afterLevel = effectiveLevel(after.classes);
    if (afterLevel <= before) return after;
    return appendSnapshot(after, 'level-up', `Nível ${afterLevel}`, toSnapshotData(after));
  };
}

/** Snapshots older than this feature, or otherwise corrupted, may be missing `data` (or the
 * whole array/pointer may be absent on a character predating the feature — normalizeCharacter
 * handles that at the API boundary, but every function here also treats it defensively so
 * nothing here ever crashes on a character it wasn't run on). A row without `data` can't be
 * restored or rendered, so it's excluded everywhere rather than risk it downstream. */
function wellFormedSnapshots(character: Character): LevelSnapshot[] {
  return (character.levelSnapshots ?? []).filter((s) => s.data != null);
}

/** True if `snapshotId` is on the character's active lineage (an ancestor of, or equal to, the
 * current snapshot) — these can never be deleted, since they're the record of how the character
 * actually got here. Anything else (restore points, and whatever followed them on an abandoned
 * branch) is fair game. */
export function isSnapshotProtected(character: Character, snapshotId: string): boolean {
  const byId = new Map(wellFormedSnapshots(character).map((s) => [s.id, s]));
  let cursor = character.currentSnapshotId ?? null;
  while (cursor) {
    if (cursor === snapshotId) return true;
    cursor = byId.get(cursor)?.parentId ?? null;
  }
  return false;
}

/** The active lineage, root-first — the chain of snapshots the live character actually
 * descends from. */
export function activeLineage(character: Character): LevelSnapshot[] {
  const byId = new Map(wellFormedSnapshots(character).map((s) => [s.id, s]));
  const chain: LevelSnapshot[] = [];
  let cursor = character.currentSnapshotId ?? null;
  while (cursor) {
    const snap = byId.get(cursor);
    if (!snap) break;
    chain.unshift(snap);
    cursor = snap.parentId;
  }
  return chain;
}

/** Every snapshot not on the active lineage — abandoned branches left behind by a restore. */
export function otherBranches(character: Character): LevelSnapshot[] {
  const activeIds = new Set(activeLineage(character).map((s) => s.id));
  return wellFormedSnapshots(character).filter((s) => !activeIds.has(s.id) && !s.deletedAt);
}

/**
 * Restores the character to an earlier snapshot. First snapshots the *current* live state (a
 * 'restore-point', so what was about to be overwritten is never lost), then replaces the live
 * data with the target snapshot's, and moves the active lineage pointer to it — anything that
 * came after the old current snapshot, including the restore-point just taken, becomes an
 * abandoned branch rather than disappearing.
 */
export function restoreSnapshot(character: Character, snapshotId: string): Character {
  const target = wellFormedSnapshots(character).find((s) => s.id === snapshotId);
  if (!target || target.deletedAt) return character;

  const beforeRestore = appendSnapshot(
    character,
    'restore-point',
    `Antes de restaurar para o nível ${target.level}`,
    toSnapshotData(character),
  );

  return {
    ...beforeRestore,
    ...target.data,
    levelSnapshots: beforeRestore.levelSnapshots,
    currentSnapshotId: target.id,
  };
}

/** Soft-deletes a snapshot — refused for anything on the active lineage (see isSnapshotProtected). */
export function deleteSnapshot(character: Character, snapshotId: string): Character {
  if (isSnapshotProtected(character, snapshotId)) return character;
  return {
    ...character,
    levelSnapshots: (character.levelSnapshots ?? []).map((s) =>
      s.id === snapshotId ? { ...s, deletedAt: new Date().toISOString() } : s,
    ),
  };
}
