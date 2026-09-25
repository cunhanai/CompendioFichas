import { useState } from 'react';
import type { Character } from '@/entities/character/model/types';

/** Reverts only the top-level keys that actually differ between `current` and `snapshot` (the
 * character as it was when edit mode was entered), applied onto `current` — never a blind
 * `update(() => snapshot)` full-object replace. A key that already matches the snapshot is left
 * exactly as `current` has it rather than being reassigned to an equal-but-stale copy, so a key
 * this popup never touches can't be rolled back to an outdated value by anything discard does. */
export function revertChangedKeys<T extends object>(current: T, snapshot: T): T {
  const reverted = { ...current };
  for (const key of Object.keys(snapshot) as (keyof T)[]) {
    if (current[key] !== snapshot[key]) {
      reverted[key] = snapshot[key];
    }
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
 *   undone". Detected by reference: `update` always returns a new `Character` object, so a
 *   changed reference means a real edit happened while `editing` was true.
 * - Closing (backdrop click, Escape, the X button) while dirty is intercepted: a confirm step
 *   offers to keep the change (already saved — just closes) or discard it (restores the
 *   character to the snapshot taken when edit mode was entered).
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

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setEditingState(isEmpty && character.active);
      setSnapshot(character);
    }
  }

  const setEditing = (next: boolean) => {
    // An inactive (archived) character is read-only everywhere else in the app — auto-entering
    // edit mode just because a section happens to be empty would silently bypass that.
    if (next && !character.active) return;
    if (next) setSnapshot(character);
    setEditingState(next);
  };

  const dirty = editingState && character !== snapshot;

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
    update((current) => revertChangedKeys(current, snapshot));
    setConfirmingClose(false);
    onOpenChange(false);
  };

  const cancelClose = () => setConfirmingClose(false);

  return {
    editing: editingState,
    setEditing,
    requestClose,
    confirmingClose,
    keepChanges,
    discardChanges,
    cancelClose,
  };
}
