import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

const badgeVariants = cva('inline-flex items-center rounded-full font-medium', {
  variants: {
    tone: {
      neutral: 'bg-neutral-800 text-neutral-400',
      amber: 'border border-amber-800/40 bg-amber-950/40 text-amber-300',
      emerald: 'bg-emerald-900/40 text-emerald-400',
      rose: 'bg-rose-950/50 text-rose-300',
      sky: 'border border-sky-800/40 bg-sky-950/50 text-sky-300',
      violet: 'border border-violet-800/40 bg-violet-950/50 text-violet-300',
    },
    size: {
      sm: 'px-2 py-0.5 text-[10px] uppercase tracking-wide',
      md: 'px-3 py-1.5 text-xs',
    },
  },
  defaultVariants: { tone: 'neutral', size: 'md' },
});

export interface BadgeProps
  extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone, size }), className)} {...props} />;
}
