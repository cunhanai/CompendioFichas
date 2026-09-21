import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

const CARD_CLASS = 'rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5';

export interface SectionCardHeaderProps {
  title: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function SectionCardHeader({ title, action, className }: SectionCardHeaderProps) {
  return (
    <div className={cn('mb-3 flex items-center justify-between gap-2', className)}>
      <h3 className="text-xs font-semibold tracking-wider text-neutral-500 uppercase">{title}</h3>
      {action}
    </div>
  );
}

/** Static, non-interactive section card — the recurring rounded panel used across the sheet. */
export function SectionCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn(CARD_CLASS, className)} {...props} />;
}

/** Clickable variant of SectionCard (opens a popup) — same shell as a <button>. */
export function SectionCardButton({
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        CARD_CLASS,
        'block w-full text-left transition hover:border-amber-700/50',
        className,
      )}
      {...props}
    />
  );
}
