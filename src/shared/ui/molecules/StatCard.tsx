import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

const statCardVariants = cva(
  'flex flex-col items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/70 px-3 py-4 text-center transition',
  {
    variants: {
      tone: {
        amber: 'hover:border-amber-700/50',
        sky: 'hover:border-sky-700/50',
      },
    },
    defaultVariants: { tone: 'amber' },
  },
);

const iconToneClass: Record<string, string> = { amber: 'text-amber-400', sky: 'text-sky-400' };

export interface StatCardProps
  extends
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'value'>,
    VariantProps<typeof statCardVariants> {
  icon: ReactNode;
  value: ReactNode;
  label: string;
}

/** Clickable stat card: icon, big value, small label — used for Iniciativa/RM/BBA/BMC/DMC. */
export function StatCard({ icon, value, label, tone, className, ...props }: StatCardProps) {
  return (
    <button type="button" className={cn(statCardVariants({ tone }), className)} {...props}>
      <span className={cn('mb-1.5', iconToneClass[tone ?? 'amber'])}>{icon}</span>
      <span className="text-2xl font-bold text-neutral-100">{value}</span>
      <span className="mt-1 text-[11px] text-neutral-500">{label}</span>
    </button>
  );
}
