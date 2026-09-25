import { useState } from 'react';
import type { Character } from '@/entities/character/model/types';

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
  const [editingState, setEditingState] = useState(isEmpty);
  const [confirmingClose, setConfirmingClose] = useState(false);
  const [snapshot, setSnapshot] = useState(character);

  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setEditingState(isEmpty);
      setSnapshot(character);
    }
  }

  const setEditing = (next: boolean) => {
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
    update(() => snapshot);
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
