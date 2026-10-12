import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { Character } from '@/entities/character/model/types';
import { Popup } from '@/shared/ui/organisms/Popup';
import { UnsavedChangesDialog } from '@/shared/ui/organisms/UnsavedChangesDialog';
import { ConfirmDialog } from '@/shared/ui/organisms/ConfirmDialog';
import { EditToggleButton } from '@/shared/ui/molecules/EditToggleButton';
import { TextField } from '@/shared/ui/atoms/TextField';
import { Button } from '@/shared/ui/atoms/Button';
import { Markdown } from '@/shared/ui/atoms/Markdown';
import { FieldView } from '@/shared/ui/molecules/FieldView';
import { useEditableSection } from '@/shared/lib/useEditableSection';
import { removeFeat, updateFeat } from '../model/mutations';

export interface FeatDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  featId: string;
  character: Character;
  update: (updater: (c: Character) => Character) => void;
}

/** View/edit detail for one talento already on the character — a dedicated dialog (not the
 * generic read-only InfoDialog also used by magias/habilidades/habilidades tipo magia) so it can
 * carry its own edit mode and remove action, same pattern as EditEquipmentDialog. */
export function FeatDetailDialog({
  open,
  onOpenChange,
  featId,
  character,
  update,
}: FeatDetailDialogProps) {
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
  const feat = character.feats.find((f) => f.id === featId);
  if (!feat) return null;

  return (
    <>
      <Popup
        open={open}
        onOpenChange={requestClose}
        title={editing ? 'Editar talento' : feat.name}
        subtitle={!editing ? feat.tag : undefined}
        size="md"
        headerActions={
          character.active && (
            <EditToggleButton editing={editing} onToggle={() => setEditing(!editing)} />
          )
        }
      >
        {!editing ? (
          <div className="flex flex-col gap-3">
            {(feat.prerequisite || feat.benefit) && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {feat.prerequisite && <FieldView label="Pré-requisito" value={feat.prerequisite} />}
                {feat.benefit && <FieldView label="Benefício" value={feat.benefit} />}
              </div>
            )}
            <Markdown>{feat.desc}</Markdown>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <TextField
              label="Nome"
              value={feat.name}
              onChange={(e) =>
                trackedUpdate((c) => updateFeat(c, featId, { name: e.target.value }))
              }
            />
            <TextField
              label="Tag"
              value={feat.tag}
              onChange={(e) => trackedUpdate((c) => updateFeat(c, featId, { tag: e.target.value }))}
            />
            <TextField
              label="Pré-requisito"
              value={feat.prerequisite}
              onChange={(e) =>
                trackedUpdate((c) => updateFeat(c, featId, { prerequisite: e.target.value }))
              }
            />
            <TextField
              label="Benefício"
              value={feat.benefit}
              onChange={(e) =>
                trackedUpdate((c) => updateFeat(c, featId, { benefit: e.target.value }))
              }
            />
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-neutral-400">
                Descrição{' '}
                <span className="text-neutral-600">(suporta markdown: **negrito** e tabelas)</span>
              </span>
              <textarea
                rows={5}
                value={feat.desc}
                onChange={(e) =>
                  trackedUpdate((c) => updateFeat(c, featId, { desc: e.target.value }))
                }
                className="rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-sm text-neutral-100 outline-none focus:border-amber-500"
              />
            </label>
            <Button variant="secondary" onClick={() => setConfirmRemove(true)}>
              <Trash2 className="h-4 w-4 text-rose-400" strokeWidth={1.8} />
              Remover talento
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
        title="Remover este talento?"
        message={`"${feat.name}" sai da ficha.`}
        confirmLabel="Remover"
        onConfirm={() => {
          update((c) => removeFeat(c, featId));
          setConfirmRemove(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}
