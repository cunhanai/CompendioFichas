export interface FieldViewProps {
  label: string;
  value: string;
}

/** Label above value, read-only display — used across Identidade/Perfil. */
export function FieldView({ label, value }: FieldViewProps) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] tracking-wide text-neutral-500 uppercase">{label}</span>
      <span className="text-sm text-neutral-200">{value}</span>
    </div>
  );
}
