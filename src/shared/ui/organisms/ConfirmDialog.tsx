import { Dialog } from '@base-ui/react/dialog';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/ui/atoms/Button';

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: React.ReactNode;
  confirmLabel?: string;
  onConfirm: () => void;
}

/** Small "remover X?" confirmation prompt — used for languages, HP log entries, ability log entries. */
export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  message,
  confirmLabel = 'Remover',
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
        <Dialog.Popup className="fixed inset-x-0 bottom-0 z-50 flex w-full flex-col gap-4 rounded-t-2xl border border-neutral-800 bg-neutral-900 p-5 sm:inset-0 sm:m-auto sm:h-fit sm:w-full sm:max-w-sm sm:rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-950/50 text-rose-400">
              <AlertTriangle className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <Dialog.Title className="font-display text-base text-neutral-100">{title}</Dialog.Title>
          </div>
          <p className="text-xs text-neutral-500">{message}</p>
          <div className="flex gap-2">
            <Dialog.Close render={<Button variant="secondary" className="flex-1" />}>
              Cancelar
            </Dialog.Close>
            <Button variant="danger" className="flex-1" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
