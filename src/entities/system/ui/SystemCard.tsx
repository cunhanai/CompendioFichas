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
  variant?: 'grid' | 'wide';
  logoUrl?: string;
}

/** Official logo (when available) or a generic placeholder + title + status, in a compact grid tile or a wide row. */
export function SystemCard({
  title,
  status,
  favorited,
  onOpen,
  variant = 'grid',
  logoUrl,
}: SystemCardProps) {
  const disabled = status === 'soon';
  const logo = logoUrl ? (
    <div className="flex h-10 shrink-0 items-center justify-center rounded-lg bg-neutral-50 px-2 py-1.5">
      <img src={logoUrl} alt={title} className="h-full w-auto object-contain" />
    </div>
  ) : (
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-800 text-neutral-500">
      <BookOpen className="h-5 w-5" strokeWidth={1.6} />
    </div>
  );

  if (variant === 'wide') {
    return (
      <button
        type="button"
        onClick={onOpen}
        disabled={disabled}
        className="flex w-full items-center gap-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-left transition hover:border-neutral-700 disabled:cursor-not-allowed"
      >
        {logo}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            {favorited && <Star className="h-3.5 w-3.5 shrink-0 fill-amber-500 text-amber-500" />}
            <span className="truncate text-sm font-medium text-neutral-200">{title}</span>
          </div>
        </div>
        <Badge tone={STATUS_TONE[status]} size="sm">
          {STATUS_LABEL[status]}
        </Badge>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={disabled}
      className={cn(
        'flex h-full flex-col items-center justify-center gap-2 rounded-2xl border p-4 text-center transition disabled:cursor-not-allowed',
        favorited
          ? 'border-amber-800/40 bg-amber-950/20 hover:border-amber-600/60'
          : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700',
      )}
    >
      {logo}
      <span className="line-clamp-2 text-xs font-medium text-neutral-200">{title}</span>
      <Badge tone={STATUS_TONE[status]} size="sm">
        {STATUS_LABEL[status]}
      </Badge>
    </button>
  );
}
