import type { ButtonHTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 rounded-lg font-semibold transition disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-amber-500 text-ink hover:bg-amber-400 active:bg-amber-600',
        secondary: 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700',
        ghost: 'bg-transparent text-amber-500 hover:text-amber-400',
        danger: 'bg-rose-600 text-white hover:bg-rose-500',
        outline:
          'border border-dashed border-neutral-700 text-neutral-500 hover:border-amber-600 hover:text-amber-400',
      },
      size: {
        sm: 'px-3 py-2 text-xs',
        md: 'px-4 py-2.5 text-sm',
        lg: 'h-10 px-4 text-sm',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
