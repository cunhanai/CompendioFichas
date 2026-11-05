import { useState } from 'react';
import { Archive, ArrowLeft, Languages, Pencil, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '@/app/providers';
import { routes } from '@/shared/lib/routes';
import { api, ApiError } from '@/shared/lib/api';
import { useAppToast } from '@/shared/ui/organisms';
import type {
  AnyLibraryItem,
  LibraryCategory,
  LibraryItem,
  LibraryItemLocale,
  SharedLibrary,
} from '@/entities/library-item/model/types';
import { toDisplayItems } from '@/entities/library-item/model/selectors';
import { freshLibraryItemIdentity, groupLibraryItems } from '@/entities/library-item/model/locale';
import { Breadcrumbs } from '@/widgets/app-shell';
import { Button } from '@/shared/ui/atoms/Button';
import { ConfirmDialog } from '@/shared/ui/organisms/ConfirmDialog';
import { AddLibraryItemDialog, LibraryItemViewDialog } from '@/features/shared-library';
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

const LOCALE_LABEL: Record<LibraryItemLocale, string> = { pt: 'PT', en: 'EN' };
const otherLocale = (locale: LibraryItemLocale): LibraryItemLocale =>
  locale === 'pt' ? 'en' : 'pt';

/** Which item the "Novo item"/edit/trash form targets — `null` is "create a brand new,
 * standalone item"; `edit` replaces an existing row's fields in place; `translate` creates a
 * new row sharing the source item's `groupId` but in the other language, prefilled from the
 * source so only the actually-different (mostly text) fields need changing. */
type FormTarget =
  { mode: 'edit'; id: string } | { mode: 'translate'; sourceId: string; locale: LibraryItemLocale };

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
    restoreLibraryItem,
  } = useAppData();
  const navigate = useNavigate();
  const toast = useAppToast();
  const [tab, setTab] = useState<LibraryCategory>('magias');
  const [formOpen, setFormOpen] = useState(false);
  const [formTarget, setFormTarget] = useState<FormTarget | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [trashOpen, setTrashOpen] = useState(false);
  // Raw rows of the trash list — kept as the single source of truth (not also a parallel
  // `DisplayItem[]` state) so there's nothing to desync; `deleted` below is just this, projected.
  const [deletedRaw, setDeletedRaw] = useState<AnyLibraryItem[] | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [confirmHardDeleteId, setConfirmHardDeleteId] = useState<string | null>(null);
  // Disables a trash row's own buttons while its restore/hard-delete request is in flight, so a
  // fast double-click can't fire the same mutation twice.
  const [busyId, setBusyId] = useState<string | null>(null);
  // Per-group "show the other language instead" override — local to this screen/session, never
  // persisted (the account-wide default lives in user.libraryLocale). Keyed by groupId, reset
  // whenever the category tab changes.
  const [localeOverrides, setLocaleOverrides] = useState<Record<string, LibraryItemLocale>>({});

  const system = systems.find((s) => s.id === systemId);
  const library = libraries[systemId];
  const rawItems = (library?.[tab] ?? []) as AnyLibraryItem[];
  const groups = Array.from(groupLibraryItems(rawItems).values());
  const selectedItems = groups.map((group) => {
    const wantLocale = localeOverrides[group[0].groupId] ?? user.libraryLocale;
    return group.find((i) => i.locale === wantLocale) ?? group[0];
  });
  const displayItems = library
    ? toDisplayItems({ ...library, [tab]: selectedItems } as SharedLibrary, tab)
    : [];
  const rows = groups.map((group, i) => ({
    group,
    selected: selectedItems[i],
    display: displayItems[i],
  }));

  const sourceItem = formTarget
    ? rawItems.find(
        (i) => i.id === (formTarget.mode === 'edit' ? formTarget.id : formTarget.sourceId),
      )
    : undefined;

  const viewingItem = deletedRaw?.find((i) => i.id === viewingId) ?? null;
  const deleted = deletedRaw
    ? toDisplayItems({ ...library, [tab]: deletedRaw } as SharedLibrary, tab)
    : null;

  const selectTab = (next: LibraryCategory) => {
    setTab(next);
    setTrashOpen(false);
    setDeletedRaw(null);
    setViewingId(null);
    setConfirmHardDeleteId(null);
    setBusyId(null);
    setLocaleOverrides({});
  };

  const loadTrash = () => {
    setTrashOpen(true);
    setDeletedRaw(null);
    api
      .get<{ deleted: SharedLibrary[LibraryCategory] }>(`/libraries/${systemId}/${tab}`)
      .then(({ deleted: deletedRows }) => {
        setDeletedRaw(deletedRows as AnyLibraryItem[]);
      })
      .catch((err: unknown) => {
        toast.error(err instanceof ApiError ? err.message : 'Não foi possível carregar a lixeira.');
        setDeletedRaw([]);
      });
  };

  const handleRestore = (id: string) => {
    setBusyId(id);
    restoreLibraryItem(systemId, tab, id)
      .then(() => {
        setDeletedRaw((rows2) => rows2?.filter((r) => r.id !== id) ?? rows2);
        toast.success('Item restaurado.');
      })
      .catch((err: unknown) => {
        toast.error(err instanceof ApiError ? err.message : 'Não foi possível restaurar o item.');
      })
      .finally(() => setBusyId(null));
  };

  const handleHardDelete = (id: string) => {
    setConfirmHardDeleteId(null);
    setBusyId(id);
    api
      .delete(`/libraries/${systemId}/${tab}`, { id, permanent: true })
      .then(() => {
        setDeletedRaw((rows2) => rows2?.filter((r) => r.id !== id) ?? rows2);
        toast.success('Item excluído definitivamente.');
      })
      .catch((err: unknown) => {
        toast.error(err instanceof ApiError ? err.message : 'Não foi possível excluir o item.');
      })
      .finally(() => setBusyId(null));
  };

  const openCreate = () => {
    setFormTarget(null);
    setFormOpen(true);
  };
  const openEdit = (id: string) => {
    setFormTarget({ mode: 'edit', id });
    setFormOpen(true);
  };
  const openTranslate = (sourceId: string, locale: LibraryItemLocale) => {
    setFormTarget({ mode: 'translate', sourceId, locale });
    setFormOpen(true);
  };
  const closeForm = () => {
    setFormOpen(false);
    setFormTarget(null);
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
                <button
                  type="button"
                  onClick={() => setViewingId(item.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="text-sm font-medium text-neutral-200">{item.name}</p>
                  <p className="mt-0.5 text-xs text-neutral-500">{item.desc}</p>
                </button>
                <div className="flex shrink-0 items-center gap-2">
                  {user.isMaster && (
                    <button
                      type="button"
                      disabled={busyId === item.id}
                      onClick={() => setConfirmHardDeleteId(item.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-2 text-xs font-medium text-rose-400 transition hover:bg-neutral-700 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                      Excluir definitivamente
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => handleRestore(item.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-neutral-800 px-3 py-2 text-xs font-medium text-emerald-400 transition hover:bg-neutral-700 disabled:opacity-50"
                  >
                    <RotateCcw className="h-3.5 w-3.5" strokeWidth={2} />
                    Restaurar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map(({ group, selected, display }) => (
            <div
              key={group[0].groupId}
              className="flex items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-neutral-200">{display.name}</p>
                  {display.tag && (
                    <span className="shrink-0 rounded-full bg-neutral-800 px-2 py-0.5 text-[10px] text-neutral-500 uppercase">
                      {display.tag}
                    </span>
                  )}
                  {group.length > 1 ? (
                    <div className="flex shrink-0 overflow-hidden rounded-full border border-neutral-700 text-[10px] font-semibold">
                      {group.map((variant) => (
                        <button
                          key={variant.locale}
                          type="button"
                          title={`Ver em ${LOCALE_LABEL[variant.locale]}`}
                          onClick={() =>
                            setLocaleOverrides((o) => ({
                              ...o,
                              [group[0].groupId]: variant.locale,
                            }))
                          }
                          className={cn(
                            'px-2 py-0.5 transition',
                            variant.locale === selected.locale
                              ? 'text-ink bg-amber-500'
                              : 'bg-neutral-800 text-neutral-400 hover:text-neutral-200',
                          )}
                        >
                          {LOCALE_LABEL[variant.locale]}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button
                      type="button"
                      title={`Adicionar tradução em ${LOCALE_LABEL[otherLocale(selected.locale)]}`}
                      onClick={() => openTranslate(selected.id, otherLocale(selected.locale))}
                      className="flex shrink-0 items-center gap-1 rounded-full border border-dashed border-neutral-700 px-2 py-0.5 text-[10px] font-medium text-neutral-500 transition hover:border-amber-600 hover:text-amber-400"
                    >
                      <Languages className="h-3 w-3" strokeWidth={2} />+{' '}
                      {LOCALE_LABEL[otherLocale(selected.locale)]}
                    </button>
                  )}
                </div>
                <p className="mt-0.5 text-xs text-neutral-500">{display.desc}</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  title="Editar"
                  onClick={() => openEdit(selected.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-800 hover:text-amber-400"
                >
                  <Pencil className="h-4 w-4" strokeWidth={1.8} />
                </button>
                {user.isAdmin && (
                  <button
                    type="button"
                    title="Excluir"
                    onClick={() => setConfirmDeleteId(selected.id)}
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

      {/* Each dialog is only mounted while `formOpen` — unlike toggling `open` on an
          always-mounted instance, this guarantees a real unmount/remount every time the form is
          reopened (matching the sheet's own `{id && <Dialog />}` pattern elsewhere), so a
          canceled, half-typed edit/translation never lingers as stale state the next time the
          same item is reopened. */}
      {formOpen && tab === 'magias' && (
        <SpellLibraryFormDialog
          open
          onOpenChange={(open) => !open && closeForm()}
          initial={sourceItem as SharedLibrary['magias'][number] | undefined}
          editing={formTarget?.mode === 'edit'}
          onSubmit={(spell) => {
            if (formTarget?.mode === 'edit' && sourceItem)
              updateLibraryItem(systemId, 'magias', {
                ...spell,
                id: formTarget.id,
                locale: sourceItem.locale,
                groupId: sourceItem.groupId,
              });
            else if (formTarget?.mode === 'translate' && sourceItem)
              addSpellToLibrary(systemId, {
                ...spell,
                ...freshLibraryItemIdentity(formTarget.locale),
                groupId: sourceItem.groupId,
              });
            else
              addSpellToLibrary(systemId, {
                ...spell,
                ...freshLibraryItemIdentity(user.libraryLocale),
              });
            closeForm();
          }}
        />
      )}
      {formOpen && tab === 'armas' && (
        <WeaponLibraryAddDialog
          open
          onOpenChange={(open) => !open && closeForm()}
          initial={sourceItem as SharedLibrary['armas'][number] | undefined}
          editing={formTarget?.mode === 'edit'}
          addToSheet={false}
          onSubmit={(weapon) => {
            if (formTarget?.mode === 'edit' && sourceItem)
              updateLibraryItem(systemId, 'armas', {
                ...weapon,
                id: formTarget.id,
                locale: sourceItem.locale,
                groupId: sourceItem.groupId,
              });
            else if (formTarget?.mode === 'translate' && sourceItem)
              addWeaponToLibrary(systemId, {
                ...weapon,
                ...freshLibraryItemIdentity(formTarget.locale),
                groupId: sourceItem.groupId,
              });
            else
              addWeaponToLibrary(systemId, {
                ...weapon,
                ...freshLibraryItemIdentity(user.libraryLocale),
              });
            closeForm();
          }}
        />
      )}
      {formOpen && tab === 'talentos' && (
        <FeatLibraryAddDialog
          open
          onOpenChange={(open) => !open && closeForm()}
          initial={sourceItem as SharedLibrary['talentos'][number] | undefined}
          editing={formTarget?.mode === 'edit'}
          addToSheet={false}
          onSubmit={(feat) => {
            if (formTarget?.mode === 'edit' && sourceItem)
              updateLibraryItem(systemId, 'talentos', {
                ...feat,
                id: formTarget.id,
                locale: sourceItem.locale,
                groupId: sourceItem.groupId,
              });
            else if (formTarget?.mode === 'translate' && sourceItem)
              addFeatToLibrary(systemId, {
                ...feat,
                ...freshLibraryItemIdentity(formTarget.locale),
                groupId: sourceItem.groupId,
              });
            else
              addFeatToLibrary(systemId, {
                ...feat,
                ...freshLibraryItemIdentity(user.libraryLocale),
              });
            closeForm();
          }}
        />
      )}
      {formOpen && tab === 'habilidades' && (
        <SpecialFormDialog
          open
          onOpenChange={(open) => !open && closeForm()}
          initial={sourceItem as SharedLibrary['habilidades'][number] | undefined}
          editing={formTarget?.mode === 'edit'}
          onSubmit={(special) => {
            if (formTarget?.mode === 'edit' && sourceItem)
              updateLibraryItem(systemId, 'habilidades', {
                ...special,
                id: formTarget.id,
                locale: sourceItem.locale,
                groupId: sourceItem.groupId,
              });
            else if (formTarget?.mode === 'translate' && sourceItem)
              addSpecialToLibrary(systemId, {
                ...special,
                ...freshLibraryItemIdentity(formTarget.locale),
                groupId: sourceItem.groupId,
              });
            else
              addSpecialToLibrary(systemId, {
                ...special,
                ...freshLibraryItemIdentity(user.libraryLocale),
              });
            closeForm();
          }}
        />
      )}
      {formOpen && PLAIN_CATEGORIES.has(tab) && (
        <AddLibraryItemDialog
          open
          onOpenChange={(open) => !open && closeForm()}
          initial={sourceItem as { name: string; desc: string } | undefined}
          editing={formTarget?.mode === 'edit'}
          onSubmit={(values) => {
            if (formTarget?.mode === 'edit' && sourceItem)
              updateLibraryItem(systemId, tab, {
                ...values,
                tag: (sourceItem as LibraryItem).tag,
                id: formTarget.id,
                locale: sourceItem.locale,
                groupId: sourceItem.groupId,
              });
            else if (formTarget?.mode === 'translate' && sourceItem)
              addLibraryItem(systemId, tab, {
                ...values,
                tag: (sourceItem as LibraryItem).tag,
                locale: formTarget.locale,
                groupId: sourceItem.groupId,
              });
            else addLibraryItem(systemId, tab, values);
            closeForm();
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

      <LibraryItemViewDialog
        category={tab}
        item={viewingItem}
        onOpenChange={(open) => !open && setViewingId(null)}
      />

      <ConfirmDialog
        open={confirmHardDeleteId !== null}
        onOpenChange={(open) => !open && setConfirmHardDeleteId(null)}
        title="Excluir este item definitivamente?"
        message="Não tem volta — o item some da lixeira pra sempre, não só da biblioteca. Personagens que já tiverem puxado este item pra ficha deles não são afetados."
        confirmLabel="Excluir definitivamente"
        onConfirm={() => confirmHardDeleteId && handleHardDelete(confirmHardDeleteId)}
      />
    </main>
  );
}
