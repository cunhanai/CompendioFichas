import { BookOpen, Star } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { Badge } from '@/shared/ui/atoms/Badge';
import type { SystemStatus } from '../model/types';

const STATUS_LABEL: Record<SystemStatus, string> = {
  active: 'Ativo',
  inactive: 'Inativo',
  soon: 'Em breve',
};
const STATUS_TONE: Record<SystemStatus, 'emerald' | 'neutral'> = {
  active: 'emerald',
  inactive: 'neutral',
  soon: 'neutral',
};

export interface SystemCardProps {
  title: string;
  status: SystemStatus;
  favorited: boolean;
  onOpen: () => void;
  onToggleFavorite?: () => void;
  variant?: 'grid' | 'wide';
  logoUrl?: string;
}

function FavoriteToggle({
  favorited,
  onToggle,
  size = 'h-4 w-4',
}: {
  favorited: boolean;
  onToggle: () => void;
  size?: string;
}) {
  return (
    <button
      type="button"
      title={favorited ? 'Remover dos favoritos' : 'Marcar como favorito'}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="shrink-0 text-neutral-600 transition hover:text-amber-400"
    >
      <Star className={cn(size, favorited && 'fill-amber-500 text-amber-500')} strokeWidth={1.8} />
    </button>
  );
}

/** Official logo (when available) or a generic placeholder + title + status, in a compact grid tile or a wide row. */
export function SystemCard({
  title,
  status,
  favorited,
  onOpen,
  onToggleFavorite,
  variant = 'grid',
  logoUrl,
}: SystemCardProps) {
  const disabled = status === 'soon';
  const clickable = !disabled ? { onClick: onOpen } : {};

  if (variant === 'wide') {
    return (
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        {...clickable}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onOpen();
          }
        }}
        className={cn(
          'flex w-full cursor-pointer items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-3 text-left transition hover:border-neutral-700',
          disabled && 'pointer-events-none cursor-not-allowed opacity-60',
        )}
      >
        <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-lg bg-neutral-50 p-1.5">
          {logoUrl ? (
            <img src={logoUrl} alt={title} className="h-full w-full object-contain" />
          ) : (
            <BookOpen className="h-6 w-6 text-neutral-400" strokeWidth={1.6} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <span className="truncate text-sm font-medium text-neutral-200">{title}</span>
        </div>
        {onToggleFavorite && <FavoriteToggle favorited={favorited} onToggle={onToggleFavorite} />}
        <Badge tone={STATUS_TONE[status]} size="sm">
          {STATUS_LABEL[status]}
        </Badge>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      {...clickable}
      onKeyDown={(e) => {
        if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onOpen();
        }
      }}
      className={cn(
        'flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border text-center transition',
        favorited
          ? 'border-amber-800/40 bg-amber-950/20 hover:border-amber-600/60'
          : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700',
        disabled && 'pointer-events-none cursor-not-allowed opacity-60',
      )}
    >
      <div className="flex aspect-[4/3] w-full items-center justify-center bg-neutral-50 p-3">
        {logoUrl ? (
          <img src={logoUrl} alt={title} className="h-full w-full object-contain" />
        ) : (
          <BookOpen className="h-10 w-10 text-neutral-400" strokeWidth={1.4} />
        )}
      </div>
      <div className="flex flex-1 flex-col items-center gap-1.5 px-3 py-2.5">
        <span className="line-clamp-2 text-xs font-medium text-neutral-200">{title}</span>
        <div className="mt-auto flex items-center gap-2">
          <Badge tone={STATUS_TONE[status]} size="sm">
            {STATUS_LABEL[status]}
          </Badge>
          {onToggleFavorite && (
            <FavoriteToggle favorited={favorited} onToggle={onToggleFavorite} size="h-3.5 w-3.5" />
          )}
        </div>
      </div>
    </div>
  );
}
