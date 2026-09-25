import { Dialog } from '@base-ui/react/dialog';
import { Save } from 'lucide-react';
import { Button } from '@/shared/ui/atoms/Button';

export interface UnsavedChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onDiscard: () => void;
}

/**
 * Prompt shown when closing a sheet popup that has unsaved edits (see useEditableSection).
 * "Salvar" just closes — every field already saves on change, so there's nothing left to
 * persist — while "Sair sem salvar" reverts to the snapshot taken when edit mode began.
 */
export function UnsavedChangesDialog({
  open,
  onOpenChange,
  onSave,
  onDiscard,
}: UnsavedChangesDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm" />
        <Dialog.Popup className="fixed inset-x-0 bottom-0 z-[60] flex w-full flex-col gap-4 rounded-t-2xl border border-neutral-800 bg-neutral-900 p-5 sm:inset-0 sm:m-auto sm:h-fit sm:w-full sm:max-w-sm sm:rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-950/50 text-amber-400">
              <Save className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <Dialog.Title className="font-display text-base text-neutral-100">
              Sair sem salvar?
            </Dialog.Title>
          </div>
          <p className="text-xs text-neutral-500">
            Você alterou esta seção. Quer salvar as alterações ou descartá-las?
          </p>
          <div className="flex flex-col gap-2">
            <Button className="w-full" onClick={onSave}>
              Salvar
            </Button>
            <Button variant="secondary" className="w-full" onClick={onDiscard}>
              Sair sem salvar
            </Button>
            <Dialog.Close
              render={
                <button
                  type="button"
                  className="py-1 text-center text-xs text-neutral-500 hover:text-neutral-300"
                >
                  Continuar editando
                </button>
              }
            />
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
