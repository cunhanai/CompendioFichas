import { Heart } from 'lucide-react';
import type { Character } from '@/entities/character/model/types';
import { drLabel, drTone } from '../model/format';
import { Badge } from '@/shared/ui/atoms/Badge';

export interface HpCardProps {
  character: Character;
  onOpen: () => void;
}

/** Always-visible HP card: counter, temp/non-lethal badges, DR/immunity badges. Click opens the popup. */
export function HpCard({ character, onOpen }: HpCardProps) {
  const pct = character.hpMax > 0 ? Math.round((character.hpCurrent / character.hpMax) * 100) : 0;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="block w-full rounded-xl border border-neutral-800 bg-neutral-900/70 px-3.5 py-3 text-left"
    >
      <div className="mb-1.5 flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-[10px] tracking-wider text-neutral-500 uppercase">
          <Heart className="h-3.5 w-3.5 text-rose-400" fill="currentColor" />
          Pontos de vida
        </span>
        <span className="flex items-center gap-2">
          <span className="text-base font-semibold text-neutral-100">
            {character.hpCurrent}
            <span className="text-sm text-neutral-500">/{character.hpMax}</span>
          </span>
          {character.tempHp > 0 && (
            <span className="text-xs font-medium text-amber-400">+{character.tempHp} temp</span>
          )}
          {character.hpNonLethal > 0 && (
            <span className="text-xs font-medium text-neutral-400">
              {character.hpNonLethal} não letal
            </span>
          )}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-neutral-800">
        <div className="h-full bg-rose-500" style={{ width: `${pct}%` }} />
      </div>
      {character.drItems.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {character.drItems.map((dr) => (
            <Badge key={dr.id} tone={drTone(dr)} size="md">
              {drLabel(dr)}
            </Badge>
          ))}
        </div>
      )}
    </button>
  );
}
