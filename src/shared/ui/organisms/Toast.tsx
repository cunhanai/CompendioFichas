import { Toast } from '@base-ui/react/toast';
import { AlertTriangle, CheckCircle2, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

const TOAST_ICON: Record<string, ReactNode> = {
  error: <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-rose-400" strokeWidth={1.8} />,
  success: <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-400" strokeWidth={1.8} />,
};

function ToastList() {
  const { toasts } = Toast.useToastManager();

  return (
    <Toast.Portal>
      <Toast.Viewport className="fixed inset-x-0 top-4 z-[100] mx-auto flex w-full max-w-sm flex-col gap-2 px-4 md:top-6">
        {toasts.map((toast) => (
          <Toast.Root
            key={toast.id}
            toast={toast}
            className={cn(
              'relative flex items-start gap-2.5 rounded-xl border bg-neutral-900 p-3.5 pr-9 shadow-lg transition',
              'data-[ending-style]:opacity-0 data-[starting-style]:-translate-y-2 data-[starting-style]:opacity-0',
              toast.type === 'error' && 'border-rose-900/60',
              toast.type === 'success' && 'border-emerald-900/60',
              !toast.type && 'border-neutral-800',
            )}
          >
            {toast.type && TOAST_ICON[toast.type]}
            <Toast.Content className="min-w-0 flex-1">
              {toast.title && <Toast.Title className="text-sm font-medium text-neutral-100" />}
              {toast.description && (
                <Toast.Description className="mt-0.5 text-xs text-neutral-400" />
              )}
            </Toast.Content>
            <Toast.Close
              aria-label="Fechar"
              className="absolute top-3 right-3 text-neutral-500 transition hover:text-neutral-300"
            >
              <X className="h-3.5 w-3.5" strokeWidth={1.8} />
            </Toast.Close>
          </Toast.Root>
        ))}
      </Toast.Viewport>
    </Toast.Portal>
  );
}

/** App-wide toast host: mount once near the root, then use `useAppToast()` anywhere below it. */
export function AppToastProvider({ children }: { children: ReactNode }) {
  return (
    <Toast.Provider>
      {children}
      <ToastList />
    </Toast.Provider>
  );
}
