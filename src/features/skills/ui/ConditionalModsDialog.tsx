import { Plus, X } from 'lucide-react';
import type { Character } from '@/entities/character/model/types';
import { Popup } from '@/shared/ui/organisms/Popup';
import { UnsavedChangesDialog } from '@/shared/ui/organisms/UnsavedChangesDialog';
import { EditToggleButton } from '@/shared/ui/molecules/EditToggleButton';
import { Badge } from '@/shared/ui/atoms/Badge';
import { useEditableSection } from '@/shared/lib/useEditableSection';
import {
  addConditionalMod,
  removeConditionalMod,
  updateConditionalMod,
} from '../model/conditionalMutations';

export interface ConditionalModsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
  update: (updater: (c: Character) => Character) => void;
}

export function ConditionalModsDialog({
  open,
  onOpenChange,
  character,
  update,
}: ConditionalModsDialogProps) {
  // An empty list here is the normal long-term state for most characters (few have conditional
  // modifiers at all), so this never auto-opens in edit mode.
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

  return (
    <>
      <Popup
        open={open}
        onOpenChange={requestClose}
        title="Modificadores condicionais"
        size="md"
        headerActions={
          character.active && (
            <EditToggleButton editing={editing} onToggle={() => setEditing(!editing)} />
          )
        }
      >
        <p className="mb-3 text-xs text-neutral-600">
          Modificadores de texto livre que não entram nas somas padrão das perícias.
        </p>
        {!editing ? (
          <>
            <div className="flex flex-wrap gap-2">
              {character.conditionalMods.map((m) => (
                <Badge key={m.id} tone="amber" size="md">
                  {m.text}
                </Badge>
              ))}
            </div>
            {character.conditionalMods.length === 0 && (
              <p className="text-xs text-neutral-600">Nenhum modificador condicional.</p>
            )}
          </>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              {character.conditionalMods.map((m) => (
                <div key={m.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={m.text}
                    onChange={(e) =>
                      trackedUpdate((c) => updateConditionalMod(c, m.id, e.target.value))
                    }
                    placeholder="Ex: Furtividade com armadura pesada −5"
                    className="min-w-0 flex-1 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => trackedUpdate((c) => removeConditionalMod(c, m.id))}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-500 hover:border-rose-800/50 hover:text-rose-400"
                  >
                    <X className="h-4 w-4" strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => trackedUpdate(addConditionalMod)}
              className="mt-3 flex items-center gap-1 text-xs font-medium text-amber-500 hover:text-amber-400"
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              Adicionar modificador
            </button>
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
