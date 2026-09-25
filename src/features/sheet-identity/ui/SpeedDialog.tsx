import type { Character } from '@/entities/character/model/types';
import { formatSpeed } from '@/entities/character/model/calculations';
import { Popup } from '@/shared/ui/organisms/Popup';
import { UnsavedChangesDialog } from '@/shared/ui/organisms/UnsavedChangesDialog';
import { EditToggleButton } from '@/shared/ui/molecules/EditToggleButton';
import { UnitInput } from '@/shared/ui/atoms/UnitInput';
import { TextField } from '@/shared/ui/atoms/TextField';
import { useEditableSection } from '@/shared/lib/useEditableSection';
import { setSpeed } from '../model/mutations';

export interface SpeedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
  update: (updater: (c: Character) => Character) => void;
}

function SpeedStat({ label, value, dimmed }: { label: string; value: string; dimmed?: boolean }) {
  return (
    <div className={`rounded-lg bg-neutral-950 px-3 py-2.5 ${dimmed ? 'opacity-50' : ''}`}>
      <p className="text-[10px] text-neutral-500">{label}</p>
      <p className={`text-sm font-medium ${dimmed ? 'text-neutral-400' : 'text-neutral-100'}`}>
        {value}
      </p>
    </div>
  );
}

export function SpeedDialog({ open, onOpenChange, character, update }: SpeedDialogProps) {
  const { speed } = character;
  const isEmpty =
    speed.base === 0 &&
    speed.armor === 0 &&
    speed.fly === 0 &&
    speed.swim === 0 &&
    speed.climb === 0 &&
    speed.dig === 0;
  const {
    editing,
    setEditing,
    requestClose,
    confirmingClose,
    keepChanges,
    discardChanges,
    cancelClose,
  } = useEditableSection({ open, isEmpty, character, update, onOpenChange });

  const swimClimbDig = [
    speed.swim > 0 ? formatSpeed(speed.swim) : null,
    speed.climb > 0 ? formatSpeed(speed.climb) : null,
    speed.dig > 0 ? formatSpeed(speed.dig) : null,
  ]
    .filter(Boolean)
    .join(' / ');

  return (
    <>
      <Popup
        open={open}
        onOpenChange={requestClose}
        title="Deslocamento"
        size="sm"
        headerActions={
          character.active && (
            <EditToggleButton
              editing={editing}
              onToggle={() => setEditing(!editing)}
              label="Editar deslocamento"
            />
          )
        }
      >
        {!editing ? (
          <div className="grid grid-cols-2 gap-3">
            <SpeedStat label="Base" value={formatSpeed(speed.base)} />
            <SpeedStat label="Com armadura" value={formatSpeed(speed.armor)} />
            <SpeedStat
              label={`Voar${speed.fly > 0 && speed.flyManeuverability ? ` (${speed.flyManeuverability})` : ''}`}
              value={speed.fly > 0 ? formatSpeed(speed.fly) : '—'}
              dimmed={speed.fly <= 0}
            />
            <SpeedStat
              label="Nadar / Escalar / Cavar"
              value={swimClimbDig || '—'}
              dimmed={!swimClimbDig}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <p className="text-[11px] text-neutral-600">
              1 quadrado = 1,5 m. Deixe em branco (0) para os que o personagem não possui.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <UnitInput
                label="Base"
                unit="m"
                step={0.5}
                value={speed.base}
                onChange={(e) => update((c) => setSpeed(c, { base: Number(e.target.value) || 0 }))}
              />
              <UnitInput
                label="Com armadura"
                unit="m"
                step={0.5}
                value={speed.armor}
                onChange={(e) => update((c) => setSpeed(c, { armor: Number(e.target.value) || 0 }))}
              />
              <UnitInput
                label="Voar"
                unit="m"
                step={0.5}
                value={speed.fly}
                onChange={(e) => update((c) => setSpeed(c, { fly: Number(e.target.value) || 0 }))}
              />
              <UnitInput
                label="Nadar"
                unit="m"
                step={0.5}
                value={speed.swim}
                onChange={(e) => update((c) => setSpeed(c, { swim: Number(e.target.value) || 0 }))}
              />
              <UnitInput
                label="Escalar"
                unit="m"
                step={0.5}
                value={speed.climb}
                onChange={(e) => update((c) => setSpeed(c, { climb: Number(e.target.value) || 0 }))}
              />
              <UnitInput
                label="Cavar"
                unit="m"
                step={0.5}
                value={speed.dig}
                onChange={(e) => update((c) => setSpeed(c, { dig: Number(e.target.value) || 0 }))}
              />
            </div>
            <TextField
              label="Manobrabilidade (voo)"
              placeholder="Ex: Boa, Razoável..."
              value={speed.flyManeuverability}
              onChange={(e) => update((c) => setSpeed(c, { flyManeuverability: e.target.value }))}
            />
          </div>
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
