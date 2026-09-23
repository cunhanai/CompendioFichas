import { Lock, TrendingUp } from 'lucide-react';
import type { ComputedSkill } from '@/entities/character/model/calculations';
import { signed } from '@/entities/character/model/calculations';
import { ABILITY_COLOR_CLASS, ABILITY_SHORT } from '@/entities/character/model/constants';
import { cn } from '@/shared/lib/cn';
import { Tooltip } from '@/shared/ui/atoms/Tooltip';

export function SkillRow({ skill, onOpen }: { skill: ComputedSkill; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex items-center justify-between gap-3 py-2.5 text-left"
    >
      <span className="flex min-w-0 items-center gap-1.5 truncate text-sm text-neutral-200">
        {skill.trainedOnly && (
          <Lock
            className={cn(
              'h-3 w-3 shrink-0',
              skill.ranks > 0 ? 'text-emerald-400' : 'text-neutral-600',
            )}
            strokeWidth={2}
          />
        )}
        <span className="truncate">{skill.name}</span>
        <span className={cn('shrink-0 text-xs', ABILITY_COLOR_CLASS[skill.ability])}>
          ({ABILITY_SHORT[skill.ability]})
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-3 text-xs text-neutral-500">
        <Tooltip content="Graduação">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" strokeWidth={2} />
            {skill.ranks}
          </span>
        </Tooltip>
        {skill.miscTotal !== 0 && (
          <Tooltip content="Modificador variado">
            <span className="font-medium text-amber-400">{signed(skill.miscTotal)}</span>
          </Tooltip>
        )}
        <span className="text-base font-semibold text-neutral-100">{signed(skill.total)}</span>
      </span>
    </button>
  );
}
