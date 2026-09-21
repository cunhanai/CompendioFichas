import { useState } from 'react';
import { useCharacter } from '@/app/providers';

/** Open/close state + activate/stop mutations for a character's ShareDialog. */
export function useShareDialog(characterId: string) {
  const { character, update } = useCharacter(characterId);
  const [open, setOpen] = useState(false);

  return {
    character,
    open,
    openDialog: () => setOpen(true),
    onOpenChange: setOpen,
    onActivate: () => update((c) => ({ ...c, shared: true })),
    onStop: () => update((c) => ({ ...c, shared: false })),
  };
}
