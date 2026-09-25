import type { Character } from '@/entities/character/model/types';
import { Popup } from '@/shared/ui/organisms/Popup';
import { UnsavedChangesDialog } from '@/shared/ui/organisms/UnsavedChangesDialog';
import { EditToggleButton } from '@/shared/ui/molecules/EditToggleButton';
import { Button } from '@/shared/ui/atoms/Button';
import { useEditableSection } from '@/shared/lib/useEditableSection';
import { setStory } from '../model/mutations';

export interface StoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
  update: (updater: (c: Character) => Character) => void;
}

export function StoryDialog({ open, onOpenChange, character, update }: StoryDialogProps) {
  const {
    editing,
    setEditing,
    requestClose,
    confirmingClose,
    keepChanges,
    discardChanges,
    cancelClose,
  } = useEditableSection({
    open,
    isEmpty: !character.story,
    character,
    update,
    onOpenChange,
  });

  return (
    <>
      <Popup
        open={open}
        onOpenChange={requestClose}
        title="História do personagem"
        size="lg"
        headerActions={
          character.active && (
            <EditToggleButton editing={editing} onToggle={() => setEditing(!editing)} />
          )
        }
        footer={
          editing && (
            <Button className="w-full" onClick={() => setEditing(false)}>
              Salvar
            </Button>
          )
        }
      >
        {!editing ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap text-neutral-300">
            {character.story}
          </p>
        ) : (
          <textarea
            rows={8}
            value={character.story}
            onChange={(e) => update((c) => setStory(c, e.target.value))}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-3 text-sm text-neutral-200 outline-none focus:border-amber-500"
          />
        )}
      </Popup>
      <UnsavedChangesDialog
        open={confirmingClose}
        onOpenChange={(o) => !o && cancelClose()}
        onSave={keepChanges}
        onDiscard={discardChanges}
      />
    </>
  );
}
