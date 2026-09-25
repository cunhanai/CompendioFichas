import type { Character } from '@/entities/character/model/types';
import { computeCarriedWeight, loadState } from '@/entities/character/model/calculations';
import { Popup } from '@/shared/ui/organisms/Popup';
import { UnsavedChangesDialog } from '@/shared/ui/organisms/UnsavedChangesDialog';
import { EditToggleButton } from '@/shared/ui/molecules/EditToggleButton';
import { useEditableSection } from '@/shared/lib/useEditableSection';
import { setLoadField } from '../model/mutations';

const FIELDS: { key: keyof Character['load']; label: string }[] = [
  { key: 'light', label: 'Carga leve (kg)' },
  { key: 'medium', label: 'Carga média (kg)' },
  { key: 'heavy', label: 'Carga pesada (kg)' },
  { key: 'overhead', label: 'Erguer sobre a cabeça (kg)' },
  { key: 'ground', label: 'Erguer do chão (kg)' },
  { key: 'drag', label: 'Arrastar/empurrar (kg)' },
];

export function LoadDialog({
  open,
  onOpenChange,
  character,
  update,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
  update: (updater: (c: Character) => Character) => void;
}) {
  const isEmpty = FIELDS.every((f) => character.load[f.key] === 0);
  const {
    editing,
    setEditing,
    requestClose,
    confirmingClose,
    keepChanges,
    discardChanges,
    cancelClose,
    update: trackedUpdate,
  } = useEditableSection({ open, isEmpty, character, update, onOpenChange });
  const carried = computeCarriedWeight(character);
  const state = loadState(carried, character.load);
  const pct =
    character.load.heavy > 0
      ? Math.min(100, Math.round((carried / character.load.heavy) * 100))
      : 0;

  return (
    <>
      <Popup
        open={open}
        onOpenChange={requestClose}
        title="Carga"
        size="sm"
        headerActions={
          character.active && (
            <EditToggleButton editing={editing} onToggle={() => setEditing(!editing)} />
          )
        }
      >
        <div className="mb-4 rounded-lg border border-neutral-800 bg-neutral-950 px-4 py-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs text-neutral-500">Carregando agora (calculado)</span>
            <span className="text-sm font-semibold text-neutral-100">
              {String(carried).replace('.', ',')} kg
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-neutral-800">
            <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
          </div>
          <p className="mt-2 text-[11px] text-neutral-500">
            Soma do peso dos equipamentos · carga {state}
          </p>
        </div>

        {!editing ? (
          <div className="grid grid-cols-2 gap-2.5 text-center">
            {FIELDS.map((f) => (
              <div key={f.key} className="rounded-lg bg-neutral-950 py-2.5">
                <p className="text-sm font-medium text-neutral-100">{character.load[f.key]} kg</p>
                <p className="text-[10px] text-neutral-500">{f.label.replace(' (kg)', '')}</p>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {FIELDS.map((f) => (
                <label key={f.key} className="flex flex-col gap-1.5">
                  <span className="text-xs font-medium text-neutral-400">{f.label}</span>
                  <input
                    type="number"
                    value={character.load[f.key]}
                    onChange={(e) =>
                      trackedUpdate((c) => setLoadField(c, f.key, Number(e.target.value) || 0))
                    }
                    className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-500"
                  />
                </label>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-neutral-600">
              A carga atual não é editável — ela vem da soma dos equipamentos do inventário.
            </p>
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
