import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import { cn } from '@/shared/lib/cn';

export interface PillTabOption<T extends string> {
  value: T;
  label: string;
}

export interface PillTabsProps<T extends string> {
  value: T;
  onValueChange: (value: T) => void;
  options: PillTabOption<T>[];
  className?: string;
}

/** Row of equal-width pill tabs used inside popups (CA/Toque/Desprevenido, Fort/Ref/Vontade...). */
export function PillTabs<T extends string>({
  value,
  onValueChange,
  options,
  className,
}: PillTabsProps<T>) {
  return (
    <BaseTabs.Root
      value={value}
      onValueChange={(v) => onValueChange(v as T)}
      className={cn('flex gap-2', className)}
    >
      <BaseTabs.List className="flex w-full gap-2">
        {options.map((opt) => (
          <BaseTabs.Tab
            key={opt.value}
            value={opt.value}
            className="data-[active]:text-ink flex-1 rounded-lg bg-neutral-800 py-2 text-xs font-medium text-neutral-400 transition hover:text-neutral-200 data-[active]:bg-amber-500"
          >
            {opt.label}
          </BaseTabs.Tab>
        ))}
      </BaseTabs.List>
    </BaseTabs.Root>
  );
}
