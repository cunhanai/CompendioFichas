import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { Character } from '@/entities/character/model/types';
import { Popup } from '@/shared/ui/organisms/Popup';
import { UnsavedChangesDialog } from '@/shared/ui/organisms/UnsavedChangesDialog';
import { ConfirmDialog } from '@/shared/ui/organisms/ConfirmDialog';
import { EditToggleButton } from '@/shared/ui/molecules/EditToggleButton';
import { TextField } from '@/shared/ui/atoms/TextField';
import { Button } from '@/shared/ui/atoms/Button';
import { useEditableSection } from '@/shared/lib/useEditableSection';
import { removeSpecial, updateSpecial } from '../model/mutations';

export interface SpecialDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  specialId: string;
  character: Character;
  update: (updater: (c: Character) => Character) => void;
}

/** View/edit detail for one habilidade especial already on the character — a dedicated dialog
 * (not the generic read-only InfoDialog also used by magias/talentos/habilidades tipo magia) so
 * it can carry its own edit mode and remove action, same pattern as FeatDetailDialog. */
export function SpecialDetailDialog({
  open,
  onOpenChange,
  specialId,
  character,
  update,
}: SpecialDetailDialogProps) {
  const {
    editing,
    setEditing,
    requestClose,
    confirmingClose,
    keepChanges,
    discardChanges,
    cancelClose,
    update: trackedUpdate,
  } = useEditableSection({ open, isEmpty: false, character, update, onOpenChange });
  const [confirmRemove, setConfirmRemove] = useState(false);
  const special = character.specials.find((s) => s.id === specialId);
  if (!special) return null;

  return (
    <>
      <Popup
        open={open}
        onOpenChange={requestClose}
        title={editing ? 'Editar habilidade' : special.name}
        subtitle={!editing ? special.subtitle : undefined}
        size="md"
        headerActions={
          character.active && (
            <EditToggleButton editing={editing} onToggle={() => setEditing(!editing)} />
          )
        }
      >
        {!editing ? (
          <>
            {special.uses && <p className="mb-3 text-xs text-neutral-500">Usos: {special.uses}</p>}
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-neutral-300">
              {special.desc}
            </p>
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <TextField
              label="Nome"
              value={special.name}
              onChange={(e) =>
                trackedUpdate((c) => updateSpecial(c, specialId, { name: e.target.value }))
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Subtítulo"
                value={special.subtitle}
                onChange={(e) =>
                  trackedUpdate((c) => updateSpecial(c, specialId, { subtitle: e.target.value }))
                }
              />
              <TextField
                label="Usos"
                placeholder="Ex: 3/dia"
                value={special.uses}
                onChange={(e) =>
                  trackedUpdate((c) => updateSpecial(c, specialId, { uses: e.target.value }))
                }
              />
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-neutral-400">Descrição</span>
              <textarea
                rows={5}
                value={special.desc}
                onChange={(e) =>
                  trackedUpdate((c) => updateSpecial(c, specialId, { desc: e.target.value }))
                }
                className="rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-neutral-100 outline-none focus:border-amber-500"
              />
            </label>
            <Button variant="secondary" onClick={() => setConfirmRemove(true)}>
              <Trash2 className="h-4 w-4 text-rose-400" strokeWidth={1.8} />
              Remover habilidade
            </Button>
          </div>
        )}
      </Popup>
      <UnsavedChangesDialog
        open={confirmingClose}
        onOpenChange={(o) => !o && cancelClose()}
        onSave={keepChanges}
        onDiscard={discardChanges}
      />
      <ConfirmDialog
        open={confirmRemove}
        onOpenChange={setConfirmRemove}
        title="Remover esta habilidade?"
        message={`"${special.name}" sai da ficha.`}
        confirmLabel="Remover"
        onConfirm={() => {
          update((c) => removeSpecial(c, specialId));
          setConfirmRemove(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}
