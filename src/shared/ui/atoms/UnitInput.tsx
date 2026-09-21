import type { InputHTMLAttributes } from 'react';
import { cn } from '@/shared/lib/cn';

export interface UnitInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  unit: string;
}

/**
 * Number input glued to a fixed unit box, e.g. "24 | anos" or "1,68 | m" — used for
 * Idade/Altura/Peso/Deslocamento in edit mode, visually one box split in half.
 */
export function UnitInput({ label, unit, className, ...props }: UnitInputProps) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-neutral-400">{label}</span>
      <div className="flex">
        <input
          type="number"
          className={cn(
            'min-w-0 flex-1 rounded-l-lg border border-r-0 border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-amber-500',
            className,
          )}
          {...props}
        />
        <span className="flex items-center rounded-r-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-500">
          {unit}
        </span>
      </div>
    </label>
  );
}
