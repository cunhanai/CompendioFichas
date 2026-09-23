import { Home, Layers, LogOut, User } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/shared/lib/cn';
import { routes } from '@/shared/lib/routes';
import { useSession } from '@/entities/session';

const itemBase = 'flex flex-1 flex-col items-center justify-center py-2.5 transition';
const itemOn = cn(itemBase, 'text-amber-400');
const itemOff = cn(itemBase, 'text-neutral-600 hover:text-neutral-300');

function isSystemsFamily(pathname: string) {
  return pathname.startsWith('/sistemas') || pathname.startsWith('/personagens');
}

/** Mobile icon-only bottom navigation bar. */
export function BottomBar() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { logout } = useSession();

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-40 flex items-stretch border-t border-neutral-800 bg-neutral-950/95 backdrop-blur md:hidden">
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
      <button
        type="button"
        title="Sair"
        onClick={logout}
        className={cn(itemOff, 'hover:text-rose-400')}
      >
        <LogOut className="h-5 w-5" strokeWidth={1.8} />
      </button>
    </nav>
  );
}
