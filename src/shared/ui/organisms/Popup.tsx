import type { ReactNode } from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { X } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/shared/lib/cn';
import { IconButton } from '@/shared/ui/atoms/IconButton';

const popupVariants = cva(
  'fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] w-full flex-col rounded-t-2xl border border-neutral-800 bg-neutral-900 sm:inset-0 sm:m-auto sm:h-fit sm:w-full sm:rounded-2xl',
  {
    variants: {
      size: {
        sm: 'sm:max-w-sm',
        md: 'sm:max-w-md',
        lg: 'sm:max-w-lg',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

export interface PopupProps extends VariantProps<typeof popupVariants> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  subtitle?: ReactNode;
  headerActions?: ReactNode;
  tabs?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * Shared shell for every sheet popup: bottom sheet on mobile, centered modal on desktop.
 * Header (title/subtitle + optional actions + close), optional tab row, scrollable body,
 * optional footer — mirrors the recurring modal pattern from the design mock. Clicking the
 * backdrop or pressing Escape closes it (Base UI's default outside-press dismissal).
 */
export function Popup({
  open,
  onOpenChange,
  title,
  subtitle,
  headerActions,
  tabs,
  footer,
  size,
  children,
}: PopupProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Popup className={cn(popupVariants({ size }))}>
          <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
            <div className="min-w-0">
              <Dialog.Title className="font-display truncate text-base text-neutral-100">
                {title}
              </Dialog.Title>
              {subtitle && <p className="text-xs text-neutral-500">{subtitle}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {headerActions}
              <Dialog.Close
                render={
                  <IconButton label="Fechar" variant="ghost">
                    <X className="h-4.5 w-4.5" />
                  </IconButton>
                }
              />
            </div>
          </div>
          {tabs && <div className="px-5 pt-4">{tabs}</div>}
          <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
          {footer && <div className="border-t border-neutral-800 p-4">{footer}</div>}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
