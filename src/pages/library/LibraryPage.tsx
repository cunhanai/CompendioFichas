import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '@/app/providers';
import { routes } from '@/shared/lib/routes';
import type { LibraryCategory } from '@/entities/library-item/model/types';
import { toDisplayItems } from '@/entities/library-item/model/selectors';
import { Breadcrumbs } from '@/widgets/app-shell';
import { Button } from '@/shared/ui/atoms/Button';
import { AddLibraryItemDialog } from '@/features/shared-library';
import { cn } from '@/shared/lib/cn';

const CATEGORIES: { value: LibraryCategory; label: string }[] = [
  { value: 'magias', label: 'Magias' },
  { value: 'talentos', label: 'Talentos' },
  { value: 'pericias', label: 'Perícias' },
  { value: 'habilidades', label: 'Habilidades' },
  { value: 'armas', label: 'Armas' },
  { value: 'idiomas', label: 'Idiomas' },
  { value: 'criaturas', label: 'Criaturas' },
];

export function LibraryPage() {
  const { systemId = '' } = useParams<{ systemId: string }>();
  const { systems, libraries, addLibraryItem } = useAppData();
  const navigate = useNavigate();
  const [tab, setTab] = useState<LibraryCategory>('magias');
  const [addOpen, setAddOpen] = useState(false);

  const system = systems.find((s) => s.id === systemId);
  const library = libraries[systemId];
  const items = library ? toDisplayItems(library, tab) : [];

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-6 md:px-10 md:py-10">
      <Breadcrumbs
        items={[
          { label: 'Início', onClick: () => navigate(routes.dashboard()) },
          { label: system?.title ?? '', onClick: () => navigate(routes.characters(systemId)) },
          { label: 'Biblioteca compartilhada' },
        ]}
      />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl text-neutral-100">Biblioteca compartilhada</h1>
          <p className="mt-1 text-xs text-neutral-500">
            Itens cadastrados aqui ficam disponíveis para todos os jogadores deste sistema.
          </p>
        </div>
        <Button size="lg" onClick={() => setAddOpen(true)} className="shrink-0">
          <Plus className="h-4 w-4" strokeWidth={2.2} />
          Novo item
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => setTab(cat.value)}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-xs font-medium transition',
              tab === cat.value
                ? 'text-ink bg-amber-500'
                : 'border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-neutral-200',
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-neutral-200">{item.name}</p>
              <p className="mt-0.5 text-xs text-neutral-500">{item.desc}</p>
            </div>
            {item.tag && (
              <span className="ml-3 shrink-0 rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-500 uppercase">
                {item.tag}
              </span>
            )}
          </div>
        ))}
      </div>

      <AddLibraryItemDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={(values) => {
          addLibraryItem(systemId, tab, values);
          setAddOpen(false);
        }}
      />
    </main>
  );
}
