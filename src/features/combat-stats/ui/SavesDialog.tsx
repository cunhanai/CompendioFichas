import { useState } from 'react';
import type { Character, Saves } from '@/entities/character/model/types';
import {
  computeAllAbilities,
  computeSave,
  SAVE_ABILITY_LABEL,
  signed,
} from '@/entities/character/model/calculations';
import { Popup } from '@/shared/ui/organisms/Popup';
import { UnsavedChangesDialog } from '@/shared/ui/organisms/UnsavedChangesDialog';
import { PillTabs } from '@/shared/ui/molecules/PillTabs';
import { EditToggleButton } from '@/shared/ui/molecules/EditToggleButton';
import { useEditableSection } from '@/shared/lib/useEditableSection';
import { setSaveField } from '../model/mutations';

export interface SavesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
  update: (updater: (c: Character) => Character) => void;
  initialTab?: keyof Saves;
}

export function SavesDialog({
  open,
  onOpenChange,
  character,
  update,
  initialTab = 'fort',
}: SavesDialogProps) {
  const [tab, setTab] = useState<keyof Saves>(initialTab);
  const isEmpty = (['fort', 'ref', 'will'] as const).every((k) => {
    const b = character.saves[k];
    return b.base === 0 && b.magic === 0 && b.misc === 0 && b.temp === 0;
  });
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

  const abilities = computeAllAbilities(character.abilities);
  const { total, abilityMod } = computeSave(tab, character, abilities);
  const block = character.saves[tab];

  return (
    <>
      <Popup
        open={open}
        onOpenChange={requestClose}
        title="Jogadas de resistência"
        size="md"
        headerActions={<EditToggleButton editing={editing} onToggle={() => setEditing(!editing)} />}
        tabs={
          <PillTabs
            value={tab}
            onValueChange={setTab}
            options={[
              { value: 'fort', label: 'Fortitude' },
              { value: 'ref', label: 'Reflexo' },
              { value: 'will', label: 'Vontade' },
            ]}
          />
        }
      >
        <p className="mb-3 text-3xl font-bold text-neutral-100">{signed(total)}</p>
        {!editing ? (
          <div className="flex flex-col divide-y divide-neutral-800/70">
            <Row label="Base" value={signed(block.base)} />
            <Row label={SAVE_ABILITY_LABEL[tab]} value={signed(abilityMod)} />
            <Row label="Mágico" value={signed(block.magic)} />
            <Row label="Variado" value={signed(block.misc)} />
            <Row label="Temporário" value={signed(block.temp)} />
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-neutral-800/70">
            <EditRow
              label="Base"
              value={block.base}
              onChange={(v) => trackedUpdate((c) => setSaveField(c, tab, 'base', v))}
            />
            <Row label={SAVE_ABILITY_LABEL[tab]} value={signed(abilityMod)} />
            <EditRow
              label="Mágico"
              value={block.magic}
              onChange={(v) => trackedUpdate((c) => setSaveField(c, tab, 'magic', v))}
            />
            <EditRow
              label="Variado"
              value={block.misc}
              onChange={(v) => trackedUpdate((c) => setSaveField(c, tab, 'misc', v))}
            />
            <EditRow
              label="Temporário"
              value={block.temp}
              onChange={(v) => trackedUpdate((c) => setSaveField(c, tab, 'temp', v))}
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-neutral-400">{label}</span>
      <span className="font-medium text-neutral-100">{value}</span>
    </div>
  );
}

function EditRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 text-sm">
      <span className="shrink-0 text-neutral-400">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-20 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-right text-neutral-100 outline-none focus:border-amber-500"
      />
    </div>
  );
}
