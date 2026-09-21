import { Home, Layers, LogOut, User } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { useNavigation } from '@/shared/lib/navigation';
import type { Route } from '@/shared/lib/navigation';
import { useSession } from '@/entities/session';

const itemBase = 'flex flex-1 flex-col items-center justify-center py-2.5 transition';
const itemOn = cn(itemBase, 'text-amber-400');
const itemOff = cn(itemBase, 'text-neutral-600 hover:text-neutral-300');

function isSystemsFamily(route: Route) {
  return route.name === 'systems' || route.name === 'characters' || route.name === 'sheet';
}

/** Mobile icon-only bottom navigation bar. */
export function BottomBar() {
  const { route, goDashboard, goSystems, goProfile } = useNavigation();
  const { logout } = useSession();

  return (
    <nav className="fixed right-0 bottom-0 left-0 z-40 flex items-stretch border-t border-neutral-800 bg-neutral-950/95 backdrop-blur md:hidden">
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
