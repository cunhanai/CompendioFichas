import { useNavigation } from '@/shared/lib/navigation';
import { AppShell } from '@/widgets/app-shell/AppShell';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { SystemsPage } from '@/pages/systems/SystemsPage';
import { CharactersPage } from '@/pages/characters/CharactersPage';
import { LibraryPage } from '@/pages/library/LibraryPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { SheetPage } from '@/pages/sheet/SheetPage';

/** Renders the icon nav shell + whichever page the current route points to. */
export function AppScreens() {
  const { route } = useNavigation();

  return (
    <AppShell>
      {route.name === 'dashboard' && <DashboardPage />}
      {route.name === 'systems' && <SystemsPage />}
      {route.name === 'characters' && <CharactersPage systemId={route.systemId} />}
      {route.name === 'library' && <LibraryPage systemId={route.systemId} />}
      {route.name === 'profile' && <ProfilePage />}
      {route.name === 'sheet' && (
        <SheetPage characterId={route.characterId} initialTab={route.tab} />
      )}
    </AppShell>
  );
}
