import { useState } from 'react';
import type { Character } from '@/entities/character/model/types';
import { KNOWN_CLASSES } from '@/entities/character/model/constants';
import { Popup } from '@/shared/ui/organisms/Popup';
import { Button } from '@/shared/ui/atoms/Button';
import { TextInput } from '@/shared/ui/atoms/TextField';
import { addClass } from '../model/mutations';

export interface ClassPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
  update: (updater: (c: Character) => Character) => void;
  onAdded?: (className: string) => void;
}

export function ClassPickerDialog({
  open,
  onOpenChange,
  character,
  update,
  onAdded,
}: ClassPickerDialogProps) {
  const [text, setText] = useState('');
  const known = character.classes.map((c) => c.name);
  const candidates = KNOWN_CLASSES.filter((n) => !known.includes(n));

  const pick = (name: string) => {
    update((c) => addClass(c, name));
    onAdded?.(name);
    setText('');
    onOpenChange(false);
  };

  return (
    <Popup open={open} onOpenChange={onOpenChange} title="Adicionar classe" size="sm">
      <div className="mb-3 flex items-center gap-2">
        <TextInput
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Nome de outra classe..."
          className="min-w-0 flex-1"
        />
        <Button size="sm" onClick={() => text.trim() && pick(text.trim())} className="shrink-0">
          Adicionar
        </Button>
      </div>
      <p className="mb-2 text-[11px] text-neutral-600">Ou escolha uma classe já conhecida:</p>
      <div className="flex flex-col gap-2">
        {candidates.map((name) => (
          <button
            key={name}
            type="button"
            onClick={() => pick(name)}
            className="rounded-lg bg-neutral-950 px-4 py-3 text-left text-sm text-neutral-200 transition hover:bg-neutral-800/70"
          >
            {name} <span className="text-neutral-500">— entra no nível 1</span>
          </button>
        ))}
      </div>
    </Popup>
  );
}
