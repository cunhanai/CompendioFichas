import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import type { SpecialLibraryItem } from '@/entities/library-item/model/types';
import { Popup } from '@/shared/ui/organisms/Popup';

export interface SpecialPickDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  specials: SpecialLibraryItem[];
  onPick: (special: SpecialLibraryItem) => void;
  onCreateCustom: () => void;
}

export function SpecialPickDialog({
  open,
  onOpenChange,
  specials,
  onPick,
  onCreateCustom,
}: SpecialPickDialogProps) {
  const [query, setQuery] = useState('');
  const filtered = specials.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <Popup
      open={open}
      onOpenChange={onOpenChange}
      title="Puxar habilidade da biblioteca"
      size="md"
      footer={
        <button
          type="button"
          onClick={onCreateCustom}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-neutral-800 py-2.5 text-sm font-medium text-amber-400 transition hover:bg-neutral-700"
        >
          <Plus className="h-4 w-4" strokeWidth={2} />
          Não achei — criar habilidade avulsa
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
          placeholder="Buscar habilidade"
          className="w-full rounded-lg border border-neutral-700 bg-neutral-950 py-2.5 pr-3 pl-9 text-sm text-neutral-100 outline-none focus:border-amber-500"
        />
      </div>
      <div className="flex flex-col gap-2">
        {filtered.map((sp) => (
          <div
            key={sp.id}
            className="flex items-center justify-between gap-3 rounded-lg bg-neutral-950 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="text-sm text-neutral-200">{sp.name}</p>
              <p className="text-[11px] text-neutral-500">{sp.subtitle}</p>
            </div>
            <button
              type="button"
              title="Adicionar à ficha"
              onClick={() => onPick(sp)}
              className="hover:text-ink flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-neutral-800 text-amber-400 transition hover:bg-amber-500"
            >
              <Plus className="h-4 w-4" strokeWidth={2.4} />
            </button>
          </div>
        ))}
      </div>
    </Popup>
  );
}
