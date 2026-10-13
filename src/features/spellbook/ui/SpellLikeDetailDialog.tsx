import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { Character } from '@/entities/character/model/types';
import { Popup } from '@/shared/ui/organisms/Popup';
import { UnsavedChangesDialog } from '@/shared/ui/organisms/UnsavedChangesDialog';
import { ConfirmDialog } from '@/shared/ui/organisms/ConfirmDialog';
import { EditToggleButton } from '@/shared/ui/molecules/EditToggleButton';
import { FieldView } from '@/shared/ui/molecules/FieldView';
import { TextField } from '@/shared/ui/atoms/TextField';
import { Button } from '@/shared/ui/atoms/Button';
import { Markdown } from '@/shared/ui/atoms/Markdown';
import { useEditableSection } from '@/shared/lib/useEditableSection';
import { removeSpellLikeAbility, updateSpellLikeAbility } from '../model/mutations';

export interface SpellLikeDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  abilityId: string;
  character: Character;
  update: (updater: (c: Character) => Character) => void;
  /** True right after creation, so the dialog opens straight into edit mode instead of showing a
   * blank read-only view with nothing to click on. */
  startEditing?: boolean;
}

/** View/edit detail for a habilidade similar a magia — same dedicated-dialog pattern as
 * FeatDetailDialog/SpecialDetailDialog. There's no "pick from library" for this category (these
 * are tied to a specific character's bloodline/race, not a reusable catalog entry), so this is
 * the only dialog for it, covering both the freshly-created and the edit-later cases. */
export function SpellLikeDetailDialog({
  open,
  onOpenChange,
  abilityId,
  character,
  update,
  startEditing = false,
}: SpellLikeDetailDialogProps) {
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
    isEmpty: startEditing,
    character,
    update,
    onOpenChange,
  });
  const [confirmRemove, setConfirmRemove] = useState(false);
  const sla = character.spellLikeAbilities.find((s) => s.id === abilityId);
  if (!sla) return null;

  return (
    <>
      <Popup
        open={open}
        onOpenChange={requestClose}
        title={editing ? 'Editar habilidade similar a magia' : sla.name}
        size="md"
        headerActions={
          character.active && (
            <EditToggleButton editing={editing} onToggle={() => setEditing(!editing)} />
          )
        }
      >
        {!editing ? (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {sla.spells && <FieldView label="Magias de origem" value={sla.spells} />}
              {sla.usesPerDay && <FieldView label="Usos por dia" value={sla.usesPerDay} />}
              {sla.casterLevel && <FieldView label="Nível de conjurador" value={sla.casterLevel} />}
            </div>
            <Markdown>{sla.desc}</Markdown>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <TextField
              label="Nome"
              value={sla.name}
              onChange={(e) =>
                trackedUpdate((c) => updateSpellLikeAbility(c, abilityId, { name: e.target.value }))
              }
            />
            <TextField
              label="Magias de origem"
              placeholder="Ex: Enfeitiçar Pessoa, Voar"
              value={sla.spells}
              onChange={(e) =>
                trackedUpdate((c) =>
                  updateSpellLikeAbility(c, abilityId, { spells: e.target.value }),
                )
              }
            />
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Usos por dia"
                placeholder="Ex: 3/dia, à vontade"
                value={sla.usesPerDay}
                onChange={(e) =>
                  trackedUpdate((c) =>
                    updateSpellLikeAbility(c, abilityId, { usesPerDay: e.target.value }),
                  )
                }
              />
              <TextField
                label="Nível de conjurador"
                placeholder="Ex: igual ao nível efetivo, 5"
                value={sla.casterLevel}
                onChange={(e) =>
                  trackedUpdate((c) =>
                    updateSpellLikeAbility(c, abilityId, { casterLevel: e.target.value }),
                  )
                }
              />
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-neutral-400">
                Descrição{' '}
                <span className="text-neutral-600">(suporta markdown: **negrito** e tabelas)</span>
              </span>
              <textarea
                rows={5}
                value={sla.desc}
                onChange={(e) =>
                  trackedUpdate((c) =>
                    updateSpellLikeAbility(c, abilityId, { desc: e.target.value }),
                  )
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
        message={`"${sla.name}" sai da ficha.`}
        confirmLabel="Remover"
        onConfirm={() => {
          update((c) => removeSpellLikeAbility(c, abilityId));
          setConfirmRemove(false);
          onOpenChange(false);
        }}
      />
    </>
  );
}
