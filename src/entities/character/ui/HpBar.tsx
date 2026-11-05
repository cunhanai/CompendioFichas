import { Heart } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export interface HpBarProps {
  hpCurrent: number;
  hpMax: number;
  className?: string;
}

/** Heart icon + fill bar + "current/max" fraction — shared by every place that shows a
 * character's HP at a glance (`CharCard`, `DeletedCharacterViewDialog`). `className` merges onto
 * the wrapper so callers can adjust spacing/width without touching the bar itself. */
export function HpBar({ hpCurrent, hpMax, className }: HpBarProps) {
  const pct = hpMax > 0 ? Math.round((hpCurrent / hpMax) * 100) : 0;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Heart className="h-4 w-4 shrink-0 text-rose-400" fill="currentColor" />
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-800">
        <div className="h-full bg-rose-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="shrink-0 text-xs text-neutral-400">
        {hpCurrent}/{hpMax}
      </span>
    </div>
  );
}
