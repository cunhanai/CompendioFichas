import { useEffect, useState } from 'react';
import { ArchiveRestore } from 'lucide-react';
import { Popup } from '@/shared/ui/organisms/Popup';
import { Avatar } from '@/shared/ui/atoms/Avatar';
import { Button } from '@/shared/ui/atoms/Button';
import { useAppToast } from '@/shared/ui/organisms';
import { api, ApiError } from '@/shared/lib/api';
import type { DeletedCharacterSummary } from '@/entities/character/model/types';
import { daysRemainingInTrash } from '@/entities/character/model/trash';

export interface TrashDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  systemId: string;
  onRestore: (id: string) => Promise<void>;
}

/** Owner's own trash — deleted characters from this system, with a "Restaurar" action. Fetched
 * lazily (only while open), same pattern as PhotoGalleryDialog/ActivityLog. */
export function TrashDialog({ open, onOpenChange, systemId, onRestore }: TrashDialogProps) {
  const toast = useAppToast();
  const [deleted, setDeleted] = useState<DeletedCharacterSummary[] | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    api
      .get<{ deleted: DeletedCharacterSummary[] }>('/characters/deleted')
      .then(({ deleted: rows }) => setDeleted(rows))
      .catch((err: unknown) => {
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

  return (
    <Popup open={open} onOpenChange={handleOpenChange} title="Lixeira" size="sm">
      {deleted === null ? (
        <p className="py-6 text-center text-xs text-neutral-500">Carregando…</p>
      ) : forThisSystem.length === 0 ? (
        <p className="py-6 text-center text-xs text-neutral-500">Nenhuma ficha excluída.</p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {forThisSystem.map((c) => (
            <div
              key={c.id}
              className="flex items-center justify-between gap-2 rounded-lg bg-neutral-950 px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <Avatar size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm text-neutral-200">{c.name}</p>
                  <p className="truncate text-xs text-neutral-500">
                    Restam {daysRemainingInTrash(c.deletedAt)} dias na lixeira
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="secondary"
                disabled={restoringId === c.id}
                onClick={() => handleRestore(c.id)}
              >
                <ArchiveRestore className="h-3.5 w-3.5" strokeWidth={1.8} />
                Restaurar
              </Button>
            </div>
          ))}
        </div>
      )}
    </Popup>
  );
}
