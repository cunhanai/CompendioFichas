import { useEffect, useState } from 'react';
import { ArchiveRestore } from 'lucide-react';
import { useAppData } from '@/app/providers';
import { api, ApiError } from '@/shared/lib/api';
import { useAppToast } from '@/shared/ui/organisms';
import { SectionCard } from '@/shared/ui/molecules/SectionCard';
import { Avatar } from '@/shared/ui/atoms/Avatar';
import { Button } from '@/shared/ui/atoms/Button';
import { formatRelativeTime } from '@/shared/lib/format';
import type { DeletedCharacterSummary } from '@/entities/character/model/types';

const RETENTION_DAYS = 90;

function daysRemaining(deletedAt: string): number {
  const elapsedMs = Date.now() - new Date(deletedAt).getTime();
  const elapsedDays = Math.floor(elapsedMs / (24 * 60 * 60 * 1000));
  return Math.max(0, RETENTION_DAYS - elapsedDays);
}

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
            <div
              key={c.id}
              className="flex items-center justify-between gap-2 rounded-lg bg-neutral-950 px-3 py-2.5"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <Avatar src={c.photoUrl} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm text-neutral-200">{c.name}</p>
                  <p className="truncate text-xs text-neutral-500">
                    @{c.ownerUsername} ·{' '}
                    {systems.find((s) => s.id === c.systemId)?.title ?? c.systemId} · excluída{' '}
                    {formatRelativeTime(c.deletedAt)} · restam {daysRemaining(c.deletedAt)} dias
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
    </SectionCard>
  );
}
