import { GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/react/sortable';
import type { Weapon } from '@/entities/character/model/types';
import { cn } from '@/shared/lib/cn';

export function WeaponRow({
  weapon,
  index,
  onOpen,
}: {
  weapon: Weapon;
  index: number;
  onOpen: () => void;
}) {
  const { ref, handleRef, isDragging } = useSortable({
    id: weapon.id,
    index,
    group: 'weapons',
  });

  return (
    <div
      ref={ref}
      className={cn(
        'flex w-full items-center gap-1 rounded-lg bg-neutral-950 transition',
        isDragging && 'opacity-40',
      )}
    >
      <button
        ref={handleRef}
        type="button"
        title="Reordenar"
        className="flex h-9 w-6 shrink-0 cursor-grab items-center justify-center text-neutral-700 hover:text-neutral-400 active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4" strokeWidth={1.8} />
      </button>
      <button
        type="button"
        onClick={onOpen}
        className="flex min-w-0 flex-1 items-center justify-between gap-3 rounded-lg px-2 py-3 text-left transition hover:bg-neutral-900"
      >
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-neutral-200">{weapon.name}</p>
          <p className="mt-0.5 truncate text-xs text-neutral-500">
            {weapon.atk} · {weapon.dmg} · crítico {weapon.crit} · {weapon.type}
          </p>
        </div>
        {weapon.hasAmmo && (
          <span
            className={cn(
              'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium',
              weapon.ammoCurrent > 0
                ? 'bg-sky-950/50 text-sky-300'
                : 'bg-rose-950/50 text-rose-300',
            )}
          >
            {weapon.ammoCurrent}/{weapon.ammoMax} mun.
          </span>
        )}
      </button>
    </div>
  );
}
