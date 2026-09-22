import { useState } from 'react';
import { Check, Plus, Search } from 'lucide-react';
import type { LibraryItem } from '@/entities/library-item/model/types';
import { Popup } from '@/shared/ui/organisms/Popup';
import { cn } from '@/shared/lib/cn';

export interface FeatPickDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feats: LibraryItem[];
  addedNames: string[];
  onPick: (feat: LibraryItem) => void;
  onCreateNew: () => void;
}

export function FeatPickDialog({
  open,
  onOpenChange,
  feats,
  addedNames,
  onPick,
  onCreateNew,
}: FeatPickDialogProps) {
  const [query, setQuery] = useState('');
  const filtered = feats.filter((f) => f.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <Popup
      open={open}
      onOpenChange={onOpenChange}
      title="Buscar talento na biblioteca"
      size="md"
      footer={
        <button
          type="button"
          onClick={onCreateNew}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-800 py-2.5 text-sm font-medium text-amber-400 transition hover:bg-neutral-700"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Não achei — cadastrar novo talento na biblioteca
        </button>
      }
    >
      <div className="relative mb-3">
        <Search
          className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-500"
          strokeWidth={2}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nome do talento..."
          className="w-full rounded-lg border border-neutral-700 bg-neutral-950 py-2.5 pr-3 pl-9 text-sm text-neutral-100 outline-none focus:border-amber-500"
        />
      </div>
      <div className="flex flex-col gap-2">
        {filtered.map((feat) => {
          const added = addedNames.includes(feat.name);
          return (
            <div
              key={feat.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-neutral-950 px-4 py-3 transition hover:bg-neutral-800/70"
            >
              <div className="min-w-0">
                <p className="text-sm text-neutral-200">{feat.name}</p>
                <p className="mt-0.5 text-[11px] text-neutral-500">{feat.desc}</p>
              </div>
              <button
                type="button"
                disabled={added}
                onClick={() => onPick(feat)}
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition',
                  added
                    ? 'bg-emerald-600 text-white'
                    : 'hover:text-ink bg-neutral-800 text-amber-400 hover:bg-amber-500',
                )}
              >
                {added ? (
                  <Check className="h-4 w-4" strokeWidth={2.4} />
                ) : (
                  <Plus className="h-4 w-4" strokeWidth={2.4} />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </Popup>
  );
}
