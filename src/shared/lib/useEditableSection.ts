import { useState } from 'react';
import type { Character } from '@/entities/character/model/types';

/** Reverts exactly the given top-level keys back to `snapshot`'s values, applied onto `current`
 * — never a blind `update(() => snapshot)` full-object replace. Only `keys` (the ones this
 * specific section actually touched — see `useEditableSection`'s `update`) are ever reassigned,
 * so a *different* top-level key changed by another section editing the same character at the
 * same time (e.g. `QuickStats` can keep `HpDialog` and `AbilityDialog` open together) is left
 * exactly as `current` has it, not rolled back to a stale copy from this section's own snapshot. */
export function revertKeys<T extends object>(current: T, snapshot: T, keys: Iterable<keyof T>): T {
  const reverted = { ...current };
  for (const key of keys) {
    reverted[key] = snapshot[key];
  }
  return reverted;
}

export interface UseEditableSectionArgs {
  open: boolean;
  /** When true, the popup opens straight into edit mode instead of the read-only preview —
   * there's nothing useful to preview when a section has no data yet. */
  isEmpty: boolean;
  character: Character;
  update: (updater: (c: Character) => Character) => void;
  onOpenChange: (open: boolean) => void;
}

/**
 * Standardizes the view/edit toggle shared by every field-editing sheet popup:
 * - Starts in edit mode when the section is empty, otherwise in the read-only preview.
 * - Every field in these popups saves immediately on change (no separate draft state) — so
 *   "unsaved changes" here means "changed since edit mode was entered, and could still be
 *   undone". Tracked precisely: the `update` this hook returns (use it instead of the raw
 *   `update` prop for every field change while editing) records exactly which top-level
 *   `Character` keys this section's own edits touched.
 * - Closing (backdrop click, Escape, the X button) while dirty is intercepted: a confirm step
 *   offers to keep the change (already saved — just closes) or discard it (reverts only the
 *   keys this section touched back to the snapshot taken when edit mode was entered — a
 *   concurrent edit to some other key, from another section open on the same character, is
 *   never touched by this).
 * - Re-opening the popup always resets to the read-only preview (never resumes edit mode),
 *   regardless of how it was last closed.
 */
export function useEditableSection({
  open,
  isEmpty,
  character,
  update,
  onOpenChange,
}: UseEditableSectionArgs) {
  // "Adjusting state during render" (React's own recommended pattern for resetting state when
  // a prop changes, in place of an effect+setState round trip): comparing against the previous
  // `open` value and calling setState conditionally, right here in the render body, lets React
  // apply it before painting — no extra effect, no ref read during render.
  const [prevOpen, setPrevOpen] = useState(open);
  const [editingState, setEditingState] = useState(isEmpty && character.active);
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [snapshot, setSnapshot] = useState(character);
  const [touchedKeys, setTouchedKeys] = useState<ReadonlySet<keyof Character>>(() => new Set());

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setEditingState(isEmpty && character.active);
      setSnapshot(character);
      setTouchedKeys(new Set());
    }
  }

  const setEditing = (next: boolean) => {
    // An inactive (archived) character is read-only everywhere else in the app — auto-entering
    // edit mode just because a section happens to be empty would silently bypass that.
    if (next && !character.active) return;
    if (next) {
      setSnapshot(character);
      setTouchedKeys(new Set());
    }
    setEditingState(next);
  };

  /** Wraps the raw `update` prop to record which top-level keys this section's own edits
   * touch, so `discardChanges` can revert only those — see the module doc above. */
  const trackedUpdate = (updater: (c: Character) => Character) => {
    update((current) => {
      const next = updater(current);
      const changedKeys = (Object.keys(next) as (keyof Character)[]).filter(
        (key) => next[key] !== current[key],
      );
      if (changedKeys.length > 0) {
        setTouchedKeys((prev) => new Set([...prev, ...changedKeys]));
      }
      return next;
    });
  };

  const dirty = editingState && touchedKeys.size > 0;

  const requestClose = () => {
    if (dirty) {
      setConfirmingClose(true);
      return;
    }
    onOpenChange(false);
  };

  const keepChanges = () => {
    setConfirmingClose(false);
    onOpenChange(false);
  };

  const discardChanges = () => {
    update((current) => revertKeys(current, snapshot, touchedKeys));
    setConfirmingClose(false);
    onOpenChange(false);
  };

  const cancelClose = () => setConfirmingClose(false);

  return {
    editing: editingState,
    setEditing,
    /** Use this instead of the raw `update` prop for every field change made while editing —
     * it's what makes discard precise (see module doc). */
    update: trackedUpdate,
    requestClose,
    confirmingClose,
    keepChanges,
    discardChanges,
    cancelClose,
  };
}
