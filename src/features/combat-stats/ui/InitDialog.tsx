import type { Character } from '@/entities/character/model/types';
import {
  computeAllAbilities,
  computeInitiative,
  signed,
} from '@/entities/character/model/calculations';
import { Popup } from '@/shared/ui/organisms/Popup';
import { UnsavedChangesDialog } from '@/shared/ui/organisms/UnsavedChangesDialog';
import { EditToggleButton } from '@/shared/ui/molecules/EditToggleButton';
import { VariedModRowEdit, VariedModRowView } from '@/shared/ui/molecules/VariedModRow';
import { useEditableSection } from '@/shared/lib/useEditableSection';
import { addInitVariedMod, removeInitVariedMod, updateInitVariedMod } from '../model/mutations';

export interface InitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
  update: (updater: (c: Character) => Character) => void;
}

export function InitDialog({ open, onOpenChange, character, update }: InitDialogProps) {
  // Initiative is always derived from the Dex modifier — an empty variedMods list is the normal
  // long-term state for most characters, not "no data yet", so this never auto-opens in edit mode.
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
  const abilities = computeAllAbilities(character.abilities);
  const total = computeInitiative(character, abilities);

  return (
    <>
      <Popup
        open={open}
        onOpenChange={requestClose}
        title="Iniciativa"
        size="md"
        headerActions={<EditToggleButton editing={editing} onToggle={() => setEditing(!editing)} />}
      >
        <p className="mb-3 text-3xl font-bold text-neutral-100">{signed(total)}</p>
        <div className="mb-1 flex flex-col divide-y divide-neutral-800/70">
          <div className="flex items-center justify-between py-2 text-sm">
            <span className="text-neutral-400">Modificador de Destreza</span>
            <span className="font-medium text-neutral-100">{signed(abilities.dex.mod)}</span>
          </div>
        </div>
        <div className="pt-3">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-neutral-400">Modificadores variados</span>
            {editing && (
              <button
                type="button"
                onClick={() => trackedUpdate(addInitVariedMod)}
                className="flex items-center gap-1 text-xs font-medium text-amber-500 hover:text-amber-400"
              >
                + Adicionar
              </button>
            )}
          </div>
          {character.initVariedMods.length === 0 && (
            <p className="text-xs text-neutral-600">Nenhum modificador variado.</p>
          )}
          {!editing ? (
            <div className="flex flex-col divide-y divide-neutral-800/70">
              {character.initVariedMods.map((m) => (
                <VariedModRowView key={m.id} label={m.label} value={m.value} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {character.initVariedMods.map((m) => (
                <VariedModRowEdit
                  key={m.id}
                  label={m.label}
                  value={m.value}
                  onLabelChange={(label) =>
                    trackedUpdate((c) => updateInitVariedMod(c, m.id, { label }))
                  }
                  onValueChange={(value) =>
                    trackedUpdate((c) => updateInitVariedMod(c, m.id, { value }))
                  }
                  onRemove={() => trackedUpdate((c) => removeInitVariedMod(c, m.id))}
                />
              ))}
            </div>
          )}
        </div>
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
