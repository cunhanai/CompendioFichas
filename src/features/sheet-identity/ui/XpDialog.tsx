import { useState } from 'react';
import type { Character } from '@/entities/character/model/types';
import { xpProgress } from '@/entities/character/model/calculations';
import { Popup } from '@/shared/ui/organisms/Popup';
import { EditToggleButton } from '@/shared/ui/molecules/EditToggleButton';
import { Switch } from '@/shared/ui/atoms/Switch';
import { setXp } from '../model/mutations';

export interface XpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
  update: (updater: (c: Character) => Character) => void;
}

export function XpDialog({ open, onOpenChange, character, update }: XpDialogProps) {
  const [editing, setEditing] = useState(false);
  const { pct } = xpProgress(character.xpCurrent, character.xpMax);

  return (
    <Popup
      open={open}
      onOpenChange={onOpenChange}
      title="Experiência"
      size="sm"
      headerActions={
        character.active && (
          <EditToggleButton
            editing={editing}
            onToggle={() => setEditing((e) => !e)}
            label="Editar XP"
          />
        )
      }
    >
      {!editing ? (
        character.xpEnabled ? (
          <div>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="text-neutral-300">
                {character.xpCurrent.toLocaleString('pt-BR')} XP
              </span>
              <span className="text-neutral-500">
                faltam {Math.max(0, character.xpMax - character.xpCurrent).toLocaleString('pt-BR')}{' '}
                para o próximo nível
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-neutral-800">
              <div className="h-full bg-amber-500" style={{ width: `${pct}%` }} />
            </div>
          </div>
        ) : (
          <p className="text-sm text-neutral-500">Experiência desativada nesta mesa.</p>
        )
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-lg border border-neutral-800 bg-neutral-950 px-3.5 py-2.5">
            <span className="text-sm text-neutral-300">Usar experiência (XP) nesta mesa</span>
            <Switch
              checked={character.xpEnabled}
              onCheckedChange={(v) => update((c) => setXp(c, { xpEnabled: v }))}
              label="Usar experiência nesta mesa"
            />
          </div>
          {character.xpEnabled && (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-neutral-400">XP atual</span>
                <input
                  type="number"
                  value={character.xpCurrent}
                  onChange={(e) =>
                    update((c) => setXp(c, { xpCurrent: Number(e.target.value) || 0 }))
                  }
                  className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-500"
                />
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-neutral-400">
                  XP necessário para o próximo nível
                </span>
                <input
                  type="number"
                  value={character.xpMax}
                  onChange={(e) => update((c) => setXp(c, { xpMax: Number(e.target.value) || 1 }))}
                  className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-500"
                />
              </label>
            </>
          )}
        </div>
      )}
    </Popup>
  );
}
