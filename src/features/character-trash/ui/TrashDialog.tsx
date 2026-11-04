import { useEffect, useRef, useState } from 'react';
import { Popup } from '@/shared/ui/organisms/Popup';
import { useAppToast } from '@/shared/ui/organisms';
import { ConfirmDialog } from '@/shared/ui/organisms/ConfirmDialog';
import { api, ApiError } from '@/shared/lib/api';
import { useAppData } from '@/app/providers';
import type { DeletedCharacterSummary } from '@/entities/character/model/types';
import { DeletedCharacterRow } from '@/entities/character/ui/DeletedCharacterRow';
import { DeletedCharacterViewDialog } from '@/entities/character/ui/DeletedCharacterViewDialog';

export interface TrashDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  systemId: string;
  onRestore: (id: string) => Promise<void>;
}

/** Owner's own trash — deleted characters from this system, with "Restaurar" and (master-only)
 * "Excluir definitivamente" actions, plus a read-only view on click. Fetched lazily (only while
 * open), same pattern as PhotoGalleryDialog/ActivityLog. */
export function TrashDialog({ open, onOpenChange, systemId, onRestore }: TrashDialogProps) {
  const toast = useAppToast();
  const { user } = useAppData();
  const [deleted, setDeleted] = useState<DeletedCharacterSummary[] | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [confirmHardDeleteId, setConfirmHardDeleteId] = useState<string | null>(null);
  // Guards against an earlier fetch (e.g. from a fast close+reopen) resolving after a later one
  // and clobbering it with stale data — same pattern as PhotoGalleryDialog.
  const fetchSeq = useRef(0);

  useEffect(() => {
    if (!open) return;
    const seq = ++fetchSeq.current;
    api
      .get<{ deleted: DeletedCharacterSummary[] }>('/characters/deleted')
      .then(({ deleted: rows }) => {
        if (seq === fetchSeq.current) setDeleted(rows);
      })
      .catch((err: unknown) => {
        if (seq !== fetchSeq.current) return;
        toast.error(err instanceof ApiError ? err.message : 'Não foi possível carregar a lixeira.');
        setDeleted([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Resets on close (rather than inside the fetch effect) so the next open always starts from a
  // clean loading state instead of briefly showing last time's list — same pattern as
  // PhotoGalleryDialog's handleOpenChange.
  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) setDeleted(null);
  };

  const forThisSystem = (deleted ?? []).filter((c) => c.systemId === systemId);
  const viewing = forThisSystem.find((c) => c.id === viewingId) ?? null;

  const handleRestore = async (id: string) => {
    setRestoringId(id);
    try {
      await onRestore(id);
      setDeleted((rows) => rows?.filter((r) => r.id !== id) ?? rows);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Não foi possível restaurar a ficha.');
    } finally {
      setRestoringId(null);
    }
  };

  const handleHardDelete = async (id: string) => {
    setConfirmHardDeleteId(null);
    setRestoringId(id);
    try {
      await api.delete(`/admin/users/deleted-characters/${id}`, { permanent: true });
      setDeleted((rows) => rows?.filter((r) => r.id !== id) ?? rows);
      toast.success('Ficha excluída definitivamente.');
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Não foi possível excluir a ficha.');
    } finally {
      setRestoringId(null);
    }
  };

  return (
    <>
      <Popup open={open} onOpenChange={handleOpenChange} title="Lixeira" size="sm">
        {deleted === null ? (
          <p className="py-6 text-center text-xs text-neutral-500">Carregando…</p>
        ) : forThisSystem.length === 0 ? (
          <p className="py-6 text-center text-xs text-neutral-500">Nenhuma ficha excluída.</p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {forThisSystem.map((c) => (
              <DeletedCharacterRow
                key={c.id}
                character={c}
                restoring={restoringId === c.id}
                onRestore={() => handleRestore(c.id)}
                onView={() => setViewingId(c.id)}
                onHardDelete={user.isMaster ? () => setConfirmHardDeleteId(c.id) : undefined}
              />
            ))}
          </div>
        )}
      </Popup>

      <DeletedCharacterViewDialog
        character={viewing}
        onOpenChange={(next) => !next && setViewingId(null)}
      />

      <ConfirmDialog
        open={confirmHardDeleteId !== null}
        onOpenChange={(next) => !next && setConfirmHardDeleteId(null)}
        title="Excluir esta ficha definitivamente?"
        message="Não tem volta — a ficha e tudo que ela tem (itens, histórico, fotos) são apagados pra sempre, não só movidos pra lixeira."
        confirmLabel="Excluir definitivamente"
        onConfirm={() => confirmHardDeleteId && handleHardDelete(confirmHardDeleteId)}
      />
    </>
  );
}
