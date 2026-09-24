import { UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '@/app/providers';
import { routes } from '@/shared/lib/routes';
import { Breadcrumbs } from '@/widgets/app-shell';
import { Button } from '@/shared/ui/atoms/Button';
import { AccountCard, AvatarUpload } from '@/features/profile-settings';

export function ProfilePage() {
  const { user, updateUser } = useAppData();
  const navigate = useNavigate();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-6 md:px-10 md:py-10">
      <Breadcrumbs
        items={[
          { label: 'Início', onClick: () => navigate(routes.dashboard()) },
          { label: 'Meu perfil' },
        ]}
      />

      <div className="mb-8 flex items-center gap-4">
        <AvatarUpload
          src={user.avatarUrl}
          onChange={(avatarUrl) => updateUser((u) => ({ ...u, avatarUrl }))}
        />
        <div className="min-w-0">
          <h1 className="font-display text-2xl text-neutral-100">{user.name}</h1>
          <p className="text-sm text-neutral-500">@{user.username}</p>
        </div>
      </div>

      <AccountCard user={user} onSave={(values) => updateUser((u) => ({ ...u, ...values }))} />

      {user.isAdmin && (
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => navigate(routes.adminCreateUser())}
        >
          <UserPlus className="h-4 w-4" strokeWidth={1.8} />
          Criar usuário
        </Button>
      )}
    </main>
  );
}
