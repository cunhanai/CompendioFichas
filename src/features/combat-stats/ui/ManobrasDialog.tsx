import { useState } from 'react';
import type { Character } from '@/entities/character/model/types';
import {
  computeAllAbilities,
  computeManobras,
  signed,
} from '@/entities/character/model/calculations';
import { Popup } from '@/shared/ui/organisms/Popup';
import { UnsavedChangesDialog } from '@/shared/ui/organisms/UnsavedChangesDialog';
import { PillTabs } from '@/shared/ui/molecules/PillTabs';
import { EditToggleButton } from '@/shared/ui/molecules/EditToggleButton';
import { useEditableSection } from '@/shared/lib/useEditableSection';
import { setBbaValue } from '../model/mutations';

export interface ManobrasDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
  update: (updater: (c: Character) => Character) => void;
  initialTab?: 'bba' | 'bmc' | 'dmc';
}

export function ManobrasDialog({
  open,
  onOpenChange,
  character,
  update,
  initialTab = 'bba',
}: ManobrasDialogProps) {
  const [tab, setTab] = useState<'bba' | 'bmc' | 'dmc'>(initialTab);
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
    isEmpty: character.bbaValue === 0,
    character,
    update,
    onOpenChange,
  });
  const abilities = computeAllAbilities(character.abilities);
  const { bba, bmc, dmc } = computeManobras(character, abilities);

  return (
    <>
      <Popup
        open={open}
        onOpenChange={requestClose}
        title="Manobras de combate"
        size="md"
        headerActions={
          tab === 'bba' && (
            <EditToggleButton editing={editing} onToggle={() => setEditing(!editing)} />
          )
        }
        tabs={
          <PillTabs
            value={tab}
            onValueChange={setTab}
            options={[
              { value: 'bba', label: 'BBA' },
              { value: 'bmc', label: 'BMC' },
              { value: 'dmc', label: 'DMC' },
            ]}
          />
        }
      >
        {tab === 'bba' && (
          <div>
            <p className="mb-1 text-xs text-neutral-500">Bônus Base de Ataque</p>
            <p className="mb-3 text-3xl font-bold text-neutral-100">{signed(bba)}</p>
            {!editing ? (
              <div className="flex items-center justify-between border-t border-neutral-800/70 py-2 text-sm">
                <span className="text-neutral-400">Base</span>
                <span className="font-medium text-neutral-100">{signed(bba)}</span>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3 border-t border-neutral-800/70 py-2.5 text-sm">
                <span className="shrink-0 text-neutral-400">Base</span>
                <input
                  type="number"
                  value={character.bbaValue}
                  onChange={(e) =>
                    trackedUpdate((c) => setBbaValue(c, Number(e.target.value) || 0))
                  }
                  className="w-20 rounded border border-neutral-700 bg-neutral-950 px-2 py-1 text-right text-neutral-100 outline-none focus:border-amber-500"
                />
              </div>
            )}
          </div>
        )}
        {tab === 'bmc' && (
          <div>
            <p className="mb-1 text-xs text-neutral-500">Bônus de Manobra de Combate</p>
            <p className="mb-3 text-3xl font-bold text-neutral-100">{signed(bmc)}</p>
            <div className="flex flex-col divide-y divide-neutral-800/70">
              <Row label="BBA" value={signed(bba)} />
              <Row label="Mod. Força" value={signed(abilities.str.mod)} />
              <Row label="Mod. tamanho" value={signed(bmc - bba - abilities.str.mod)} />
            </div>
          </div>
        )}
        {tab === 'dmc' && (
          <div>
            <p className="mb-1 text-xs text-neutral-500">Defesa de Manobra de Combate</p>
            <p className="mb-3 text-3xl font-bold text-neutral-100">{dmc}</p>
            <div className="flex flex-col divide-y divide-neutral-800/70">
              <Row label="Base" value="10" />
              <Row label="BBA" value={signed(bba)} />
              <Row label="Mod. Força" value={signed(abilities.str.mod)} />
              <Row label="Mod. Destreza" value={signed(abilities.dex.mod)} />
            </div>
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
