import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/widgets/app-shell/AppShell';

const DashboardPage = lazy(() =>
  import('@/pages/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const SystemsPage = lazy(() =>
  import('@/pages/systems/SystemsPage').then((m) => ({ default: m.SystemsPage })),
);
const CharactersPage = lazy(() =>
  import('@/pages/characters/CharactersPage').then((m) => ({ default: m.CharactersPage })),
);
const LibraryPage = lazy(() =>
  import('@/pages/library/LibraryPage').then((m) => ({ default: m.LibraryPage })),
);
const ProfilePage = lazy(() =>
  import('@/pages/profile/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);
const CreateUserPage = lazy(() =>
  import('@/pages/admin/CreateUserPage').then((m) => ({ default: m.CreateUserPage })),
);
const UsersPage = lazy(() =>
  import('@/pages/admin/UsersPage').then((m) => ({ default: m.UsersPage })),
);
const SheetPage = lazy(() =>
  import('@/pages/sheet/SheetPage').then((m) => ({ default: m.SheetPage })),
);

/** Renders the icon nav shell + whichever page the current URL points to.
 * Pages load on demand (React.lazy) — the character sheet especially is a large chunk
 * (~10 tabs, ~35 popups) that most visits to, say, the profile page never need. */
export function AppScreens() {
  return (
    <AppShell>
      <Suspense fallback={<div className="min-h-screen bg-neutral-950" />}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/sistemas" element={<SystemsPage />} />
          <Route path="/sistemas/:systemId/personagens" element={<CharactersPage />} />
          <Route path="/sistemas/:systemId/biblioteca" element={<LibraryPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/perfil/criar-usuario" element={<CreateUserPage />} />
          <Route path="/admin/usuarios" element={<UsersPage />} />
          <Route path="/personagens/:characterId" element={<SheetPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AppShell>
  );
}
