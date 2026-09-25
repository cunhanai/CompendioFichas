import { useEffect, useState } from 'react';
import { Search, UserMinus, UserPlus } from 'lucide-react';
import { Popup } from '@/shared/ui/organisms/Popup';
import { Avatar } from '@/shared/ui/atoms/Avatar';
import { api, ApiError } from '@/shared/lib/api';
import { useAppToast } from '@/shared/ui/organisms';
import type { RosterUser } from '@/entities/user/model/types';
import type { CharacterShareEntry } from '../model/types';

export interface SharePickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentShares: CharacterShareEntry[];
  onShare: (userId: string) => void;
  onUnshare: (userId: string) => void;
}

/**
 * "Compartilhar ficha": pick any account in the app to grant view-only access, and manage who
 * already has it. Replaces the old public-link model — there's no link, no anonymous access,
 * and the recipient only ever gets read access (see api/_lib/routes/characters.ts).
 */
export function SharePickerDialog({
  open,
  onOpenChange,
  currentShares,
  onShare,
  onUnshare,
}: SharePickerDialogProps) {
  const toast = useAppToast();
  const [roster, setRoster] = useState<RosterUser[] | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) return;
    api
      .get<{ users: RosterUser[] }>('/user/roster')
      .then(({ users }) => setRoster(users))
      .catch((err: unknown) => {
        toast.error(err instanceof ApiError ? err.message : 'Não foi possível carregar usuários.');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const sharedIds = new Set(currentShares.map((s) => s.userId));
  const available = (roster ?? []).filter(
    (u) =>
      !sharedIds.has(u.id) &&
      (u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.username.toLowerCase().includes(query.toLowerCase())),
  );

  return (
    <Popup open={open} onOpenChange={onOpenChange} title="Compartilhar ficha" size="sm">
      <div className="flex flex-col gap-4">
        {currentShares.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
              Compartilhado com
            </p>
            <div className="flex flex-col gap-1.5">
              {currentShares.map((s) => (
                <div
                  key={s.userId}
                  className="flex items-center justify-between gap-2 rounded-lg bg-neutral-950 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-neutral-200">{s.name}</p>
                    <p className="truncate text-xs text-neutral-500">@{s.username}</p>
                  </div>
                  <button
                    type="button"
                    title="Remover acesso"
                    onClick={() => onUnshare(s.userId)}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-neutral-500 hover:bg-rose-950/60 hover:text-rose-300"
                  >
                    <UserMinus className="h-4 w-4" strokeWidth={1.8} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-semibold tracking-wider text-neutral-500 uppercase">
            Adicionar
          </p>
          <div className="relative mb-2">
            <Search
              className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-500"
              strokeWidth={2}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Nome ou usuário..."
              className="w-full rounded-lg border border-neutral-700 bg-neutral-950 py-2.5 pr-3 pl-9 text-sm text-neutral-100 outline-none focus:border-amber-500"
            />
          </div>
          <div className="flex max-h-64 flex-col gap-1.5 overflow-y-auto">
            {roster === null && (
              <p className="py-4 text-center text-xs text-neutral-600">Carregando…</p>
            )}
            {roster !== null && available.length === 0 && (
              <p className="py-4 text-center text-xs text-neutral-600">
                {roster.length === 0
                  ? 'Nenhum outro usuário cadastrado.'
                  : 'Nenhum usuário encontrado.'}
              </p>
            )}
            {available.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between gap-2 rounded-lg bg-neutral-950 px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <Avatar src={u.avatarUrl} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm text-neutral-200">{u.name}</p>
                    <p className="truncate text-xs text-neutral-500">@{u.username}</p>
                  </div>
                </div>
                <button
                  type="button"
                  title="Compartilhar"
                  onClick={() => onShare(u.id)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-amber-500 hover:bg-amber-950/40 hover:text-amber-400"
                >
                  <UserPlus className="h-4 w-4" strokeWidth={1.8} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[11px] text-neutral-600">
          Quem você compartilhar só consegue visualizar a ficha — nunca editar.
        </p>
      </div>
    </Popup>
  );
}
