import { useState } from 'react';
import type { Character } from '@/entities/character/model/types';
import { Popup } from '@/shared/ui/organisms/Popup';
import { PillTabs } from '@/shared/ui/molecules/PillTabs';
import { EditToggleButton } from '@/shared/ui/molecules/EditToggleButton';
import { Switch } from '@/shared/ui/atoms/Switch';
import { TextField } from '@/shared/ui/atoms/TextField';
import { cn } from '@/shared/lib/cn';
import {
  adjustAmmo,
  patchWeapon,
  reloadAmmo,
  removeAmmoLogEntry,
  toggleWeaponAmmo,
} from '../model/mutations';

export interface WeaponDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  weaponId: string;
  character: Character;
  update: (updater: (c: Character) => Character) => void;
}

type Tab = 'detalhes' | 'municao' | 'historico';

export function WeaponDetailDialog({
  open,
  onOpenChange,
  weaponId,
  character,
  update,
}: WeaponDetailDialogProps) {
  const [tab, setTab] = useState<Tab>('detalhes');
  const [editing, setEditing] = useState(false);

  const weapon = character.weapons.find((w) => w.id === weaponId);
  if (!weapon) return null;

  const set = (patch: Partial<typeof weapon>) => update((c) => patchWeapon(c, weaponId, patch));

  return (
    <Popup
      open={open}
      onOpenChange={onOpenChange}
      title={weapon.name}
      size="md"
      headerActions={<EditToggleButton editing={editing} onToggle={() => setEditing((e) => !e)} />}
      tabs={
        weapon.hasAmmo && (
          <PillTabs
            value={tab}
            onValueChange={setTab}
            options={[
              { value: 'detalhes', label: 'Detalhes' },
              { value: 'municao', label: 'Munição' },
              { value: 'historico', label: 'Histórico' },
            ]}
          />
        )
      }
    >
      {(tab === 'detalhes' || !weapon.hasAmmo) &&
        (!editing ? (
          <>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <Stat label="Ataque" value={weapon.atk} />
              <Stat label="Crítico" value={weapon.crit} />
              <Stat label="Dano" value={weapon.dmg} />
              <Stat label="Tipo" value={weapon.type} />
              <div className="col-span-2 rounded-lg bg-neutral-950 px-3 py-2.5">
                <p className="text-[10px] text-neutral-500">Alcance</p>
                <p className="text-sm font-medium text-neutral-100">{weapon.range}</p>
              </div>
            </div>
            {weapon.desc && (
              <p className="mb-4 text-sm leading-relaxed text-neutral-400">{weapon.desc}</p>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-3">
            <TextField
              label="Nome"
              value={weapon.name}
              onChange={(e) => set({ name: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Ataque"
                value={weapon.atk}
                onChange={(e) => set({ atk: e.target.value })}
              />
              <TextField
                label="Crítico"
                value={weapon.crit}
                onChange={(e) => set({ crit: e.target.value })}
              />
              <TextField
                label="Dano"
                value={weapon.dmg}
                onChange={(e) => set({ dmg: e.target.value })}
              />
              <TextField
                label="Tipo"
                value={weapon.type}
                onChange={(e) => set({ type: e.target.value })}
              />
              <div className="col-span-2">
                <TextField
                  label="Alcance"
                  value={weapon.range}
                  onChange={(e) => set({ range: e.target.value })}
                />
              </div>
            </div>
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-neutral-400">Descrição personalizada</span>
              <textarea
                rows={2}
                value={weapon.desc}
                onChange={(e) => set({ desc: e.target.value })}
                className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-500"
              />
            </label>
            <div className="mt-1 flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950 px-3.5 py-2.5">
              <span className="text-sm text-neutral-300">Usa munição</span>
              <Switch
                checked={weapon.hasAmmo}
                onCheckedChange={() => update((c) => toggleWeaponAmmo(c, weaponId))}
                label="Usa munição"
              />
            </div>
            {weapon.hasAmmo && (
              <div className="grid grid-cols-2 gap-3">
                <TextField
                  label="Munição atual"
                  type="number"
                  value={weapon.ammoCurrent}
                  onChange={(e) => set({ ammoCurrent: Number(e.target.value) || 0 })}
                />
                <TextField
                  label="Munição máxima"
                  type="number"
                  value={weapon.ammoMax}
                  onChange={(e) => set({ ammoMax: Number(e.target.value) || 0 })}
                />
              </div>
            )}
          </div>
        ))}

      {tab === 'municao' && weapon.hasAmmo && (
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">
              Munição
            </p>
            <span className="text-sm font-semibold text-neutral-100">
              {weapon.ammoCurrent}
              <span className="text-xs text-neutral-500">/{weapon.ammoMax}</span>
            </span>
          </div>
          <div className="mb-3 h-2 overflow-hidden rounded-full bg-neutral-800">
            <div
              className="h-full bg-sky-500"
              style={{
                width: `${weapon.ammoMax ? Math.round((weapon.ammoCurrent / weapon.ammoMax) * 100) : 0}%`,
              }}
            />
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            <AmmoBtn onClick={() => update((c) => adjustAmmo(c, weaponId, -1))} tone="rose">
              -1
            </AmmoBtn>
            <AmmoBtn onClick={() => update((c) => adjustAmmo(c, weaponId, -5))} tone="rose">
              -5
            </AmmoBtn>
            <AmmoBtn onClick={() => update((c) => adjustAmmo(c, weaponId, 1))} tone="emerald">
              +1
            </AmmoBtn>
            <button
              title="Recarregar ao máximo"
              onClick={() => update((c) => reloadAmmo(c, weaponId))}
              className="h-9 rounded-md bg-neutral-800 text-xs font-semibold text-neutral-300 transition hover:bg-neutral-700"
            >
              Recarregar
            </button>
          </div>
        </div>
      )}

      {tab === 'historico' && weapon.hasAmmo && (
        <>
          {weapon.ammoLog.length === 0 ? (
            <p className="text-xs text-neutral-600">Nenhum uso registrado ainda.</p>
          ) : (
            <div className="flex flex-col divide-y divide-neutral-800/70">
              {weapon.ammoLog.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between gap-3 py-2.5 text-sm"
                >
                  <span
                    className={cn(
                      'font-medium whitespace-nowrap',
                      entry.delta > 0 ? 'text-emerald-300' : 'text-rose-300',
                    )}
                  >
                    {entry.delta > 0
                      ? `+${entry.delta} munição recuperada`
                      : `${entry.delta} munição usada`}
                  </span>
                  {editing && (
                    <button
                      title="Remover registro"
                      onClick={() => update((c) => removeAmmoLogEntry(c, weaponId, entry.id))}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-neutral-500 hover:bg-rose-950/60 hover:text-rose-300"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </Popup>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-neutral-950 px-3 py-2.5">
      <p className="text-[10px] text-neutral-500">{label}</p>
      <p className="text-sm font-medium text-neutral-100">{value}</p>
    </div>
  );
}

function AmmoBtn({
  children,
  onClick,
  tone,
}: {
  children: string;
  onClick: () => void;
  tone: 'rose' | 'emerald';
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'h-9 rounded-md text-sm font-semibold transition',
        tone === 'rose'
          ? 'bg-rose-950/60 text-rose-300 hover:bg-rose-900/60'
          : 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60',
      )}
    >
      {children}
    </button>
  );
}
