import { useState } from 'react';
import type { Character } from '@/entities/character/model/types';
import { Popup } from '@/shared/ui/organisms/Popup';
import { EditToggleButton } from '@/shared/ui/molecules/EditToggleButton';
import { setRmValue } from '../model/mutations';

export interface RmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
  update: (updater: (c: Character) => Character) => void;
}

export function RmDialog({ open, onOpenChange, character, update }: RmDialogProps) {
  const [editing, setEditing] = useState(false);

  return (
    <Popup
      open={open}
      onOpenChange={onOpenChange}
      title="Resistência a Magia"
      size="sm"
      headerActions={<EditToggleButton editing={editing} onToggle={() => setEditing((e) => !e)} />}
    >
      {!editing ? (
        <p className="mb-2 text-3xl font-bold text-neutral-100">{character.rmValue}</p>
      ) : (
        <input
          type="number"
          value={character.rmValue}
          onChange={(e) => update((c) => setRmValue(c, Number(e.target.value) || 0))}
          className="mb-3 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2 text-lg text-neutral-100 outline-none focus:border-amber-500"
        />
      )}
      <p className="text-xs text-neutral-500">
        Valor fixo de resistência a magias e efeitos mágicos, conforme raça, classe ou talento.
      </p>
    </Popup>
  );
}
