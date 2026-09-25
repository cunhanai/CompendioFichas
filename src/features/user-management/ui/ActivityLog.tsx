import { useEffect, useState } from 'react';
import {
  KeyRound,
  LogIn,
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  UserCheck,
  UserPlus,
  UserX,
} from 'lucide-react';
import { api, ApiError } from '@/shared/lib/api';
import { useAppToast } from '@/shared/ui/organisms';
import { SectionCard } from '@/shared/ui/molecules/SectionCard';
import { formatRelativeTime } from '@/shared/lib/format';
import type { AuditLogEntry } from '../model/types';

const ACTION_META: Record<string, { label: (e: AuditLogEntry) => string; icon: typeof LogIn }> = {
  'user.create': { label: (e) => `criou a conta de @${e.targetUsername}`, icon: UserPlus },
  'user.activate': { label: (e) => `reativou @${e.targetUsername}`, icon: UserCheck },
  'user.deactivate': { label: (e) => `desativou @${e.targetUsername}`, icon: UserX },
  'user.promote': { label: (e) => `tornou @${e.targetUsername} administrador`, icon: ShieldCheck },
  'user.demote': { label: (e) => `removeu @${e.targetUsername} de administrador`, icon: ShieldX },
  'user.password_reset': {
    label: (e) => `redefiniu a senha de @${e.targetUsername}`,
    icon: KeyRound,
  },
  'user.password_change': { label: () => 'trocou a própria senha', icon: KeyRound },
  'auth.login_success': { label: () => 'entrou na conta', icon: LogIn },
  'auth.login_failed': { label: () => 'tentativa de login falhou', icon: ShieldAlert },
  'auth.rate_limited': {
    label: () => 'tentativas de login bloqueadas (limite atingido)',
    icon: ShieldAlert,
  },
};

/** Admin-only: recent audit_log entries, newest first. */
export function ActivityLog() {
  const toast = useAppToast();
  const [entries, setEntries] = useState<AuditLogEntry[] | null>(null);

  useEffect(() => {
    api
      .get<{ entries: AuditLogEntry[] }>('/admin/users/activity')
      .then(({ entries: rows }) => setEntries(rows))
      .catch((err: unknown) => {
        toast.error(
          err instanceof ApiError ? err.message : 'Não foi possível carregar a atividade.',
        );
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <SectionCard>
      {!entries ? (
        <p className="py-6 text-center text-xs text-neutral-500">Carregando atividade…</p>
      ) : entries.length === 0 ? (
        <p className="py-6 text-center text-xs text-neutral-500">Nenhuma atividade registrada.</p>
      ) : (
        <div className="flex flex-col">
          {entries.map((entry) => {
            const meta = ACTION_META[entry.action];
            const Icon = meta?.icon ?? ShieldAlert;
            return (
              <div
                key={entry.id}
                className="flex items-start gap-3 border-b border-neutral-800 py-3 first:pt-0 last:border-0 last:pb-0"
              >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-neutral-400">
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.8} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-neutral-200">
                    <span className="font-medium text-neutral-100">@{entry.actorUsername}</span>{' '}
                    {meta ? meta.label(entry) : entry.action}
                  </p>
                  <p className="text-[11px] text-neutral-600">
                    {formatRelativeTime(entry.createdAt)}
                    {entry.detail ? ` · ${entry.detail}` : ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
}
