import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppData } from '@/app/providers';
import { routes } from '@/shared/lib/routes';
import { Breadcrumbs } from '@/widgets/app-shell';
import { UsersManagementPanel, ActivityLog } from '@/features/user-management';
import { PillTabs } from '@/shared/ui/molecules/PillTabs';

type Tab = 'users' | 'activity';

export function UsersPage() {
  const { user } = useAppData();
  const navigate = useNavigate();
  // Driven by the URL (not local state) so a link like ?tab=activity (e.g. from a notification
  // banner) switches the tab even when this page is already mounted — a query-string-only
  // navigation doesn't remount the component, so a useState initializer wouldn't see it.
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: Tab = searchParams.get('tab') === 'activity' ? 'activity' : 'users';
  const setTab = (next: Tab) => setSearchParams(next === 'users' ? {} : { tab: next });

  if (!user.isAdmin) return <Navigate to={routes.profile()} replace />;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-6 md:px-10 md:py-10">
      <Breadcrumbs
        items={[
          { label: 'Início', onClick: () => navigate(routes.dashboard()) },
          { label: 'Usuários' },
        ]}
      />
      <h1 className="font-display mb-6 text-2xl text-neutral-100">Gestão de usuários</h1>

      <PillTabs
        value={tab}
        onValueChange={setTab}
        className="mb-5"
        options={[
          { value: 'users', label: 'Usuários' },
          { value: 'activity', label: 'Atividade recente' },
        ]}
      />

      {tab === 'users' ? <UsersManagementPanel /> : <ActivityLog />}
    </main>
  );
}
