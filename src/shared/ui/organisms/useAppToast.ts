import { Toast } from '@base-ui/react/toast';

/** Convenience wrapper over Base UI's toast manager for the two cases the app needs. */
export function useAppToast() {
  const { add } = Toast.useToastManager();
  return {
    error: (description: string, title = 'Algo deu errado') =>
      add({ type: 'error', title, description }),
    success: (description: string, title = 'Pronto') =>
      add({ type: 'success', title, description }),
  };
}
