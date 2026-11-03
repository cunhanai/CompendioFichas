import { Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '@/app/providers';
import { routes } from '@/shared/lib/routes';
import { NotificationBanner } from '@/shared/ui/organisms/NotificationBanner';
import { CHANGELOG_ENTRIES, CURRENT_VERSION } from '@/entities/changelog/model/data';

/**
 * Persistent banner announcing the latest changelog entry — shows on every page as soon as a
 * user whose `lastSeenChangelogVersion` doesn't match `CURRENT_VERSION` loads the app (covers
 * both "never seen one" and "seen an older one"), same shell/placement as `SecurityAlertBanner`.
 * Dismissing it marks `CURRENT_VERSION` as seen server-side (not just local state), so it
 * doesn't reappear on another device or after a fresh login — same reasoning as why the
 * security alert is DB-backed rather than kept in localStorage.
 *
 * Only ever summarizes the single newest entry, even if the user missed several in a row (e.g.
 * away for a few days) — clicking it opens the full `/novidades` page for the rest.
 */
export function ChangelogNotificationBanner() {
  const { user, dismissChangelogNotice } = useAppData();
  const navigate = useNavigate();

  if (user.lastSeenChangelogVersion === CURRENT_VERSION) return null;

  const latest = CHANGELOG_ENTRIES[0];

  return (
    <NotificationBanner
      tone="violet"
      icon={Sparkles}
      message={`Novidades: ${latest.title}`}
      timestamp="Toque para ver tudo o que mudou"
      onDismiss={() => dismissChangelogNotice(CURRENT_VERSION)}
      onClick={() => navigate(routes.changelog())}
    />
  );
}
