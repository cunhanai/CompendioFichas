import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '@/app/providers';
import { routes } from '@/shared/lib/routes';
import { formatRelativeTime } from '@/shared/lib/format';
import { ConfirmDialog } from '@/shared/ui/organisms/ConfirmDialog';
import { NotificationBanner } from '@/shared/ui/organisms/NotificationBanner';

/**
 * Persistent, admin-only banner for standing security alerts (e.g. a burst of failed
 * logins). Shows on every page as soon as an admin loads the app — not just inside the
 * Usuários screen — and stays until manually dismissed, surviving logout/login since it's
 * backed by a DB row, not local state. Built on the generic `NotificationBanner` shell — this
 * file only supplies what's specific to a security alert (its tone, icon, message, and what
 * clicking it opens); a future notification kind would be its own thin wrapper the same way,
 * not a change to the shell.
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
  const navigate = useNavigate();
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const alert = securityAlerts[0];
  if (!user.isAdmin || !alert) return null;

  return (
    <>
      <NotificationBanner
        tone="rose"
        icon={ShieldAlert}
        message={alert.description}
        timestamp={formatRelativeTime(alert.createdAt)}
        onDismiss={() => setConfirmId(alert.id)}
        onClick={() => navigate(routes.adminUsers('activity'))}
      />

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
    </>
  );
}
