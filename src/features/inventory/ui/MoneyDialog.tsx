import { useState } from 'react';
import type { Character } from '@/entities/character/model/types';
import { moneyTotalInPo } from '@/entities/character/model/calculations';
import { Popup } from '@/shared/ui/organisms/Popup';
import { EditToggleButton } from '@/shared/ui/molecules/EditToggleButton';
import { setMoneyField } from '../model/mutations';

const COINS = [
  { key: 'pc', label: 'Peças de cobre (PC)', color: 'text-orange-300' },
  { key: 'pp', label: 'Peças de prata (PP)', color: 'text-neutral-300' },
  { key: 'po', label: 'Peças de ouro (PO)', color: 'text-amber-400' },
  { key: 'pl', label: 'Peças de platina (PL)', color: 'text-sky-300' },
] as const;

export function MoneyDialog({
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
  const [editing, setEditing] = useState(false);

  return (
    <Popup
      open={open}
      onOpenChange={onOpenChange}
      title="Dinheiro"
      size="sm"
      headerActions={
        character.active && (
          <EditToggleButton editing={editing} onToggle={() => setEditing((e) => !e)} />
        )
      }
    >
      {!editing ? (
        <>
          <div className="grid grid-cols-4 gap-2">
            {COINS.map((coin) => (
              <div
                key={coin.key}
                className="rounded-lg border border-neutral-800 bg-neutral-950 py-3 text-center"
              >
                <p className={`text-lg font-semibold ${coin.color}`}>{character.money[coin.key]}</p>
                <p className="text-[10px] text-neutral-500">{coin.key.toUpperCase()}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-neutral-500">
            Total equivalente:{' '}
            <span className="text-neutral-300">
              {moneyTotalInPo(character.money).toFixed(2).replace('.', ',')} PO
            </span>
          </p>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {COINS.map((coin) => (
            <label key={coin.key} className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-neutral-400">{coin.label}</span>
              <input
                type="number"
                value={character.money[coin.key]}
                onChange={(e) =>
                  update((c) => setMoneyField(c, coin.key, Number(e.target.value) || 0))
                }
                className="rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-100 outline-none focus:border-amber-500"
              />
            </label>
          ))}
        </div>
      )}
    </Popup>
  );
}
