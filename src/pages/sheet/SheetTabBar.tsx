import type { ComponentType } from 'react';
import {
  Award,
  Backpack,
  BookUser,
  History,
  Map,
  PawPrint,
  Sparkles,
  Swords,
  Wand2,
} from 'lucide-react';
import { SHEET_TABS, type SheetTabId } from '@/entities/character/model/constants';
import { cn } from '@/shared/lib/cn';

const ICONS: Record<SheetTabId, ComponentType<{ className?: string; strokeWidth?: number }>> = {
  geral: BookUser,
  combate: Swords,
  pericias: Sparkles,
  magias: Wand2,
  talentos: Award,
  inventario: Backpack,
  criaturas: PawPrint,
  plano: Map,
  historico: History,
};

export interface SheetTabBarProps {
  active: SheetTabId;
  onChange: (tab: SheetTabId) => void;
}

/** Icon-only tabs; the active one also shows its label — matches the mock's SheetTab component. */
export function SheetTabBar({ active, onChange }: SheetTabBarProps) {
  return (
    <div className="grid grid-cols-5 gap-0.5 rounded-xl border border-neutral-800 bg-neutral-900/60 p-1 sm:grid-cols-9">
      {SHEET_TABS.map((t) => {
        const Icon = ICONS[t.id];
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            title={t.label}
            className={cn(
              'flex h-11 w-full items-center justify-center gap-1.5 rounded-lg text-xs font-medium transition',
              isActive
                ? 'text-ink bg-amber-500'
                : 'text-neutral-500 hover:bg-neutral-800 hover:text-neutral-200',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.8} />
            {isActive && <span className="hidden sm:inline">{t.label}</span>}
          </button>
        );
      })}
    </div>
  );
}
