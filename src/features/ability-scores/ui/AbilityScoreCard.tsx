import type { AbilityKey } from '@/entities/character/model/types';
import type { ComputedAbility } from '@/entities/character/model/calculations';
import { signed } from '@/shared/lib/format';
import { ABILITY_COLOR_CLASS, ABILITY_SHORT } from '@/entities/character/model/constants';
import { cn } from '@/shared/lib/cn';

export interface AbilityScoreCardProps {
  abilityKey: AbilityKey;
  computed: ComputedAbility;
  onOpen: () => void;
}

export function AbilityScoreCard({ abilityKey, computed, onOpen }: AbilityScoreCardProps) {
  const abated = computed.damage + computed.drain;
  const hasAbatement = abated > 0;
  const alertColor = computed.drain > 0 ? 'text-violet-400' : 'text-rose-400';
  const alertBorder = computed.drain > 0 ? 'border-violet-800/50' : 'border-rose-800/50';
  const original = computed.base + computed.tempSum;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        'flex flex-col items-center justify-center gap-0.5 rounded-xl border bg-neutral-950 px-2 py-3 text-center transition hover:border-neutral-600',
        hasAbatement ? alertBorder : 'border-neutral-800',
      )}
    >
      <span className={cn('text-xs font-semibold', ABILITY_COLOR_CLASS[abilityKey])}>
        {ABILITY_SHORT[abilityKey]}
      </span>
      <span className={cn('text-lg font-bold', hasAbatement ? alertColor : 'text-neutral-100')}>
        {computed.total}
      </span>
      <span className="text-xs text-neutral-400">{signed(computed.mod)}</span>
      {hasAbatement && (
        <span className="text-[10px] text-neutral-600">
          <span className="line-through">{original}</span> ▾{abated}
        </span>
      )}
    </button>
  );
}
