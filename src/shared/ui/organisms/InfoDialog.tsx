import type { ReactNode } from 'react';
import { Popup } from './Popup';

export interface InfoRow {
  label: string;
  value: string;
}

export interface InfoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle?: string;
  description?: string;
  rows?: InfoRow[];
  children?: ReactNode;
}

/** Generic read-only detail popup — used for spells, feats, special abilities, spell-like abilities. */
export function InfoDialog({
  open,
  onOpenChange,
  title,
  subtitle,
  description,
  rows,
  children,
}: InfoDialogProps) {
  return (
    <Popup open={open} onOpenChange={onOpenChange} title={title} subtitle={subtitle} size="md">
      {rows && rows.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3 text-xs">
          {rows.map((row) => (
            <div key={row.label} className="rounded-lg bg-neutral-950 px-3 py-2.5">
              <p className="text-neutral-500">{row.label}</p>
              <p className="mt-0.5 text-neutral-200">{row.value}</p>
            </div>
          ))}
        </div>
      )}
      {description && <p className="text-sm leading-relaxed text-neutral-300">{description}</p>}
      {children}
    </Popup>
  );
}
