import { useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';
import { useAppData } from '@/app/providers';
import { formatRelativeTime } from '@/shared/lib/format';
import { ConfirmDialog } from '@/shared/ui/organisms/ConfirmDialog';

/**
 * Persistent, admin-only banner for standing security alerts (e.g. a burst of failed
 * logins). Shows on every page as soon as an admin loads the app — not just inside the
 * Usuários screen — and stays until manually dismissed, surviving logout/login since it's
 * backed by a DB row, not local state.
 *
 * Only ever shows the single most recent undismissed alert (`securityAlerts` is already
 * `desc(createdAt)` from `GET /api/bootstrap`), matching the product design of "at most one
 * live alert at a time" (enforced at the DB level by a partial unique index — see
 * db/schema.ts). If more than one somehow exists (e.g. leftover rows from before that index
 * was in place), the rest stay hidden here rather than cluttering every screen; dismissing the
 * shown one reveals the next-most-recent, if any.
 */
export function SecurityAlertBanner() {
  const { user, securityAlerts, dismissSecurityAlert } = useAppData();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const alert = securityAlerts[0];
  if (!user.isAdmin || !alert) return null;

  return (
    <div className="flex flex-col gap-2 border-b border-rose-900/50 bg-rose-950/30 px-5 py-3 md:px-10">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" strokeWidth={1.8} />
          <div>
            <p className="text-sm text-rose-200">{alert.description}</p>
            <p className="text-[11px] text-rose-400/70">{formatRelativeTime(alert.createdAt)}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setConfirmId(alert.id)}
          aria-label="Remover alerta"
          className="shrink-0 text-rose-400 transition hover:text-rose-300"
        >
          <X className="h-4 w-4" strokeWidth={1.8} />
        </button>
      </div>

      <ConfirmDialog
        open={confirmId !== null}
        onOpenChange={(open) => !open && setConfirmId(null)}
        title="Remover este alerta?"
        message="O alerta some definitivamente daqui — isso não apaga nada do registro de atividade, só o aviso."
        confirmLabel="Remover"
        onConfirm={() => {
          if (confirmId) dismissSecurityAlert(confirmId);
          setConfirmId(null);
        }}
      />
    </div>
  );
}
