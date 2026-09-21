import { useAppData } from '@/app/providers';
import { useNavigation } from '@/shared/lib/navigation';
import { Avatar } from '@/shared/ui/atoms/Avatar';
import { Breadcrumbs } from '@/widgets/app-shell';
import { AccountCard, PasswordCard } from '@/features/profile-settings';

export function ProfilePage() {
  const { user, updateUser } = useAppData();
  const { goDashboard } = useNavigation();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-5 py-6 md:px-10 md:py-10">
      <Breadcrumbs items={[{ label: 'Início', onClick: goDashboard }, { label: 'Meu perfil' }]} />

      <div className="mb-8 flex items-center gap-4">
        <Avatar tone="amber" size="lg" />
        <div className="min-w-0">
          <h1 className="font-display text-2xl text-neutral-100">{user.name}</h1>
          <p className="text-sm text-neutral-500">@{user.username}</p>
        </div>
      </div>

      <AccountCard user={user} onSave={(values) => updateUser((u) => ({ ...u, ...values }))} />
      <PasswordCard />
    </main>
  );
}
