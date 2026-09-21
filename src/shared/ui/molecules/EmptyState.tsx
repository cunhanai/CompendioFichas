import type { ReactNode } from 'react';

export interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

/** Dashed placeholder box used for not-yet-implemented sheet sections (Criaturas, Plano). */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-neutral-800 bg-neutral-900/40 px-6 py-12 text-center">
      <span className="text-neutral-600">{icon}</span>
      <div>
        <p className="text-sm text-neutral-300">{title}</p>
        <p className="mt-1 text-xs text-neutral-600">{description}</p>
      </div>
      {action}
    </div>
  );
}
