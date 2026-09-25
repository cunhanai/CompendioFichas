import { useState } from 'react';
import type { AbilityKey, Character } from '@/entities/character/model/types';
import { computeAbility } from '@/entities/character/model/calculations';
import { ABILITY_DESCRIPTION, ABILITY_LONG } from '@/entities/character/model/constants';
import { signed } from '@/shared/lib/format';
import { Popup } from '@/shared/ui/organisms/Popup';
import { ConfirmDialog } from '@/shared/ui/organisms/ConfirmDialog';
import { UnsavedChangesDialog } from '@/shared/ui/organisms/UnsavedChangesDialog';
import { PillTabs } from '@/shared/ui/molecules/PillTabs';
import { EditToggleButton } from '@/shared/ui/molecules/EditToggleButton';
import { VariedModRowEdit, VariedModRowView } from '@/shared/ui/molecules/VariedModRow';
import { Badge } from '@/shared/ui/atoms/Badge';
import { useEditableSection } from '@/shared/lib/useEditableSection';
import {
  addAbilityMod,
  applyAbilityDamage,
  applyAbilityDrain,
  removeAbilityLogEntry,
  removeAbilityMod,
  setAbilityBase,
  updateAbilityMod,
} from '../model/mutations';

export interface AbilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  abilityKey: AbilityKey;
  character: Character;
  update: (updater: (c: Character) => Character) => void;
}

type Tab = 'resumo' | 'danoDreno' | 'historico';

function logLabel(delta: number, type: 'dano' | 'dreno') {
  return `${delta > 0 ? '+' : ''}${delta} ${type}`;
}
function logColor(delta: number, type: 'dano' | 'dreno') {
  if (type === 'dano') return delta > 0 ? 'text-rose-300' : 'text-emerald-300';
  return delta > 0 ? 'text-violet-300' : 'text-emerald-300';
}

export function AbilityDialog({
  open,
  onOpenChange,
  abilityKey,
  character,
  update,
}: AbilityDialogProps) {
  const [tab, setTab] = useState<Tab>('resumo');
  const [removeLogId, setRemoveLogId] = useState<string | null>(null);
  const [dmgAmount, setDmgAmount] = useState(1);
  const [dmgDesc, setDmgDesc] = useState('');
  const [drainAmount, setDrainAmount] = useState(1);
  const [drainDesc, setDrainDesc] = useState('');

  const ability = character.abilities[abilityKey];
  const computed = computeAbility(ability);
  const removeLogEntry = ability.log.find((e) => e.id === removeLogId);
  const isEmpty = ability.base === 0 && ability.mods.length === 0 && ability.log.length === 0;
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

  return (
    <>
      <Popup
        open={open}
        onOpenChange={requestClose}
        title={ABILITY_LONG[abilityKey]}
        subtitle={`Total ${computed.total} · Modificador ${signed(computed.mod)}`}
        size="md"
        headerActions={<EditToggleButton editing={editing} onToggle={() => setEditing(!editing)} />}
        tabs={
          <PillTabs
            value={tab}
            onValueChange={setTab}
            options={[
              { value: 'resumo', label: 'Resumo' },
              { value: 'danoDreno', label: 'Dano/Dreno' },
              { value: 'historico', label: 'Histórico' },
            ]}
          />
        }
      >
        {tab === 'resumo' && (
          <div>
            <p className="mb-4 text-sm leading-relaxed text-neutral-300">
              {ABILITY_DESCRIPTION[abilityKey]}
            </p>
            <div className="mb-1 grid grid-cols-4 gap-2">
              {editing ? (
                <label className="flex flex-col items-center gap-1">
                  <span className="text-[10px] text-neutral-500">Base</span>
                  <input
                    type="number"
                    value={ability.base}
                    onChange={(e) =>
                      trackedUpdate((c) =>
                        setAbilityBase(c, abilityKey, Number(e.target.value) || 0),
                      )
                    }
                    className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-1 py-2 text-center text-sm text-neutral-100 outline-none focus:border-amber-500"
                  />
                </label>
              ) : (
                <div className="rounded-lg bg-neutral-950 px-2 py-2.5 text-center">
                  <p className="mb-0.5 text-[10px] text-neutral-500">Base</p>
                  <p className="text-sm font-semibold text-neutral-100">{ability.base}</p>
                </div>
              )}
              <div className="rounded-lg bg-neutral-950 px-2 py-2.5 text-center">
                <p className="mb-0.5 text-[10px] text-neutral-500">Temp.</p>
                <p className="text-sm font-semibold text-neutral-100">{signed(computed.tempSum)}</p>
              </div>
              <div className="rounded-lg bg-neutral-950 px-2 py-2.5 text-center">
                <p className="mb-0.5 text-[10px] text-neutral-500">Total</p>
                <p className="text-sm font-semibold text-neutral-100">{computed.total}</p>
              </div>
              <div className="rounded-lg bg-neutral-950 px-2 py-2.5 text-center">
                <p className="mb-0.5 text-[10px] text-neutral-500">Modificador</p>
                <p className="text-sm font-semibold text-neutral-100">{signed(computed.mod)}</p>
              </div>
            </div>

            {(computed.damage > 0 || computed.drain > 0) && (
              <button
                type="button"
                onClick={() => setTab('danoDreno')}
                className="mt-2 mb-1 flex w-full items-center gap-2 text-xs text-neutral-400 hover:text-neutral-200"
              >
                {computed.damage > 0 && <Badge tone="rose">Dano {computed.damage}</Badge>}
                {computed.drain > 0 && <Badge tone="violet">Dreno {computed.drain}</Badge>}
                <span className="ml-auto text-amber-500">ver aba Dano/Dreno →</span>
              </button>
            )}

            <div className="pt-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
                  Modificadores variados
                </p>
                {editing && (
                  <button
                    type="button"
                    onClick={() => trackedUpdate((c) => addAbilityMod(c, abilityKey))}
                    className="flex items-center gap-1 text-xs font-medium text-amber-500 hover:text-amber-400"
                  >
                    + Adicionar
                  </button>
                )}
              </div>
              {ability.mods.length === 0 && (
                <p className="text-xs text-neutral-600">Nenhum modificador variado.</p>
              )}
              {!editing ? (
                <div className="flex flex-col divide-y divide-neutral-800/70">
                  {ability.mods.map((m) => (
                    <VariedModRowView key={m.id} label={m.label} value={m.value} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {ability.mods.map((m) => (
                    <VariedModRowEdit
                      key={m.id}
                      label={m.label}
                      value={m.value}
                      onLabelChange={(label) =>
                        trackedUpdate((c) => updateAbilityMod(c, abilityKey, m.id, { label }))
                      }
                      onValueChange={(value) =>
                        trackedUpdate((c) => updateAbilityMod(c, abilityKey, m.id, { value }))
                      }
                      onRemove={() => trackedUpdate((c) => removeAbilityMod(c, abilityKey, m.id))}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'danoDreno' && (
          <div>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-neutral-950 px-3 py-2.5 text-center">
                <p className="mb-1 text-[10px] tracking-wider text-neutral-500 uppercase">
                  Dano (recuperável)
                </p>
                <p className="text-lg font-semibold text-rose-300">{ability.damage}</p>
              </div>
              <div className="rounded-lg bg-neutral-950 px-3 py-2.5 text-center">
                <p className="mb-1 text-[10px] tracking-wider text-neutral-500 uppercase">
                  Dreno (permanente)
                </p>
                <p className="text-lg font-semibold text-violet-300">{ability.drain}</p>
              </div>
            </div>

            {editing ? (
              <div className="flex flex-col gap-3">
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3.5">
                  <p className="mb-2 text-xs font-medium text-neutral-400">Registrar dano</p>
                  <div className="mb-2 flex gap-2">
                    <input
                      type="number"
                      value={dmgAmount}
                      onChange={(e) => setDmgAmount(Number(e.target.value) || 0)}
                      className="w-16 rounded-lg border border-neutral-700 bg-neutral-950 px-2 py-2 text-center text-sm text-neutral-100 outline-none focus:border-amber-500"
                    />
                    <input
                      type="text"
                      value={dmgDesc}
                      onChange={(e) => setDmgDesc(e.target.value)}
                      placeholder="Descrição (ex: veneno de aranha)"
                      className="min-w-0 flex-1 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-500"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="h-8 flex-1 rounded-md bg-emerald-950/60 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-900/60"
                      onClick={() => {
                        trackedUpdate((c) =>
                          applyAbilityDamage(c, abilityKey, -dmgAmount, dmgDesc),
                        );
                        setDmgAmount(1);
                        setDmgDesc('');
                      }}
                    >
                      Recuperar
                    </button>
                    <button
                      className="h-8 flex-1 rounded-md bg-rose-950/60 text-xs font-semibold text-rose-300 transition hover:bg-rose-900/60"
                      onClick={() => {
                        trackedUpdate((c) => applyAbilityDamage(c, abilityKey, dmgAmount, dmgDesc));
                        setDmgAmount(1);
                        setDmgDesc('');
                      }}
                    >
                      Aplicar dano
                    </button>
                  </div>
                </div>
                <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3.5">
                  <p className="mb-2 text-xs font-medium text-neutral-400">Registrar dreno</p>
                  <div className="mb-2 flex gap-2">
                    <input
                      type="number"
                      value={drainAmount}
                      onChange={(e) => setDrainAmount(Number(e.target.value) || 0)}
                      className="w-16 rounded-lg border border-neutral-700 bg-neutral-950 px-2 py-2 text-center text-sm text-neutral-100 outline-none focus:border-amber-500"
                    />
                    <input
                      type="text"
                      value={drainDesc}
                      onChange={(e) => setDrainDesc(e.target.value)}
                      placeholder="Descrição (ex: toque de nível negativo)"
                      className="min-w-0 flex-1 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-500"
                    />
                  </div>
                  <button
                    className="h-8 w-full rounded-md bg-violet-950/60 text-xs font-semibold text-violet-300 transition hover:bg-violet-900/60"
                    onClick={() => {
                      trackedUpdate((c) =>
                        applyAbilityDrain(c, abilityKey, drainAmount, drainDesc),
                      );
                      setDrainAmount(1);
                      setDrainDesc('');
                    }}
                  >
                    Aplicar dreno
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-neutral-600">
                Ative o modo de edição para registrar dano ou dreno.
              </p>
            )}
          </div>
        )}

        {tab === 'historico' &&
          (ability.log.length === 0 ? (
            <p className="text-xs text-neutral-600">Nenhum registro ainda.</p>
          ) : (
            <div className="flex flex-col divide-y divide-neutral-800/70">
              {ability.log.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <div className="min-w-0">
                    <span
                      className={`block font-medium whitespace-nowrap ${logColor(entry.delta, entry.type)}`}
                    >
                      {logLabel(entry.delta, entry.type)}
                    </span>
                    {entry.desc && (
                      <span className="block truncate text-xs text-neutral-500">{entry.desc}</span>
                    )}
                  </div>
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
      </Popup>

      <ConfirmDialog
        open={removeLogId != null}
        onOpenChange={(o) => !o && setRemoveLogId(null)}
        title="Remover registro?"
        message={
          <>
            Remover "
            <span className="text-neutral-300">
              {removeLogEntry ? logLabel(removeLogEntry.delta, removeLogEntry.type) : ''}
            </span>
            " do histórico. O ajuste correspondente será desfeito.
          </>
        }
        onConfirm={() => {
          if (removeLogId) trackedUpdate((c) => removeAbilityLogEntry(c, abilityKey, removeLogId));
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
