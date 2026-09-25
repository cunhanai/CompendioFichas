import { useState } from 'react';
import { Popup } from '@/shared/ui/organisms/Popup';
import { TextField } from '@/shared/ui/atoms/TextField';
import { UnitInput } from '@/shared/ui/atoms/UnitInput';
import { Button } from '@/shared/ui/atoms/Button';
import { ABILITY_SHORT } from '@/entities/character/model/constants';
import { cn } from '@/shared/lib/cn';
import type { SpellcastingBlock } from '@/entities/character/model/types';
import type { NewSpellbookInput } from '../model/mutations';

export interface SpellBookCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: NewSpellbookInput) => void;
}

const pillBase = 'rounded-lg px-2.5 py-1.5 text-xs font-medium transition';
const pillOn = cn(pillBase, 'bg-amber-500 text-ink');
const pillOff = cn(
  pillBase,
  'border border-neutral-700 bg-neutral-950 text-neutral-300 hover:border-neutral-600',
);

const KIND_OPTIONS: { value: SpellcastingBlock['kind']; label: string; desc: string }[] = [
  {
    value: 'espontânea',
    label: 'Espontânea',
    desc: 'Conhece magias fixas por nível e gasta de um pool de espaços por círculo.',
  },
  {
    value: 'preparada',
    label: 'Preparada',
    desc: 'Escolhe magias do círculo disponível para preparar antes do dia; pode repetir a mesma.',
  },
];

/** "Adicionar grimório": creates a new spellbook for one of the character's spellcasting
 * classes. Slot counts per circle start at 0 — set with the edit toggle on the book itself
 * afterward, the same way other manually-tracked stats work in this app. */
export function SpellBookCreateDialog({
  open,
  onOpenChange,
  onCreate,
}: SpellBookCreateDialogProps) {
  const [className, setClassName] = useState('');
  const [ability, setAbility] = useState('Int');
  const [kind, setKind] = useState<SpellcastingBlock['kind']>('preparada');
  const [circleCount, setCircleCount] = useState(4);

  const reset = () => {
    setClassName('');
    setAbility('Int');
    setKind('preparada');
    setCircleCount(4);
  };

  const canSubmit = className.trim().length > 0 && circleCount >= 1;

  return (
    <Popup
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
      title="Adicionar grimório"
      size="md"
    >
      <div className="flex flex-col gap-4">
        <TextField
          label="Classe conjuradora"
          placeholder="Ex: Mago, Clérigo, Bardo..."
          value={className}
          onChange={(e) => setClassName(e.target.value)}
        />

        <div>
          <span className="mb-1.5 block text-xs text-neutral-500">Atributo de conjuração</span>
          <div className="flex flex-wrap gap-2">
            {Object.values(ABILITY_SHORT).map((label) => (
              <button
                key={label}
                type="button"
                className={ability === label ? pillOn : pillOff}
                onClick={() => setAbility(label)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1.5 block text-xs text-neutral-500">Tipo de conjuração</span>
          <div className="flex flex-col gap-2">
            {KIND_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setKind(opt.value)}
                className={cn(
                  'rounded-lg border px-3.5 py-2.5 text-left transition',
                  kind === opt.value
                    ? 'border-amber-600/50 bg-amber-950/30'
                    : 'border-neutral-800 bg-neutral-950 hover:border-neutral-700',
                )}
              >
                <p
                  className={cn(
                    'text-sm font-medium',
                    kind === opt.value ? 'text-amber-300' : 'text-neutral-200',
                  )}
                >
                  {opt.label}
                </p>
                <p className="mt-0.5 text-[11px] text-neutral-500">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        <UnitInput
          label="Círculos de magia"
          unit="círculos"
          min={1}
          max={9}
          value={circleCount}
          onChange={(e) => setCircleCount(Math.min(9, Math.max(1, Number(e.target.value) || 1)))}
        />
        <p className="-mt-2 text-[11px] text-neutral-600">
          Quantos círculos essa classe conjura (a maioria vai até o 9º). Dá pra ajustar o número de
          espaços de cada círculo depois de criar o grimório.
        </p>

        <Button
          disabled={!canSubmit}
          onClick={() => {
            onCreate({ className: className.trim(), abilityLabel: ability, kind, circleCount });
            reset();
          }}
        >
          Criar grimório
        </Button>
      </div>
    </Popup>
  );
}
