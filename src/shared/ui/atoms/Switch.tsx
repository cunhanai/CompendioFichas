import { Switch as BaseSwitch } from '@base-ui/react/switch';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';

const trackVariants = cva('relative shrink-0 rounded-full transition', {
  variants: {
    tone: {
      amber: 'data-[checked]:bg-amber-600 data-[unchecked]:bg-neutral-700',
      emerald: 'data-[checked]:bg-emerald-600 data-[unchecked]:bg-neutral-700',
    },
    size: {
      sm: 'h-4 w-7',
      md: 'h-5 w-9',
    },
  },
  defaultVariants: { tone: 'amber', size: 'md' },
});

const thumbVariants = cva('block rounded-full bg-white transition', {
  variants: {
    size: {
      sm: 'h-3 w-3 data-[checked]:translate-x-3.5 data-[unchecked]:translate-x-0.5',
      md: 'h-4 w-4 data-[checked]:translate-x-4 data-[unchecked]:translate-x-0.5',
    },
  },
  defaultVariants: { size: 'md' },
});

export interface SwitchProps extends VariantProps<typeof trackVariants> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

/** Styled on/off switch built on Base UI's Switch primitive. */
export function Switch({ checked, onCheckedChange, label, disabled, tone, size }: SwitchProps) {
  return (
    <BaseSwitch.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      aria-label={label}
      className={cn(trackVariants({ tone, size }), disabled && 'opacity-50')}
    >
      <BaseSwitch.Thumb className={thumbVariants({ size })} />
    </BaseSwitch.Root>
  );
}
