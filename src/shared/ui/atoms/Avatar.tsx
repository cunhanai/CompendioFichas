import { User } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

const avatarVariants = cva(
  'flex shrink-0 items-center justify-center rounded-full border-2 bg-neutral-800 text-neutral-600',
  {
    variants: {
      tone: {
        neutral: 'border-neutral-700',
        amber: 'border-amber-600/50',
      },
      size: {
        sm: 'h-9 w-9',
        md: 'h-14 w-14 sm:h-16 sm:w-16',
        lg: 'h-16 w-16 md:h-20 md:w-20',
      },
    },
    defaultVariants: { tone: 'neutral', size: 'md' },
  },
);

const iconSize: Record<string, string> = {
  sm: 'h-4 w-4',
  md: 'h-7 w-7 sm:h-8 sm:w-8',
  lg: 'h-8 w-8',
};

export interface AvatarProps extends VariantProps<typeof avatarVariants> {
  className?: string;
}

/** Placeholder circular avatar (no real photo upload backend — mirrors the mock). */
export function Avatar({ tone, size = 'md', className }: AvatarProps) {
  return (
    <div className={cn(avatarVariants({ tone, size }), className)}>
      <User className={iconSize[size ?? 'md']} strokeWidth={1.5} />
    </div>
  );
}
