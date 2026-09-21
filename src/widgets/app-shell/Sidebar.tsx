import { Home, Layers, LogOut, User } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useNavigation } from '@/shared/lib/navigation';
import type { Route } from '@/shared/lib/navigation';
import { useSession } from '@/entities/session';

const itemBase = 'flex h-11 w-11 items-center justify-center rounded-lg transition';
const itemOn = cn(itemBase, 'bg-amber-500/15 text-amber-400');
const itemOff = cn(itemBase, 'text-neutral-500 hover:bg-neutral-900 hover:text-neutral-200');

function isSystemsFamily(route: Route) {
  return route.name === 'systems' || route.name === 'characters' || route.name === 'sheet';
}

/** Desktop icon-only sidebar: logo, Início/Sistemas/Perfil, Sair pinned to the bottom. */
export function Sidebar() {
  const { route, goDashboard, goSystems, goProfile } = useNavigation();
  const { logout } = useSession();

  return (
    <aside className="hidden w-16 shrink-0 flex-col items-center gap-2 border-r border-neutral-800 bg-neutral-950 py-6 md:flex">
      <div className="mb-6 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700">
        <svg
          viewBox="0 0 24 24"
          className="text-ink h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <path d="M4 19V6a2 2 0 0 1 2-2h9l5 5v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z" />
          <path d="M15 4v5h5" />
        </svg>
      </div>
      <button
        type="button"
        title="Início"
        className={route.name === 'dashboard' ? itemOn : itemOff}
        onClick={goDashboard}
      >
        <Home className="h-5 w-5" strokeWidth={1.8} />
      </button>
      <button
        type="button"
        title="Sistemas"
        className={isSystemsFamily(route) ? itemOn : itemOff}
        onClick={goSystems}
      >
        <Layers className="h-5 w-5" strokeWidth={1.8} />
      </button>
      <button
        type="button"
        title="Perfil"
        className={route.name === 'profile' ? itemOn : itemOff}
        onClick={goProfile}
      >
        <User className="h-5 w-5" strokeWidth={1.8} />
      </button>
      <div className="mt-auto">
        <button
          type="button"
          title="Sair"
          onClick={logout}
          className="flex h-11 w-11 items-center justify-center rounded-lg text-neutral-500 transition hover:bg-neutral-900 hover:text-rose-400"
        >
          <LogOut className="h-5 w-5" strokeWidth={1.8} />
        </button>
      </div>
    </aside>
  );
}
