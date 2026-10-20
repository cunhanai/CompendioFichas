import { useEffect, useState } from 'react';
import { useAppData } from '@/app/providers';
import { api, ApiError } from '@/shared/lib/api';
import { useAppToast } from '@/shared/ui/organisms';
import { SectionCard } from '@/shared/ui/molecules/SectionCard';
import { formatRelativeTime } from '@/shared/lib/format';
import type { DeletedCharacterSummary } from '@/entities/character/model/types';
import { DeletedCharacterRow } from '@/entities/character/ui/DeletedCharacterRow';

/** Master-only: every deleted character across every user, with a "Restaurar" action. The
 * backend already enforces master-only (403 for a plain admin) — this UI isn't the real guard,
 * but matches the same tab-visibility pattern as other admin-only panels. */
export function DeletedCharactersPanel() {
  const { systems } = useAppData();
  const toast = useAppToast();
  const [deleted, setDeleted] = useState<DeletedCharacterSummary[] | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

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

  return (
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
            />
          ))}
        </div>
      )}
    </SectionCard>
  );
}
