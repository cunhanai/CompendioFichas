import type { ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

const iconButtonVariants = cva(
  'inline-flex shrink-0 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-40',
  {
    variants: {
      variant: {
        neutral:
          'border border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-amber-600/50 hover:text-amber-400',
        ghost: 'text-neutral-400 hover:bg-neutral-800',
        active: 'bg-emerald-600 text-white',
        amber: 'bg-amber-500 text-ink hover:bg-amber-400',
        danger:
          'border border-neutral-800 bg-neutral-900 text-neutral-500 hover:border-rose-800/50 hover:text-rose-400',
      },
      size: {
        sm: 'h-7 w-7',
        md: 'h-8 w-8',
        lg: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'neutral', size: 'md' },
  },
);

export interface IconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof iconButtonVariants> {
  label: string;
}

/** Square icon-only button. `label` sets both `title` and `aria-label` for accessibility. */
export function IconButton({ className, variant, size, label, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={cn(iconButtonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
