import { useState } from 'react';
import { Archive, ArrowLeft, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '@/app/providers';
import { routes } from '@/shared/lib/routes';
import { api, ApiError } from '@/shared/lib/api';
import { useAppToast } from '@/shared/ui/organisms';
import type { LibraryCategory, SharedLibrary } from '@/entities/library-item/model/types';
import { toDisplayItems, type DisplayItem } from '@/entities/library-item/model/selectors';
import { Breadcrumbs } from '@/widgets/app-shell';
import { Button } from '@/shared/ui/atoms/Button';
import { ConfirmDialog } from '@/shared/ui/organisms/ConfirmDialog';
import { AddLibraryItemDialog } from '@/features/shared-library';
import { WeaponLibraryAddDialog } from '@/features/weapons';
import { FeatLibraryAddDialog, SpecialFormDialog } from '@/features/feats-and-abilities';
import { SpellLibraryFormDialog } from '@/features/spellbook';
import { cn } from '@/shared/lib/cn';

const CATEGORIES: { value: LibraryCategory; label: string }[] = [
  { value: 'classes', label: 'Classes' },
  { value: 'racas', label: 'Raças' },
  { value: 'tipos', label: 'Tipos de criatura' },
  { value: 'magias', label: 'Magias' },
  { value: 'talentos', label: 'Talentos' },
  { value: 'pericias', label: 'Perícias' },
  { value: 'habilidades', label: 'Habilidades' },
  { value: 'armas', label: 'Armas' },
  { value: 'idiomas', label: 'Idiomas' },
  { value: 'criaturas', label: 'Criaturas' },
];

const PLAIN_CATEGORIES = new Set<LibraryCategory>([
  'pericias',
  'idiomas',
  'criaturas',
  'classes',
  'racas',
  'tipos',
]);

/** Thin wrapper so `systemId` changing while mounted (navigating between two systems' libraries
 * without leaving the page) remounts the content fresh — same reasoning/pattern as
 * `<FotosTab key={characterId}>` in SheetPage.tsx: simpler than an effect that resets every
 * piece of per-system local state (selected tab, trash view, pending edit) by hand. */
export function LibraryPage() {
  const { systemId = '' } = useParams<{ systemId: string }>();
  return <LibraryPageContent key={systemId} systemId={systemId} />;
}

function LibraryPageContent({ systemId }: { systemId: string }) {
  const {
    user,
    systems,
    libraries,
    addLibraryItem,
    addSpellToLibrary,
    addWeaponToLibrary,
    addFeatToLibrary,
    addSpecialToLibrary,
    updateLibraryItem,
    removeLibraryItem,
  } = useAppData();
  const navigate = useNavigate();
  const toast = useAppToast();
  const [tab, setTab] = useState<LibraryCategory>('magias');
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [trashOpen, setTrashOpen] = useState(false);
  const [deleted, setDeleted] = useState<DisplayItem[] | null>(null);

  const system = systems.find((s) => s.id === systemId);
  const library = libraries[systemId];
  const items = library ? toDisplayItems(library, tab) : [];
  const editingItem = editingId ? library?.[tab].find((i) => i.id === editingId) : undefined;

  const selectTab = (next: LibraryCategory) => {
    setTab(next);
    setTrashOpen(false);
    setDeleted(null);
  };

  const loadTrash = () => {
    setTrashOpen(true);
    setDeleted(null);
    api
      .get<{ deleted: SharedLibrary[LibraryCategory] }>(`/libraries/${systemId}/${tab}`)
      .then(({ deleted: rows }) => {
        const fakeLibrary = { ...library, [tab]: rows } as SharedLibrary;
        setDeleted(toDisplayItems(fakeLibrary, tab));
      })
      .catch((err: unknown) => {
        toast.error(err instanceof ApiError ? err.message : 'Não foi possível carregar a lixeira.');
        setDeleted([]);
      });
  };

  const handleRestore = (id: string) => {
    api
      .patch(`/libraries/${systemId}/${tab}`, { id, restore: true })
      .then(() => {
        setDeleted((rows) => rows?.filter((r) => r.id !== id) ?? rows);
        toast.success('Item restaurado.');
      })
      .catch((err: unknown) => {
        toast.error(err instanceof ApiError ? err.message : 'Não foi possível restaurar o item.');
      });
  };

  const openCreate = () => {
    setEditingId(null);
    setFormOpen(true);
  };
  const openEdit = (id: string) => {
    setEditingId(id);
    setFormOpen(true);
  };

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
        <div className="flex shrink-0 gap-2">
          {user.isAdmin && (
            <Button
              variant="secondary"
              size="lg"
              onClick={() => (trashOpen ? setTrashOpen(false) : loadTrash())}
            >
              {trashOpen ? (
                <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
              ) : (
                <Archive className="h-4 w-4" strokeWidth={2.2} />
              )}
              {trashOpen ? 'Voltar' : 'Lixeira'}
            </Button>
          )}
          {!trashOpen && (
            <Button size="lg" onClick={openCreate}>
              <Plus className="h-4 w-4" strokeWidth={2.2} />
              Novo item
            </Button>
          )}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            type="button"
            onClick={() => selectTab(cat.value)}
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

      {trashOpen ? (
        <div className="flex flex-col gap-2">
          {deleted === null ? (
            <p className="py-6 text-center text-xs text-neutral-500">Carregando…</p>
          ) : deleted.length === 0 ? (
            <p className="py-6 text-center text-xs text-neutral-500">
              Nenhum item excluído nesta categoria.
            </p>
          ) : (
            deleted.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-200">{item.name}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">{item.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRestore(item.id)}
                  className="flex shrink-0 items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-2 text-xs font-medium text-emerald-400 transition hover:bg-neutral-700"
                >
                  <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
                  Restaurar
                </button>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-neutral-200">{item.name}</p>
                  {item.tag && (
                    <span className="shrink-0 rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-500 uppercase">
                      {item.tag}
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-neutral-500">{item.desc}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  title="Editar"
                  onClick={() => openEdit(item.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-800 hover:text-amber-400"
                >
                  <Pencil className="h-4 w-4" strokeWidth={1.8} />
                </button>
                {user.isAdmin && (
                  <button
                    type="button"
                    title="Excluir"
                    onClick={() => setConfirmDeleteId(item.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-800 hover:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.8} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'magias' && (
        <SpellLibraryFormDialog
          key={editingId ?? 'new'}
          open={formOpen}
          onOpenChange={setFormOpen}
          initial={editingItem as SharedLibrary['magias'][number] | undefined}
          onSubmit={(spell) => {
            if (editingId) updateLibraryItem(systemId, 'magias', { ...spell, id: editingId });
            else addSpellToLibrary(systemId, { ...spell, id: crypto.randomUUID() });
            setFormOpen(false);
          }}
        />
      )}
      {tab === 'armas' && (
        <WeaponLibraryAddDialog
          key={editingId ?? 'new'}
          open={formOpen}
          onOpenChange={setFormOpen}
          initial={editingItem as SharedLibrary['armas'][number] | undefined}
          addToSheet={false}
          onSubmit={(weapon) => {
            if (editingId) updateLibraryItem(systemId, 'armas', { ...weapon, id: editingId });
            else addWeaponToLibrary(systemId, { ...weapon, id: crypto.randomUUID() });
            setFormOpen(false);
          }}
        />
      )}
      {tab === 'talentos' && (
        <FeatLibraryAddDialog
          key={editingId ?? 'new'}
          open={formOpen}
          onOpenChange={setFormOpen}
          initial={editingItem as SharedLibrary['talentos'][number] | undefined}
          addToSheet={false}
          onSubmit={(feat) => {
            if (editingId) updateLibraryItem(systemId, 'talentos', { ...feat, id: editingId });
            else addFeatToLibrary(systemId, { ...feat, id: crypto.randomUUID() });
            setFormOpen(false);
          }}
        />
      )}
      {tab === 'habilidades' && (
        <SpecialFormDialog
          key={editingId ?? 'new'}
          open={formOpen}
          onOpenChange={setFormOpen}
          initial={editingItem as SharedLibrary['habilidades'][number] | undefined}
          onSubmit={(special) => {
            if (editingId)
              updateLibraryItem(systemId, 'habilidades', { ...special, id: editingId });
            else addSpecialToLibrary(systemId, { ...special, id: crypto.randomUUID() });
            setFormOpen(false);
          }}
        />
      )}
      {PLAIN_CATEGORIES.has(tab) && (
        <AddLibraryItemDialog
          key={editingId ?? 'new'}
          open={formOpen}
          onOpenChange={setFormOpen}
          initial={editingItem as { name: string; desc: string } | undefined}
          onSubmit={(values) => {
            if (editingId) updateLibraryItem(systemId, tab, { ...values, tag: '', id: editingId });
            else addLibraryItem(systemId, tab, values);
            setFormOpen(false);
          }}
        />
      )}

      <ConfirmDialog
        open={confirmDeleteId !== null}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        title="Excluir este item?"
        message="Vai pra lixeira — personagens que já tiverem puxado este item pra ficha deles não são afetados, cada um guarda sua própria cópia. Pode ser restaurado depois pela lixeira."
        confirmLabel="Excluir"
        onConfirm={() => {
          if (confirmDeleteId) removeLibraryItem(systemId, tab, confirmDeleteId);
          setConfirmDeleteId(null);
        }}
      />
    </main>
  );
}
