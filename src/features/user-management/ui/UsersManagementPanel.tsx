import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, ShieldCheck, UserPlus } from 'lucide-react';
import { useAppData } from '@/app/providers';
import { routes } from '@/shared/lib/routes';
import { formatRelativeTime } from '@/shared/lib/format';
import { api, ApiError } from '@/shared/lib/api';
import { useAppToast } from '@/shared/ui/organisms';
import { SectionCard } from '@/shared/ui/molecules/SectionCard';
import { Avatar } from '@/shared/ui/atoms/Avatar';
import { Badge } from '@/shared/ui/atoms/Badge';
import { Switch } from '@/shared/ui/atoms/Switch';
import { IconButton } from '@/shared/ui/atoms/IconButton';
import { Button } from '@/shared/ui/atoms/Button';
import { ConfirmDialog } from '@/shared/ui/organisms/ConfirmDialog';
import type { AdminUserView } from '../model/types';
import { TempPasswordDialog, type TempPasswordResult } from './TempPasswordDialog';

/** Admin-only: list every account and manage its access — active state, admin role, password resets. */
export function UsersManagementPanel() {
  const navigate = useNavigate();
  const toast = useAppToast();
  const { user: self } = useAppData();
  const [users, setUsers] = useState<AdminUserView[] | null>(null);
  const [resetTarget, setResetTarget] = useState<AdminUserView | null>(null);
  const [tempPassword, setTempPassword] = useState<TempPasswordResult | null>(null);

  useEffect(() => {
    api
      .get<{ users: AdminUserView[] }>('/admin/users')
      .then(({ users: rows }) => setUsers(rows))
      .catch((err: unknown) => {
        toast.error(err instanceof ApiError ? err.message : 'Não foi possível carregar usuários.');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patchUser = async (
    id: string,
    changes: Partial<Pick<AdminUserView, 'active' | 'isAdmin'>>,
  ) => {
    const previous = users;
    setUsers((list) => list?.map((u) => (u.id === id ? { ...u, ...changes } : u)) ?? list);
    try {
      await api.patch<{ user: AdminUserView }>(`/admin/users/${id}`, changes);
    } catch (err) {
      setUsers(previous);
      toast.error(err instanceof ApiError ? err.message : 'Não foi possível atualizar o usuário.');
    }
  };

  const confirmReset = async () => {
    if (!resetTarget) return;
    const target = resetTarget;
    setResetTarget(null);
    try {
      const { tempPassword: password } = await api.post<{ tempPassword: string }>(
        `/admin/users/${target.id}/reset-password`,
      );
      setTempPassword({ username: target.username, password });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Não foi possível redefinir a senha.');
    }
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button type="button" onClick={() => navigate(routes.adminCreateUser())}>
          <UserPlus className="h-4 w-4" strokeWidth={1.8} />
          Criar usuário
        </Button>
      </div>

      <SectionCard>
        {!users ? (
          <p className="py-6 text-center text-xs text-neutral-500">Carregando usuários…</p>
        ) : (
          <div className="flex flex-col">
            {users.map((u) => {
              const isSelf = u.id === self.id;
              // The master account can't be activated/deactivated or promoted/demoted from
              // here at all, and only the master itself can reset its own password.
              const canManageAccess = !u.isMaster;
              const canToggleAdmin = self.isMaster && !u.isMaster;
              const canResetPassword = !u.isMaster || isSelf;
              return (
                <div
                  key={u.id}
                  className="flex flex-col gap-3 border-b border-neutral-800 py-3.5 first:pt-0 last:border-0 last:pb-0 sm:flex-row sm:items-center"
                >
                  <Avatar src={u.avatarUrl} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate text-sm font-medium text-neutral-100">{u.name}</p>
                      {u.isMaster ? (
                        <Badge tone="violet" size="sm">
                          Master
                        </Badge>
                      ) : (
                        u.isAdmin && (
                          <Badge tone="amber" size="sm">
                            Admin
                          </Badge>
                        )
                      )}
                      {!u.active && (
                        <Badge tone="rose" size="sm">
                          Inativo
                        </Badge>
                      )}
                      {u.mustChangePassword && (
                        <Badge tone="sky" size="sm">
                          Deve trocar senha
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500">@{u.username}</p>
                    <p className="mt-0.5 text-[11px] text-neutral-600">
                      {u.lastLoginAt
                        ? `Último acesso ${formatRelativeTime(u.lastLoginAt)}`
                        : 'Nunca acessou'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                    {canManageAccess && (
                      <Switch
                        checked={u.active}
                        onCheckedChange={(active) => patchUser(u.id, { active })}
                        label={u.active ? 'Desativar conta' : 'Ativar conta'}
                        disabled={isSelf}
                        tone="emerald"
                      />
                    )}
                    {canToggleAdmin && (
                      <IconButton
                        label={u.isAdmin ? 'Remover administrador' : 'Tornar administrador'}
                        variant={u.isAdmin ? 'amber' : 'neutral'}
                        disabled={isSelf}
                        onClick={() => patchUser(u.id, { isAdmin: !u.isAdmin })}
                      >
                        <ShieldCheck className="h-4 w-4" strokeWidth={1.8} />
                      </IconButton>
                    )}
                    {canResetPassword && (
                      <IconButton label="Redefinir senha" onClick={() => setResetTarget(u)}>
                        <KeyRound className="h-4 w-4" strokeWidth={1.8} />
                      </IconButton>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      <ConfirmDialog
        open={resetTarget !== null}
        onOpenChange={(open) => !open && setResetTarget(null)}
        title="Redefinir senha?"
        message={
          resetTarget &&
          `Uma nova senha temporária será gerada para @${resetTarget.username} e a conta será desconectada de todos os dispositivos.`
        }
        confirmLabel="Redefinir"
        onConfirm={confirmReset}
      />

      <TempPasswordDialog result={tempPassword} onClose={() => setTempPassword(null)} />
    </>
  );
}
