import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Character } from '@/entities/character/model/types';
import { Popup } from '@/shared/ui/organisms/Popup';
import { ConfirmDialog } from '@/shared/ui/organisms/ConfirmDialog';
import { UnsavedChangesDialog } from '@/shared/ui/organisms/UnsavedChangesDialog';
import { PillTabs } from '@/shared/ui/molecules/PillTabs';
import { EditToggleButton } from '@/shared/ui/molecules/EditToggleButton';
import { Badge } from '@/shared/ui/atoms/Badge';
import { useEditableSection } from '@/shared/lib/useEditableSection';
import {
  addDrItem,
  addTempHp,
  applyLethalDamage,
  applyNonLethalDamage,
  clearTempHp,
  removeDrItem,
  removeHpLogEntry,
  setHpCurrent,
  setHpMax,
} from '../model/mutations';
import { drLabel, drTone } from '../model/format';
import { DrAddDialog } from './DrAddDialog';

export interface HpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
  update: (updater: (c: Character) => Character) => void;
}

type Tab = 'ajustar' | 'historico' | 'reducao';

const AJUSTE_BTN = 'h-9 rounded-md text-sm font-semibold transition';

function hpLogLabel(delta: number, kind: 'letal' | 'nao-letal') {
  const sign = delta > 0 ? '+' : '';
  return `${sign}${delta}${kind === 'nao-letal' ? ' não letal' : ' PV'}`;
}
function hpLogColor(delta: number, kind: 'letal' | 'nao-letal') {
  if (kind === 'nao-letal') return delta > 0 ? 'text-neutral-300' : 'text-emerald-300';
  return delta > 0 ? 'text-emerald-300' : 'text-rose-300';
}

export function HpDialog({ open, onOpenChange, character, update }: HpDialogProps) {
  const [tab, setTab] = useState<Tab>('ajustar');
  const [drAddOpen, setDrAddOpen] = useState(false);
  const [removeLogId, setRemoveLogId] = useState<string | null>(null);
  const {
    editing,
    setEditing,
    requestClose,
    confirmingClose,
    keepChanges,
    discardChanges,
    cancelClose,
  } = useEditableSection({
    open,
    isEmpty: character.hpMax === 0,
    character,
    update,
    onOpenChange,
  });

  const removeLogEntry = character.hpLog.find((e) => e.id === removeLogId);

  return (
    <>
      <Popup
        open={open}
        onOpenChange={requestClose}
        title="Pontos de vida"
        size="md"
        headerActions={
          character.active && (
            <EditToggleButton editing={editing} onToggle={() => setEditing(!editing)} />
          )
        }
        tabs={
          <PillTabs
            value={tab}
            onValueChange={setTab}
            options={[
              { value: 'ajustar', label: 'Ajustar' },
              { value: 'historico', label: 'Histórico' },
              { value: 'reducao', label: 'Redução' },
            ]}
          />
        }
      >
        {tab === 'ajustar' && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              {editing ? (
                <>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-neutral-400">Vida atual</span>
                    <input
                      type="number"
                      value={character.hpCurrent}
                      onChange={(e) => update((c) => setHpCurrent(c, Number(e.target.value) || 0))}
                      className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-500"
                    />
                  </label>
                  <label className="flex flex-col gap-1.5">
                    <span className="text-xs font-medium text-neutral-400">Vida máxima</span>
                    <input
                      type="number"
                      value={character.hpMax}
                      onChange={(e) => update((c) => setHpMax(c, Number(e.target.value) || 1))}
                      className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-500"
                    />
                  </label>
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-neutral-500">Vida atual</span>
                    <span className="text-base font-semibold text-neutral-100">
                      {character.hpCurrent}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-neutral-500">Vida máxima</span>
                    <span className="text-base font-semibold text-neutral-100">
                      {character.hpMax}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div>
              <p className="mb-2 text-xs text-neutral-500">Dano letal</p>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  className={`${AJUSTE_BTN} bg-rose-950/60 text-rose-300 hover:bg-rose-900/60`}
                  onClick={() => update((c) => applyLethalDamage(c, -1))}
                >
                  -1
                </button>
                <button
                  className={`${AJUSTE_BTN} bg-rose-950/60 text-rose-300 hover:bg-rose-900/60`}
                  onClick={() => update((c) => applyLethalDamage(c, -5))}
                >
                  -5
                </button>
                <button
                  className={`${AJUSTE_BTN} bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60`}
                  onClick={() => update((c) => applyLethalDamage(c, 1))}
                >
                  +1
                </button>
                <button
                  className={`${AJUSTE_BTN} bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60`}
                  onClick={() => update((c) => applyLethalDamage(c, 5))}
                >
                  +5
                </button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs text-neutral-500">
                Dano não letal{' '}
                <span className="text-neutral-600">(atual: {character.hpNonLethal})</span>
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  className={`${AJUSTE_BTN} bg-neutral-800 text-neutral-300 hover:bg-neutral-700`}
                  onClick={() => update((c) => applyNonLethalDamage(c, 1))}
                >
                  +1
                </button>
                <button
                  className={`${AJUSTE_BTN} bg-neutral-800 text-neutral-300 hover:bg-neutral-700`}
                  onClick={() => update((c) => applyNonLethalDamage(c, 5))}
                >
                  +5
                </button>
                <button
                  className={`${AJUSTE_BTN} bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60`}
                  onClick={() => update((c) => applyNonLethalDamage(c, -1))}
                >
                  -1
                </button>
                <button
                  className={`${AJUSTE_BTN} bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60`}
                  onClick={() => update((c) => applyNonLethalDamage(c, -5))}
                >
                  -5
                </button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs text-neutral-500">Vida temporária</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => update(addTempHp)}
                  className="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-md bg-amber-950/40 text-sm font-medium text-amber-300 transition hover:bg-amber-900/50"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={2.2} />
                  Adicionar PV temporário
                </button>
                {character.tempHp > 0 && (
                  <button
                    onClick={() => update(clearTempHp)}
                    className="h-9 shrink-0 rounded-md bg-neutral-800 px-3 text-sm font-medium text-neutral-300 transition hover:bg-neutral-700"
                  >
                    Limpar (+{character.tempHp})
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {tab === 'historico' &&
          (character.hpLog.length === 0 ? (
            <p className="py-6 text-center text-sm text-neutral-500">Nenhum registro ainda.</p>
          ) : (
            <div className="flex flex-col divide-y divide-neutral-800/70">
              {character.hpLog.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <span
                    className={`font-medium whitespace-nowrap ${hpLogColor(entry.delta, entry.kind)}`}
                  >
                    {hpLogLabel(entry.delta, entry.kind)}
                  </span>
                  {editing && (
                    <button
                      title="Remover este registro"
                      onClick={() => setRemoveLogId(entry.id)}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-neutral-500 hover:bg-rose-950/60 hover:text-rose-300"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          ))}

        {tab === 'reducao' && (
          <div>
            <div className="flex flex-wrap gap-2">
              {character.drItems.map((dr) =>
                editing ? (
                  <button
                    key={dr.id}
                    type="button"
                    title="Remover"
                    onClick={() => update((c) => removeDrItem(c, dr.id))}
                    className="transition hover:opacity-70"
                  >
                    <Badge tone={drTone(dr)} size="md">
                      {drLabel(dr)}
                    </Badge>
                  </button>
                ) : (
                  <Badge key={dr.id} tone={drTone(dr)} size="md">
                    {drLabel(dr)}
                  </Badge>
                ),
              )}
              {editing && (
                <button
                  type="button"
                  title="Adicionar redução/imunidade"
                  onClick={() => setDrAddOpen(true)}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-dashed border-neutral-700 text-neutral-500 hover:border-amber-600 hover:text-amber-400"
                >
                  <Plus className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              )}
            </div>
            {character.drItems.length === 0 && (
              <p className="py-6 text-center text-sm text-neutral-500">
                Nenhuma redução ou imunidade registrada.
              </p>
            )}
          </div>
        )}
      </Popup>

      <DrAddDialog
        open={drAddOpen}
        onOpenChange={setDrAddOpen}
        onSubmit={(item) => {
          update((c) => addDrItem(c, item));
          setDrAddOpen(false);
        }}
      />

      <ConfirmDialog
        open={removeLogId != null}
        onOpenChange={(o) => !o && setRemoveLogId(null)}
        title="Remover registro?"
        message={
          <>
            Remover "
            <span className="text-neutral-300">
              {removeLogEntry ? hpLogLabel(removeLogEntry.delta, removeLogEntry.kind) : ''}
            </span>
            " do histórico de pontos de vida. O ajuste correspondente será desfeito.
          </>
        }
        onConfirm={() => {
          if (removeLogId) update((c) => removeHpLogEntry(c, removeLogId));
          setRemoveLogId(null);
        }}
      />

      <UnsavedChangesDialog
        open={confirmingClose}
        onOpenChange={(o) => !o && cancelClose()}
        onSave={keepChanges}
        onDiscard={discardChanges}
      />
    </>
  );
}
