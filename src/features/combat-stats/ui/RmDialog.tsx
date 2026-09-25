import type { Character } from '@/entities/character/model/types';
import { Popup } from '@/shared/ui/organisms/Popup';
import { UnsavedChangesDialog } from '@/shared/ui/organisms/UnsavedChangesDialog';
import { EditToggleButton } from '@/shared/ui/molecules/EditToggleButton';
import { useEditableSection } from '@/shared/lib/useEditableSection';
import { setRmValue } from '../model/mutations';

export interface RmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
  update: (updater: (c: Character) => Character) => void;
}

export function RmDialog({ open, onOpenChange, character, update }: RmDialogProps) {
  // RM 0 is a normal, permanent state for most characters (not everyone has magic
  // resistance), so this never auto-opens in edit mode the way a truly untouched section would.
  const {
    editing,
    setEditing,
    requestClose,
    confirmingClose,
    keepChanges,
    discardChanges,
    cancelClose,
  } = useEditableSection({ open, isEmpty: false, character, update, onOpenChange });

  return (
    <>
      <Popup
        open={open}
        onOpenChange={requestClose}
        title="Resistência a Magia"
        size="sm"
        headerActions={<EditToggleButton editing={editing} onToggle={() => setEditing(!editing)} />}
      >
        {!editing ? (
          <p className="mb-2 text-3xl font-bold text-neutral-100">{character.rmValue}</p>
        ) : (
          <input
            type="number"
            value={character.rmValue}
            onChange={(e) => update((c) => setRmValue(c, Number(e.target.value) || 0))}
            className="mb-3 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-lg text-neutral-100 outline-none focus:border-amber-500"
          />
        )}
        <p className="text-xs text-neutral-500">
          Valor fixo de resistência a magias e efeitos mágicos, conforme raça, classe ou talento.
        </p>
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
