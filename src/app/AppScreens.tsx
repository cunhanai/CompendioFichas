import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/widgets/app-shell/AppShell';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { SystemsPage } from '@/pages/systems/SystemsPage';
import { CharactersPage } from '@/pages/characters/CharactersPage';
import { LibraryPage } from '@/pages/library/LibraryPage';
import { ProfilePage } from '@/pages/profile/ProfilePage';
import { CreateUserPage } from '@/pages/admin/CreateUserPage';
import { SheetPage } from '@/pages/sheet/SheetPage';

/** Renders the icon nav shell + whichever page the current URL points to. */
export function AppScreens() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/sistemas" element={<SystemsPage />} />
        <Route path="/sistemas/:systemId/personagens" element={<CharactersPage />} />
        <Route path="/sistemas/:systemId/biblioteca" element={<LibraryPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/perfil/criar-usuario" element={<CreateUserPage />} />
        <Route path="/personagens/:characterId" element={<SheetPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
