import type { Character } from '@/entities/character/model/types';
import { Popup } from '@/shared/ui/organisms/Popup';
import { UnsavedChangesDialog } from '@/shared/ui/organisms/UnsavedChangesDialog';
import { EditToggleButton } from '@/shared/ui/molecules/EditToggleButton';
import { Button } from '@/shared/ui/atoms/Button';
import { Markdown } from '@/shared/ui/atoms/Markdown';
import { useEditableSection } from '@/shared/lib/useEditableSection';
import { setNotasAdicionais } from '../model/mutations';

export interface NotasAdicionaisDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
  update: (updater: (c: Character) => Character) => void;
}

/** Free-text notes for the aba Combate — same view/edit/markdown pattern as StoryDialog. Generic
 * on purpose: the field isn't "combos" specifically, combos are just one suggested use. */
export function NotasAdicionaisDialog({
  open,
  onOpenChange,
  character,
  update,
}: NotasAdicionaisDialogProps) {
  const {
    editing,
    setEditing,
    requestClose,
    confirmingClose,
    keepChanges,
    discardChanges,
    cancelClose,
    update: trackedUpdate,
  } = useEditableSection({
    open,
    isEmpty: !character.notasAdicionais,
    character,
    update,
    onOpenChange,
  });

  return (
    <>
      <Popup
        open={open}
        onOpenChange={requestClose}
        title="Anotações adicionais"
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
          <Markdown>{character.notasAdicionais}</Markdown>
        ) : (
          <>
            <p className="mb-1.5 text-xs text-neutral-600">
              Anote o que quiser aqui — combos de combate, lembretes de regra, o que for. Suporta
              markdown: **negrito**, *itálico* e tabelas.
            </p>
            <textarea
              rows={8}
              value={character.notasAdicionais}
              onChange={(e) => trackedUpdate((c) => setNotasAdicionais(c, e.target.value))}
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-3 text-sm text-neutral-200 outline-none focus:border-amber-500"
            />
          </>
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
