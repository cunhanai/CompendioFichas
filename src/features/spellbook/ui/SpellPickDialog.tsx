import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import type { SpellLibraryItem } from '@/entities/library-item/model/types';
import { Popup } from '@/shared/ui/organisms/Popup';

export interface SpellPickDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spells: SpellLibraryItem[];
  onPick: (spell: SpellLibraryItem) => void;
  onViewDetail: (spell: SpellLibraryItem) => void;
}

export function SpellPickDialog({
  open,
  onOpenChange,
  spells,
  onPick,
  onViewDetail,
}: SpellPickDialogProps) {
  const [query, setQuery] = useState('');
  const filtered = spells.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));

  return (
    <Popup open={open} onOpenChange={onOpenChange} title="Buscar magia na biblioteca" size="md">
      <div className="relative mb-3">
        <Search
          className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-500"
          strokeWidth={2}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Nome da magia..."
          className="w-full rounded-lg border border-neutral-700 bg-neutral-950 py-2.5 pr-3 pl-9 text-sm text-neutral-100 outline-none focus:border-amber-500"
        />
      </div>
      <div className="flex flex-col gap-2">
        {filtered.map((spell) => (
          <div
            key={spell.id}
            className="flex items-center justify-between rounded-lg bg-neutral-950 px-4 py-3 transition hover:bg-neutral-800/70"
          >
            <button
              type="button"
              onClick={() => onViewDetail(spell)}
              className="min-w-0 flex-1 text-left"
            >
              <p className="text-sm text-neutral-200">{spell.name}</p>
              <p className="text-[11px] text-neutral-500">
                {spell.school} · {spell.circle === 0 ? 'truque' : `${spell.circle}º círculo`}
              </p>
            </button>
            <button
              type="button"
              onClick={() => onPick(spell)}
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
