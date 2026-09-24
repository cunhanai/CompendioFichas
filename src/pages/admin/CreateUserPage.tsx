import { Navigate, useNavigate } from 'react-router-dom';
import { useAppData } from '@/app/providers';
import { routes } from '@/shared/lib/routes';
import { Breadcrumbs } from '@/widgets/app-shell';
import { CreateUserForm } from '@/features/user-admin';

export function CreateUserPage() {
  const { user } = useAppData();
  const navigate = useNavigate();

  if (!user.isAdmin) return <Navigate to={routes.profile()} replace />;

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-6 md:px-10 md:py-10">
      <Breadcrumbs
        items={[
          { label: 'Início', onClick: () => navigate(routes.dashboard()) },
          { label: 'Meu perfil', onClick: () => navigate(routes.profile()) },
          { label: 'Criar usuário' },
        ]}
      />
      <h1 className="font-display mb-6 text-2xl text-neutral-100">Criar usuário</h1>
      <CreateUserForm />
    </main>
  );
}
