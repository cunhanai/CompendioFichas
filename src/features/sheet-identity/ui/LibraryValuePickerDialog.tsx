import { useState } from 'react';
import type { LibraryCategory, LibraryItem } from '@/entities/library-item/model/types';
import { useAppData, useLibrary } from '@/app/providers';
import { Popup } from '@/shared/ui/organisms/Popup';
import { Button } from '@/shared/ui/atoms/Button';
import { TextInput } from '@/shared/ui/atoms/TextField';

export interface LibraryValuePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  placeholder: string;
  systemId: string;
  /** A category whose items are the plain {id, name, desc, tag} shape (e.g. 'racas', 'tipos'). */
  category: Extract<LibraryCategory, 'racas' | 'tipos'>;
  onPick: (name: string) => void;
}

/** Single-value "pick from the shared library, or type a new one" dialog — same idea as
 * ClassPickerDialog, but for a field that holds one value (e.g. Raça) rather than a list. Typing
 * a name not already in the library adds it there too, same as every other library picker. */
export function LibraryValuePickerDialog({
  open,
  onOpenChange,
  title,
  placeholder,
  systemId,
  category,
  onPick,
}: LibraryValuePickerDialogProps) {
  const [text, setText] = useState('');
  const { addLibraryItem } = useAppData();
  const library = useLibrary(systemId);
  const items: LibraryItem[] = library?.[category] ?? [];

  const pick = (name: string) => {
    if (!items.some((i) => i.name === name)) {
      addLibraryItem(systemId, category, { name, desc: '' });
    }
    onPick(name);
    setText('');
    onOpenChange(false);
  };

  return (
    <Popup open={open} onOpenChange={onOpenChange} title={title} size="sm">
      <div className="mb-3 flex items-center gap-2">
        <TextInput
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1"
        />
        <Button size="sm" onClick={() => text.trim() && pick(text.trim())} className="shrink-0">
          Adicionar
        </Button>
      </div>
      {items.length > 0 && (
        <p className="mb-2 text-[11px] text-neutral-600">Ou escolha um já conhecido:</p>
      )}
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => pick(item.name)}
            className="rounded-lg bg-neutral-950 px-4 py-3 text-left text-sm text-neutral-200 transition hover:bg-neutral-800/70"
          >
            {item.name}
          </button>
        ))}
      </div>
    </Popup>
  );
}
