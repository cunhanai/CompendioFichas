import { useState } from 'react';
import { Plus } from 'lucide-react';
import type { Character } from '@/entities/character/model/types';
import { useAppData, useLibrary } from '@/app/providers';
import { Popup } from '@/shared/ui/organisms/Popup';
import { ConfirmDialog } from '@/shared/ui/organisms/ConfirmDialog';
import { TextInput } from '@/shared/ui/atoms/TextField';
import { Button } from '@/shared/ui/atoms/Button';
import { addLanguage, removeLanguage } from '../model/mutations';

export interface LanguagesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
  update: (updater: (c: Character) => Character) => void;
}

export function LanguagesDialog({ open, onOpenChange, character, update }: LanguagesDialogProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const [text, setText] = useState('');
  const { addLibraryItem } = useAppData();
  const library = useLibrary(character.systemId);
  const known = character.languages.map((l) => l.name);
  const candidates = (library?.idiomas ?? []).map((i) => i.name).filter((n) => !known.includes(n));

  const removeTarget = character.languages.find((l) => l.id === removeId);

  const pick = (name: string) => {
    update((c) => addLanguage(c, name));
    setText('');
    setAddOpen(false);
  };

  return (
    <>
      <Popup open={open} onOpenChange={onOpenChange} title="Idiomas" size="sm">
        <div className="flex flex-wrap items-center gap-2">
          {character.languages.map((lang) => (
            <button
              key={lang.id}
              type="button"
              title="Remover idioma"
              onClick={() => setRemoveId(lang.id)}
              className="rounded-full bg-neutral-800 px-3 py-1.5 text-xs text-neutral-300 transition hover:bg-rose-950/50 hover:text-rose-300"
            >
              {lang.name}
            </button>
          ))}
          {character.active && (
            <button
              type="button"
              title="Adicionar idioma"
              onClick={() => setAddOpen(true)}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-dashed border-neutral-700 text-neutral-500 transition hover:border-amber-600 hover:text-amber-400"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            </button>
          )}
        </div>
      </Popup>

      <Popup open={addOpen} onOpenChange={setAddOpen} title="Adicionar idioma" size="sm">
        <div className="mb-3 flex items-center gap-2">
          <TextInput
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Nome do novo idioma..."
            className="min-w-0 flex-1"
          />
          <Button
            size="sm"
            className="shrink-0"
            onClick={() => {
              if (!text.trim()) return;
              const name = text.trim();
              if (!candidates.includes(name) && !known.includes(name)) {
                addLibraryItem(character.systemId, 'idiomas', { name, desc: '' });
              }
              pick(name);
            }}
          >
            Adicionar
          </Button>
        </div>
        {candidates.length > 0 && (
          <>
            <p className="mb-2 text-[11px] text-neutral-600">Ou escolha um já conhecido:</p>
            <div className="flex flex-col gap-2">
              {candidates.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => pick(name)}
                  className="rounded-lg bg-neutral-950 px-4 py-3 text-left text-sm text-neutral-200 transition hover:bg-neutral-800/70"
                >
                  {name}
                </button>
              ))}
            </div>
          </>
        )}
      </Popup>

      <ConfirmDialog
        open={removeId != null}
        onOpenChange={(o) => !o && setRemoveId(null)}
        title="Remover idioma?"
        message={
          <>
            Remover "<span className="text-neutral-300">{removeTarget?.name}</span>" da lista de
            idiomas do personagem.
          </>
        }
        onConfirm={() => {
          if (removeId) update((c) => removeLanguage(c, removeId));
          setRemoveId(null);
        }}
      />
    </>
  );
}
