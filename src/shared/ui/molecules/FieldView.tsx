import type { ReactNode } from 'react';

export interface FieldViewProps {
  label: string;
  value?: string;
  children?: ReactNode;
}

/** Label above value, read-only display — used across Identidade/Perfil. `children`, when given,
 * replaces the default plain-text value span (e.g. to show a `SourceLink` for a Fonte field). */
export function FieldView({ label, value, children }: FieldViewProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] tracking-wide text-neutral-500 uppercase">{label}</span>
      {children ?? <span className="text-sm text-neutral-200">{value}</span>}
    </div>
  );
}
