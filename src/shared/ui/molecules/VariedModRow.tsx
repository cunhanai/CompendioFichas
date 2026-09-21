import { X } from 'lucide-react';
import { VariedDot } from '@/shared/ui/atoms/VariedDot';
import { IconButton } from '@/shared/ui/atoms/IconButton';
import { signed } from '@/shared/lib/format';

export interface VariedModRowViewProps {
  label: string;
  value: number;
}

/** Read-only row for a single "modificador variado" (dot + label + signed value). */
export function VariedModRowView({ label, value }: VariedModRowViewProps) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="flex items-center gap-2 text-neutral-400">
        <VariedDot />
        {label}
      </span>
      <span className="font-medium text-neutral-100">{signed(value)}</span>
    </div>
  );
}

export interface VariedModRowEditProps {
  label: string;
  value: number;
  onLabelChange: (label: string) => void;
  onValueChange: (value: number) => void;
  onRemove: () => void;
}

/** Editable row: dot + label input + value input + remove button. */
export function VariedModRowEdit({
  label,
  value,
  onLabelChange,
  onValueChange,
  onRemove,
}: VariedModRowEditProps) {
  return (
    <div className="flex items-center gap-2">
      <VariedDot />
      <input
        type="text"
        value={label}
        onChange={(e) => onLabelChange(e.target.value)}
        placeholder="Descrição"
        className="min-w-0 flex-1 rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm text-neutral-200 outline-none focus:border-amber-500"
      />
      <input
        type="number"
        value={value}
        onChange={(e) => onValueChange(Number(e.target.value) || 0)}
        placeholder="+0"
        className="w-16 shrink-0 rounded-lg border border-neutral-700 bg-neutral-950 px-2 py-2 text-right text-sm text-neutral-200 outline-none focus:border-amber-500"
      />
      <IconButton label="Remover modificador" variant="danger" size="md" onClick={onRemove}>
        <X className="h-4 w-4" />
      </IconButton>
    </div>
  );
}
