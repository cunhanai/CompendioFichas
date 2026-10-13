import { ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/cn';

export interface PickerFieldProps {
  label?: string;
  value: string;
  placeholder?: string;
  onClick: () => void;
  className?: string;
}

/** Same look as TextField, but opens a picker dialog on click instead of editing inline — for a
 * field whose value comes from a list (e.g. the shared library) rather than free typing. */
export function PickerField({ label, value, placeholder, onClick, className }: PickerFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <span className="text-xs font-medium text-neutral-400">{label}</span>}
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'flex w-full items-center justify-between rounded-lg border border-neutral-700 bg-neutral-950 px-3.5 py-2.5 text-left text-sm transition outline-none hover:border-neutral-600 focus:border-amber-500',
          value ? 'text-neutral-100' : 'text-neutral-600',
          className,
        )}
      >
        {value || placeholder}
        <ChevronRight className="h-4 w-4 shrink-0 text-neutral-600" strokeWidth={2} />
      </button>
    </div>
  );
}
