import { useEffect, useState } from 'react';
import { useAppData } from '@/app/providers';
import { api, ApiError } from '@/shared/lib/api';
import { useAppToast } from '@/shared/ui/organisms';
import { ConfirmDialog } from '@/shared/ui/organisms/ConfirmDialog';
import { SectionCard } from '@/shared/ui/molecules/SectionCard';
import { formatRelativeTime } from '@/shared/lib/format';
import type { DeletedCharacterSummary } from '@/entities/character/model/types';
import { DeletedCharacterRow } from '@/entities/character/ui/DeletedCharacterRow';
import { DeletedCharacterViewDialog } from '@/entities/character/ui/DeletedCharacterViewDialog';

/** Master-only: every deleted character across every user, with "Restaurar" and "Excluir
 * definitivamente" actions, plus a read-only view on click. The backend already enforces
 * master-only (403 for a plain admin) — this UI isn't the real guard, but matches the same
 * tab-visibility pattern as other admin-only panels. */
export function DeletedCharactersPanel() {
  const { systems } = useAppData();
  const toast = useAppToast();
  const [deleted, setDeleted] = useState<DeletedCharacterSummary[] | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const [confirmHardDeleteId, setConfirmHardDeleteId] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ deleted: DeletedCharacterSummary[] }>('/admin/users/deleted-characters')
      .then(({ deleted: rows }) => setDeleted(rows))
      .catch((err: unknown) => {
        toast.error(err instanceof ApiError ? err.message : 'Não foi possível carregar a lixeira.');
        setDeleted([]);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const viewing = (deleted ?? []).find((c) => c.id === viewingId) ?? null;

  const handleRestore = async (id: string) => {
    setRestoringId(id);
    try {
      await api.post(`/admin/users/deleted-characters/${id}/restore`, {});
      setDeleted((rows) => rows?.filter((r) => r.id !== id) ?? rows);
      toast.success('Ficha restaurada.');
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
      <SectionCard>
        {deleted === null ? (
          <p className="py-6 text-center text-xs text-neutral-500">Carregando…</p>
        ) : deleted.length === 0 ? (
          <p className="py-6 text-center text-xs text-neutral-500">
            Nenhuma ficha excluída no momento.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {deleted.map((c) => (
              <DeletedCharacterRow
                key={c.id}
                character={c}
                subtitle={`@${c.ownerUsername} · ${systems.find((s) => s.id === c.systemId)?.title ?? c.systemId} · excluída ${formatRelativeTime(c.deletedAt)}`}
                restoring={restoringId === c.id}
                onRestore={() => handleRestore(c.id)}
                onView={() => setViewingId(c.id)}
                onHardDelete={() => setConfirmHardDeleteId(c.id)}
              />
            ))}
          </div>
        )}
      </SectionCard>

      <DeletedCharacterViewDialog
        character={viewing}
        subtitle={viewing ? `@${viewing.ownerUsername}` : undefined}
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
