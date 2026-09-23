import { FileText, Home, Layers, LogOut, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import { routes } from '@/shared/lib/routes';
import { useSession } from '@/entities/session';

const itemBase = 'flex h-11 w-11 items-center justify-center rounded-lg transition';
const itemOn = cn(itemBase, 'bg-amber-500/15 text-amber-400');
const itemOff = cn(itemBase, 'text-neutral-500 hover:bg-neutral-900 hover:text-neutral-200');

function isSystemsFamily(pathname: string) {
  return pathname.startsWith('/sistemas') || pathname.startsWith('/personagens');
}

/** Desktop icon-only sidebar: logo, Início/Sistemas/Perfil, Sair pinned to the bottom. */
export function Sidebar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout } = useSession();

  return (
    <aside className="hidden w-16 shrink-0 flex-col items-center gap-2 border-r border-neutral-800 bg-neutral-950 py-6 md:flex">
      <div className="mb-6 flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-700">
        <FileText className="text-ink h-5 w-5" strokeWidth={1.8} />
      </div>
      <button
        type="button"
        title="Início"
        className={pathname === routes.dashboard() ? itemOn : itemOff}
        onClick={() => navigate(routes.dashboard())}
      >
        <Home className="h-5 w-5" strokeWidth={1.8} />
      </button>
      <button
        type="button"
        title="Sistemas"
        className={isSystemsFamily(pathname) ? itemOn : itemOff}
        onClick={() => navigate(routes.systems())}
      >
        <Layers className="h-5 w-5" strokeWidth={1.8} />
      </button>
      <button
        type="button"
        title="Perfil"
        className={pathname === routes.profile() ? itemOn : itemOff}
        onClick={() => navigate(routes.profile())}
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
